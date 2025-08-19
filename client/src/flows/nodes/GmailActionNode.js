import React, { useState } from 'react';
import { Handle } from 'reactflow';
import './GmailActionNode.css';

function GmailActionNode({ data, isConnectable }) {
  const [config, setConfig] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    template: 'default',
    attachments: false
  });

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="gmail-action-node">
      <div className="node-status"></div>
      
      <div className="node-header">
        <h4>Gmail Action</h4>
        <div className="node-type">Action</div>
      </div>

      <div className="node-content">
        <div className="config-section">
          <label className="config-label">Recipients (To)</label>
          <input
            type="text"
            className="config-input"
            placeholder="recipient@example.com, another@example.com"
            value={config.to}
            onChange={(e) => handleConfigChange('to', e.target.value)}
          />
        </div>

        <div className="config-section">
          <label className="config-label">CC</label>
          <input
            type="text"
            className="config-input"
            placeholder="cc@example.com (optional)"
            value={config.cc}
            onChange={(e) => handleConfigChange('cc', e.target.value)}
          />
        </div>

        <div className="config-section">
          <label className="config-label">BCC</label>
          <input
            type="text"
            className="config-input"
            placeholder="bcc@example.com (optional)"
            value={config.bcc}
            onChange={(e) => handleConfigChange('bcc', e.target.value)}
          />
        </div>

        <div className="config-section">
          <label className="config-label">Subject</label>
          <input
            type="text"
            className="config-input"
            placeholder="File uploaded: {'{{filename}}'}"
            value={config.subject}
            onChange={(e) => handleConfigChange('subject', e.target.value)}
          />
        </div>

        <div className="config-section">
          <label className="config-label">Message Body</label>
          <textarea
            className="config-input"
            placeholder="A new file has been uploaded to ACC..."
            value={config.body}
            onChange={(e) => handleConfigChange('body', e.target.value)}
            rows="4"
          />
        </div>

        <div className="config-section">
          <label className="config-label">Email Template</label>
          <select
            className="config-input"
            value={config.template}
            onChange={(e) => handleConfigChange('template', e.target.value)}
          >
            <option value="default">Default Template</option>
            <option value="notification">Notification Template</option>
            <option value="approval">Approval Request</option>
            <option value="custom">Custom Template</option>
          </select>
        </div>

        <div className="config-section">
          <label className="config-label">Include Attachments</label>
          <select
            className="config-input"
            value={config.attachments}
            onChange={(e) => handleConfigChange('attachments', e.target.value === 'true')}
          >
            <option value="false">No attachments</option>
            <option value="true">Include uploaded file</option>
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
          <p>This node will send an email when triggered by an ACC event</p>
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

export default GmailActionNode;
