import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../api';
import './WorkflowBuilder.css';

// Import custom nodes
import ACCTriggerNode from '../flows/nodes/ACCTriggerNode';
import GmailActionNode from '../flows/nodes/GmailActionNode';
import CalendarActionNode from '../flows/nodes/CalendarActionNode';

const nodeTypes = {
  'acc-trigger': ACCTriggerNode,
  'gmail-action': GmailActionNode,
  'calendar-action': CalendarActionNode,
};

function WorkflowBuilder({ user }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback((type, position) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: type.replace('-', ' ').toUpperCase() },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('');
    setSelectedWorkflow(null);
  }, [setNodes, setEdges]);

  const saveWorkflow = useCallback(async () => {
    if (!workflowName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a workflow name' });
      return;
    }

    if (nodes.length === 0) {
      setMessage({ type: 'error', text: 'Please add at least one node to the workflow' });
      return;
    }

    setLoading(true);
    try {
      const workflowData = {
        name: workflowName,
        nodes,
        edges,
        userId: user._id
      };

      const response = await api.post('/api/workflows', workflowData);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Workflow saved successfully!' });
        fetchSavedWorkflows();
        setWorkflowName('');
        clearCanvas();
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save workflow' 
      });
    } finally {
      setLoading(false);
    }
  }, [workflowName, nodes, edges, user._id, clearCanvas]);

  const loadWorkflow = useCallback(async (workflowId) => {
    try {
      const response = await api.get(`/api/workflows/${workflowId}`);
      
      if (response.data.success) {
        const workflow = response.data.data;
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        setWorkflowName(workflow.name);
        setSelectedWorkflow(workflowId);
        setMessage({ type: 'success', text: 'Workflow loaded successfully!' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to load workflow' 
      });
    }
  }, [setNodes, setEdges]);

  const deleteWorkflow = useCallback(async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.delete(`/api/workflows/${workflowId}`);
        setMessage({ type: 'success', text: 'Workflow deleted successfully!' });
        fetchSavedWorkflows();
        
        if (selectedWorkflow === workflowId) {
          clearCanvas();
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: 'Failed to delete workflow' 
        });
      }
    }
  }, [selectedWorkflow, clearCanvas]);

  const fetchSavedWorkflows = useCallback(async () => {
    try {
      const response = await api.get('/api/workflows');
      if (response.data.success) {
        setSavedWorkflows(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchSavedWorkflows();
  }, [fetchSavedWorkflows]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div className="workflow-builder">
      <div className="workflow-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🎯 Workflow Builder</h1>
            <p>Design and automate your ACC workflows</p>
          </div>
          <div className="header-actions">
            <div className="workflow-form">
              <input
                type="text"
                className="form-input"
                placeholder="Enter workflow name..."
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
              <button 
                className="header-btn success"
                onClick={saveWorkflow}
                disabled={loading || !workflowName.trim()}
              >
                💾 Save Workflow
              </button>
              <button 
                className="header-btn warning"
                onClick={clearCanvas}
              >
                🗑️ Clear Canvas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="workflow-toolbar">
        <div className="toolbar-content">
          <div className="toolbar-left">
            <span className="toolbar-title">Drag & Drop Nodes:</span>
            <div className="node-palette">
              <div
                className="node-item"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', 'acc-trigger');
                }}
              >
                <div className="node-icon acc-trigger">🚀</div>
                ACC Trigger
              </div>
              <div
                className="node-item"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', 'gmail-action');
                }}
              >
                <div className="node-icon gmail-action">📧</div>
                Gmail Action
              </div>
              <div
                className="node-item"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', 'calendar-action');
                }}
              >
                <div className="node-icon calendar-action">📅</div>
                Calendar Action
              </div>
            </div>
          </div>
          <div className="toolbar-right">
            <button 
              className="toolbar-btn"
              onClick={() => setNodes([])}
            >
              🗑️ Clear Nodes
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => setEdges([])}
            >
              🔗 Clear Connections
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ margin: '1rem 2rem' }}>
          <div className="alert-icon">
            {message.type === 'success' ? '✓' : '⚠'}
          </div>
          {message.text}
        </div>
      )}

      <div className="workflow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      <div className="workflow-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Saved Workflows</h3>
        </div>
        
        <div className="sidebar-content">
          {savedWorkflows.length === 0 ? (
            <div className="sidebar-section">
              <p>No saved workflows yet. Create your first workflow!</p>
            </div>
          ) : (
            savedWorkflows.map(workflow => (
              <div 
                key={workflow._id}
                className={`saved-workflow ${selectedWorkflow === workflow._id ? 'selected' : ''}`}
                onClick={() => loadWorkflow(workflow._id)}
              >
                <div className="workflow-name">{workflow.name}</div>
                <div className="workflow-meta">
                  <span>{workflow.nodes.length} nodes</span>
                  <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="workflow-actions">
                  <button 
                    className="workflow-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadWorkflow(workflow._id);
                    }}
                  >
                    📂 Load
                  </button>
                  <button 
                    className="workflow-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkflow(workflow._id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
