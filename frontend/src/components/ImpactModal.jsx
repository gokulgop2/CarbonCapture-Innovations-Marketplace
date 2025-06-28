// frontend/src/components/ImpactModal.jsx

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ImpactModal({ report, onClose }) {
  if (!report) return null;

  const chartData = {
    labels: ['CO₂ Impact (Tonnes/Year)'],
    datasets: [
      {
        label: 'CO₂ Diverted from Atmosphere',
        data: [report.environmental.co2_diverted],
        backgroundColor: 'rgba(0, 169, 145, 0.7)',
      },
      {
        label: 'Estimated Logistics Emissions',
        data: [report.environmental.estimated_logistics_emissions],
        backgroundColor: 'rgba(255, 120, 0, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Annual Environmental Impact' },
    },
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h2>Impact Report: {report.producer_name} &rarr; {report.consumer_name}</h2>
        
        <div className="report-section">
          <h3>Financial Analysis (Annual)</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <h4>Producer Revenue</h4>
              <p>${report.financials.producer_annual_revenue.toLocaleString()}</p>
            </div>
            <div className="metric-card">
              <h4>Consumer Savings</h4>
              <p>${report.financials.consumer_annual_savings.toLocaleString()}</p>
            </div>
            <div className="metric-card">
              <h4>Carbon Credit Value</h4>
              <p>${report.financials.carbon_credit_value.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Environmental Analysis (Annual)</h3>
          <Bar options={chartOptions} data={chartData} />
          <p className="net-impact-final">
            <strong>Net Carbon Sequestered:</strong> {report.environmental.net_co2_impact.toLocaleString()} Tonnes
          </p>
        </div>
      </div>
    </div>
  );
}

export default ImpactModal;