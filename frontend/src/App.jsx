// frontend/src/App.jsx

import React, { useState } from 'react';
import './App.css';
import RegistrationForm from './components/RegistrationForm';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import ImpactModal from './components/ImpactModal'; // Import the new modal
import { getMatches, getAnalyzedMatches, getImpactReport } from './api'; // Import the new report function

function App() {
  const [analysisReport, setAnalysisReport] = useState(null);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);
  
  // New state for the impact report modal
  const [impactReport, setImpactReport] = useState(null);

  const handleFindMatches = async (producer) => {
    if (!producer || !producer.id) return;
    
    setIsLoading(true);
    setSelectedProducer(producer);
    setAnalysisReport(null);
    setMapFocus(null);
    setImpactReport(null); // Clear any old reports

    try {
      const initialMatches = await getMatches(producer.id);
      if (initialMatches.length === 0) {
        alert(`No potential matches found for ${producer.name}.`);
        setIsLoading(false);
        return;
      }
      const report = await getAnalyzedMatches(producer, initialMatches);
      setAnalysisReport(report);
      
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation({ lat: location.y, lon: location.x });
  };

  const handleSelectMatch = (match) => {
    setMapFocus({
      center: [match.location.lat, match.location.lon],
      zoom: 12,
    });
  };

  // This new function calls the API and opens the modal
  const handleGenerateReport = async (match) => {
    if (!selectedProducer || !match) return;
    setIsLoading(true);
    try {
      const reportData = await getImpactReport(selectedProducer, match);
      setImpactReport(reportData);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {isLoading && <div className="loading-overlay">Analyzing...</div>}
      
      {/* This renders the modal when there is report data */}
      <ImpactModal report={impactReport} onClose={() => setImpactReport(null)} />

      <header className="app-header">
        <h1>CarbonCapture Innovations Marketplace</h1>
      </header>

      <main className="dashboard-layout-3-col">
        <div className="dashboard-forms">
          <RegistrationForm 
            onFindMatches={handleFindMatches} 
            selectedLocation={selectedLocation}
            onFormSubmit={() => setSelectedLocation(null)} 
          />
        </div>
        <div className="dashboard-sidebar">
          <Sidebar 
            producer={selectedProducer} 
            report={analysisReport} 
            onSelectMatch={handleSelectMatch}
            onGenerateReport={handleGenerateReport}
          />
        </div>
        <div className="dashboard-map">
          <MapView 
            selectedProducer={selectedProducer} 
            matches={analysisReport ? analysisReport.ranked_matches : []}
            onLocationSelect={handleLocationSelect}
            mapFocus={mapFocus}
          />
        </div>
      </main>
    </div>
  );
}

export default App;