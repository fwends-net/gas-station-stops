import { useMemo } from 'react';

const GAP_WARNING_THRESHOLD = 15; // km

function findGaps(stations, totalDistance) {
  const gaps = [];

  if (stations.length === 0) {
    if (totalDistance > GAP_WARNING_THRESHOLD) {
      gaps.push({
        fromKm: 0,
        toKm: totalDistance,
        distance: totalDistance,
        afterIndex: -1,
      });
    }
    return gaps;
  }

  // Gap from start to first station
  if (stations[0].distanceAlongRoute > GAP_WARNING_THRESHOLD) {
    gaps.push({
      fromKm: 0,
      toKm: stations[0].distanceAlongRoute,
      distance: stations[0].distanceAlongRoute,
      afterIndex: -1,
    });
  }

  // Gaps between consecutive stations
  for (let i = 0; i < stations.length - 1; i++) {
    const gapDistance = stations[i + 1].distanceAlongRoute - stations[i].distanceAlongRoute;
    if (gapDistance > GAP_WARNING_THRESHOLD) {
      gaps.push({
        fromKm: stations[i].distanceAlongRoute,
        toKm: stations[i + 1].distanceAlongRoute,
        distance: gapDistance,
        afterIndex: i,
      });
    }
  }

  // Gap from last station to end
  if (stations.length > 0) {
    const lastStation = stations[stations.length - 1];
    const gapToEnd = totalDistance - lastStation.distanceAlongRoute;
    if (gapToEnd > GAP_WARNING_THRESHOLD) {
      gaps.push({
        fromKm: lastStation.distanceAlongRoute,
        toKm: totalDistance,
        distance: gapToEnd,
        afterIndex: stations.length - 1,
      });
    }
  }

  return gaps;
}

function exportStationList(stations, totalDistance, routeName) {
  let content = `Gas Station Stops - ${routeName || 'Route'}\n`;
  content += '='.repeat(60) + '\n\n';
  content += `Total route distance: ${totalDistance.toFixed(1)} km\n`;
  content += `Gas stations found: ${stations.length}\n\n`;
  content += '-'.repeat(60) + '\n\n';

  stations.forEach((station, index) => {
    const name = station.brand && station.brand !== station.name
      ? `${station.name} (${station.brand})`
      : station.name;
    const pct = ((station.distanceAlongRoute / totalDistance) * 100).toFixed(0);
    const detourM = (station.detourDistance * 1000).toFixed(0);

    content += `${index + 1}. ${name}\n`;
    content += `   At km ${station.distanceAlongRoute.toFixed(1)} (${pct}% of route)\n`;
    content += `   Detour: ${detourM}m off route\n`;
    content += `   Google Maps: https://www.google.com/maps?q=${station.lat},${station.lon}\n\n`;
  });

  // Create and trigger download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${routeName || 'route'}_gas_stations.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function StationList({
  stations,
  totalDistance,
  selectedStation,
  onStationSelect,
  maxDetour,
  onMaxDetourChange,
  bikepackingMode,
  onBikepackingModeChange,
  routeName,
}) {
  const gaps = useMemo(() => {
    if (!stations || !totalDistance) return [];
    return findGaps(stations, totalDistance);
  }, [stations, totalDistance]);

  if (!stations) {
    return (
      <div className="station-list empty">
        <p>Upload a GPX file to find gas stations along your route.</p>
      </div>
    );
  }

  // Create a map of gaps by afterIndex for easy lookup
  const gapsByIndex = {};
  gaps.forEach(gap => {
    gapsByIndex[gap.afterIndex] = gap;
  });

  return (
    <div className="station-list">
      <div className="station-list-header">
        <h2>Gas Stations</h2>
        <div className="station-count">
          {stations.length} found along {totalDistance?.toFixed(1)} km route
        </div>

        {gaps.length > 0 && (
          <div className="gap-summary">
            ⚠️ {gaps.length} gap{gaps.length > 1 ? 's' : ''} over {GAP_WARNING_THRESHOLD}km without stations
          </div>
        )}

        <div className="station-controls">
          <div className="detour-filter">
            <label>
              Max detour:
              <select value={maxDetour} onChange={(e) => onMaxDetourChange(Number(e.target.value))}>
                <option value={0.5}>500m</option>
                <option value={1}>1 km</option>
                <option value={1.5}>1.5 km</option>
                <option value={2}>2 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={40}>40 km</option>
              </select>
            </label>
          </div>

          <label className="bikepacking-mode">
            <input
              type="checkbox"
              checked={bikepackingMode}
              onChange={(e) => onBikepackingModeChange(e.target.checked)}
            />
            Bikepacking mode
          </label>

          <button
            className="export-btn"
            onClick={() => exportStationList(stations, totalDistance, routeName)}
            disabled={stations.length === 0}
          >
            Export List
          </button>
        </div>
      </div>

      <div className="station-items">
        {stations.length === 0 ? (
          <p className="no-stations">No gas stations found within {maxDetour} km of your route.</p>
        ) : (
          <>
            {/* Gap before first station */}
            {gapsByIndex[-1] && (
              <div className="gap-warning">
                <span className="gap-icon">⚠️</span>
                <span className="gap-text">
                  {gapsByIndex[-1].distance.toFixed(1)} km without stations
                  <span className="gap-range">
                    (km 0 → km {gapsByIndex[-1].toKm.toFixed(1)})
                  </span>
                </span>
              </div>
            )}

            {stations.map((station, index) => {
              const pct = ((station.distanceAlongRoute / totalDistance) * 100).toFixed(0);
              const isSelected = selectedStation?.id === station.id;
              const gapAfter = gapsByIndex[index];

              return (
                <div key={station.id}>
                  <div
                    className={`station-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onStationSelect(station)}
                  >
                    <div className="station-number">{index + 1}</div>
                    <div className="station-info">
                      <div className="station-name">
                        {station.name}
                        {station.brand && station.brand !== station.name && (
                          <span className="station-brand"> ({station.brand})</span>
                        )}
                      </div>
                      <div className="station-details">
                        <span className="station-distance">
                          km {station.distanceAlongRoute.toFixed(1)}
                        </span>
                        <span className="station-pct">({pct}%)</span>
                        <span className="station-detour">
                          {(station.detourDistance * 1000).toFixed(0)}m detour
                        </span>
                      </div>
                    </div>
                    <a
                      className="station-maps-link"
                      href={`https://www.google.com/maps?q=${station.lat},${station.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open in Google Maps"
                    >
                      🗺️
                    </a>
                  </div>

                  {/* Gap warning after this station */}
                  {gapAfter && (
                    <div className="gap-warning">
                      <span className="gap-icon">⚠️</span>
                      <span className="gap-text">
                        {gapAfter.distance.toFixed(1)} km without stations
                        <span className="gap-range">
                          (km {gapAfter.fromKm.toFixed(1)} → km {gapAfter.toKm.toFixed(1)})
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
