// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import RegisterProducerPage from './pages/RegisterProducerPage';
import RegisterConsumerPage from './pages/RegisterConsumerPage';
import ComparisonPage from './pages/ComparisonPage'; // Import the new page

function App() {
  // Watchlist state will be managed here
  const [watchlist, setWatchlist] = useState([]);

  // On initial load, get the watchlist from browser storage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('carbonWatchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // When the watchlist changes, save it to browser storage
  useEffect(() => {
    localStorage.setItem('carbonWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const handleAddToWatchlist = (matchToAdd) => {
    // Prevent adding duplicates
    if (!watchlist.some(item => item.id === matchToAdd.id)) {
      setWatchlist(prev => [...prev, matchToAdd]);
      alert(`${matchToAdd.name} has been added to your watchlist!`);
    } else {
      alert(`${matchToAdd.name} is already in your watchlist.`);
    }
  };

  const handleRemoveFromWatchlist = (matchId) => {
    setWatchlist(prev => prev.filter(item => item.id !== matchId));
  };


  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="header-title-link"><h1>CarbonCapture Innovations Marketplace</h1></Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/register-producer" className="nav-link">Register as Producer</Link>
          <Link to="/register-consumer" className="nav-link">Register as Consumer</Link>
          <Link to="/compare" className="nav-link">
            My Watchlist <span className="watchlist-badge">{watchlist.length}</span>
          </Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage onAddToWatchlist={handleAddToWatchlist} />} />
        <Route path="/register-producer" element={<RegisterProducerPage />} />
        <Route path="/register-consumer" element={<RegisterConsumerPage />} />
        <Route 
          path="/compare" 
          element={<ComparisonPage watchlist={watchlist} onRemove={handleRemoveFromWatchlist} />} 
        />
      </Routes>
    </div>
  );
}

export default App;