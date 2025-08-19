import React, { useState } from 'react';
import { Handle } from 'reactflow';
import './ACCTriggerNode.css';

function ACCTriggerNode({ data, isConnectable }) {
  const [config, setConfig] = useState({
    triggerType: 'file-upload',
    projectId: '',
    folderId: '',
    fileTypes: ['*'],
    conditions: 'any'
  });

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="acc-trigger-node">
      <div className="node-status"></div>
      
      <div className="node-header">
        <h4>ACC Trigger</h4>
        <div className="node-type">Trigger</div>
      </div>

      <div className="node-content">
        <div className="trigger-info">
          <div className="trigger-icon">
            🚀 ACC File Upload Trigger
          </div>
          <p>Triggers when files are uploaded to specific ACC locations</p>
          <p>Configure the trigger conditions below</p>
        </div>

        <div className="config-section">
          <label className="config-label">Trigger Type</label>
          <select
            className="config-input"
            value={config.triggerType}
            onChange={(e) => handleConfigChange('triggerType', e.target.value)}
          >
            <option value="file-upload">File Upload</option>
            <option value="file-modify">File Modified</option>
            <option value="file-delete">File Deleted</option>
            <option value="folder-create">Folder Created</option>
          </select>
        </div>

        <div className="config-section">
          <label className="config-label">Project ID</label>
          <input
            type="text"
            className="config-input"
            placeholder="Enter project ID or leave empty for any"
            value={config.projectId}
            onChange={(e) => handleConfigChange('projectId', e.target.value)}
          />
        </div>

        <div className="config-section">
          <label className="config-label">Folder ID</label>
          <input
            type="text"
            className="config-input"
            placeholder="Enter folder ID or leave empty for any"
            value={config.folderId}
            onChange={(e) => handleConfigChange('folderId', e.target.value)}
          />
        </div>

        <div className="config-section">
          <label className="config-label">File Types</label>
          <input
            type="text"
            className="config-input"
            placeholder="*.pdf,*.dwg,*.rvt (comma separated)"
            value={config.fileTypes.join(',')}
            onChange={(e) => handleConfigChange('fileTypes', e.target.value.split(',').map(t => t.trim()))}
          />
        </div>

        <div className="config-section">
          <label className="config-label">Trigger Conditions</label>
          <select
            className="config-input"
            value={config.conditions}
            onChange={(e) => handleConfigChange('conditions', e.target.value)}
          >
            <option value="any">Any file</option>
            <option value="new">New files only</option>
            <option value="modified">Modified files only</option>
            <option value="specific">Specific file types only</option>
          </select>
        </div>

        <div className="action-info">
          <p><strong>When triggered:</strong></p>
          <p>This node will activate the connected action nodes in your workflow</p>
          <p>Use the output handle below to connect to Gmail or Calendar actions</p>
        </div>
      </div>

      <Handle
        type="source"
        position="bottom"
        className="react-flow__handle"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default ACCTriggerNode;
