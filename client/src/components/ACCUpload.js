import React, { useState, useEffect } from 'react';
import api from '../api';
import './ACCUpload.css';

function ACCUpload({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/api/acc/accounts');
      if (response.data.success) {
        const accountsData = response.data.data;
        if (Array.isArray(accountsData)) {
          setAccounts(accountsData);
        } else {
          setAccounts([accountsData]);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch ACC accounts' });
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (accountId) => {
    try {
      const response = await api.get(`/api/acc/accounts/${accountId}/projects`);
      if (response.data.success) {
        const projectsData = response.data.data;
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else {
          setProjects([projectsData]);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch projects' });
      setProjects([]);
    }
  };

  const fetchFolders = async (projectId) => {
    try {
      const response = await api.get(`/api/acc/projects/${projectId}/folders`);
      if (response.data.success) {
        const foldersData = response.data.data;
        if (Array.isArray(foldersData)) {
          setFolders(foldersData);
        } else {
          setFolders([foldersData]);
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch folders' });
      setFolders([]);
    }
  };

  const handleAccountChange = (accountId) => {
    setSelectedAccount(accountId);
    setSelectedProject('');
    setSelectedFolder('');
    setProjects([]);
    setFolders([]);
    if (accountId) {
      fetchProjects(accountId);
    }
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    setSelectedFolder('');
    setFolders([]);
    if (projectId) {
      fetchFolders(projectId);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedAccount || !selectedProject || !selectedFolder || !selectedFile) {
      setMessage({ type: 'error', text: 'Please select account, project, folder, and file' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('accountId', selectedAccount);
      formData.append('projectId', selectedProject);
      formData.append('folderId', selectedFolder);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post('/api/acc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: `File uploaded successfully! ${response.data.data.message}` 
        });
        setSelectedFile(null);
        setSelectedAccount('');
        setSelectedProject('');
        setSelectedFolder('');
        setProjects([]);
        setFolders([]);
        setAccounts([]);
        fetchAccounts();
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Upload failed' 
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading ACC accounts...</p>
      </div>
    );
  }

  return (
    <div className="acc-upload">
      <div className="upload-header">
        <h1 className="upload-title">ACC File Upload</h1>
        <p className="upload-subtitle">
          Upload files to your Autodesk Construction Cloud projects and folders
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

      <div className="upload-form">
        <div className="form-section">
          <h2 className="section-title">Select Location</h2>
          
          <div className="form-group">
            <label htmlFor="account" className="form-label">Account</label>
            <select
              id="account"
              className="form-control"
              value={selectedAccount}
              onChange={(e) => handleAccountChange(e.target.value)}
              required
            >
              <option value="">Select an account</option>
              {Array.isArray(accounts) && accounts.map(account => (
                <option key={account.accountId} value={account.accountId}>
                  {account.accountName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="project" className="form-label">Project</label>
            <select
              id="project"
              className="form-control"
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              required
              disabled={!selectedAccount}
            >
              <option value="">Select a project</option>
              {Array.isArray(projects) && projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="folder" className="form-label">Folder</label>
            <select
              id="folder"
              className="form-control"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              required
              disabled={!selectedProject}
            >
              <option value="">Select a folder</option>
              {Array.isArray(folders) && folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Select File</h2>
          
          {!selectedFile ? (
            <div 
              className="file-upload-area"
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
            >
              <div className="file-upload-icon">📁</div>
              <div className="file-upload-text">Drop your file here</div>
              <div className="file-upload-hint">or click to browse</div>
              <button 
                type="button" 
                className="file-upload-button"
                onClick={() => document.getElementById('file-input').click()}
              >
                Choose File
              </button>
              <input
                id="file-input"
                type="file"
                className="file-input"
                onChange={handleFileChange}
                accept="*/*"
              />
            </div>
          ) : (
            <div className="selected-file">
              <div className="file-info">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <h4>{selectedFile.name}</h4>
                  <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                type="button" 
                className="remove-file"
                onClick={removeFile}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              Uploading... {uploadProgress}%
            </div>
          </div>
        )}

        <button
          type="button"
          className={`upload-btn ${uploading ? 'loading' : ''}`}
          onClick={handleUpload}
          disabled={uploading || !selectedFile || !selectedAccount || !selectedProject || !selectedFolder}
        >
          {uploading ? 'Uploading...' : 'Upload to ACC'}
        </button>
      </div>
    </div>
  );
}

export default ACCUpload;
