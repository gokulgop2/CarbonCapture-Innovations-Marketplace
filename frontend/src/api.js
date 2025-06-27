// src/api.js

const API_BASE_URL = 'http://127.0.0.1:5000'; // Your Flask backend URL

// Function to add a new producer
export const addProducer = async (producerData) => {
  const response = await fetch(`${API_BASE_URL}/api/producers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producerData),
  });
  if (!response.ok) {
    throw new Error('Failed to add producer');
  }
  return response.json();
};

// Function to add a new consumer
export const addConsumer = async (consumerData) => {
    const response = await fetch(`${API_BASE_URL}/api/consumers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consumerData),
    });
    if (!response.ok) {
      throw new Error('Failed to add consumer');
    }
    return response.json();
  };

// Function to get all producers (we need this to display them)
export const getProducers = async () => {
    const response = await fetch(`${API_BASE_URL}/api/producers`);
    if (!response.ok) {
      throw new Error('Failed to fetch producers');
    }
    return response.json();
};

// Function to get matches for a specific producer
export const getMatches = async (producerId) => {
  const response = await fetch(`${API_BASE_URL}/api/matches?producer_id=${producerId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  return response.json();
};

export const getAnalyzedMatches = async (producer, matches) => {
    const response = await fetch(`${API_BASE_URL}/api/analyze-matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ producer, matches }),
    });
    if (!response.ok) {
      throw new Error('Failed to get AI analysis for matches');
    }
    return response.json();
  };