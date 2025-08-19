import React, { useState } from 'react';
import api from '../api';
import './CalendarTest.css';

function CalendarTest({ user }) {
  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setResult(null);
    setMessage('');

    try {
      const response = await api.post('/api/connectors/google-calendar/test-event', formData);
      
      if (response.data.success) {
        setResult(response.data.data);
        setMessage({ type: 'success', text: 'Test event created successfully!' });
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to create test event' 
      });
    } finally {
      setCreating(false);
    }
  };

  const getDuration = () => {
    if (!formData.startTime || !formData.endTime) return '';
    
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <div className="calendar-test">
      <div className="test-header">
        <h1 className="test-title">Calendar Test</h1>
        <p className="test-subtitle">
          Test your Google Calendar connector by creating a test event
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <div className="alert-icon">
            {message.type === 'success' ? '✓' : '⚠'}
          </div>
          {message.text}
        </div>
      )}

      <div className="test-form">
        <div className="form-section">
          <h2 className="section-title">Event Details</h2>
          
          <div className="form-group">
            <label htmlFor="summary" className="form-label">Event Title</label>
            <input
              type="text"
              id="summary"
              name="summary"
              className="form-control"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Test Event from ACC Workflow"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="This is a test event created via the ACC Workflow application..."
              rows="4"
            />
          </div>

          <div className="datetime-group">
            <div className="form-group">
              <label htmlFor="startTime" className="form-label">Start Time</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                className="form-control"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTime" className="form-label">End Time</label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                className="form-control"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {getDuration() && (
            <div className="duration-indicator">
              <span>Duration:</span>
              <span className="duration-value">{getDuration()}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className={`create-btn ${creating ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={creating || !formData.summary || !formData.startTime || !formData.endTime}
        >
          {creating ? 'Creating...' : 'Create Test Event'}
        </button>
      </div>

      {result && (
        <div className="test-results">
          <div className="results-header">
            <div className="results-icon">✓</div>
            <h3 className="results-title">Event Created Successfully</h3>
          </div>
          
          <div className="result-item">
            <span className="result-label">Event ID:</span>
            <span className="result-value">{result.eventId}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Event Link:</span>
            <span className="result-value">
              <a href={result.eventLink} target="_blank" rel="noopener noreferrer">
                View in Calendar
              </a>
            </span>
          </div>
        </div>
      )}

      <div className="event-preview">
        <div className="preview-header">
          <h4>Event Preview</h4>
        </div>
        <div className="preview-content">
          <div className="preview-field">
            <span className="preview-label">Title:</span>
            <span className="preview-value">{formData.summary || 'No title specified'}</span>
          </div>
          <div className="preview-field">
            <span className="preview-label">Description:</span>
            <span className="preview-value">{formData.description || 'No description specified'}</span>
          </div>
          <div className="preview-field">
            <span className="preview-label">Start:</span>
            <span className="preview-value">
              {formData.startTime ? new Date(formData.startTime).toLocaleString() : 'No start time specified'}
            </span>
          </div>
          <div className="preview-field">
            <span className="preview-label">End:</span>
            <span className="preview-value">
              {formData.endTime ? new Date(formData.endTime).toLocaleString() : 'No end time specified'}
            </span>
          </div>
          {getDuration() && (
            <div className="preview-field">
              <span className="preview-label">Duration:</span>
              <span className="preview-value">{getDuration()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarTest;
