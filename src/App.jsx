import { useState, useCallback } from 'react';
import Map from './components/Map';
import FileUpload from './components/FileUpload';
import StationList from './components/StationList';
import About from './components/About';
import { parseGpx, getRouteBounds } from './utils/gpxParser';
import { queryGasStations, filterStationsAlongRoute } from './utils/overpassApi';
import './App.css';

function App() {
  const [routeName, setRouteName] = useState(null);
  const [routePoints, setRoutePoints] = useState(null);
  const [allStations, setAllStations] = useState(null);
  const [filteredStations, setFilteredStations] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [maxDetour, setMaxDetour] = useState(1);
  const [queriedDetour, setQueriedDetour] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  const handleFileLoad = useCallback(async (gpxText, fileName) => {
    setIsLoading(true);
    setError(null);
    setSelectedStation(null);

    try {
      // Parse GPX
      const { name, points } = parseGpx(gpxText);
      setRouteName(name || fileName);
      setRoutePoints(points);

      // Get bounds and query for gas stations
      const bounds = getRouteBounds(points, maxDetour + 0.5);
      const stations = await queryGasStations(bounds);
      setAllStations(stations);
      setQueriedDetour(maxDetour);

      // Filter stations along route
      const filtered = filterStationsAlongRoute(stations, points, maxDetour);
      setFilteredStations(filtered);
    } catch (err) {
      console.error('Error processing GPX:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [maxDetour]);

  const handleMaxDetourChange = useCallback(async (newMaxDetour) => {
    setMaxDetour(newMaxDetour);
    if (!routePoints) return;

    // If new detour exceeds what we queried, fetch more stations
    if (newMaxDetour > queriedDetour) {
      setIsLoading(true);
      try {
        const bounds = getRouteBounds(routePoints, newMaxDetour + 0.5);
        const stations = await queryGasStations(bounds);
        setAllStations(stations);
        setQueriedDetour(newMaxDetour);
        const filtered = filterStationsAlongRoute(stations, routePoints, newMaxDetour);
        setFilteredStations(filtered);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    } else if (allStations) {
      const filtered = filterStationsAlongRoute(allStations, routePoints, newMaxDetour);
      setFilteredStations(filtered);
    }
  }, [allStations, routePoints, queriedDetour]);

  const handleStationSelect = useCallback((station) => {
    setSelectedStation(station);
  }, []);

  const totalDistance = routePoints?.[routePoints.length - 1]?.distanceFromStart;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gas Station Planner</h1>
        {routeName && <span className="route-name">{routeName}</span>}
        <button className="about-btn" onClick={() => setShowAbout(true)}>
          About
        </button>
      </header>

      {showAbout && <About onClose={() => setShowAbout(false)} />}

      <main className="app-main">
        <aside className="sidebar">
          {!routePoints && <FileUpload onFileLoad={handleFileLoad} isLoading={isLoading} />}

          {isLoading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Finding gas stations...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>Error: {error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          {routePoints && !isLoading && (
            <>
              <button
                className="new-route-btn"
                onClick={() => {
                  setRoutePoints(null);
                  setRouteName(null);
                  setAllStations(null);
                  setFilteredStations(null);
                  setSelectedStation(null);
                  setQueriedDetour(0);
                }}
              >
                Load New Route
              </button>
              <StationList
                stations={filteredStations}
                totalDistance={totalDistance}
                selectedStation={selectedStation}
                onStationSelect={handleStationSelect}
                maxDetour={maxDetour}
                onMaxDetourChange={handleMaxDetourChange}
                routeName={routeName}
              />
            </>
          )}
        </aside>

        <div className="map-wrapper">
          <Map
            routePoints={routePoints}
            stations={filteredStations}
            selectedStation={selectedStation}
            onStationSelect={handleStationSelect}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
