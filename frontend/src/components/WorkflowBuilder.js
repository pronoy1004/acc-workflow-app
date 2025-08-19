import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../api';
import './WorkflowBuilder.css';

// Custom node types
import ACCTriggerNode from '../flows/nodes/ACCTriggerNode';
import GmailActionNode from '../flows/nodes/GmailActionNode';
import CalendarActionNode from '../flows/nodes/CalendarActionNode';

const nodeTypes = {
  'acc-trigger': ACCTriggerNode,
  'gmail-action': GmailActionNode,
  'calendar-action': CalendarActionNode,
};

function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const reactFlowWrapper = useRef(null);

  // Load saved workflows on component mount
  React.useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await api.get('/api/workflows');
      if (response.data.success) {
        setSavedWorkflows(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params) => {
      // Only allow connections from ACC trigger to action nodes
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode && 
          sourceNode.type === 'acc-trigger' && 
          (targetNode.type === 'gmail-action' || targetNode.type === 'calendar-action')) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [nodes, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: type.replace('-', ' ').toUpperCase() },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const addNode = useCallback((type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: { 
        label: type.replace('-', ' ').toUpperCase(),
        config: {}
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('');
    setWorkflowDescription('');
    setSelectedWorkflow(null);
  }, [setNodes, setEdges]);



  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      setError('Please enter a workflow name');
      return;
    }

    if (nodes.length === 0) {
      setError('Please add at least one node to the workflow');
      return;
    }

    // Validate workflow structure
    const triggerNodes = nodes.filter(n => n.type === 'acc-trigger');
    if (triggerNodes.length !== 1) {
      setError('Exactly one ACC trigger node is required');
      return;
    }

    const actionNodes = nodes.filter(n => 
      n.type === 'gmail-action' || n.type === 'calendar-action'
    );
    if (actionNodes.length === 0) {
      setError('At least one action node (Gmail or Calendar) is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const workflowData = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges
      };

      let response;
      if (selectedWorkflow) {
        response = await api.put(`/api/workflows/${selectedWorkflow._id}`, workflowData);
      } else {
        response = await api.post('/api/workflows', workflowData);
      }

      if (response.data.success) {
        setWorkflowName('');
        setWorkflowDescription('');
        setNodes([]);
        setEdges([]);
        setSelectedWorkflow(null);
        fetchWorkflows();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save workflow');
    } finally {
      setSaving(false);
    }
  };

  const loadWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowName(workflow.name);
    setWorkflowDescription(workflow.description || '');
    setNodes(workflow.nodes || []);
    setEdges(workflow.edges || []);
  };



  const deleteWorkflow = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.delete(`/api/workflows/${workflowId}`);
        fetchWorkflows();
        if (selectedWorkflow && selectedWorkflow._id === workflowId) {
          setSelectedWorkflow(null);
          setWorkflowName('');
          setWorkflowDescription('');
          setNodes([]);
          setEdges([]);
        }
      } catch (error) {
        setError('Failed to delete workflow');
      }
    }
  };



  if (loading) {
    return <div className="loading">Loading workflows...</div>;
  }

  return (
    <div className="workflow-builder">
      <div className="workflow-sidebar">
        <h2>Workflow Builder</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="workflow-form">
          <div className="form-group">
            <label htmlFor="workflowName">Workflow Name:</label>
            <input
              type="text"
              id="workflowName"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="workflowDescription">Description:</label>
            <textarea
              id="workflowDescription"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Enter workflow description (optional)"
              rows="3"
            />
          </div>
        </div>

        <div className="node-toolbar">
          <h3>Add Nodes</h3>
          <button 
            onClick={() => addNode('acc-trigger')}
            className="add-node-btn trigger-btn"
          >
            Add ACC Trigger
          </button>
          <button 
            onClick={() => addNode('gmail-action')}
            className="add-node-btn gmail-btn"
          >
            Add Gmail Action
          </button>
          <button 
            onClick={() => addNode('calendar-action')}
            className="add-node-btn calendar-btn"
          >
            Add Calendar Action
          </button>
        </div>

        <div className="workflow-actions">
          <button 
            onClick={saveWorkflow}
            disabled={saving || !workflowName.trim()}
            className="save-btn"
          >
            {saving ? 'Saving...' : 'Save Workflow'}
          </button>
          <button onClick={clearCanvas} className="clear-btn">
            Clear Canvas
          </button>
        </div>

        <div className="saved-workflows">
          <h3>Saved Workflows</h3>
          {savedWorkflows.length === 0 ? (
            <p>No saved workflows</p>
          ) : (
            savedWorkflows.map(workflow => (
              <div key={workflow._id} className="workflow-item">
                <div className="workflow-info">
                  <h4>{workflow.name}</h4>
                  <p>{workflow.description || 'No description'}</p>
                  <p>Nodes: {workflow.nodes.length}</p>
                </div>
                <div className="workflow-item-actions">
                  <button 
                    onClick={() => loadWorkflow(workflow)}
                    className="load-btn"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => deleteWorkflow(workflow._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="workflow-canvas" ref={reactFlowWrapper}>
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
          <Background />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default WorkflowBuilder;
