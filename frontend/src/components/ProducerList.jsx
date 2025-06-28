// frontend/src/components/ProducerList.jsx

import React, { useState, useEffect } from 'react';
import { getProducers } from '../api';

function ProducerList({ onFindMatches }) {
  const [producers, setProducers] = useState([]);

  useEffect(() => {
    const refreshProducers = async () => {
      try {
        const producersData = await getProducers();
        setProducers(producersData);
      } catch (error)
      {
        console.error("Could not fetch producers:", error);
      }
    };
    refreshProducers();
  }, []);

  return (
    // The root div now has a more specific class name for styling
    <div className="producer-list-container">
      <h2 className="panel-header">Find Matches for a Producer</h2>
      <div className="producer-list-content">
        {producers.length > 0 ? (
          producers.map((producer) => (
            <div key={producer.id} className="producer-item">
              <span>{producer.name}</span>
              <button onClick={() => onFindMatches(producer)}>Find Matches</button>
            </div>
          ))
        ) : (
          <p style={{ padding: '1.5rem' }}>No producers found.</p>
        )}
      </div>
    </div>
  );
}

export default ProducerList;