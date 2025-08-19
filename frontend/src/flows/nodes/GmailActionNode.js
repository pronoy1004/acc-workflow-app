import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './GmailActionNode.css';

function GmailActionNode({ data, isConnectable }) {
  const [config, setConfig] = useState(data.config || {
    recipients: '',
    subject: '',
    body: ''
  });

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  return (
    <div className="gmail-action-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div className="node-header">
        <h4>Gmail Action</h4>
        <span className="node-type">Action</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>Recipients:</label>
          <input
            type="text"
            value={config.recipients}
            onChange={(e) => handleConfigChange('recipients', e.target.value)}
            placeholder="email1@example.com, email2@example.com"
          />
        </div>
        
        <div className="config-section">
          <label>Subject:</label>
          <input
            type="text"
            value={config.subject}
            onChange={(e) => handleConfigChange('subject', e.target.value)}
            placeholder="Enter email subject"
          />
        </div>
        
        <div className="config-section">
          <label>Message Body:</label>
          <textarea
            value={config.body}
            onChange={(e) => handleConfigChange('body', e.target.value)}
            placeholder="Enter email message. Use {{filename}} for dynamic content."
            rows="3"
          />
        </div>
        
        <div className="action-info">
          <p>This action sends an email when the workflow is triggered.</p>
          <p><strong>Variables:</strong> {'{{filename}}'} will be replaced with the uploaded filename.</p>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default GmailActionNode;
