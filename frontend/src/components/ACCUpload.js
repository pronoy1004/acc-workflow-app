import React, { useState, useEffect } from 'react';
import api from '../api';
import './ACCUpload.css';

function ACCUpload() {
  const [hubs, setHubs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedHub, setSelectedHub] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      const response = await api.get('/api/acc/accounts');
      if (response.data.success) {
        const accountsData = response.data.data;
        
        // Store user info for display
        setUserInfo({
          userName: accountsData.userName,
          accountName: accountsData.accountName,
          email: accountsData.email,
          displayName: accountsData.displayName
        });
        
        // Handle hubs for project access
        if (accountsData.hasHubs && accountsData.hubs && Array.isArray(accountsData.hubs)) {
          setHubs(accountsData.hubs);
        } else if (accountsData.directProjects && Array.isArray(accountsData.directProjects)) {
          // User has direct project access (no hubs)
          setHubs([]);
          // Pre-populate projects since user doesn't need to select a hub
          setProjects(accountsData.directProjects);
        } else if (accountsData.accountId) {
          // Fallback: If there's a primary hub, use it
          setHubs([{
            id: accountsData.accountId,
            attributes: { name: accountsData.accountName }
          }]);
        } else {
          setHubs([]);
        }
      }
    } catch (error) {
      setError('Failed to fetch ACC account info');
      setHubs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async (hubId) => {
    try {
      let response;
      
      if (hubId) {
        // Use the hub-based endpoint if hub is selected
        response = await api.get(`/api/acc/hubs/${hubId}/projects`);
      } else {
        // If no hub, try to get projects directly
        response = await api.get('/api/acc/projects');
      }
      
      if (response.data.success) {
        const projectsData = response.data.data;
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else {
          setProjects([projectsData]);
        }
      }
    } catch (error) {
      setError('Failed to fetch projects');
      setProjects([]);
    }
  };



  const handleHubChange = (hubId) => {
    setSelectedHub(hubId);
    setSelectedProject('');
    setProjects([]);
    
    if (hubId) {
      fetchProjects(hubId);
    }
  };

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !selectedProject) {
      setError('Please select a file and project');
      return;
    }

    setUploading(true);
    setError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProject);


      const response = await api.post('/api/acc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUploadResult(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading ACC hubs...</div>;
  }

  return (
    <div className="acc-upload">
      <h2>ACC File Upload</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* User Account Info */}
      {userInfo && (
        <div className="user-info">
          <h3>Your ACC Account</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Name:</strong> {userInfo.displayName || userInfo.userName}
            </div>
            {userInfo.email && (
              <div className="info-item">
                <strong>Email:</strong> {userInfo.email}
              </div>
            )}
            <div className="info-item">
              <strong>Account:</strong> {userInfo.accountName}
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleUpload} className="upload-form">
        {/* Only show hub selection if user has hubs */}
        {hubs.length > 0 && (
          <div className="form-group">
            <label htmlFor="hub">Select Hub:</label>
            <select
              id="hub"
              value={selectedHub}
              onChange={(e) => handleHubChange(e.target.value)}
              required
            >
              <option value="">Select a hub</option>
              {Array.isArray(hubs) && hubs.map(hub => (
                <option key={hub.id} value={hub.id}>
                  {hub.attributes.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show message if user has direct project access */}
        {hubs.length === 0 && projects.length > 0 && (
          <div className="info-message">
            <p>✅ You have direct access to {projects.length} project(s). No hub selection needed.</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="project">Project:</label>
          <select
            id="project"
            value={selectedProject}
            onChange={(e) => handleProjectChange(e.target.value)}
            required
            disabled={hubs.length > 0 && !selectedHub}
          >
            <option value="">Select a project</option>
            {Array.isArray(projects) && projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name || project.attributes?.name || project.id}
              </option>
            ))}
          </select>
        </div>

        <div className="info-message">
          <p>📁 Files will be uploaded to the project's "Project Files" folder by default</p>
        </div>

        <div className="form-group">
          <label htmlFor="file">File:</label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={uploading || !file || !selectedProject}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>

      {uploadResult && (
        <div className="upload-result">
          <h3>Upload Successful!</h3>
          <div className="result-details">
            <p><strong>Filename:</strong> {uploadResult.filename}</p>
            <p><strong>Message:</strong> {uploadResult.message}</p>
            {uploadResult.itemId && <p><strong>Item ID:</strong> {uploadResult.itemId}</p>}
            {uploadResult.versionId && <p><strong>Version ID:</strong> {uploadResult.versionId}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default ACCUpload;
