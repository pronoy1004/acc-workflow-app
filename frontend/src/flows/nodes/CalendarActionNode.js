import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import './CalendarActionNode.css';

function CalendarActionNode({ data, isConnectable }) {
  const [config, setConfig] = useState(data.config || {
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendees: ''
  });

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  return (
    <div className="calendar-action-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div className="node-header">
        <h4>Calendar Action</h4>
        <span className="node-type">Action</span>
      </div>
      
      <div className="node-content">
        <div className="config-section">
          <label>Event Title:</label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => handleConfigChange('title', e.target.value)}
            placeholder="Enter event title"
          />
        </div>
        
        <div className="config-section">
          <label>Description:</label>
          <textarea
            value={config.description}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            placeholder="Enter event description"
            rows="2"
          />
        </div>
        
        <div className="config-section">
          <label>Start Time:</label>
          <input
            type="datetime-local"
            value={config.startTime}
            onChange={(e) => handleConfigChange('startTime', e.target.value)}
          />
        </div>
        
        <div className="config-section">
          <label>End Time:</label>
          <input
            type="datetime-local"
            value={config.endTime}
            onChange={(e) => handleConfigChange('endTime', e.target.value)}
          />
        </div>
        
        <div className="config-section">
          <label>Attendees:</label>
          <input
            type="text"
            value={config.attendees}
            onChange={(e) => handleConfigChange('attendees', e.target.value)}
            placeholder="email1@example.com, email2@example.com"
          />
        </div>
        
        <div className="action-info">
          <p>This action creates a calendar event when the workflow is triggered.</p>
          <p><strong>Note:</strong> Start and end times are required for the event to be created.</p>
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

export default CalendarActionNode;
