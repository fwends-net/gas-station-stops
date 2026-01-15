/**
 * Calculate the great-circle distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km

  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Find the nearest point on a route to a given location
 * @param {number} lat - Latitude of the location
 * @param {number} lon - Longitude of the location
 * @param {Array} routePoints - Array of route points with lat, lon, distanceFromStart
 * @returns {{point: Object, distance: number}} Nearest point and distance to it
 */
export function findNearestRoutePoint(lat, lon, routePoints) {
  let minDistance = Infinity;
  let nearestPoint = null;

  // Sample every 5 points for performance
  const sampleEvery = 5;
  let nearestIdx = 0;

  for (let i = 0; i < routePoints.length; i += sampleEvery) {
    const point = routePoints[i];
    const dist = haversineDistance(lat, lon, point.lat, point.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = point;
      nearestIdx = i;
    }
  }

  // Refine search around nearest point
  const start = Math.max(0, nearestIdx - sampleEvery);
  const end = Math.min(routePoints.length, nearestIdx + sampleEvery);

  for (let i = start; i < end; i++) {
    const point = routePoints[i];
    const dist = haversineDistance(lat, lon, point.lat, point.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestPoint = point;
    }
  }

  return { point: nearestPoint, distance: minDistance };
}
