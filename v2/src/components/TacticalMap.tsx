import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Hospital } from '../types';
import { Locate } from 'lucide-react';
import { getDrivingRoute, generateCurvedRoadRoute } from '../utils/routing';
import { calculateDistanceKm } from '../utils/distance';

interface TacticalMapProps {
  userLocation: { lat: number; lng: number; address: string };
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hosp: Hospital) => void;
  isHolding: boolean;
  onUserLocate?: () => void;
  isLocating?: boolean;
  isSearchActive?: boolean;
  onRouteCalculated?: (distanceKm: number, durationMin: number) => void;
  drawerExpanded?: boolean;
  isAdjustingPickup?: boolean;
  pickupPoint?: { lat: number; lng: number } | null;
  onPickupPointChange?: (point: { lat: number; lng: number }) => void;
  theme?: 'light' | 'dark';
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  userLocation,
  hospitals,
  selectedHospital,
  onSelectHospital,
  isHolding,
  onUserLocate,
  isLocating = false,
  isSearchActive = false,
  onRouteCalculated,
  drawerExpanded = false,
  isAdjustingPickup = false,
  pickupPoint = null,
  onPickupPointChange,
  theme = 'light',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const routeGlowPolylineRef = useRef<L.Polyline | null>(null);
  const hospitalMarkersRef = useRef<Record<string, L.Marker>>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const isRecenterActiveRef = useRef(false);
  const prevCenteredLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Rapido-style pickup pin & walking dotted path elements
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const walkingLineRef = useRef<L.Polyline | null>(null);
  const walkingBadgeRef = useRef<L.Marker | null>(null);

  // Stable callback refs to prevent effect re-trigger loops
  const onSelectHospitalRef = useRef(onSelectHospital);
  onSelectHospitalRef.current = onSelectHospital;

  const onRouteCalculatedRef = useRef(onRouteCalculated);
  onRouteCalculatedRef.current = onRouteCalculated;

  const userLocationRef = useRef(userLocation);
  userLocationRef.current = userLocation;

  const onPickupPointChangeRef = useRef(onPickupPointChange);
  onPickupPointChangeRef.current = onPickupPointChange;

  const isAdjustingPickupRef = useRef(isAdjustingPickup);
  isAdjustingPickupRef.current = isAdjustingPickup;

  const lastRoutedKeyRef = useRef<string>('');
  const lastFittedHospitalIdRef = useRef<string>('');
  const userHasPannedMapRef = useRef<boolean>(false);

  // 1. Initialize Leaflet Map with crisp OpenStreetMap tiles - default daylight street view
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const initialLat = userLocationRef.current.lat;
      const initialLng = userLocationRef.current.lng;

      // Google Maps initial load: center directly on user coordinates
      const mapOptions: L.MapOptions & { tap?: boolean } = {
        center: [initialLat, initialLng],
        zoom: 16.5,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        tap: false, // Critical fix: avoids touch/mouse gesture freeze in browsers & iframes
      };

      const map = L.map(mapContainerRef.current, mapOptions as L.MapOptions);

      // Explicitly enforce dragging & gesture controls
      map.dragging.enable();
      if (map.touchZoom) map.touchZoom.enable();
      if (map.scrollWheelZoom) map.scrollWheelZoom.enable();
      if (map.doubleClickZoom) map.doubleClickZoom.enable();

      // Track when user manually pans/drags the map so background updates don't yank it away
      map.on('dragstart', () => {
        userHasPannedMapRef.current = true;
      });
      map.on('zoomstart', () => {
        userHasPannedMapRef.current = true;
      });

      // 100% Free OpenStreetMap tiles - zero API key, no watermark, crisp roads and text
      const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: theme === 'dark' ? 'osm-dark-tiles' : 'osm-street-tiles',
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
      setMapReady(true);

      // Invalidate size and ensure map is strictly centered on user's exact coordinates once DOM layout settles
      const resizeTimer = setTimeout(() => {
        try {
          map.invalidateSize();
          map.setView([userLocationRef.current.lat, userLocationRef.current.lng], 16.5, {
            animate: false,
          });
        } catch {
          // ignore
        }
      }, 100);

      // Handle container resizes seamlessly
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          try {
            map.invalidateSize();
          } catch {
            // ignore
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      // Map click handler when in pickup adjustment mode: click anywhere to place/move the pickup pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isAdjustingPickupRef.current && onPickupPointChangeRef.current) {
          onPickupPointChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      return () => {
        clearTimeout(resizeTimer);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        try {
          map.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      };
    } catch (e) {
      console.error('Error creating Leaflet map:', e);
    }
  }, []);

  // 2. Update user GPS marker with authentic Google Maps Blue Location Dot
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (userMarkerRef.current) {
      try {
        userMarkerRef.current.remove();
      } catch {
        // ignore
      }
    }

    try {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center w-14 h-14 pointer-events-none">
            <!-- Google Maps Accuracy Halo Circle -->
            <span class="absolute inline-flex w-14 h-14 rounded-full bg-[#1a73e8]/20 border border-[#1a73e8]/40 animate-pulse"></span>
            <!-- Directional soft beam -->
            <span class="absolute inline-flex w-7 h-7 rounded-full bg-[#00b0ff]/30"></span>
            <!-- Solid White Border with Google Blue Core Dot -->
            <span class="relative inline-flex w-4 h-4 rounded-full bg-[#0091ea] border-[2.5px] border-white shadow-[0_2px_10px_rgba(0,145,234,0.9)]"></span>
          </div>
        `,
        iconSize: [56, 56],
        iconAnchor: [28, 28],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
        interactive: false, // Critical: user location blue dot must never block map dragging or clicking
      }).addTo(map);
      userMarkerRef.current = marker;

      // By default on app open and whenever user coordinates change:
      // Center directly on the blue dot if user hasn't manually panned away
      const prev = prevCenteredLocationRef.current;
      const isFirstCentering = !prev;
      const coordsChanged =
        !prev ||
        Math.abs(prev.lat - userLocation.lat) > 0.0001 ||
        Math.abs(prev.lng - userLocation.lng) > 0.0001;

      if (coordsChanged && !isAdjustingPickup && (isFirstCentering || !userHasPannedMapRef.current)) {
        prevCenteredLocationRef.current = { lat: userLocation.lat, lng: userLocation.lng };
        map.setView([userLocation.lat, userLocation.lng], 16.5, { animate: !isFirstCentering });
      }
    } catch (e) {
      console.warn('Failed to place user marker:', e);
    }
  }, [userLocation.lat, userLocation.lng, mapReady, isAdjustingPickup]);

  // 3. Rapido-Style Draggable Road Pickup Pin & Dotted Walking Arrow Path
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // If not in pickup adjustment mode, clear elements
    if (!isAdjustingPickup || !pickupPoint) {
      if (pickupMarkerRef.current) {
        try {
          pickupMarkerRef.current.remove();
        } catch {
          // ignore
        }
        pickupMarkerRef.current = null;
      }
      if (walkingLineRef.current) {
        try {
          walkingLineRef.current.remove();
        } catch {
          // ignore
        }
        walkingLineRef.current = null;
      }
      if (walkingBadgeRef.current) {
        try {
          walkingBadgeRef.current.remove();
        } catch {
          // ignore
        }
        walkingBadgeRef.current = null;
      }
      return;
    }

    const distMeters = Math.max(
      5,
      Math.round(
        calculateDistanceKm(userLocation.lat, userLocation.lng, pickupPoint.lat, pickupPoint.lng) * 1000
      )
    );

    // 1. Draggable Pickup Marker
    if (!pickupMarkerRef.current) {
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-pin',
        html: `
          <div class="relative flex flex-col items-center select-none cursor-grab active:cursor-grabbing w-[120px]">
            <!-- Rapido Style Floating Pill -->
            <div class="bg-[#FF671F] text-white font-black text-[10px] tracking-wider px-2.5 py-1 rounded-full shadow-[0_6px_24px_rgba(255,103,31,0.75)] border-2 border-white flex items-center gap-1.5 whitespace-nowrap animate-bounce">
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>ROAD PICKUP</span>
              <span class="text-[8px] bg-white text-[#FF671F] px-1 py-0.5 rounded font-black">DRAG</span>
            </div>
            <!-- Pin Stem & Head -->
            <div class="w-1 h-3 bg-[#FF671F] border-x border-white"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-[#FF671F] border-2 border-white shadow-lg"></div>
          </div>
        `,
        iconSize: [120, 60],
        iconAnchor: [60, 60],
      });

      const marker = L.marker([pickupPoint.lat, pickupPoint.lng], {
        icon: pickupIcon,
        draggable: true,
        zIndexOffset: 3000,
      }).addTo(map);

      marker.on('drag', (e) => {
        const pos = e.target.getLatLng();
        if (onPickupPointChangeRef.current) {
          onPickupPointChangeRef.current({ lat: pos.lat, lng: pos.lng });
        }
      });

      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        if (onPickupPointChangeRef.current) {
          onPickupPointChangeRef.current({ lat: pos.lat, lng: pos.lng });
        }
      });

      pickupMarkerRef.current = marker;

      // Fit bounds to show both user location and road pickup spot comfortably
      try {
        const bounds = L.latLngBounds([
          [userLocation.lat, userLocation.lng],
          [pickupPoint.lat, pickupPoint.lng],
        ]);
        map.fitBounds(bounds, { padding: [100, 100], maxZoom: 18, animate: true });
      } catch {
        // ignore
      }
    } else {
      pickupMarkerRef.current.setLatLng([pickupPoint.lat, pickupPoint.lng]);
    }

    // 2. Dotted Walking Line (Rapido / Uber walking line)
    const lineCoords: [number, number][] = [
      [userLocation.lat, userLocation.lng],
      [pickupPoint.lat, pickupPoint.lng],
    ];

    if (!walkingLineRef.current) {
      const line = L.polyline(lineCoords, {
        color: '#FF671F',
        weight: 4.5,
        dashArray: '6, 10',
        lineCap: 'round',
        opacity: 0.95,
        interactive: false, // Polyline must never block map dragging
      }).addTo(map);
      walkingLineRef.current = line;
    } else {
      walkingLineRef.current.setLatLngs(lineCoords);
    }

    // 3. Walking Distance & Arrow Badge at Midpoint
    const midLat = (userLocation.lat + pickupPoint.lat) / 2;
    const midLng = (userLocation.lng + pickupPoint.lng) / 2;

    const badgeIcon = L.divIcon({
      className: 'walking-badge-marker',
      html: `
        <div class="bg-white border-2 border-[#FF671F] text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <span class="text-xs">🚶</span>
          <span>Walk ~${distMeters}m</span>
          <span class="text-[#FF671F] text-xs">➔</span>
        </div>
      `,
      iconSize: [120, 30],
      iconAnchor: [60, 15],
    });

    if (!walkingBadgeRef.current) {
      const badge = L.marker([midLat, midLng], {
        icon: badgeIcon,
        interactive: false,
        zIndexOffset: 2500,
      }).addTo(map);
      walkingBadgeRef.current = badge;
    } else {
      walkingBadgeRef.current.setLatLng([midLat, midLng]);
      walkingBadgeRef.current.setIcon(badgeIcon);
    }
  }, [isAdjustingPickup, pickupPoint, userLocation.lat, userLocation.lng, mapReady]);

  // 4. Update hospital markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Clear previous markers
    Object.values(hospitalMarkersRef.current).forEach((m: L.Marker) => {
      try {
        m.remove();
      } catch {
        // ignore
      }
    });
    hospitalMarkersRef.current = {};

    hospitals.forEach((hosp) => {
      const isSelected = selectedHospital ? hosp.id === selectedHospital.id : false;
      const availableBeds = hosp.wards.reduce((acc, w) => acc + w.available_now, 0);

      try {
        const hospitalIcon = L.divIcon({
          className: 'custom-hospital-marker',
          html: `
            <div class="cursor-pointer group flex flex-col items-center w-[120px] transition-transform duration-300 ${
              isSelected ? 'scale-110 z-30' : 'opacity-90 hover:opacity-100 z-10'
            }">
              <!-- Pin Head (Google Maps Medical Style) -->
              <div class="relative flex items-center justify-center px-2.5 py-1 rounded-xl font-sans text-[10px] font-bold shadow-lg transition-all duration-300 ${
                isSelected
                  ? 'bg-white border-2 border-[#FF671F] text-slate-900 shadow-[0_4px_16px_rgba(255,103,31,0.35)] ring-2 ring-[#FF671F]/30'
                  : 'bg-white/95 border border-slate-300 text-slate-800'
              }">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${availableBeds > 0 ? 'bg-[#16A34A]' : 'bg-[#ef4444]'} animate-pulse"></span>
                  <span class="max-w-[110px] truncate tracking-tight font-black">${hosp.short_name || hosp.name}</span>
                </div>
              </div>

              <!-- Distance & ETA Pill -->
              <div class="mt-0.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-bold ${
                isSelected ? 'text-[#FF671F]' : 'text-slate-600'
              } tracking-tight shadow-sm">
                ${hosp.distance_km} km • ${hosp.eta_minutes} min
              </div>

              <!-- Pin Anchor Stem -->
              <div class="w-0.5 h-2.5 ${isSelected ? 'bg-[#FF671F]' : 'bg-slate-400'}"></div>
              <div class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#FF671F]' : 'bg-slate-500'}"></div>
            </div>
          `,
          iconSize: [120, 52],
          iconAnchor: [60, 52],
        });

        const marker = L.marker([hosp.lat, hosp.lng], { icon: hospitalIcon }).addTo(map);
        marker.on('click', () => {
          onSelectHospitalRef.current(hosp);
        });

        hospitalMarkersRef.current[hosp.id] = marker;
      } catch (e) {
        console.warn('Failed to place hospital marker:', e);
      }
    });
  }, [hospitals, selectedHospital?.id, mapReady]);

  // 5. Stable Neon Road Route drawing - active from userLocation/pickup to selectedHospital
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // If no hospital is selected yet (initial app state), remove route and exit
    if (!selectedHospital) {
      if (routePolylineRef.current) {
        try {
          routePolylineRef.current.remove();
        } catch {}
        routePolylineRef.current = null;
      }
      if (routeGlowPolylineRef.current) {
        try {
          routeGlowPolylineRef.current.remove();
        } catch {}
        routeGlowPolylineRef.current = null;
      }
      lastRoutedKeyRef.current = '';
      return;
    }

    // Start point is pickupPoint if adjusting, otherwise userLocation
    const startLat = isAdjustingPickup && pickupPoint ? pickupPoint.lat : userLocation.lat;
    const startLng = isAdjustingPickup && pickupPoint ? pickupPoint.lng : userLocation.lng;

    const routeKey = `${startLat.toFixed(4)},${startLng.toFixed(4)}->${selectedHospital.id}:${isHolding ? 'hold' : 'route'}`;
    if (lastRoutedKeyRef.current === routeKey && routePolylineRef.current) {
      return;
    }
    lastRoutedKeyRef.current = routeKey;

    // Clear old polylines
    if (routePolylineRef.current) {
      try {
        routePolylineRef.current.remove();
      } catch {
        // ignore
      }
      routePolylineRef.current = null;
    }
    if (routeGlowPolylineRef.current) {
      try {
        routeGlowPolylineRef.current.remove();
      } catch {
        // ignore
      }
      routeGlowPolylineRef.current = null;
    }

    let isCurrent = true;

    try {
      // 1. Instantly draw curved arterial road geometry (never a raw straight line!)
      const instantRoadCoords = generateCurvedRoadRoute(
        startLat,
        startLng,
        selectedHospital.lat,
        selectedHospital.lng
      );
      // Ensure the start and end connect directly with pinpoint precision
      instantRoadCoords[0] = [startLat, startLng];
      instantRoadCoords[instantRoadCoords.length - 1] = [selectedHospital.lat, selectedHospital.lng];

      // Google Maps Navigation Route: Indian flag theme (Emerald/Green path, Saffron for active emergency hold)
      const glowColor = isHolding ? '#FF671F' : '#16A34A';
      const coreColor = isHolding ? '#FF8533' : '#22C55E';

      const glowPolyline = L.polyline(instantRoadCoords, {
        color: glowColor,
        weight: 9,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false, // Critical: polyline must never block map dragging
      }).addTo(map);

      const corePolyline = L.polyline(instantRoadCoords, {
        color: coreColor,
        weight: 4.5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false, // Critical: polyline must never block map dragging
      }).addTo(map);

      routeGlowPolylineRef.current = glowPolyline;
      routePolylineRef.current = corePolyline;

      // Fit bounds when explicitly switching to a different hospital after search or booking a hold
      if (
        (isSearchActive || isHolding) &&
        !isRecenterActiveRef.current &&
        lastFittedHospitalIdRef.current !== `${selectedHospital.id}:${isHolding}`
      ) {
        lastFittedHospitalIdRef.current = `${selectedHospital.id}:${isHolding}`;
        const initialBounds = L.latLngBounds(instantRoadCoords);
        if (initialBounds.isValid()) {
          map.fitBounds(initialBounds, {
            padding: [70, 70],
            maxZoom: 15,
            animate: true,
          });
        }
      }

      // 2. Fetch real street-by-street OSRM navigation driving route asynchronously
      getDrivingRoute(
        startLat,
        startLng,
        selectedHospital.lat,
        selectedHospital.lng
      ).then((routeResult) => {
        if (!isCurrent || !mapInstanceRef.current) return;

        if (corePolyline && glowPolyline && routeResult.coordinates.length >= 2) {
          const exactCoords: [number, number][] = routeResult.coordinates.map((pt) => [pt[0], pt[1]]);
          exactCoords[0] = [startLat, startLng];
          exactCoords[exactCoords.length - 1] = [selectedHospital.lat, selectedHospital.lng];

          corePolyline.setLatLngs(exactCoords);
          glowPolyline.setLatLngs(exactCoords);
        }

        if (onRouteCalculatedRef.current) {
          onRouteCalculatedRef.current(routeResult.distanceKm, routeResult.durationMin);
        }
      });
    } catch (e) {
      console.warn('Failed to draw road route polyline:', e);
    }

    return () => {
      isCurrent = false;
    };
  }, [
    userLocation.lat,
    userLocation.lng,
    selectedHospital?.id,
    selectedHospital?.lat,
    selectedHospital?.lng,
    isHolding,
    isSearchActive,
    isAdjustingPickup,
    pickupPoint?.lat,
    pickupPoint?.lng,
    mapReady,
  ]);

  // Recenter map on user location with high zoom level (Google Maps target button behavior)
  const handleRecenter = () => {
    isRecenterActiveRef.current = true;
    userHasPannedMapRef.current = false; // Reset manual pan flag so map stays centered
    if (onUserLocate) {
      onUserLocate();
    }
    if (mapInstanceRef.current) {
      const targetPoint =
        isAdjustingPickup && pickupPoint
          ? [pickupPoint.lat, pickupPoint.lng]
          : [userLocation.lat, userLocation.lng];

      mapInstanceRef.current.flyTo(targetPoint as [number, number], 17.5, {
        animate: true,
        duration: 0.8,
      });
    }
    setTimeout(() => {
      isRecenterActiveRef.current = false;
    }, 3000);
  };

  // Dynamically update tile classes when theme changes
  useEffect(() => {
    if (!tileLayerRef.current) return;
    try {
      const container = tileLayerRef.current.getContainer();
      if (container) {
        if (theme === 'dark') {
          container.classList.remove('osm-street-tiles');
          container.classList.add('osm-dark-tiles');
        } else {
          container.classList.remove('osm-dark-tiles');
          container.classList.add('osm-street-tiles');
        }
      }
    } catch {
      // ignore
    }
  }, [theme, mapReady]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#f1f5f9] dark:bg-[#070e1e]">
      {/* Fullscreen Map Canvas with native grab cursor and direct touch/pointer response */}
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      />

      {/* Floating Google Maps Target Button on Right - Centered at ~50% height */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 right-3.5 z-30 flex flex-col gap-2.5 transition-all duration-300 ${
          drawerExpanded
            ? 'opacity-0 pointer-events-none translate-x-4'
            : 'opacity-100 pointer-events-auto translate-x-0'
        }`}
      >
        {/* Recenter / GPS target button */}
        <button
          onClick={handleRecenter}
          title="Recenter on My Location"
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
            isLocating
              ? 'liquid-btn-saffron text-white animate-pulse'
              : 'liquid-glass-orb text-[#FF671F] hover:bg-[#FF671F] hover:text-white'
          }`}
        >
          <Locate className="w-5 h-5" />
        </button>
      </div>

      {/* Street/Corridor info tag floating top-left when search is active */}
      {isSearchActive && selectedHospital && (
        <div className="absolute top-28 left-3.5 z-30 pointer-events-auto hidden sm:flex items-center gap-2 liquid-glass-pill px-4 py-2 rounded-full shadow-md text-[11px] font-semibold text-slate-800 dark:text-slate-200">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
          <span className="text-slate-500 dark:text-slate-400">DESTINATION:</span>
          <span className="text-slate-900 dark:text-white uppercase font-bold">{selectedHospital.short_name || selectedHospital.name}</span>
        </div>
      )}
    </div>
  );
};
