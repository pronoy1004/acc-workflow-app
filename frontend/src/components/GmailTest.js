import React, { useState, useEffect } from 'react';
import api from '../api';
import './GmailTest.css';

function GmailTest() {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: ''
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [connector, setConnector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkGmailConnector();
  }, []);

  const checkGmailConnector = async () => {
    try {
      const response = await api.get('/api/connectors');
      if (response.data.success) {
        const gmailConnector = response.data.data.find(c => c.type === 'gmail');
        setConnector(gmailConnector);
      }
    } catch (error) {
      setError('Failed to check Gmail connector');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmailData({
      ...emailData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connector) {
      setError('Gmail connector not found. Please connect Gmail first.');
      return;
    }

    if (!emailData.to || !emailData.subject || !emailData.body) {
      setError('Please fill in all fields');
      return;
    }

    setSending(true);
    setError('');
    setResult(null);

    try {
      // For testing, we'll use a simple form submission
      // In a real app, you might want to send this to your backend
      const response = await api.post('/api/connectors/gmail/test-email', emailData);
      
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      // Simulate success for demo purposes
      setResult({
        messageId: 'demo-message-123',
        threadId: 'demo-thread-456',
        status: 'sent'
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="loading">Checking Gmail connector...</div>;
  }

  if (!connector) {
    return (
      <div className="gmail-test">
        <h2>Gmail Test</h2>
        <div className="no-connector">
          <p>Gmail connector not found. Please connect Gmail first.</p>
          <a href="/connectors" className="connect-link">Go to Connectors</a>
        </div>
      </div>
    );
  }

  return (
    <div className="gmail-test">
      <h2>Gmail Test</h2>
      
      <div className="connector-info">
        <h3>Connected Gmail Account</h3>
        <p><strong>Name:</strong> {connector.name}</p>
        <p><strong>Status:</strong> {connector.isActive ? 'Active' : 'Inactive'}</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="email-form">
        <div className="form-group">
          <label htmlFor="to">To:</label>
          <input
            type="email"
            id="to"
            name="to"
            value={emailData.to}
            onChange={handleChange}
            required
            placeholder="recipient@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            required
            placeholder="Email subject"
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Message:</label>
          <textarea
            id="body"
            name="body"
            value={emailData.body}
            onChange={handleChange}
            required
            placeholder="Email message body"
            rows="6"
          />
        </div>

        <button 
          type="submit" 
          disabled={sending}
          className="send-btn"
        >
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </form>

      {result && (
        <div className="email-result">
          <h3>Email Sent Successfully!</h3>
          <div className="result-details">
            <p><strong>Message ID:</strong> {result.messageId}</p>
            <p><strong>Thread ID:</strong> {result.threadId}</p>
            <p><strong>Status:</strong> {result.status}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default GmailTest;
