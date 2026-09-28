// distance.js — OSRM-powered real road distance + ETA
// Uses OSRM Table API for batch calculation and Route API for single route geometry

'use strict';

// Haversine as fallback only
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
}

// ETA from road duration (seconds) → rounded minutes
function secondsToMinutes(secs) {
  return Math.max(1, Math.round(secs / 60));
}

// Fallback ETA from km (25km/h Kolkata average)
function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  return haversineKm(lat1, lng1, lat2, lng2);
}
function calculateEtaMinutes(distKm) {
  return Math.max(2, Math.round((distKm / 25) * 60));
}

/**
 * Batch-calculate real road distances + ETAs from one origin to many destinations
 * using OSRM Table API (single HTTP request for all hospitals).
 * 
 * Returns array of { distance_km, eta_minutes } in same order as destinations.
 * Falls back to haversine if OSRM is unreachable.
 * 
 * @param {number} originLat
 * @param {number} originLng
 * @param {Array<{lat, lng}>} destinations
 * @returns {Promise<Array<{distance_km, eta_minutes}>>}
 */
async function batchRealDistances(originLat, originLng, destinations) {
  // Build OSRM Table API URL
  // Format: {lng,lat} for each coordinate
  const coords = [
    `${originLng},${originLat}`,
    ...destinations.map(d => `${d.lng},${d.lat}`)
  ].join(';');

  const url = `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=duration,distance`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OSRM table error ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.durations || !data.distances) {
      throw new Error('OSRM table returned invalid data');
    }

    const durations = data.durations[0]; // row 0 = from origin
    const distances = data.distances[0];

    // durations[0] is origin→origin = 0, destinations start at index 1
    return destinations.map((_, i) => {
      const rawSecs = durations[i + 1];
      const rawMeters = distances[i + 1];

      if (rawSecs == null || rawSecs === 0 || rawMeters == null) {
        // OSRM couldn't route — fall back to haversine
        const fallbackKm = haversineKm(originLat, originLng, destinations[i].lat, destinations[i].lng);
        return {
          distance_km: fallbackKm,
          eta_minutes: calculateEtaMinutes(fallbackKm),
          source: 'haversine',
        };
      }

      return {
        distance_km: Math.round(rawMeters / 100) / 10, // meters → km, 1 decimal
        eta_minutes: secondsToMinutes(rawSecs),
        source: 'osrm',
      };
    });
  } catch (err) {
    console.warn('OSRM batch failed, using haversine fallback:', err.message);
    return destinations.map(d => {
      const km = haversineKm(originLat, originLng, d.lat, d.lng);
      return { distance_km: km, eta_minutes: calculateEtaMinutes(km), source: 'haversine' };
    });
  }
}

/**
 * Get a single route geometry + real distance/ETA from OSRM Route API.
 * Returns { geometry (GeoJSON), distance_km, eta_minutes }
 */
async function getRealRoute(originLat, originLng, destLat, destLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`OSRM route error ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
      throw new Error('No route returned');
    }

    const route = data.routes[0];
    return {
      geometry: route.geometry,
      distance_km: Math.round(route.distance / 100) / 10,
      eta_minutes: secondsToMinutes(route.duration),
      source: 'osrm',
    };
  } catch (err) {
    console.warn('OSRM route failed:', err.message);
    return {
      geometry: null,
      distance_km: haversineKm(originLat, originLng, destLat, destLng),
      eta_minutes: calculateEtaMinutes(haversineKm(originLat, originLng, destLat, destLng)),
      source: 'haversine',
    };
  }
}
