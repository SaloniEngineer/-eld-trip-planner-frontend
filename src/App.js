import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './App.css';
import ELDLogSheet from './ELDLogSheet';

const createIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const greenIcon = createIcon('#22c55e');
const blueIcon = createIcon('#3b82f6');
const redIcon = createIcon('#ef4444');
const orangeIcon = createIcon('#f97316');
const yellowIcon = createIcon('#eab308');

function App() {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/plan-trip/', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const routeCoords = result?.route_geometry?.coordinates?.map(c => [c[1], c[0]]) || [];

  return (
    <div className="app">
      <div className="header">
        <div className="header-content">
          <div>
            <h1>ELD Trip Planner</h1>
            <p>Electronic Logging Device — HOS Compliance Tool</p>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="card form-card">
          <h2 className="card-title">Plan Your Trip</h2>
          <form onSubmit={handleSubmit} className="trip-form">
            <div className="input-group">
              <label>Current Location</label>
              <input
                type="text"
                name="current_location"
                placeholder="e.g. Delhi, India"
                value={formData.current_location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Pickup Location</label>
              <input
                type="text"
                name="pickup_location"
                placeholder="e.g. Haryana, India"
                value={formData.pickup_location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Dropoff Location</label>
              <input
                type="text"
                name="dropoff_location"
                placeholder="e.g. Patna, India"
                value={formData.dropoff_location}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Current Cycle Used (Hours)</label>
              <input
                type="number"
                name="current_cycle_used"
                placeholder="e.g. 12"
                value={formData.current_cycle_used}
                onChange={handleChange}
                required
                min="0"
                max="70"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Calculating...' : 'Plan Trip'}
            </button>
          </form>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading && (
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <p>Calculating your route and HOS schedule...</p>
          </div>
        )}

        {result && (
          <div className="results">
            <h2 className="section-title">Trip Summary</h2>
            <div className="summary-grid">
              <div className="summary-card blue">
                <div className="summary-value">{result.distance_miles}</div>
                <div className="summary-label">Miles</div>
              </div>
              <div className="summary-card green">
                <div className="summary-value">{result.estimated_driving_hours}</div>
                <div className="summary-label">Drive Hours</div>
              </div>
              <div className="summary-card orange">
                <div className="summary-value">{result.fuel_stops_needed}</div>
                <div className="summary-label">Fuel Stops</div>
              </div>
              <div className="summary-card purple">
                <div className="summary-value">{result.total_days_needed}</div>
                <div className="summary-label">Days Needed</div>
              </div>
              <div className="summary-card red">
                <div className="summary-value">{result.remaining_cycle_hours}</div>
                <div className="summary-label">Cycle Hrs Left</div>
              </div>
            </div>

            <h2 className="section-title">Daily Schedule</h2>
            <div className="card">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Driving Hours</th>
                    <th>On Duty</th>
                    <th>Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {result.daily_schedule.map((day) => (
                    <tr key={day.day}>
                      <td><span className="day-badge">Day {day.day}</span></td>
                      <td>{day.driving_hours} hrs</td>
                      <td>{day.on_duty_hours || 0} hrs</td>
                      <td>
                        <span className={day.off_duty_rest === 'N/A' ? 'rest-na' : 'rest-badge'}>
                          {day.off_duty_rest}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="section-title">Route Map</h2>
            <div className="card map-card">
              <div className="map-legend">
                <span><span className="legend-dot green"></span> Current Location</span>
                <span><span className="legend-dot blue"></span> Pickup</span>
                <span><span className="legend-dot red"></span> Dropoff</span>
                <span><span className="legend-dot orange"></span> Rest Stop</span>
                <span><span className="legend-dot yellow"></span> Fuel Stop</span>
              </div>
              <MapContainer
                center={[result.waypoints.current.lat, result.waypoints.current.lon]}
                zoom={5}
                style={{ height: '450px', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {routeCoords.length > 0 &&
                  <Polyline positions={routeCoords} color="#3b82f6" weight={4} opacity={0.8} />
                }
                <Marker position={[result.waypoints.current.lat, result.waypoints.current.lon]} icon={greenIcon}>
                  <Popup><b>Current Location</b><br />{result.waypoints.current.label}</Popup>
                </Marker>
                <Marker position={[result.waypoints.pickup.lat, result.waypoints.pickup.lon]} icon={blueIcon}>
                  <Popup><b>Pickup</b><br />{result.waypoints.pickup.label}<br /><small>1 hr On Duty</small></Popup>
                </Marker>
                <Marker position={[result.waypoints.dropoff.lat, result.waypoints.dropoff.lon]} icon={redIcon}>
                  <Popup><b>Dropoff</b><br />{result.waypoints.dropoff.label}<br /><small>1 hr On Duty</small></Popup>
                </Marker>
                {result.rest_stops?.map((stop, i) => (
                  <Marker key={i} position={[stop.lat, stop.lon]} icon={orangeIcon}>
                    <Popup><b>{stop.label}</b><br />10 hour mandatory rest</Popup>
                  </Marker>
                ))}
                {result.fuel_stop_locations?.map((stop, i) => (
                  <Marker key={i} position={[stop.lat, stop.lon]} icon={yellowIcon}>
                    <Popup><b>{stop.label}</b></Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <h2 className="section-title">ELD Log Sheets</h2>
            {result.daily_schedule.map((day, index) => (
              <ELDLogSheet
                key={day.day}
                day={day.day}
                drivingHours={day.driving_hours}
                offDutyHours={day.off_duty_hours}
                sleeperBerthHours={day.sleeper_berth_hours}
                onDutyHours={day.on_duty_hours}
                isFirstDay={index === 0}
                isLastDay={index === result.daily_schedule.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;