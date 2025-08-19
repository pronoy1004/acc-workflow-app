import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ConnectorsPage from './components/ConnectorsPage';
import ACCUpload from './components/ACCUpload';
import GmailTest from './components/GmailTest';
import CalendarTest from './components/CalendarTest';
import WorkflowBuilder from './components/WorkflowBuilder';
import api from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You could verify the token here if needed
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>ACC Workflow App</h1>
        <nav>
          <a href="/connectors">Connectors</a>
          <a href="/acc-upload">ACC Upload</a>
          <a href="/gmail-test">Gmail Test</a>
          <a href="/calendar-test">Calendar Test</a>
          <a href="/workflow-builder">Workflow Builder</a>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/connectors" replace />} />
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/acc-upload" element={<ACCUpload />} />
          <Route path="/gmail-test" element={<GmailTest />} />
          <Route path="/calendar-test" element={<CalendarTest />} />
          <Route path="/workflow-builder" element={<WorkflowBuilder />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
