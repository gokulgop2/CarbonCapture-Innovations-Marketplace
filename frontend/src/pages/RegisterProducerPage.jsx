// frontend/src/pages/RegisterProducerPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addProducer } from '../api';

function RegisterProducerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedLocation = location.state?.location; // Get location from navigation state

  const [producerName, setProducerName] = useState('');
  const [producerSupply, setProducerSupply] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocation) {
      alert("Please select a location from the map on the Dashboard page first!");
      return;
    }
    const producerData = {
      name: producerName,
      location: { lat: selectedLocation.lat, lon: selectedLocation.lon },
      co2_supply_tonnes_per_week: parseInt(producerSupply, 10),
    };
    try {
      await addProducer(producerData);
      alert(`Successfully added producer: ${producerName}`);
      navigate('/'); // Navigate back to the homepage after success
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <main className="registration-page">
      <div className="form-container">
        <div className="form-section">
          <h2>Register a CO₂ Producer</h2>
          <p className="form-instruction">
            To set your location, please go to the Dashboard, search for an address on the map, then return to this page.
          </p>
          {selectedLocation && (
            <div className="location-display">
              Selected Location: Lat: {selectedLocation.lat.toFixed(4)}, Lon: {selectedLocation.lon.toFixed(4)}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter Producer Name" value={producerName} onChange={(e) => setProducerName(e.target.value)} />
            <input type="number" placeholder="Enter CO₂ Supply (tonnes/week)" value={producerSupply} onChange={(e) => setProducerSupply(e.target.value)} />
            <button type="submit" disabled={!selectedLocation}>Register Producer</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterProducerPage;