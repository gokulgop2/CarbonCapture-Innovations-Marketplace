// frontend/src/pages/RegisterConsumerPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addConsumer } from '../api';

function RegisterConsumerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedLocation = location.state?.location;

  const [consumerName, setConsumerName] = useState('');
  const [consumerIndustry, setConsumerIndustry] = useState('');
  const [consumerDemand, setConsumerDemand] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocation) {
      alert("Please select a location from the map on the Dashboard page first!");
      return;
    }
    const consumerData = {
      name: consumerName,
      industry: consumerIndustry,
      location: { lat: selectedLocation.lat, lon: selectedLocation.lon },
      co2_demand_tonnes_per_week: parseInt(consumerDemand, 10),
    };
    try {
      await addConsumer(consumerData);
      alert(`Successfully added consumer: ${consumerName}`);
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <main className="registration-page">
      <div className="form-container">
        <div className="form-section">
          <h2>Register a CO₂ Consumer</h2>
          <p className="form-instruction">
            To set your location, please go to the Dashboard, search for an address on the map, then return to this page.
          </p>
          {selectedLocation && (
            <div className="location-display">
              Selected Location: Lat: {selectedLocation.lat.toFixed(4)}, Lon: {selectedLocation.lon.toFixed(4)}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter Consumer Name" value={consumerName} onChange={(e) => setConsumerName(e.target.value)} />
            <input type="text" placeholder="Enter Industry" value={consumerIndustry} onChange={(e) => setConsumerIndustry(e.target.value)} />
            <input type="number" placeholder="Enter CO₂ Demand (tonnes/week)" value={consumerDemand} onChange={(e) => setConsumerDemand(e.target.value)} />
            <button type="submit" disabled={!selectedLocation}>Register Consumer</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterConsumerPage;