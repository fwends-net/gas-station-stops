import { haversineDistance } from './distance';

/**
 * Parse a GPX file and extract track points with cumulative distance
 * @param {string} gpxText - The GPX file content as text
 * @returns {{name: string, points: Array}} Route name and array of track points
 */
export function parseGpx(gpxText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxText, 'text/xml');

  // Check for parsing errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid GPX file');
  }

  // Get route name
  const nameEl = doc.querySelector('trk > name') || doc.querySelector('metadata > name');
  const name = nameEl ? nameEl.textContent : 'Unnamed Route';

  // Extract track points
  const trkpts = doc.querySelectorAll('trkpt');
  const points = [];
  let cumulativeDistance = 0;
  let prevPoint = null;

  trkpts.forEach((trkpt) => {
    const lat = parseFloat(trkpt.getAttribute('lat'));
    const lon = parseFloat(trkpt.getAttribute('lon'));

    if (prevPoint) {
      cumulativeDistance += haversineDistance(
        prevPoint.lat,
        prevPoint.lon,
        lat,
        lon
      );
    }

    const point = {
      lat,
      lon,
      distanceFromStart: cumulativeDistance,
    };

    points.push(point);
    prevPoint = point;
  });

  return { name, points };
}

/**
 * Get the bounding box of a route with a buffer
 * @param {Array} points - Array of route points
 * @param {number} bufferKm - Buffer distance in km
 * @returns {{south: number, west: number, north: number, east: number}}
 */
export function getRouteBounds(points, bufferKm = 2) {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);

  const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;

  // Approximate degrees per km
  const latPerKm = 1 / 111;
  const lonPerKm = 1 / (111 * Math.cos((avgLat * Math.PI) / 180));

  const bufferLat = bufferKm * latPerKm;
  const bufferLon = bufferKm * lonPerKm;

  return {
    south: Math.min(...lats) - bufferLat,
    west: Math.min(...lons) - bufferLon,
    north: Math.max(...lats) + bufferLat,
    east: Math.max(...lons) + bufferLon,
  };
}
