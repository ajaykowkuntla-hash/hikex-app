/**
 * HIKEX Geolocation & Navigation Utilities
 * Production-grade helpers for GPS distance, bearing, nearest-point-on-route,
 * ETA estimation, and route progress tracking.
 */

// Haversine distance between two [lng, lat] points in kilometres
export function haversineDistance(p1, p2) {
  const R = 6371; // Earth radius km
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(p2[1] - p1[1]);
  const dLon = toRad(p2[0] - p1[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1[1])) * Math.cos(toRad(p2[1])) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Total route distance in km
export function routeDistance(route) {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(route[i - 1], route[i]);
  }
  return total;
}

// Distance from a point to the nearest segment on a route.
// Returns { index, distance, nearestPoint }
export function nearestPointOnRoute(point, route) {
  if (!route || route.length === 0) return null;
  if (route.length === 1) return { index: 0, distance: haversineDistance(point, route[0]), nearestPoint: route[0] };

  let minDist = Infinity;
  let bestIdx = 0;
  let bestPoint = route[0];

  const toRad = (d) => d * Math.PI / 180;

  for (let i = 0; i < route.length - 1; i++) {
    const A = route[i];
    const B = route[i + 1];
    const P = point;

    // Approximate flat earth projection at this latitude
    const latCos = Math.cos(toRad(A[1]));
    
    // Convert to relative Cartesian-like coordinates (in degrees)
    const px = (P[0] - A[0]) * latCos;
    const py = P[1] - A[1];
    
    const bx = (B[0] - A[0]) * latCos;
    const by = B[1] - A[1];
    
    // Segment length squared
    const l2 = bx * bx + by * by;
    
    let t = 0;
    if (l2 !== 0) {
      // Dot product projection
      t = Math.max(0, Math.min(1, (px * bx + py * by) / l2));
    }
    
    // Nearest point on segment M
    const mLng = A[0] + t * (B[0] - A[0]);
    const mLat = A[1] + t * (B[1] - A[1]);
    const M = [mLng, mLat];
    
    const d = haversineDistance(P, M);
    
    if (d < minDist) {
      minDist = d;
      bestIdx = i;
      bestPoint = M;
    }
  }

  // Also check the very last point
  const lastD = haversineDistance(point, route[route.length - 1]);
  if (lastD < minDist) {
    minDist = lastD;
    bestIdx = route.length - 1;
    bestPoint = route[route.length - 1];
  }

  return { index: bestIdx, distance: minDist, nearestPoint: bestPoint };
}

// Calculate bearing (degrees 0-360) from point A to point B
export function calcBearing(p1, p2) {
  const toRad = (d) => d * Math.PI / 180;
  const toDeg = (r) => r * 180 / Math.PI;
  const dLon = toRad(p2[0] - p1[0]);
  const lat1 = toRad(p1[1]);
  const lat2 = toRad(p2[1]);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Distance remaining from a given route index to the end
export function distanceRemaining(route, fromIndex) {
  let total = 0;
  for (let i = fromIndex + 1; i < route.length; i++) {
    total += haversineDistance(route[i - 1], route[i]);
  }
  return total;
}

// Estimated time of arrival (in minutes) given remaining km and average hiking speed
export function estimateETA(remainingKm, avgSpeedKmH = 4) {
  if (avgSpeedKmH <= 0) return 0;
  return (remainingKm / avgSpeedKmH) * 60;
}

// Format seconds into M:SS or H:MM:SS
export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) {
    const formattedH = h > 99 ? h : String(h).padStart(2, '0');
    return `${formattedH}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Format km nicely
export function formatKm(km) {
  if (km < 1) return `${(km * 1000).toFixed(0)}m`;
  return `${km.toFixed(2)} km`;
}

/**
 * Start real GPS tracking.
 * Returns { stop } function.
 * @param {Function} onPosition - Called with { lat, lng, accuracy, speed, heading }
 * @param {Function} onError - Called with error
 */
export function startGPSTracking(onPosition, onError) {
  if (!navigator.geolocation) {
    onError?.(new Error('Geolocation not supported'));
    return { stop: () => {} };
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed, // m/s, can be null
        heading: pos.coords.heading, // degrees, can be null
        timestamp: pos.timestamp,
      });
    },
    (err) => {
      onError?.(err);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );

  return {
    stop: () => navigator.geolocation.clearWatch(watchId),
  };
}
