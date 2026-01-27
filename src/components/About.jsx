export default function About({ onClose }) {
  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-close" onClick={onClose}>×</button>

        <h2>About Gas Station Planner</h2>

        <section>
          <h3>What is this?</h3>
          <p>
            Gas Station Planner helps cyclists find fuel stops along their routes.
            Upload a GPX file from your favorite route planning tool (Komoot, Strava, etc.)
            and instantly see all gas stations within detour distance of your route.
          </p>
        </section>

        <section>
          <h3>How it works</h3>
          <ul>
            <li>Your GPX file is parsed entirely in your browser - no data is uploaded to our servers</li>
            <li>Gas station and supermarket data comes from <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> via the Overpass API</li>
            <li>Distances are calculated using the Haversine formula for accuracy</li>
            <li>Gap warnings alert you to stretches over 15km without fuel stops</li>
            <li>Enable "Bikepacking mode" to also show supermarkets and convenience stores along your route</li>
          </ul>
        </section>


        <section>
          <h3>Privacy &amp; Cookies</h3>
          <p>
            <strong>This website does not use cookies</strong> and does not track you in any way.
            We do not use analytics or advertising services.
          </p>
          <p>
            Your GPX route data is processed entirely in your browser and is never stored on any server.
            The only external requests made are:
          </p>
          <ul>
            <li><strong>Map tiles:</strong> Loaded from OpenStreetMap tile servers to display the map</li>
            <li><strong>Gas station data:</strong> A bounding box (not your exact route) is sent to the
            Overpass API to query nearby fuel stations</li>
          </ul>
          <p>
            Google Maps links open in a new tab - we do not embed Google services or share data with Google.
          </p>
        </section>

        <section>
          <h3>Third-party services</h3>
          <p>This application uses the following external services:</p>
          <ul>
            <li>
              <strong>OpenStreetMap Tiles</strong> - Map imagery provided under the{' '}
              <a href="https://operations.osmfoundation.org/policies/tiles/" target="_blank" rel="noopener noreferrer">
                OSM Tile Usage Policy
              </a>
            </li>
            <li>
              <strong>Overpass API</strong> - Gas station data queried from OpenStreetMap under fair use.
              Service provided by volunteers at{' '}
              <a href="https://overpass-api.de" target="_blank" rel="noopener noreferrer">overpass-api.de</a>
            </li>
          </ul>
        </section>

        <section>
          <h3>Data attribution</h3>
          <p>
            Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>,
            licensed under the <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener noreferrer">Open Data Commons Open Database License</a> (ODbL).
          </p>
        </section>

        <section>
          <h3>Disclaimer</h3>
          <p>
            Gas station and supermarket data is sourced from OpenStreetMap and may be incomplete or outdated.
            Always verify fuel stop and store availability before your ride, especially in remote areas.
            This tool is provided as-is without warranty.
          </p>
        </section>
      <section>
        <h3>Attribution</h3>
        <p>
          This project was vibe coded by <a href="https://www.fwends.net">Peter Riegersperger</a> — the concept, direction, and prompts were his,
          while the code was written by Claude, Anthropic's AI assistant.
        </p>
      </section>
      <section>
        <h3>Contact &amp; Feedback</h3>
        <p>
          I'm always open to suggestions and feedback! If you have ideas for improvements or run into any issues, please reach out.
        </p>
        <p>
          <a href="mailto:peter@fwends.net">peter@fwends.net</a>
        </p>
        <p>
          Full contact information available <a href="https://www.fwends.net/imprint/">on my main website</a>
        </p>
      </section>

        <div className="about-footer">
          <p>Version 1.0 · January 2026</p>
        </div>
      </div>
    </div>
  );
}
