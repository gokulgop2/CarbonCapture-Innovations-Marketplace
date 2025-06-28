// frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import RegisterProducerPage from './pages/RegisterProducerPage';
import RegisterConsumerPage from './pages/RegisterConsumerPage';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="header-title-link"><h1>CarbonCapture Innovations Marketplace</h1></Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/register-producer" className="nav-link">Register as Producer</Link>
          <Link to="/register-consumer" className="nav-link">Register as Consumer</Link>
        </nav>
      </header>

      {/* The router setup remains the same, but no props are passed */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register-producer" element={<RegisterProducerPage />} />
        <Route path="/register-consumer" element={<RegisterConsumerPage />} />
      </Routes>
    </div>
  );
}

export default App;