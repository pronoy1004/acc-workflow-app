const Workflow = require('../models/Workflow');
const GmailService = require('./gmailService');
const GoogleCalendarService = require('./googleCalendarService');
const logger = require('../utils/logger');

class WorkflowEngine {
  /**
   * Execute workflows based on a trigger event
   * @param {string} triggerType - Type of trigger (e.g., 'file-upload', 'file-modify')
   * @param {Object} triggerData - Data from the trigger event
   * @param {string} userId - ID of the user who triggered the event
   */
  static async executeWorkflows(triggerType, triggerData, userId) {
    try {
      logger.info(`Executing workflows for trigger: ${triggerType}`, { userId, triggerData });

      // Find all workflows for this user that match the trigger type
      const workflows = await Workflow.find({
        userId: userId,
        'nodes': {
          $elemMatch: {
            'type': 'acc-trigger',
            'data.triggerType': triggerType
          }
        }
      });

      if (workflows.length === 0) {
        logger.info(`No workflows found for trigger: ${triggerType}`, { userId });
        return { success: true, message: 'No workflows to execute' };
      }

      const results = [];
      
      for (const workflow of workflows) {
        try {
          const result = await this.executeWorkflow(workflow, triggerData, userId);
          results.push({
            workflowId: workflow._id,
            workflowName: workflow.name,
            success: result.success,
            message: result.message,
            actions: result.actions
          });
        } catch (error) {
          logger.error(`Error executing workflow ${workflow._id}:`, error);
          results.push({
            workflowId: workflow._id,
            workflowName: workflow.name,
            success: false,
            message: error.message
          });
        }
      }

      return {
        success: true,
        message: `Executed ${workflows.length} workflows`,
        results: results
      };

    } catch (error) {
      logger.error('Error in workflow execution:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Execute a single workflow
   * @param {Object} workflow - The workflow to execute
   * @param {Object} triggerData - Data from the trigger event
   * @param {string} userId - ID of the user who triggered the event
   */
  static async executeWorkflow(workflow, triggerData, userId) {
    try {
      logger.info(`Executing workflow: ${workflow.name}`, { workflowId: workflow._id, userId });

      // Find the trigger node
      const triggerNode = workflow.nodes.find(node => node.type === 'acc-trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow');
      }

      // Check if trigger conditions are met
      if (!this.checkTriggerConditions(triggerNode, triggerData)) {
        logger.info(`Trigger conditions not met for workflow: ${workflow.name}`);
        return { success: true, message: 'Trigger conditions not met' };
      }

      // Find all action nodes
      const actionNodes = workflow.nodes.filter(node => 
        node.type === 'gmail-action' || node.type === 'calendar-action'
      );

      const actionResults = [];

      // Execute each action node
      for (const actionNode of actionNodes) {
        try {
          const result = await this.executeActionNode(actionNode, triggerData, userId);
          actionResults.push({
            nodeId: actionNode.id,
            type: actionNode.type,
            success: result.success,
            message: result.message,
            data: result.data
          });
        } catch (error) {
          logger.error(`Error executing action node ${actionNode.id}:`, error);
          actionResults.push({
            nodeId: actionNode.id,
            type: actionNode.type,
            success: false,
            message: error.message
          });
        }
      }

      return {
        success: true,
        message: `Workflow executed successfully`,
        actions: actionResults
      };

    } catch (error) {
      logger.error(`Error executing workflow ${workflow._id}:`, error);
      throw error;
    }
  }

  /**
   * Check if trigger conditions are met
   * @param {Object} triggerNode - The trigger node configuration
   * @param {Object} triggerData - Data from the trigger event
   */
  static checkTriggerConditions(triggerNode, triggerData) {
    const config = triggerNode.data || {};
    
    // Check project ID if specified
    if (config.projectId && config.projectId !== triggerData.projectId) {
      return false;
    }

    // Check folder ID if specified
    if (config.folderId && config.folderId !== triggerData.folderId) {
      return false;
    }

    // Check file types if specified
    if (config.fileTypes && config.fileTypes.length > 0 && config.fileTypes[0] !== '*') {
      const fileExtension = triggerData.filename.split('.').pop().toLowerCase();
      const allowedTypes = config.fileTypes.map(t => t.replace('*.', '').toLowerCase());
      if (!allowedTypes.includes(fileExtension)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute an action node
   * @param {Object} actionNode - The action node to execute
   * @param {Object} triggerData - Data from the trigger event
   * @param {string} userId - ID of the user who triggered the event
   */
  static async executeActionNode(actionNode, triggerData, userId) {
    try {
      const config = actionNode.data || {};

      switch (actionNode.type) {
        case 'gmail-action':
          return await this.executeGmailAction(config, triggerData, userId);
        
        case 'calendar-action':
          return await this.executeCalendarAction(config, triggerData, userId);
        
        default:
          throw new Error(`Unknown action type: ${actionNode.type}`);
      }
    } catch (error) {
      logger.error(`Error executing action node ${actionNode.id}:`, error);
      throw error;
    }
  }

  /**
   * Execute a Gmail action
   * @param {Object} config - Action configuration
   * @param {Object} triggerData - Data from the trigger event
   * @param {string} userId - ID of the user who triggered the event
   */
  static async executeGmailAction(config, triggerData, userId) {
    try {
      // Replace template variables
      const subject = this.replaceTemplateVariables(config.subject || 'File uploaded: {{filename}}', triggerData);
      const body = this.replaceTemplateVariables(config.body || 'A new file has been uploaded to ACC', triggerData);

      // Get user's Gmail connector
      const Connector = require('../models/Connector');
      const gmailConnector = await Connector.findOne({
        userId: userId,
        type: 'gmail',
        isActive: true
      });

      if (!gmailConnector) {
        throw new Error('Gmail connector not found or not active');
      }

      // Send email
      const emailData = {
        to: config.to,
        cc: config.cc,
        bcc: config.bcc,
        subject: subject,
        body: body
      };

      const result = await GmailService.sendEmail(
        gmailConnector.accessToken,
        gmailConnector.refreshToken,
        gmailConnector.expiresAt,
        emailData
      );

      return {
        success: true,
        message: 'Email sent successfully',
        data: result
      };

    } catch (error) {
      logger.error('Error executing Gmail action:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Execute a Calendar action
   * @param {Object} config - Action configuration
   * @param {Object} triggerData - Data from the trigger event
   * @param {string} userId - ID of the user who triggered the event
   */
  static async executeCalendarAction(config, triggerData, userId) {
    try {
      // Replace template variables
      const summary = this.replaceTemplateVariables(config.summary || 'File Review: {{filename}}', triggerData);
      const description = this.replaceTemplateVariables(config.description || 'Review meeting for the newly uploaded file', triggerData);

      // Get user's Google Calendar connector
      const Connector = require('../models/Connector');
      const calendarConnector = await Connector.findOne({
        userId: userId,
        type: 'google-calendar',
        isActive: true
      });

      if (!calendarConnector) {
        throw new Error('Google Calendar connector not found or not active');
      }

      // Calculate start time based on config
      let startTime = new Date();
      if (config.startTime === '15min') {
        startTime.setMinutes(startTime.getMinutes() + 15);
      } else if (config.startTime === '1hour') {
        startTime.setHours(startTime.getHours() + 1);
      } else if (config.startTime === 'next-day') {
        startTime.setDate(startTime.getDate() + 1);
        startTime.setHours(9, 0, 0, 0); // 9 AM next day
      }

      // Calculate end time
      const endTime = new Date(startTime);
      const durationMinutes = parseInt(config.duration || '60');
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      const eventData = {
        summary: summary,
        description: description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendees: config.attendees ? config.attendees.split(',').map(e => e.trim()) : []
      };

      const result = await GoogleCalendarService.createEvent(
        calendarConnector.accessToken,
        calendarConnector.refreshToken,
        calendarConnector.expiresAt,
        eventData
      );

      return {
        success: true,
        message: 'Calendar event created successfully',
        data: result
      };

    } catch (error) {
      logger.error('Error executing Calendar action:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Replace template variables in text
   * @param {string} text - Text containing template variables
   * @param {Object} data - Data to replace variables with
   */
  static replaceTemplateVariables(text, data) {
    return text
      .replace(/\{\{filename\}\}/g, data.filename || 'Unknown file')
      .replace(/\{\{project\}\}/g, data.projectName || 'Unknown project')
      .replace(/\{\{folder\}\}/g, data.folderName || 'Unknown folder')
      .replace(/\{\{uploader\}\}/g, data.uploader || 'Unknown user')
      .replace(/\{\{timestamp\}\}/g, new Date().toLocaleString())
      .replace(/\{\{filesize\}\}/g, data.fileSize || 'Unknown size');
  }
}

module.exports = WorkflowEngine;
