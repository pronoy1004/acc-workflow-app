const express = require('express');
const Workflow = require('../models/Workflow');
const WorkflowExecution = require('../models/WorkflowExecution');
const WorkflowEngine = require('../services/workflowEngine');

const router = express.Router();

// Get all workflows for the authenticated user
router.get('/', async (req, res) => {
  try {
    const workflows = await Workflow.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get a specific workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create a new workflow
router.post('/', async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;

    if (!name || !nodes || !Array.isArray(nodes)) {
      return res.status(400).json({
        success: false,
        message: 'Name and nodes array are required'
      });
    }

    // Validate that there's exactly one trigger node
    const triggerNodes = nodes.filter(node => node.type === 'acc-trigger');
    if (triggerNodes.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Exactly one ACC trigger node is required'
      });
    }

    // Validate that edges only go from trigger to action nodes
    const validEdges = edges.every(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      return sourceNode && targetNode && 
             sourceNode.type === 'acc-trigger' && 
             (targetNode.type === 'gmail-action' || targetNode.type === 'calendar-action');
    });

    if (!validEdges) {
      return res.status(400).json({
        success: false,
        message: 'Edges can only go from ACC trigger to Gmail or Calendar action nodes'
      });
    }

    const workflow = new Workflow({
      userId: req.user._id,
      name,
      description,
      nodes,
      edges
    });

    await workflow.save();

    res.status(201).json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update an existing workflow
router.put('/:id', async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;

    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    if (name) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (nodes) workflow.nodes = nodes;
    if (edges) workflow.edges = edges;

    await workflow.save();

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a workflow
router.delete('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    workflow.isActive = false;
    await workflow.save();

    res.json({
      success: true,
      data: {
        message: 'Workflow deleted successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Execute a workflow
router.post('/:id/execute', async (req, res) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    const { projectId, folderId, fileBuffer, filename } = req.body;

    if (!projectId || !folderId || !fileBuffer || !filename) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, folder ID, file buffer, and filename are required'
      });
    }

    // Create execution record
    const execution = new WorkflowExecution({
      workflowId: workflow._id,
      userId: req.user._id,
      inputData: { projectId, folderId, fileBuffer, filename }
    });

    await execution.save();

    // Execute workflow asynchronously
    WorkflowEngine.executeWorkflow(execution._id, workflow, {
      projectId,
      folderId,
      fileBuffer: Buffer.from(fileBuffer, 'base64'),
      filename
    }).catch(error => {
      console.error('Workflow execution error:', error);
    });

    res.json({
      success: true,
      data: {
        executionId: execution._id,
        message: 'Workflow execution started',
        status: 'pending'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get workflow execution status
router.get('/:id/executions', async (req, res) => {
  try {
    const executions = await WorkflowExecution.find({
      workflowId: req.params.id,
      userId: req.user._id
    }).sort({ startedAt: -1 });

    res.json({
      success: true,
      data: executions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get specific execution details
router.get('/executions/:executionId', async (req, res) => {
  try {
    const execution = await WorkflowExecution.findOne({
      _id: req.params.executionId,
      userId: req.user._id
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        message: 'Execution not found'
      });
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
