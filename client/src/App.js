import React, { useState, useEffect } from 'react';
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
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/auth/me')
        .then(response => {
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🚀 ACC Workflow App</h1>
            <div className="user-info">
              <span className="user-email">Welcome, {user.email}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
        
        <nav className="nav-menu">
          <a href="#connectors" className="nav-link active">Connectors</a>
          <a href="#upload" className="nav-link">ACC Upload</a>
          <a href="#gmail" className="nav-link">Gmail Test</a>
          <a href="#calendar" className="nav-link">Calendar Test</a>
          <a href="#workflow" className="nav-link">Workflow Builder</a>
        </nav>
      </header>

      <main className="main-content">
        <div className="content-section" id="connectors">
          <ConnectorsPage user={user} />
        </div>
        
        <div className="content-section" id="upload">
          <ACCUpload user={user} />
        </div>
        
        <div className="content-section" id="gmail">
          <GmailTest user={user} />
        </div>
        
        <div className="content-section" id="calendar">
          <CalendarTest user={user} />
        </div>
        
        <div className="content-section" id="workflow">
          <WorkflowBuilder user={user} />
        </div>
      </main>
    </div>
  );
}

export default App;
