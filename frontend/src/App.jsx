// frontend/src/App.jsx

import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import the new page components
import HomePage from './pages/HomePage';
import RegisterProducerPage from './pages/RegisterProducerPage';
import RegisterConsumerPage from './pages/RegisterConsumerPage';

function App() {
  // State for the selected location from the map will live here
  // so it can be passed to the registration pages.
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        {/* Main navigation links */}
        <Link to="/" className="header-title-link"><h1>CarbonCapture Innovations Marketplace</h1></Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          {/* This Link passes the selectedLocation state to the registration page */}
          <Link to="/register-producer" state={{ location: selectedLocation }} className="nav-link">Register as Producer</Link>
          <Link to="/register-consumer" state={{ location: selectedLocation }} className="nav-link">Register as Consumer</Link>
        </nav>
      </header>

      {/* This section defines the page that renders for each URL path */}
      <Routes>
        <Route path="/" element={<HomePage setSelectedLocation={setSelectedLocation} />} />
        <Route path="/register-producer" element={<RegisterProducerPage />} />
        <Route path="/register-consumer" element={<RegisterConsumerPage />} />
      </Routes>
    </div>
  );
}

export default App;