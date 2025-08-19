import React, { useState, useEffect } from 'react';
import api from '../api';
import './ConnectorsPage.css';

function ConnectorsPage({ user }) {
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

    // Decode JWT to get user ID
    const userData = decodeToken(token);
    if (!userData || !userData.userId) {
      setError('Invalid authentication token');
      return;
    }

    const redirectUri = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const state = btoa(JSON.stringify({ userId: userData.userId }));
    const authUrl = `${redirectUri}/api/auth/${type}?state=${encodeURIComponent(state)}`;
    window.location.href = authUrl;
  };

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

  const handleDelete = async (connectorId) => {
    if (window.confirm('Are you sure you want to disconnect this service?')) {
      try {
        await api.delete(`/api/connectors/${connectorId}`);
        fetchConnectors();
      } catch (error) {
        setError('Failed to disconnect service');
      }
    }
  };

  const handleRefresh = async (connectorId) => {
    try {
      await api.post(`/api/connectors/${connectorId}/refresh`);
      fetchConnectors();
    } catch (error) {
      setError('Failed to refresh service');
    }
  };

  const getConnectorIcon = (type) => {
    switch (type) {
      case 'acc':
        return '🏗️';
      case 'gmail':
        return '📧';
      case 'google-calendar':
        return '📅';
      default:
        return '🔗';
    }
  };

  const getConnectorName = (type) => {
    switch (type) {
      case 'acc':
        return 'Autodesk Construction Cloud';
      case 'gmail':
        return 'Gmail';
      case 'google-calendar':
        return 'Google Calendar';
      default:
        return type;
    }
  };

  const getConnectorDescription = (type) => {
    switch (type) {
      case 'acc':
        return 'Connect to ACC for file management and project workflows';
      case 'gmail':
        return 'Send automated emails when workflows are triggered';
      case 'google-calendar':
        return 'Create calendar events automatically from workflows';
      default:
        return 'External service connector';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading connectors...</p>
      </div>
    );
  }

  return (
    <div className="connectors-page">
      <div className="page-header">
        <h1 className="page-title">Service Connectors</h1>
        <p className="page-subtitle">
          Connect your accounts to enable automated workflows between ACC, Gmail, and Google Calendar
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠</div>
          {error}
        </div>
      )}

      {connectors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <h3>No Services Connected</h3>
          <p>
            Get started by connecting your first service. You'll need to connect at least 
            ACC and one action service (Gmail or Calendar) to create workflows.
          </p>
        </div>
      ) : (
        <div className="connectors-grid">
          {connectors.map(connector => (
            <div 
              key={connector._id} 
              className={`connector-card ${connector.isActive ? 'connected' : 'disconnected'}`}
            >
              <div className="connector-header">
                <div className="connector-info">
                  <div className={`connector-icon ${connector.type}`}>
                    {getConnectorIcon(connector.type)}
                  </div>
                  <div className="connector-details">
                    <h3>{getConnectorName(connector.type)}</h3>
                    <p>{getConnectorDescription(connector.type)}</p>
                  </div>
                </div>
                <div className={`connector-status ${connector.isActive ? 'connected' : 'disconnected'}`}>
                  <div className="status-dot"></div>
                  {connector.isActive ? 'Connected' : 'Disconnected'}
                </div>
              </div>

              <div className="connector-actions">
                {connector.isActive ? (
                  <>
                    <button 
                      className="btn-refresh"
                      onClick={() => handleRefresh(connector._id)}
                    >
                      🔄 Refresh
                    </button>
                    <button 
                      className="btn-disconnect"
                      onClick={() => handleDelete(connector._id)}
                    >
                      ❌ Disconnect
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-connect"
                    onClick={() => handleConnect(connector.type)}
                  >
                    🔗 Connect
                  </button>
                )}
              </div>

              {connector.isActive && (
                <div className="connector-meta">
                  <div className="meta-item">
                    <span className="meta-label">Connected:</span>
                    <span className="meta-value">
                      {new Date(connector.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Last Updated:</span>
                    <span className="meta-value">
                      {new Date(connector.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="connectors-grid">
        {['acc', 'gmail', 'google-calendar'].map(type => {
          const existingConnector = connectors.find(c => c.type === type);
          if (existingConnector) return null;

          return (
            <div key={type} className="connector-card disconnected">
              <div className="connector-header">
                <div className="connector-info">
                  <div className={`connector-icon ${type}`}>
                    {getConnectorIcon(type)}
                  </div>
                  <div className="connector-details">
                    <h3>{getConnectorName(type)}</h3>
                    <p>{getConnectorDescription(type)}</p>
                  </div>
                </div>
                <div className="connector-status disconnected">
                  <div className="status-dot"></div>
                  Not Connected
                </div>
              </div>

              <div className="connector-actions">
                <button 
                  className="btn-connect"
                  onClick={() => handleConnect(type)}
                >
                  🔗 Connect Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConnectorsPage;
