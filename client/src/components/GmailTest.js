import React, { useState } from 'react';
import api from '../api';
import './GmailTest.css';

function GmailTest({ user }) {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
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
    setSending(true);
    setResult(null);
    setMessage('');

    try {
      const response = await api.post('/api/connectors/gmail/test-email', formData);
      
      if (response.data.success) {
        setResult(response.data.data);
        setMessage({ type: 'success', text: 'Test email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send test email' 
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="gmail-test">
      <div className="test-header">
        <h1 className="test-title">Gmail Test</h1>
        <p className="test-subtitle">
          Test your Gmail connector by sending a test email
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
          <h2 className="section-title">Email Configuration</h2>
          
          <div className="form-group">
            <label htmlFor="to" className="form-label">Recipients</label>
            <input
              type="email"
              id="to"
              name="to"
              className="form-control"
              value={formData.to}
              onChange={handleChange}
              placeholder="recipient@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject" className="form-label">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="form-control"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Test email from ACC Workflow"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="body" className="form-label">Message Body</label>
            <textarea
              id="body"
              name="body"
              className="form-control"
              value={formData.body}
              onChange={handleChange}
              placeholder="This is a test email sent via the ACC Workflow application..."
              rows="6"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className={`send-btn ${sending ? 'loading' : ''}`}
          onClick={handleSubmit}
          disabled={sending || !formData.to || !formData.subject || !formData.body}
        >
          {sending ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      {result && (
        <div className="test-results">
          <div className="results-header">
            <div className="results-icon">✓</div>
            <h3 className="results-title">Email Sent Successfully</h3>
          </div>
          
          <div className="result-item">
            <span className="result-label">Message ID:</span>
            <span className="result-value">{result.messageId}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">Status:</span>
            <span className="result-value">Delivered</span>
          </div>
        </div>
      )}

      <div className="email-preview">
        <div className="preview-header">
          <h4>Email Preview</h4>
        </div>
        <div className="preview-content">
          <div className="preview-field">
            <span className="preview-label">To:</span>
            <span className="preview-value">{formData.to || 'No recipient specified'}</span>
          </div>
          <div className="preview-field">
            <span className="preview-label">Subject:</span>
            <span className="preview-value">{formData.subject || 'No subject specified'}</span>
          </div>
          <div className="preview-field">
            <span className="preview-label">Body:</span>
            <span className="preview-value">{formData.body || 'No message body specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GmailTest;
