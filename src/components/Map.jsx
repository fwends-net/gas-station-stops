import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom gas station icon
const gasStationIcon = new L.DivIcon({
  className: 'gas-station-marker',
  html: `<div style="
    background: #e74c3c;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    border: 2px solid white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  ">⛽</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Selected gas station icon
const selectedGasStationIcon = new L.DivIcon({
  className: 'gas-station-marker-selected',
  html: `<div style="
    background: #27ae60;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  ">⛽</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Supermarket icon
const supermarketIcon = new L.DivIcon({
  className: 'supermarket-marker',
  html: `<div style="
    background: #f39c12;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    border: 2px solid white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  ">🛒</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Selected supermarket icon
const selectedSupermarketIcon = new L.DivIcon({
  className: 'supermarket-marker-selected',
  html: `<div style="
    background: #27ae60;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  ">🛒</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function getStationIcon(station, isSelected) {
  if (station.category === 'supermarket') {
    return isSelected ? selectedSupermarketIcon : supermarketIcon;
  }
  return isSelected ? selectedGasStationIcon : gasStationIcon;
}

// Component to fit map bounds to route
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);

  return null;
}

export default function Map({ routePoints, stations, selectedStation, onStationSelect }) {
  const defaultCenter = [39.5, 2.8]; // Mallorca as default
  const defaultZoom = 10;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routePoints && routePoints.length > 0 && (
        <>
          <FitBounds points={routePoints} />
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lon])}
            color="#3498db"
            weight={4}
            opacity={0.8}
          />
        </>
      )}

      {stations &&
        stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lon]}
            icon={getStationIcon(station, selectedStation?.id === station.id)}
            eventHandlers={{
              click: () => onStationSelect(station),
            }}
          >
            <Popup>
              <div className="station-popup">
                <strong>{station.name}</strong>
                {station.brand && <div>Brand: {station.brand}</div>}
                <div>At km {station.distanceAlongRoute.toFixed(1)}</div>
                <div>Detour: {(station.detourDistance * 1000).toFixed(0)}m</div>
                <a
                  href={`https://www.google.com/maps?q=${station.lat},${station.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
