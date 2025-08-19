import React, { useState } from 'react';
import { Handle } from 'reactflow';
import './CalendarActionNode.css';

function CalendarActionNode({ data, isConnectable }) {
  const [config, setConfig] = useState({
    summary: '',
    description: '',
    location: '',
    startTime: 'now',
    duration: '60',
    attendees: '',
    reminders: ['15'],
    timezone: 'UTC'
  });

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="calendar-action-node">
      <div className="node-status"></div>
      
      <div className="node-header">
        <h4>Calendar Action</h4>
        <div className="node-type">Action</div>
      </div>

      <div className="node-content">
        <div className="config-section">
          <label className="config-label">Event Title</label>
          <input
            type="text"
            className="config-input"
            placeholder="File Review: {'{{filename}}'}"
            value={config.summary}
            onChange={(e) => handleConfigChange('summary', e.target.value)}
          />
        </div>

        <div className="config-section">
          <label className="config-label">Description</label>
          <textarea
            className="config-input"
            placeholder="Review meeting for the newly uploaded file..."
            value={config.description}
            onChange={(e) => handleConfigChange('description', e.target.value)}
            rows="3"
          />
        </div>

        <div className="config-section">
          <label className="config-label">Location</label>
          <input
            type="text"
            className="config-input"
            placeholder="Conference Room A or Zoom Meeting"
            value={config.location}
            onChange={(e) => handleConfigChange('location', e.target.value)}
          />
        </div>

        <div className="datetime-group">
          <div className="config-section">
            <label className="config-label">Start Time</label>
            <select
              className="config-input"
              value={config.startTime}
              onChange={(e) => handleConfigChange('startTime', e.target.value)}
            >
              <option value="now">Immediately</option>
              <option value="15min">15 minutes from now</option>
              <option value="1hour">1 hour from now</option>
              <option value="next-day">Next business day</option>
              <option value="custom">Custom time</option>
            </select>
          </div>

          <div className="config-section">
            <label className="config-label">Duration</label>
            <select
              className="config-input"
              value={config.duration}
              onChange={(e) => handleConfigChange('duration', e.target.value)}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>

        <div className="config-section">
          <label className="config-label">Attendees</label>
          <input
            type="text"
            className="config-input"
            placeholder="email1@example.com, email2@example.com"
            value={config.attendees}
            onChange={(e) => handleConfigChange('attendees', e.target.value)}
          />
        </div>

        <div className="reminder-settings">
          <div className="reminder-title">Reminder Settings</div>
          <div className="reminder-options">
            {['5', '15', '30', '60'].map(minutes => (
              <div
                key={minutes}
                className={`reminder-option ${config.reminders.includes(minutes) ? 'selected' : ''}`}
                onClick={() => {
                  const newReminders = config.reminders.includes(minutes)
                    ? config.reminders.filter(r => r !== minutes)
                    : [...config.reminders, minutes];
                  handleConfigChange('reminders', newReminders);
                }}
              >
                {minutes} min
              </div>
            ))}
          </div>
        </div>

        <div className="timezone-selector">
          <label className="timezone-label">Time Zone</label>
          <select
            className="timezone-select"
            value={config.timezone}
            onChange={(e) => handleConfigChange('timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div className="template-variables">
          <h5>Available Variables</h5>
          <div className="variable-list">
            <span className="variable-tag">{'{{filename}}'}</span>
            <span className="variable-tag">{'{{project}}'}</span>
            <span className="variable-tag">{'{{folder}}'}</span>
            <span className="variable-tag">{'{{uploader}}'}</span>
            <span className="variable-tag">{'{{timestamp}}'}</span>
            <span className="variable-tag">{'{{filesize}}'}</span>
          </div>
        </div>

        <div className="action-info">
          <p><strong>Action:</strong></p>
          <p>This node will create a calendar event when triggered by an ACC event</p>
          <p>Use the input handle above to connect from ACC Trigger nodes</p>
        </div>
      </div>

      <Handle
        type="target"
        position="top"
        className="react-flow__handle"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default CalendarActionNode;
