import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './ACCTriggerNode.css';

function ACCTriggerNode({ data, isConnectable }) {
  const [config, setConfig] = useState(data.config || {
    projectId: '',
    folderId: '',
    filename: ''
  });

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  return (
    <div className="acc-trigger-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div className="node-header">
        <h4>ACC Trigger</h4>
        <span className="node-type">Trigger</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>Project ID:</label>
          <input
            type="text"
            value={config.projectId}
            onChange={(e) => handleConfigChange('projectId', e.target.value)}
            placeholder="Enter project ID"
          />
        </div>
        
        <div className="config-section">
          <label>Folder ID:</label>
          <input
            type="text"
            value={config.folderId}
            onChange={(e) => handleConfigChange('folderId', e.target.value)}
            placeholder="Enter folder ID"
          />
        </div>
        
        <div className="config-section">
          <label>Sample Filename:</label>
          <input
            type="text"
            value={config.filename}
            onChange={(e) => handleConfigChange('filename', e.target.value)}
            placeholder="Enter sample filename"
          />
        </div>
        
        <div className="trigger-info">
          <p>This node triggers when a file is uploaded to the specified ACC project and folder.</p>
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

export default ACCTriggerNode;
