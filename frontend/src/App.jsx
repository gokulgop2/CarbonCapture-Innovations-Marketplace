// frontend/src/App.jsx
import React, { useState } from 'react';
import './App.css';
import RegistrationForm from './components/RegistrationForm';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { getMatches, getAnalyzedMatches } from './api';

function App() {
  const [analysisReport, setAnalysisReport] = useState(null); // NEW: Holds the entire AI report
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);

  const handleFindMatches = async (producer) => {
    if (!producer || !producer.id) return;
    
    setIsLoading(true);
    setSelectedProducer(producer);
    setAnalysisReport(null); // Clear old report
    setMapFocus(null);

    try {
      const initialMatches = await getMatches(producer.id);
      if (initialMatches.length === 0) {
        alert(`No potential matches found for ${producer.name}.`);
        setIsLoading(false);
        return;
      }
      const report = await getAnalyzedMatches(producer, initialMatches);
      setAnalysisReport(report); // Set the new, full report
      
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location) => setSelectedLocation({ lat: location.y, lon: location.x });
  const handleSelectMatch = (match) => setMapFocus({ center: [match.location.lat, match.location.lon], zoom: 12 });

  return (
    <div className="app-container">
      {isLoading && <div className="loading-overlay">Performing Strategic Analysis...</div>}
      <header className="app-header"><h1>CarbonCapture Innovations Marketplace</h1></header>
      <main className="dashboard-layout-3-col">
        <div className="dashboard-forms">
          <RegistrationForm onFindMatches={handleFindMatches} selectedLocation={selectedLocation} onFormSubmit={() => setSelectedLocation(null)} />
        </div>
        <div className="dashboard-sidebar">
          {/* Pass the full report down to the sidebar */}
          <Sidebar producer={selectedProducer} report={analysisReport} onSelectMatch={handleSelectMatch} />
        </div>
        <div className="dashboard-map">
          <MapView 
            selectedProducer={selectedProducer} 
            matches={analysisReport ? analysisReport.ranked_matches : []} // Pass ranked matches to map
            onLocationSelect={handleLocationSelect}
            mapFocus={mapFocus}
          />
        </div>
      </main>
    </div>
  );
}
export default App;