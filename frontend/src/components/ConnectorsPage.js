import React, { useState, useEffect } from 'react';
import api from '../api';
import './ConnectorsPage.css';

// Function to decode JWT token and get user ID
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

function ConnectorsPage() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConnectors();
  }, []);

  const fetchConnectors = async () => {
    try {
      const response = await api.get('/api/connectors');
      if (response.data.success) {
        setConnectors(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch connectors');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (type) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in first');
      return;
    }

    const userData = decodeToken(token);
    if (!userData || !userData.userId) {
      setError('Invalid authentication token');
      return;
    }

    const redirectUri = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    // Pass user ID in state parameter for OAuth callback
    const state = btoa(JSON.stringify({ userId: userData.userId }));
    const authUrl = `${redirectUri}/api/auth/${type}?state=${encodeURIComponent(state)}`;
    window.location.href = authUrl;
  };

  const handleDelete = async (connectorId) => {
    if (window.confirm('Are you sure you want to delete this connector?')) {
      try {
        await api.delete(`/api/connectors/${connectorId}`);
        fetchConnectors();
      } catch (error) {
        setError('Failed to delete connector');
      }
    }
  };

  const handleRefresh = async (connectorId) => {
    try {
      await api.post(`/api/connectors/${connectorId}/refresh`);
      fetchConnectors();
    } catch (error) {
      setError('Failed to refresh connector');
    }
  };

  if (loading) {
    return <div className="loading">Loading connectors...</div>;
  }

  return (
    <div className="connectors-page">
      <h2>Connectors</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="connector-buttons">
        <button 
          onClick={() => handleConnect('acc')}
          className="connect-btn acc-btn"
        >
          Connect ACC
        </button>
        <button 
          onClick={() => handleConnect('gmail')}
          className="connect-btn gmail-btn"
        >
          Connect Gmail
        </button>
        <button 
          onClick={() => handleConnect('google-calendar')}
          className="connect-btn calendar-btn"
        >
          Connect Google Calendar
        </button>
      </div>

      <div className="connectors-list">
        <h3>Connected Services</h3>
        {connectors.length === 0 ? (
          <p>No connectors found. Connect your services above.</p>
        ) : (
          connectors.map(connector => (
            <div key={connector._id} className="connector-item">
              <div className="connector-info">
                <h4>{connector.name}</h4>
                <p>Type: {connector.type}</p>
                <p>Status: {connector.isActive ? 'Active' : 'Inactive'}</p>
                <p>Created: {new Date(connector.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="connector-actions">
                <button 
                  onClick={() => handleRefresh(connector._id)}
                  className="refresh-btn"
                >
                  Refresh
                </button>
                <button 
                  onClick={() => handleDelete(connector._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ConnectorsPage;
