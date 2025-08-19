const express = require('express');
const multer = require('multer');
const Connector = require('../models/Connector');
const ACCService = require('../services/accService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
  }
});

// Get ACC accounts for the authenticated user
router.get('/accounts', async (req, res) => {
  try {
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

    const accountResult = await ACCService.getAccountInfo(
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt
    );

    if (!accountResult.success) {
      return res.status(400).json({
        success: false,
        message: accountResult.message
      });
    }

    // Update tokens if refreshed
    if (accountResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...accountResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: accountResult.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get hubs for the authenticated user
router.get('/hubs', async (req, res) => {
  try {
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

    const accountResult = await ACCService.getAccountInfo(
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt
    );

    if (!accountResult.success) {
      return res.status(400).json({
        success: false,
        message: accountResult.message
      });
    }

    // Update tokens if refreshed
    if (accountResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...accountResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: {
        hubs: accountResult.data.hubs,
        primaryHub: accountResult.data.accountId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get projects directly (for users without hubs)
router.get('/projects', async (req, res) => {
  try {
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

    const projectsResult = await ACCService.getProjects(
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt
    );

    if (!projectsResult.success) {
      return res.status(400).json({
        success: false,
        message: projectsResult.message
      });
    }

    // Update tokens if refreshed
    if (projectsResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...projectsResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: projectsResult.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get projects for a specific hub
router.get('/hubs/:hubId/projects', async (req, res) => {
  try {
    const { hubId } = req.params;
    
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

    const projectsResult = await ACCService.getProjects(
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt,
      hubId
    );

    if (!projectsResult.success) {
      return res.status(400).json({
        success: false,
        message: projectsResult.message
      });
    }

    // Update tokens if refreshed
    if (projectsResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...projectsResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: projectsResult.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Legacy endpoint for backward compatibility
router.get('/accounts/:accountId/projects', async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

    const projectsResult = await ACCService.getProjects(
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt,
      accountId
    );

    if (!projectsResult.success) {
      return res.status(400).json({
        success: false,
        message: projectsResult.message
      });
    }

    // Update tokens if refreshed
    if (projectsResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...projectsResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: projectsResult.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get folders for a specific project
router.get('/projects/:projectId/folders', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

    const foldersResult = await ACCService.getFolders(
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt,
      projectId
    );

    if (!foldersResult.success) {
      return res.status(400).json({
        success: false,
        message: foldersResult.message
      });
    }

    // Update tokens if refreshed
    if (foldersResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...foldersResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: foldersResult.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upload file to ACC
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

    const uploadResult = await ACCService.uploadFile(
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt,
      projectId,
      file.buffer,
      file.originalname
    );

    if (!uploadResult.success) {
      return res.status(400).json({
        success: false,
        message: uploadResult.message
      });
    }

    // Update tokens if refreshed
    if (uploadResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...uploadResult.newTokens
      };
      await connector.save();
    }

    // Execute workflows for file upload
    try {
      const WorkflowEngine = require('../services/workflowEngine');
      const triggerData = {
        filename: file.originalname,
        projectId: projectId,
        folderId: 'root',
        projectName: req.body.projectName || 'Unknown Project',
        folderName: 'Project Files (Root)',
        fileSize: file.size,
        uploader: req.user.email,
        timestamp: new Date().toISOString()
      };

      const workflowResult = await WorkflowEngine.executeWorkflows('file-upload', triggerData, req.user._id);
      
      if (workflowResult.success && workflowResult.results.length > 0) {
        console.log(`Executed ${workflowResult.results.length} workflows for file upload`);
      }
    } catch (workflowError) {
      console.error('Error executing workflows:', workflowError);
      // Don't fail the upload if workflow execution fails
    }

    res.json({
      success: true,
      data: uploadResult.data,
      workflowsExecuted: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get file information
router.get('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'ACC connector not found. Please connect your ACC account first.'
      });
    }

          // Real ACC Data Management API call for file info
      // This will need to be implemented based on your specific ACC file structure
      res.status(501).json({
        success: false,
        message: 'ACC file retrieval not yet implemented - implement based on your ACC Data Management API structure'
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        message: 'ACC API is working',
        timestamp: new Date().toISOString(),
        mode: 'Real ACC API - no simulation'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
