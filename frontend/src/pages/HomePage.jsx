// frontend/src/pages/HomePage.jsx

import React, { useState } from 'react';
import MapView from '../components/MapView';
import Sidebar from '../components/Sidebar';
import ProducerList from '../components/ProducerList'; // We'll create this from the old form
import ImpactModal from '../components/ImpactModal';
import { getMatches, getAnalyzedMatches, getImpactReport } from '../api';

// We receive setSelectedLocation from App.jsx to update the shared state
function HomePage({ setSelectedLocation }) {
  const [analysisReport, setAnalysisReport] = useState(null);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapFocus, setMapFocus] = useState(null);
  const [impactReport, setImpactReport] = useState(null);

  const handleFindMatches = async (producer) => {
    if (!producer || !producer.id) return;
    setIsLoading(true);
    setSelectedProducer(producer);
    setAnalysisReport(null);
    setMapFocus(null);
    setImpactReport(null);
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

  const handleSelectMatch = (match) => {
    setMapFocus({ center: [match.location.lat, match.location.lon], zoom: 12 });
  };

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
    <>
      {isLoading && <div className="loading-overlay">Analyzing...</div>}
      <ImpactModal report={impactReport} onClose={() => setImpactReport(null)} />
      <main className="dashboard-layout-3-col">
        <div className="dashboard-forms">
          {/* The producer list is now its own component */}
          <ProducerList onFindMatches={handleFindMatches} />
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
            onLocationSelect={setSelectedLocation} // Call the function from App.jsx
            mapFocus={mapFocus}
          />
        </div>
      </main>
    </>
  );
}

export default HomePage;