// app.js — PulseGrid v2 — OSRM-powered real routing
// Requires: distance.js, hospitals.js, triage.js (loaded before this file)

'use strict';

const STATE = {
  userLocation: null,
  hospitals: [],
  selectedHospital: null,
  nearestGovt: null,
  nearestPrivate: null,
  isSearchActive: false,
  isListening: false,
  currentQuery: '',
  aiTriageResult: null,
  activeHold: null,
  holdTimerInterval: null,
  drawerExpanded: false,
  showTriageMenu: false,
  theme: localStorage.getItem('pg_theme') || 'light',
  voiceLang: 'en-IN',
  recognition: null,
  map: null,
  userMarker: null,
  userAccuracyCircle: null,
  hospitalMarkers: [],
  routeLayers: {},      // keyed by hospital id
  activeRouteLayers: [],
  distancesLoaded: false,
};

// ─── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(STATE.theme);
  initMap();
  initState();
  bindEvents();
  requestGPS();
});

function initState() {
  try {
    const saved = localStorage.getItem('pg_location');
    if (saved) {
      const p = JSON.parse(saved);
      if (p && p.lat && p.lng) {
        STATE.userLocation = p;
        setLocationLabel(p.address || 'My Location');
      }
    }
  } catch (e) {}

  if (!STATE.userLocation) {
    STATE.userLocation = { ...DEFAULT_USER_LOCATION };
    setLocationLabel(DEFAULT_USER_LOCATION.address);
  }

  STATE.hospitals = INITIAL_HOSPITALS.map(h => ({
    ...h,
    wards: h.wards.map(w => ({ ...w })),
  }));

  // Initial haversine distances while OSRM loads
  recomputeHaversine();
  computeNearest();
}

// ─── DISTANCE CALCULATION ──────────────────────────

function recomputeHaversine() {
  if (!STATE.userLocation) return;
  const { lat, lng } = STATE.userLocation;
  STATE.hospitals.forEach(h => {
    h.distance_km = haversineKm(lat, lng, h.lat, h.lng);
    h.eta_minutes = calculateEtaMinutes(h.distance_km);
    h.distance_source = 'haversine';
  });
  STATE.hospitals.sort((a, b) => a.distance_km - b.distance_km);
}

async function recomputeRealDistances() {
  if (!STATE.userLocation) return;
  const { lat, lng } = STATE.userLocation;

  showDistanceLoadingIndicator(true);

  const results = await batchRealDistances(lat, lng, STATE.hospitals.map(h => ({ lat: h.lat, lng: h.lng })));

  results.forEach((res, i) => {
    STATE.hospitals[i].distance_km = res.distance_km;
    STATE.hospitals[i].eta_minutes = res.eta_minutes;
    STATE.hospitals[i].distance_source = res.source;
  });

  // Re-sort by actual road distance
  STATE.hospitals.sort((a, b) => a.distance_km - b.distance_km);
  computeNearest();
  STATE.distancesLoaded = true;

  showDistanceLoadingIndicator(false);

  // If search is active, re-render menu with updated distances
  if (STATE.isSearchActive && STATE.showTriageMenu) {
    renderTriageMenu();
  }
  if (STATE.selectedHospital) {
    // Refresh the selected hospital object with new distances
    STATE.selectedHospital = STATE.hospitals.find(h => h.id === STATE.selectedHospital.id) || STATE.selectedHospital;
  }
}

function showDistanceLoadingIndicator(show) {
  const el = document.getElementById('distance-loading');
  if (el) el.style.display = show ? 'flex' : 'none';
}

function computeNearest() {
  const govts = STATE.hospitals.filter(h => h.is_govt).sort((a, b) => a.distance_km - b.distance_km);
  const privates = STATE.hospitals.filter(h => !h.is_govt).sort((a, b) => a.distance_km - b.distance_km);
  STATE.nearestGovt = govts[0] || null;
  STATE.nearestPrivate = privates[0] || null;
}

// ─── MAP INIT ──────────────────────────────────────
function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl || !window.L) return;

  STATE.map = L.map('map', {
    center: [STATE.userLocation ? STATE.userLocation.lat : 22.6186,
             STATE.userLocation ? STATE.userLocation.lng : 88.419],
    zoom: 14,
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(STATE.map);

  // User pulse marker
  updateUserMarker();

  // Fix tile rendering
  setTimeout(() => STATE.map && STATE.map.invalidateSize(), 80);
  setTimeout(() => STATE.map && STATE.map.invalidateSize(), 400);
}

function updateUserMarker() {
  if (!STATE.map) return;
  const { lat, lng } = STATE.userLocation || DEFAULT_USER_LOCATION;

  if (STATE.userMarker) {
    STATE.userMarker.setLatLng([lat, lng]);
  } else {
    // Blue pulsing circle (user location)
    const pulseIcon = L.divIcon({
      className: '',
      html: `<div class="user-dot-outer"><div class="user-dot-inner"></div></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    STATE.userMarker = L.marker([lat, lng], { icon: pulseIcon, zIndexOffset: 1000 }).addTo(STATE.map);
  }

  STATE.map.setView([lat, lng], 14, { animate: true });
}

function placeHospitalMarkers(hospitals) {
  if (!STATE.map) return;

  STATE.hospitalMarkers.forEach(m => STATE.map.removeLayer(m));
  STATE.hospitalMarkers = [];

  hospitals.forEach(h => {
    const isSelected = STATE.selectedHospital && STATE.selectedHospital.id === h.id;
    const color = h.is_govt ? '#FF671F' : '#138808';
    const size = isSelected ? 13 : 8;

    // Circle marker for hospital
    const marker = L.circleMarker([h.lat, h.lng], {
      radius: size,
      fillColor: color,
      color: '#FFFFFF',
      weight: isSelected ? 3 : 2,
      fillOpacity: isSelected ? 1 : 0.85,
    }).addTo(STATE.map);

    // ETA label bubble (shown always for nearest hospitals)
    const label = L.divIcon({
      className: '',
      html: `<div style="
        background:white;
        border:2px solid ${color};
        border-radius:10px;
        padding:2px 7px;
        font-size:10px;
        font-weight:900;
        white-space:nowrap;
        box-shadow:0 2px 8px rgba(0,0,0,0.18);
        color:${color};
        font-family:Inter,sans-serif;
      ">${h.eta_minutes}m · ${h.distance_km}km</div>`,
      iconAnchor: [-2, 24],
    });
    const etaMarker = L.marker([h.lat, h.lng], { icon: label, interactive: false }).addTo(STATE.map);
    STATE.hospitalMarkers.push(etaMarker);

    marker.on('click', () => {
      if (STATE.isSearchActive) {
        selectHospital(h.id, h.is_govt ? 'govt' : 'priv');
      }
    });

    STATE.hospitalMarkers.push(marker);
  });
}

// ─── ROUTE DRAWING ─────────────────────────────────

function clearAllRoutes() {
  STATE.activeRouteLayers.forEach(layer => {
    if (STATE.map) STATE.map.removeLayer(layer);
  });
  STATE.activeRouteLayers = [];
}

/**
 * Draw the actual OSRM road route to a single hospital.
 * Updates that hospital's real distance/ETA from OSRM response.
 */
async function drawRoute(hospital, color) {
  if (!STATE.map || !STATE.userLocation || !hospital) return;

  const { lat: uLat, lng: uLng } = STATE.userLocation;
  const routeColor = color || (hospital.is_govt ? '#FF671F' : '#138808');

  const result = await getRealRoute(uLat, uLng, hospital.lat, hospital.lng);

  // Update hospital with real OSRM distance
  hospital.distance_km = result.distance_km;
  hospital.eta_minutes = result.eta_minutes;
  hospital.distance_source = result.source;

  let layer;
  if (result.geometry) {
    layer = L.geoJSON(result.geometry, {
      style: {
        color: routeColor,
        weight: 5,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round',
      },
    }).addTo(STATE.map);
  } else {
    // Fallback: dashed straight line
    layer = L.polyline([[uLat, uLng], [hospital.lat, hospital.lng]], {
      color: routeColor,
      weight: 4,
      opacity: 0.65,
      dashArray: '10, 8',
    }).addTo(STATE.map);
  }

  STATE.activeRouteLayers.push(layer);
  return { layer, result };
}

/**
 * Draw routes to BOTH nearest govt and private hospitals simultaneously (like the screenshot).
 * This is what shows when user presses Enter on a symptom.
 */
async function drawBothRoutes() {
  if (!STATE.map || !STATE.userLocation) return;
  clearAllRoutes();

  const { lat: uLat, lng: uLng } = STATE.userLocation;
  const bounds = [[uLat, uLng]];

  await Promise.all([
    (async () => {
      if (!STATE.nearestGovt) return;
      const res = await drawRoute(STATE.nearestGovt, '#FF671F');
      if (res) bounds.push([STATE.nearestGovt.lat, STATE.nearestGovt.lng]);
    })(),
    (async () => {
      if (!STATE.nearestPrivate) return;
      const res = await drawRoute(STATE.nearestPrivate, '#138808');
      if (res) bounds.push([STATE.nearestPrivate.lat, STATE.nearestPrivate.lng]);
    })(),
  ]);

  // Fit map to show user + both hospitals with padding (like Google Maps)
  if (bounds.length > 1) {
    const latLngBounds = L.latLngBounds(bounds);
    STATE.map.fitBounds(latLngBounds, {
      paddingTopLeft: [20, 80],
      paddingBottomRight: [20, 260], // leave room for the bottom triage menu
      animate: true,
      duration: 0.8,
    });
  }

  // Re-render menu so distances show OSRM values
  if (STATE.showTriageMenu) renderTriageMenu();
}

/**
 * Draw route to a single selected hospital (after "Choose Govt/Private" is clicked).
 */
async function drawSingleRoute(hospital) {
  if (!STATE.map || !STATE.userLocation || !hospital) return;
  clearAllRoutes();

  const { lat: uLat, lng: uLng } = STATE.userLocation;
  const res = await drawRoute(hospital);

  // Update hospital's marker with new distance/ETA
  placeHospitalMarkers([hospital]);

  // Fit map: leave space for bottom drawer
  const bounds = L.latLngBounds([[uLat, uLng], [hospital.lat, hospital.lng]]);
  STATE.map.fitBounds(bounds, {
    paddingTopLeft: [20, 80],
    paddingBottomRight: [20, 320],
    animate: true,
    duration: 0.8,
  });

  // Update drawer with new real ETA
  if (STATE.selectedHospital && STATE.selectedHospital.id === hospital.id) {
    refreshDrawerMetrics(hospital);
  }
}

function refreshDrawerMetrics(hospital) {
  const etaEl = document.querySelector('.drawer-eta-val');
  const distEl = document.querySelector('.drawer-dist-val');
  if (etaEl) etaEl.textContent = hospital.eta_minutes;
  if (distEl) distEl.textContent = hospital.distance_km;
}

// ─── GPS ───────────────────────────────────────────
function requestGPS() {
  if (!navigator.geolocation) return;
  showLocating(true);

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      applyLocation(lat, lng, null);
      showLocating(false);

      // Show accuracy circle
      if (STATE.map && accuracy < 200) {
        if (STATE.userAccuracyCircle) STATE.map.removeLayer(STATE.userAccuracyCircle);
        STATE.userAccuracyCircle = L.circle([lat, lng], {
          radius: accuracy,
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(STATE.map);
      }

      // Reverse geocode asynchronously
      reverseGeocode(lat, lng).then(addr => {
        if (addr) {
          STATE.userLocation.address = addr;
          setLocationLabel(addr);
          saveLocation();
        }
      });

      // Now fetch REAL distances from OSRM
      recomputeRealDistances();
    },
    err => {
      showLocating(false);
      console.warn('GPS error:', err.message);
      // Still do OSRM from saved/default location
      recomputeRealDistances();
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
  );
}

function applyLocation(lat, lng, address) {
  STATE.userLocation = {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6)),
    address: address || STATE.userLocation?.address || 'My Location',
  };
  setLocationLabel(STATE.userLocation.address);
  saveLocation();

  // Update haversine immediately, then OSRM
  recomputeHaversine();
  computeNearest();
  updateUserMarker();

  // Re-draw routes if search is active
  if (STATE.isSearchActive) {
    drawBothRoutes();
    placeHospitalMarkers(STATE.hospitals.slice(0, 6));
  }

  // Fetch real OSRM distances
  recomputeRealDistances();
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.display_name) return null;
    const parts = data.display_name.split(',').map(p => p.trim());
    return parts.slice(0, 3).join(', ');
  } catch (e) { return null; }
}

function saveLocation() {
  try { localStorage.setItem('pg_location', JSON.stringify(STATE.userLocation)); } catch (e) {}
}

function setLocationLabel(address) {
  const el = document.getElementById('location-label');
  if (!el) return;
  el.textContent = address && address.length > 22
    ? address.slice(0, 20) + '...'
    : (address || 'My Location');
}

function showLocating(on) {
  const btn = document.getElementById('gps-btn');
  if (!btn) return;
  if (on) {
    btn.innerHTML = `<svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
  } else {
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M12 2a10 10 0 1 0 10 10"/></svg>`;
  }
}

// ─── SEARCH / TRIAGE ───────────────────────────────
async function handleSearch(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) return;

  STATE.currentQuery = trimmed;
  STATE.isSearchActive = true;

  const triage = classifyEmergency(trimmed);
  STATE.aiTriageResult = triage;

  // Sort hospitals by triage + road distance
  sortHospitalsByTriage(triage.recommended_ward);
  computeNearest();

  // Update search bar
  updateSearchBarState(true, trimmed);

  // Show triage menu first (with current distances)
  renderTriageMenu();
  showTriageMenu(true);

  // Place hospital markers
  placeHospitalMarkers([STATE.nearestGovt, STATE.nearestPrivate].filter(Boolean));

  // Draw BOTH real OSRM routes (updates distances too)
  await drawBothRoutes();

  // Re-render triage menu with updated OSRM distances
  renderTriageMenu();
}

function sortHospitalsByTriage(wardCode) {
  STATE.hospitals.sort((a, b) => {
    const aWard = a.wards.find(w => w.ward_code === wardCode);
    const bWard = b.wards.find(w => w.ward_code === wardCode);
    const aHasBed = (aWard?.available_now || 0) > 0;
    const bHasBed = (bWard?.available_now || 0) > 0;
    if (aHasBed && !bHasBed) return -1;
    if (!aHasBed && bHasBed) return 1;
    return a.distance_km - b.distance_km;
  });
}

function handleClearSearch() {
  STATE.currentQuery = '';
  STATE.isSearchActive = false;
  STATE.selectedHospital = null;
  STATE.aiTriageResult = null;

  showTriageMenu(false);
  hideDrawer();
  updateSearchBarState(false, '');
  clearAllRoutes();

  STATE.hospitalMarkers.forEach(m => STATE.map && STATE.map.removeLayer(m));
  STATE.hospitalMarkers = [];

  if (STATE.userLocation && STATE.map) {
    STATE.map.setView([STATE.userLocation.lat, STATE.userLocation.lng], 14, { animate: true });
  }
}

// ─── TRIAGE MENU ───────────────────────────────────
function renderTriageMenu() {
  const menu = document.getElementById('triage-menu');
  if (!menu) return;

  const govtH = STATE.nearestGovt;
  const privH = STATE.nearestPrivate;
  const query = STATE.currentQuery;
  const isGovtNearest = govtH && privH && govtH.distance_km <= privH.distance_km;

  const renderCard = (h, type) => {
    if (!h) return '';
    const isGovt = type === 'govt';
    const color = isGovt ? '#FF671F' : '#138808';
    const beds = h.wards.reduce((s, w) => s + (w.available_now || 0), 0);
    const isNearest = isGovt ? isGovtNearest : !isGovtNearest;
    const isSelected = STATE.selectedHospital && STATE.selectedHospital.id === h.id;
    const isOsrm = h.distance_source === 'osrm';

    return `
      <div class="hospital-option-card liquid-glass-card${isSelected ? (isGovt ? ' selected-govt' : ' selected-priv') : ''}"
           onclick="selectHospital('${h.id}','${type}')">
        ${isSelected ? `<span class="card-check${isGovt ? ' check-saffron' : ' check-green'}">✓</span>` : ''}
        <div>
          <div class="card-header-row">
            <div class="card-type-label" style="color:${color}">
              ${isGovt
                ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 10h2v5H8zM14 10h2v5h-2z"/></svg>`
                : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
              }
              <span>${isGovt ? 'GOVT HOSPITAL' : 'PRIVATE'}</span>
              ${isNearest ? `<span class="fastest-badge">FASTEST</span>` : ''}
            </div>
            <div class="eta-badge" style="color:${color};background:${color}15;border-color:${color}30">
              ⚡ ${h.eta_minutes}m
              <span class="dist-sub">(${h.distance_km}km${isOsrm ? '' : '~'})</span>
            </div>
          </div>
          <h4 class="card-hospital-name">${h.short_name || h.name}</h4>
          <div class="card-meta">
            <span class="type-tag-pill${isGovt ? ' tag-govt' : ' tag-priv'}">${isGovt ? 'Govt / Free' : 'Private ER'}</span>
            <div class="beds-row">
              <span class="live-dot"></span>
              <strong>${beds}</strong>&nbsp;beds
            </div>
          </div>
        </div>
        <button class="choose-btn${isGovt ? ' btn-saffron' : ' btn-green'}"
                onclick="event.stopPropagation();confirmHospital('${h.id}','${type}')">
          ${isSelected ? 'CHOSEN · ROUTE ➔' : `CHOOSE ${isGovt ? 'GOVT' : 'PRIVATE'} ➔`}
        </button>
      </div>`;
  };

  const translation = typeof translateBengaliToEnglish === 'function' ? translateBengaliToEnglish(query) : { isTranslated: false };
  const transSummary = translation.isTranslated ? translation.englishSummary : '';
  const qDisplay = query.length > 22 ? query.slice(0, 20) + '…' : query;

  menu.innerHTML = `
    <div class="tiranga-stripe"></div>
    <div class="triage-top-bar">
      <div class="triage-query-label" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="pulse-dot"></span>
          <span>CHOOSE HOSPITAL FOR:&nbsp;"${qDisplay.toUpperCase()}"</span>
        </div>
      </div>
      <div class="triage-top-actions">
        <button class="wtd-btn" onclick="showWhatToDo()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          WHAT TO DO
        </button>
        <button class="close-triage" onclick="closeTriageMenu()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="hospital-cards-grid">
      ${renderCard(govtH, 'govt')}
      ${renderCard(privH, 'priv')}
    </div>`;
}

function showTriageMenu(show) {
  STATE.showTriageMenu = show;
  const el = document.getElementById('triage-menu');
  if (!el) return;
  el.style.display = show ? 'flex' : 'none';
  if (show) {
    el.classList.add('menu-slide-in');
    setTimeout(() => el.classList.remove('menu-slide-in'), 400);
  }
}

function closeTriageMenu() { showTriageMenu(false); }

function selectHospital(id, type) {
  const h = STATE.hospitals.find(h => h.id === id);
  if (!h) return;
  STATE.selectedHospital = h;
  renderTriageMenu();
  // Draw single route to selected hospital
  drawSingleRoute(h);
  placeHospitalMarkers([STATE.nearestGovt, STATE.nearestPrivate].filter(Boolean));
}

async function confirmHospital(id, type) {
  const h = STATE.hospitals.find(h => h.id === id);
  if (!h) return;
  STATE.selectedHospital = h;
  showTriageMenu(false);

  // Draw single definitive route
  await drawSingleRoute(h);
  placeHospitalMarkers([h]);
  showDrawer(h);
}

// ─── HOSPITAL DRAWER ───────────────────────────────
function showDrawer(hospital) {
  const drawer = document.getElementById('hospital-drawer');
  if (!drawer || !hospital) return;

  const triage = STATE.aiTriageResult;
  const protocol = triage ? WHAT_TO_DO[triage.protocol_key] : null;
  const totalBeds = hospital.wards.reduce((s, w) => s + (w.available_now || 0), 0);
  const color = hospital.is_govt ? '#FF671F' : '#138808';
  const topWard = hospital.wards.find(w =>
    triage ? w.ward_code === triage.recommended_ward : true
  ) || hospital.wards[0];

  const sevColor = triage
    ? (triage.severity === 'RED' ? '#ef4444' : triage.severity === 'YELLOW' ? '#f59e0b' : '#22c55e')
    : '#f59e0b';

  drawer.innerHTML = `
    <div class="drawer-handle-bar" id="drawer-handle"></div>
    <div class="drawer-inner-scroll">

      <div class="drawer-header-row">
        <div>
          <div class="drawer-type-label" style="color:${color}">
            ${hospital.is_govt ? '🏛 GOVERNMENT HOSPITAL' : '🏥 PRIVATE HOSPITAL'}
          </div>
          <h3 class="drawer-hosp-name">${hospital.name}</h3>
          <div class="drawer-hosp-area">${hospital.area}</div>
        </div>
        <button class="drawer-x-btn" onclick="hideDrawer()">✕</button>
      </div>

      <div class="metrics-strip">
        <div class="metric-block">
          <span class="drawer-eta-val metric-num" style="color:${color}">${hospital.eta_minutes}</span>
          <span class="metric-lbl">MIN ETA</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-block">
          <span class="drawer-dist-val metric-num" style="color:${color}">${hospital.distance_km}</span>
          <span class="metric-lbl">KM ROAD</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-block">
          <span class="metric-num" style="color:#138808">${totalBeds}</span>
          <span class="metric-lbl">BEDS FREE</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-block">
          <span class="metric-num">${hospital.rating || '4.5'}★</span>
          <span class="metric-lbl">RATING</span>
        </div>
      </div>

      ${triage ? `
      <div class="triage-bar" style="border-left-color:${sevColor}">
        <span class="sev-chip" style="background:${sevColor}">${triage.severity}</span>
        <span class="triage-exp-text">${triage.explanation}</span>
      </div>` : ''}

      ${topWard ? `
      <div class="ward-section">
        <div class="ward-section-label">RECOMMENDED WARD</div>
        <div class="ward-row">
          <span class="ward-name-text">${topWard.label}</span>
          <span style="color:#138808;font-weight:900;font-size:12px">${topWard.available_now} free</span>
        </div>
        <div class="capacity-bar-bg">
          <div class="capacity-bar-fill" style="width:${Math.round((topWard.occupied/Math.max(topWard.total_staffed,1))*100)}%;background:${color}"></div>
        </div>
        <div class="capacity-labels">
          <span>${topWard.occupied}/${topWard.total_staffed} occupied</span>
          <span>${topWard.available_now} available</span>
        </div>
      </div>` : ''}

      ${!STATE.activeHold ? `
      <button class="lock-btn${hospital.is_govt ? ' btn-saffron' : ' btn-green'}" onclick="handleBookSlot()">
        🔒 LOCK BED — 15 MIN HOLD
      </button>` : `
      <div class="hold-active-panel">
        <div class="hold-header-row">
          <span class="hold-live-dot"></span>
          <span class="hold-active-label">BED LOCKED · ACTIVE HOLD</span>
        </div>
        <div class="hold-otp-display">
          <span class="otp-lbl">Gate OTP:</span>
          <span class="otp-val">${STATE.activeHold.otp_code}</span>
        </div>
        <div class="hold-countdown">⏱ ${formatHoldTimer(STATE.activeHold.seconds_left)} remaining</div>
        <button class="cancel-hold-link" onclick="handleCancelHold()">Cancel Hold</button>
      </div>`}

      <div class="quick-dial-strip">
        <a href="tel:108" class="dial-btn btn-saffron">🚑 Call 108 Ambulance</a>
        <a href="tel:${hospital.emergency_phone || hospital.phone}" class="dial-btn btn-green">📞 Call Hospital</a>
      </div>

      ${protocol ? `
      <div class="wtd-section">
        <div class="wtd-section-title">${protocol.title}</div>
        <div class="wtd-section-sev${sevColor === '#ef4444' ? ' wtd-red' : ' wtd-amber'}">⚠️ ${protocol.severity_label}</div>
        <ol class="wtd-list">
          ${protocol.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
        ${protocol.hinglish_tip ? `<div class="wtd-hinglish">💬 ${protocol.hinglish_tip}</div>` : ''}
      </div>` : ''}

      <div class="hosp-features-row">
        ${hospital.has_blood_bank ? '<span class="feat-chip">🩸 Blood Bank</span>' : ''}
        ${hospital.has_cath_lab ? '<span class="feat-chip">❤️ Cath Lab</span>' : ''}
        ${hospital.has_pediatric_icu ? '<span class="feat-chip">👶 PICU</span>' : ''}
        ${hospital.is_trauma_center ? '<span class="feat-chip">🚨 Trauma</span>' : ''}
        ${hospital.is_govt ? '<span class="feat-chip">🆓 Free / Govt</span>' : ''}
      </div>
    </div>`;

  drawer.style.display = 'flex';
  drawer.classList.add('drawer-visible');
  STATE.drawerExpanded = false;

  initDrawerSwipe(drawer);
}

function hideDrawer() {
  const drawer = document.getElementById('hospital-drawer');
  if (drawer) { drawer.classList.remove('drawer-visible', 'drawer-expanded'); }
  STATE.drawerExpanded = false;
  if (!STATE.activeHold) {
    STATE.isSearchActive = false;
    STATE.selectedHospital = null;
  }
}

function initDrawerSwipe(drawer) {
  const handle = drawer.querySelector('#drawer-handle');
  if (!handle) return;

  let startY = 0;
  const onStart = (y) => { startY = y; };
  const onEnd = (y) => {
    const dy = startY - y;
    if (dy > 50) { drawer.classList.add('drawer-expanded'); STATE.drawerExpanded = true; }
    else if (dy < -50) { drawer.classList.remove('drawer-expanded'); STATE.drawerExpanded = false; }
  };

  handle.ontouchstart = e => onStart(e.touches[0].clientY);
  handle.ontouchend = e => onEnd(e.changedTouches[0].clientY);
  handle.onmousedown = e => {
    startY = e.clientY;
    const up = (ev) => { onEnd(ev.clientY); document.removeEventListener('mouseup', up); };
    document.addEventListener('mouseup', up);
  };
}

function formatHoldTimer(secs) {
  return `${Math.floor(secs/60).toString().padStart(2,'0')}:${(secs%60).toString().padStart(2,'0')}`;
}

// ─── BED BOOKING ───────────────────────────────────
function handleBookSlot() {
  const h = STATE.selectedHospital;
  if (!h) return;

  const wardCode = STATE.aiTriageResult?.recommended_ward || 'adult_icu';
  let ward = h.wards.find(w => w.ward_code === wardCode && w.available_now > 0)
    || h.wards.find(w => w.available_now > 0)
    || h.wards[0];

  if (!ward) return;
  ward.available_now = Math.max(0, ward.available_now - 1);
  ward.held_now = (ward.held_now || 0) + 1;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  STATE.activeHold = {
    hospital_id: h.id,
    hospital_name: h.short_name || h.name,
    ward_code: ward.ward_code,
    ward_label: ward.label,
    otp_code: otp,
    seconds_left: 900,
  };

  if (STATE.holdTimerInterval) clearInterval(STATE.holdTimerInterval);
  STATE.holdTimerInterval = setInterval(() => {
    if (!STATE.activeHold) { clearInterval(STATE.holdTimerInterval); return; }
    STATE.activeHold.seconds_left--;
    if (STATE.activeHold.seconds_left <= 0) {
      clearInterval(STATE.holdTimerInterval);
      handleHoldExpired();
      return;
    }
    const el = document.querySelector('.hold-countdown');
    if (el) el.textContent = '⏱ ' + formatHoldTimer(STATE.activeHold.seconds_left) + ' remaining';
  }, 1000);

  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  showDrawer(h);
  showToast(`✅ Bed locked at ${h.short_name || h.name}! OTP: ${otp}`, 'green');
}

function handleCancelHold() {
  if (!STATE.activeHold) return;
  const h = STATE.hospitals.find(h => h.id === STATE.activeHold.hospital_id);
  if (h) {
    const w = h.wards.find(w => w.ward_code === STATE.activeHold.ward_code);
    if (w) { w.available_now++; w.held_now = Math.max(0, (w.held_now || 1) - 1); }
  }
  if (STATE.holdTimerInterval) clearInterval(STATE.holdTimerInterval);
  STATE.activeHold = null;
  if (STATE.selectedHospital) showDrawer(STATE.selectedHospital);
}

function handleHoldExpired() {
  if (!STATE.activeHold) return;
  const h = STATE.hospitals.find(h => h.id === STATE.activeHold.hospital_id);
  if (h) {
    const w = h.wards.find(w => w.ward_code === STATE.activeHold.ward_code);
    if (w) { w.available_now++; w.held_now = Math.max(0, (w.held_now || 1) - 1); }
  }
  STATE.activeHold = null;
  showToast('⏱ Hold expired. Book again.', 'red');
  if (STATE.selectedHospital) showDrawer(STATE.selectedHospital);
}

// ─── VOICE ─────────────────────────────────────────
function toggleVoice() {
  STATE.isListening ? stopVoice() : startVoice();
}

function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { showToast('Voice not supported. Use Chrome/Edge.', 'red'); return; }

  if (STATE.recognition) { try { STATE.recognition.abort(); } catch (e) {} }

  const rec = new SR();
  rec.lang = STATE.voiceLang;
  rec.continuous = false;
  rec.interimResults = true;

  let speechSilenceTimer = null;
  rec.onstart = () => { STATE.isListening = true; updateMicBtn(true); showToast('🎤 Listening…', 'blue'); };
  rec.onresult = e => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    const text = (final || interim).trim();
    const inp = document.getElementById('search-input');
    if (inp && text) inp.value = text;
    if (speechSilenceTimer) clearTimeout(speechSilenceTimer);
    if (text) {
      speechSilenceTimer = setTimeout(() => {
        handleSearch(text);
        stopVoice();
      }, 2200);
    }
  };
  rec.onerror = e => {
    if (speechSilenceTimer) clearTimeout(speechSilenceTimer);
    STATE.isListening = false; updateMicBtn(false);
    if (e.error !== 'no-speech') showToast('Voice error: ' + e.error, 'red');
  };
  rec.onend = () => { STATE.isListening = false; updateMicBtn(false); };

  STATE.recognition = rec;
  rec.start();
}

function stopVoice() {
  try { STATE.recognition && STATE.recognition.stop(); } catch (e) {}
  STATE.isListening = false;
  updateMicBtn(false);
}

function updateMicBtn(on) {
  const btn = document.getElementById('mic-btn');
  if (!btn) return;
  btn.classList.toggle('mic-active', on);
  btn.innerHTML = on
    ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="#ef4444"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0" stroke="#ef4444" stroke-width="2" fill="none"/><line x1="12" y1="19" x2="12" y2="22" stroke="#ef4444" stroke-width="2"/></svg>`
    : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`;
}

function cycleVoiceLang() {
  const langs = ['en-IN', 'bn-IN', 'hi-IN'];
  const labels = { 'en-IN': '🇬🇧', 'bn-IN': '🇧🇩', 'hi-IN': '🇮🇳' };
  const idx = langs.indexOf(STATE.voiceLang);
  STATE.voiceLang = langs[(idx + 1) % langs.length];
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = labels[STATE.voiceLang];
  showToast('Language: ' + STATE.voiceLang, 'blue');
}

// ─── WHAT TO DO MODAL ──────────────────────────────
function showWhatToDo() {
  const triage = STATE.aiTriageResult;
  const p = (triage && WHAT_TO_DO[triage.protocol_key]) || WHAT_TO_DO.cardiac || WHAT_TO_DO.general || WHAT_TO_DO.respiratory || Object.values(WHAT_TO_DO)[0];
  if (!p) return;
  const modal = document.getElementById('wtd-modal');
  if (!modal) return;
  const sevColor = triage && triage.severity === 'RED' ? '#ef4444' : '#f59e0b';
  modal.innerHTML = `
    <div class="modal-backdrop" onclick="closeWtdModal()"></div>
    <div class="modal-sheet liquid-glass">
      <div class="tiranga-stripe"></div>
      <div class="modal-header">
        <h3 class="modal-title">${p.title}</h3>
        <button class="modal-x" onclick="closeWtdModal()">✕</button>
      </div>
      <div class="modal-sev-badge" style="background:${sevColor}20;color:${sevColor};border-color:${sevColor}40">
        ⚠️ ${p.severity_label} — Act Immediately
      </div>
      <ol class="modal-steps">${p.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      ${p.hinglish_tip ? `<div class="modal-hinglish">💬 ${p.hinglish_tip}</div>` : ''}
      <a href="tel:108" class="modal-call-btn btn-saffron">🚑 Call 108 Ambulance Now</a>
    </div>`;
  modal.style.display = 'flex';
}
function closeWtdModal() {
  const m = document.getElementById('wtd-modal');
  if (m) m.style.display = 'none';
}

// ─── LOCATION MODAL ────────────────────────────────
let addrTimer = null;
function showLocationModal() {
  const m = document.getElementById('location-modal');
  if (m) { m.style.display = 'flex'; setTimeout(() => document.getElementById('address-input')?.focus(), 100); }
}
function hideLocationModal() {
  const m = document.getElementById('location-modal');
  if (m) m.style.display = 'none';
}
function handleAddressInput(val) {
  clearTimeout(addrTimer);
  if (val.length < 2) { document.getElementById('address-suggestions').innerHTML = ''; return; }
  addrTimer = setTimeout(() => fetchAddressSuggestions(val), 320);
}
async function fetchAddressSuggestions(q) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
      { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    const el = document.getElementById('address-suggestions');
    if (!el) return;
    el.innerHTML = data.map(item => {
      const parts = (item.display_name || '').split(',').map(s => s.trim());
      return `<div class="addr-sugg" onclick="selectAddress(${item.lat},${item.lon},'${parts.slice(0,2).join(', ').replace(/'/g,"\\'")}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF671F" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <div><strong>${parts.slice(0,2).join(', ')}</strong><small>${parts.slice(2,4).join(', ')}</small></div>
      </div>`;
    }).join('');
  } catch (e) {}
}
function selectAddress(lat, lng, addr) {
  applyLocation(parseFloat(lat), parseFloat(lng), addr);
  hideLocationModal();
}

// ─── SEARCH BAR ────────────────────────────────────
function updateSearchBarState(active, query) {
  const inp = document.getElementById('search-input');
  const clr = document.getElementById('search-clear-btn');
  const sub = document.getElementById('search-submit-btn');
  if (inp) inp.value = query;
  if (clr) clr.style.display = active && query ? 'flex' : 'none';
  if (sub) sub.classList.toggle('submit-active', active);
}

// ─── THEME ─────────────────────────────────────────
function applyTheme(theme) {
  STATE.theme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('pg_theme', theme);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.innerHTML = theme === 'dark'
    ? `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
    : `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#334155" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}
function toggleTheme() { applyTheme(STATE.theme === 'dark' ? 'light' : 'dark'); }

// ─── TOAST ─────────────────────────────────────────
function showToast(msg, type = 'blue') {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const colors = { green: '#138808', red: '#ef4444', blue: '#3b82f6' };
  const t = document.createElement('div');
  t.className = 'toast-item';
  t.style.borderLeftColor = colors[type] || colors.blue;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, 3000);
}

// ─── EVENT BINDING ─────────────────────────────────
function bindEvents() {
  const inp = document.getElementById('search-input');
  if (inp) {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); const v = inp.value.trim(); if (v) handleSearch(v); }
    });
    inp.addEventListener('input', e => {
      const clr = document.getElementById('search-clear-btn');
      if (clr) clr.style.display = e.target.value ? 'flex' : 'none';
    });
  }

  const sub = document.getElementById('search-submit-btn');
  if (sub) sub.addEventListener('click', () => { const v = inp?.value?.trim(); if (v) handleSearch(v); });

  const clr = document.getElementById('search-clear-btn');
  if (clr) clr.addEventListener('click', handleClearSearch);

  const mic = document.getElementById('mic-btn');
  if (mic) mic.addEventListener('click', toggleVoice);

  const lang = document.getElementById('lang-btn');
  if (lang) lang.addEventListener('click', cycleVoiceLang);

  const theme = document.getElementById('theme-btn');
  if (theme) theme.addEventListener('click', toggleTheme);

  const gps = document.getElementById('gps-btn');
  if (gps) gps.addEventListener('click', requestGPS);

  const locBar = document.getElementById('location-bar');
  if (locBar) locBar.addEventListener('click', showLocationModal);

  const locClose = document.getElementById('location-modal-close');
  if (locClose) locClose.addEventListener('click', hideLocationModal);

  const addrInp = document.getElementById('address-input');
  if (addrInp) {
    addrInp.addEventListener('input', e => handleAddressInput(e.target.value));
    addrInp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); document.querySelector('.addr-sugg')?.click(); }
    });
  }

  const liveGps = document.getElementById('live-gps-btn');
  if (liveGps) liveGps.addEventListener('click', () => { hideLocationModal(); requestGPS(); });
}
