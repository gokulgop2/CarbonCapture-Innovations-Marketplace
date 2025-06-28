// frontend/src/components/MainLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Logo from './Logo'; // Import the new logo
import { FiLogOut } from 'react-icons/fi'; // Import an icon for the logout button

function MainLayout() {
  const [watchlistCount, setWatchlistCount] = useState(0);

  useEffect(() => {
    // This effect ensures the badge count is up-to-date
    const updateCount = () => {
      const savedWatchlist = localStorage.getItem('carbonWatchlist');
      if (savedWatchlist) {
        setWatchlistCount(JSON.parse(savedWatchlist).length);
      }
    };
    
    updateCount(); // Update on load
    
    // Listen for changes to localStorage from other tabs/windows
    window.addEventListener('storage', updateCount);
    
    // Custom event to listen for changes within the same tab
    window.addEventListener('watchlistUpdated', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('watchlistUpdated', updateCount);
    };
  }, []);

  const handleLogout = () => { /* ... (This would be for a real logout) */ };

  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/dashboard" className="header-title-link"><Logo /></Link>
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/compare" className="nav-link">My Watchlist <span className="watchlist-badge">{watchlistCount}</span></Link>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> <span>Logout</span>
          </button>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

export default MainLayout;