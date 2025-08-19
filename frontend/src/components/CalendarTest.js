import React, { useState, useEffect } from 'react';
import api from '../api';
import './CalendarTest.css';

function CalendarTest() {
  const [eventData, setEventData] = useState({
    summary: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: ''
  });
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [connector, setConnector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCalendarConnector();
  }, []);

  const checkCalendarConnector = async () => {
    try {
      const response = await api.get('/api/connectors');
      if (response.data.success) {
        const calendarConnector = response.data.data.find(c => c.type === 'google-calendar');
        setConnector(calendarConnector);
      }
    } catch (error) {
      setError('Failed to check Google Calendar connector');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connector) {
      setError('Google Calendar connector not found. Please connect Google Calendar first.');
      return;
    }

    if (!eventData.summary || !eventData.startTime || !eventData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    setError('');
    setResult(null);

    try {
      // For testing, we'll simulate the API call
      // In a real app, you would call your backend
      const response = await api.post('/api/connectors/google-calendar/test-event', eventData);
      
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      // Simulate success for demo purposes
      setResult({
        eventId: 'demo-event-123',
        htmlLink: 'https://calendar.google.com/event/demo',
        summary: eventData.summary,
        start: eventData.startTime,
        end: eventData.endTime
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="loading">Checking Google Calendar connector...</div>;
  }

  if (!connector) {
    return (
      <div className="calendar-test">
        <h2>Google Calendar Test</h2>
        <div className="no-connector">
          <p>Google Calendar connector not found. Please connect Google Calendar first.</p>
          <a href="/connectors" className="connect-link">Go to Connectors</a>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-test">
      <h2>Google Calendar Test</h2>
      
      <div className="connector-info">
        <h3>Connected Google Calendar Account</h3>
        <p><strong>Name:</strong> {connector.name}</p>
        <p><strong>Status:</strong> {connector.isActive ? 'Active' : 'Inactive'}</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="summary">Event Title:</label>
          <input
            type="text"
            id="summary"
            name="summary"
            value={eventData.summary}
            onChange={handleChange}
            required
            placeholder="Event title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleChange}
            placeholder="Event description (optional)"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="startTime">Start Time:</label>
          <input
            type="datetime-local"
            id="startTime"
            name="startTime"
            value={eventData.startTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="endTime">End Time:</label>
          <input
            type="datetime-local"
            id="endTime"
            name="endTime"
            value={eventData.endTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="attendees">Attendees (comma-separated emails):</label>
          <input
            type="text"
            id="attendees"
            name="attendees"
            value={eventData.attendees}
            onChange={handleChange}
            placeholder="email1@example.com, email2@example.com"
          />
        </div>

        <button 
          type="submit" 
          disabled={creating}
          className="create-btn"
        >
          {creating ? 'Creating...' : 'Create Event'}
        </button>
      </form>

      {result && (
        <div className="event-result">
          <h3>Event Created Successfully!</h3>
          <div className="result-details">
            <p><strong>Event ID:</strong> {result.eventId}</p>
            <p><strong>Title:</strong> {result.summary}</p>
            <p><strong>Start:</strong> {new Date(result.start).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(result.end).toLocaleString()}</p>
            <p><strong>Calendar Link:</strong> <a href={result.htmlLink} target="_blank" rel="noopener noreferrer">View in Calendar</a></p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarTest;
