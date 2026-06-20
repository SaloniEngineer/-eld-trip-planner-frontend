import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './App.css';
import ELDLogSheet from './ELDLogSheet';

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

  // Convert route geometry coordinates [lon, lat] -> [lat, lon] for Leaflet
  const routeCoords = result?.route_geometry?.coordinates?.map(c => [c[1], c[0]]) || [];

  return (
    <div className="App">
      <h1> ELD Trip Planner</h1>

      <form onSubmit={handleSubmit} className="trip-form">
        <input
          type="text"
          name="current_location"
          placeholder="Current Location (e.g. Delhi, India)"
          value={formData.current_location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="pickup_location"
          placeholder="Pickup Location"
          value={formData.pickup_location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="dropoff_location"
          placeholder="Dropoff Location"
          value={formData.dropoff_location}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="current_cycle_used"
          placeholder="Current Cycle Used (Hours)"
          value={formData.current_cycle_used}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Plan Trip'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="results">
          <h2>Trip Summary</h2>
          <p><strong>Distance:</strong> {result.distance_miles} miles</p>
          <p><strong>Driving Time:</strong> {result.estimated_driving_hours} hours</p>
          <p><strong>Fuel Stops Needed:</strong> {result.fuel_stops_needed}</p>
          <p><strong>Total Days Needed:</strong> {result.total_days_needed}</p>

          <h3>Daily Schedule</h3>
          <table>
            <thead>
              <tr><th>Day</th><th>Driving Hours</th><th>Rest</th></tr>
            </thead>
            <tbody>
              {result.daily_schedule.map((day) => (
                <tr key={day.day}>
                  <td>{day.day}</td>
                  <td>{day.driving_hours}</td>
                  <td>{day.off_duty_rest}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Route Map</h3>
          <MapContainer
            center={[result.waypoints.current.lat, result.waypoints.current.lon]}
            zoom={5}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
            <Marker position={[result.waypoints.current.lat, result.waypoints.current.lon]}>
              <Popup>Current: {result.waypoints.current.label}</Popup>
            </Marker>
            <Marker position={[result.waypoints.pickup.lat, result.waypoints.pickup.lon]}>
              <Popup>Pickup: {result.waypoints.pickup.label}</Popup>
            </Marker>
            <Marker position={[result.waypoints.dropoff.lat, result.waypoints.dropoff.lon]}>
              <Popup>Dropoff: {result.waypoints.dropoff.label}</Popup>
            </Marker>
          </MapContainer>

          <h3>ELD Log Sheets</h3>
          {result.daily_schedule.map((day) => (
            <ELDLogSheet key={day.day} day={day.day} drivingHours={day.driving_hours} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;