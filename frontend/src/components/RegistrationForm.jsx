// frontend/src/components/RegistrationForm.jsx

import React, { useState, useEffect } from 'react';
import { addProducer, addConsumer, getProducers } from '../api';

function RegistrationForm({ onFindMatches, selectedLocation, onFormSubmit }) {
  // State for the Producer form
  const [producerName, setProducerName] = useState('');
  const [producerSupply, setProducerSupply] = useState('');

  // State for the Consumer form
  const [consumerName, setConsumerName] = useState('');
  const [consumerIndustry, setConsumerIndustry] = useState('');
  const [consumerDemand, setConsumerDemand] = useState('');
  
  // State for the list of producers
  const [producers, setProducers] = useState([]);

  const refreshProducers = async () => {
    try {
      const producersData = await getProducers();
      setProducers(producersData);
    } catch (error) {
      console.error("Could not fetch producers:", error);
    }
  };

  useEffect(() => {
    refreshProducers();
  }, []);

  const handleProducerSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocation) {
      alert("Please use the search bar on the map to select a location first!");
      return;
    }

    const producerData = {
      name: producerName,
      location: { // We now use the location from the state
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
      },
      co2_supply_tonnes_per_week: parseInt(producerSupply, 10),
    };

    try {
      const result = await addProducer(producerData);
      alert(`Successfully added producer: ${result.producer.name}`);
      setProducerName('');
      setProducerSupply('');
      refreshProducers();
      onFormSubmit(); // This clears the selected location
    } catch (error) {
      alert(error.message);
    }
  };

  const handleConsumerSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocation) {
      alert("Please use the search bar on the map to select a location first!");
      return;
    }
    
    const consumerData = {
      name: consumerName,
      industry: consumerIndustry,
      location: { // We use the location from the state here too
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
      },
      co2_demand_tonnes_per_week: parseInt(consumerDemand, 10),
    };

    try {
      const result = await addConsumer(consumerData);
      alert(`Successfully added consumer: ${result.consumer.name}`);
      setConsumerName('');
      setConsumerIndustry('');
      setConsumerDemand('');
      onFormSubmit(); // This clears the selected location
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="form-container">
      <div className="form-section">
        <h2>Find Matches for a Producer</h2>
        <div className="producer-list">
          {producers.length > 0 ? (
            producers.map((producer) => (
              <div key={producer.id} className="producer-item">
                <span>{producer.name}</span>
                <button onClick={() => onFindMatches(producer)}>Find Matches</button>
              </div>
            ))
          ) : (<p>No producers found. Add one below!</p>)}
        </div>
      </div>
      
      {/* This new section displays the coordinates when a location is selected */}
      {selectedLocation && (
        <div className="location-display">
          Selected Location Coordinates: <br/>
          Latitude: {selectedLocation.lat.toFixed(4)}, Longitude: {selectedLocation.lon.toFixed(4)}
        </div>
      )}

      <div className="form-section">
        <h2>Register a CO₂ Producer</h2>
        <p className="form-instruction">1. Use the search bar on the map to find an address.</p>
        <form onSubmit={handleProducerSubmit}>
          <input type="text" placeholder="2. Enter Producer Name" value={producerName} onChange={(e) => setProducerName(e.target.value)} />
          <input type="number" placeholder="3. Enter CO₂ Supply (tonnes/week)" value={producerSupply} onChange={(e) => setProducerSupply(e.target.value)} />
          <button type="submit">Add Producer</button>
        </form>
      </div>

      <div className="form-section">
        <h2>Register a CO₂ Consumer</h2>
        <p className="form-instruction">1. Use the search bar on the map to find an address.</p>
        <form onSubmit={handleConsumerSubmit}>
          <input type="text" placeholder="2. Enter Consumer Name" value={consumerName} onChange={(e) => setConsumerName(e.target.value)}/>
          <input type="text" placeholder="3. Enter Industry" value={consumerIndustry} onChange={(e) => setConsumerIndustry(e.target.value)} />
          <input type="number" placeholder="4. Enter CO₂ Demand (tonnes/week)" value={consumerDemand} onChange={(e) => setConsumerDemand(e.target.value)} />
          <button type="submit">Add Consumer</button>
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;