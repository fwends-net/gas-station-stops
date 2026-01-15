import { findNearestRoutePoint } from './distance';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

/**
 * Query Overpass API for gas stations within bounds
 * @param {{south: number, west: number, north: number, east: number}} bounds
 * @returns {Promise<Array>} Array of gas station objects
 */
export async function queryGasStations(bounds) {
  const { south, west, north, east } = bounds;

  const query = `
    [out:json][timeout:60];
    (
      node["amenity"="fuel"](${south},${west},${north},${east});
      way["amenity"="fuel"](${south},${west},${north},${east});
    );
    out center;
  `;

  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return parseOverpassResponse(data);
    } catch (error) {
      lastError = error;
      console.warn(`Overpass endpoint ${endpoint} failed:`, error.message);
      continue;
    }
  }

  throw new Error(`All Overpass endpoints failed: ${lastError?.message}`);
}

/**
 * Parse Overpass API response into gas station objects
 */
function parseOverpassResponse(data) {
  const stations = [];

  for (const element of data.elements || []) {
    let lat, lon;

    if (element.type === 'node') {
      lat = element.lat;
      lon = element.lon;
    } else if (element.center) {
      lat = element.center.lat;
      lon = element.center.lon;
    } else {
      continue;
    }

    const tags = element.tags || {};

    stations.push({
      id: element.id,
      lat,
      lon,
      name: tags.name || 'Unnamed Gas Station',
      brand: tags.brand || '',
      openingHours: tags.opening_hours || 'Unknown',
      hasShop:
        (tags.shop && tags.shop !== 'no') ||
        tags.building === 'retail' ||
        tags.convenience === 'yes',
    });
  }

  return stations;
}

/**
 * Find gas stations along a route within a max detour distance
 * @param {Array} stations - Array of gas stations from Overpass
 * @param {Array} routePoints - Array of route points
 * @param {number} maxDetourKm - Maximum detour distance in km
 * @returns {Array} Filtered and enriched gas station objects
 */
export function filterStationsAlongRoute(stations, routePoints, maxDetourKm = 1) {
  const result = [];

  for (const station of stations) {
    const { point, distance } = findNearestRoutePoint(
      station.lat,
      station.lon,
      routePoints
    );

    if (distance <= maxDetourKm) {
      result.push({
        ...station,
        detourDistance: distance,
        distanceAlongRoute: point.distanceFromStart,
        nearestRoutePoint: point,
      });
    }
  }

  // Sort by distance along route
  result.sort((a, b) => a.distanceAlongRoute - b.distanceAlongRoute);

  return result;
}
