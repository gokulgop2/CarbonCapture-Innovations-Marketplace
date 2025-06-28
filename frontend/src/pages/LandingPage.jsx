// frontend/src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo'; // Import the logo
import { FaIndustry, FaShippingFast } from 'react-icons/fa'; // Import icons

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-overlay"></div>
      <div className="landing-content">
        <header className="landing-header">
          <Logo />
        </header>
        <main className="landing-main">
          <h2>Unlock the Value of Carbon</h2>
          <p>The premier B2B marketplace connecting CO₂ producers with innovative consumers. Our AI-powered platform provides deep strategic insights to build a profitable and sustainable circular economy.</p>
          <div className="role-selection">
            <Link to="/register-producer" className="role-button">
              <FaShippingFast size={32} className="role-icon" />
              <h3>Register as a Producer</h3>
              <p>I have a supply of CO₂ and want to find partners.</p>
            </Link>
            <Link to="/register-consumer" className="role-button">
              <FaIndustry size={32} className="role-icon" />
              <h3>Register as a Consumer</h3>
              <p>I need a supply of CO₂ for my industrial process.</p>
            </Link>
          </div>
          <Link to="/dashboard" className="guest-button">
            Or, explore the dashboard as a guest &rarr;
          </Link>
        </main>
      </div>
    </div>
  );
}

export default LandingPage;