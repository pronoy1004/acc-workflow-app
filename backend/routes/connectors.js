const express = require('express');
const Connector = require('../models/Connector');
const ACCService = require('../services/accService');
const GmailService = require('../services/gmailService');
const GoogleCalendarService = require('../services/googleCalendarService');

const router = express.Router();

// Get all connectors for the authenticated user
router.get('/', async (req, res) => {
  try {
    const connectors = await Connector.find({ 
      userId: req.user._id,
      isActive: true 
    }).select('-credentials.accessToken -credentials.refreshToken');

    res.json({
      success: true,
      data: connectors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ACC connector authentication (API-based flow)
router.post('/acc/authenticate', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const tokenResult = await ACCService.exchangeCodeForToken(code, redirectUri);
    if (!tokenResult.success) {
      return res.status(400).json({
        success: false,
        message: tokenResult.message
      });
    }

    // Get account info
    const accountResult = await ACCService.getAccountInfo(
      tokenResult.data.accessToken,
      tokenResult.data.refreshToken,
      tokenResult.data.expiresAt
    );

    if (!accountResult.success) {
      return res.status(400).json({
        success: false,
        message: accountResult.message
      });
    }

    // Check if connector already exists
    let connector = await Connector.findOne({
      userId: req.user._id,
      type: 'acc'
    });

    if (connector) {
      // Update existing connector
      connector.credentials = {
        accessToken: tokenResult.data.accessToken,
        refreshToken: tokenResult.data.refreshToken,
        expiresAt: tokenResult.data.expiresAt,
        scope: tokenResult.data.scope,
        accountId: accountResult.data.accountId,
        accountName: accountResult.data.accountName
      };
      connector.name = `ACC - ${accountResult.data.accountName}`;
    } else {
      // Create new connector
      connector = new Connector({
        userId: req.user._id,
        type: 'acc',
        name: `ACC - ${accountResult.data.accountName}`,
        credentials: {
          accessToken: tokenResult.data.accessToken,
          refreshToken: tokenResult.data.refreshToken,
          expiresAt: tokenResult.data.expiresAt,
          scope: tokenResult.data.scope,
          accountId: accountResult.data.accountId,
          accountName: accountResult.data.accountName
        }
      });
    }

    await connector.save();

    res.json({
      success: true,
      data: {
        id: connector._id,
        type: connector.type,
        name: connector.name,
        accountId: connector.credentials.accountId,
        accountName: connector.credentials.accountName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Gmail connector authentication (API-based flow)
router.post('/gmail/authenticate', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const tokenResult = await GmailService.exchangeCodeForToken(code, redirectUri);
    if (!tokenResult.success) {
      return res.status(400).json({
        success: false,
        message: tokenResult.message
      });
    }

    // Get profile info
    const profileResult = await GmailService.getProfile(
      tokenResult.data.accessToken,
      tokenResult.data.refreshToken,
      tokenResult.data.expiresAt
    );

    if (!profileResult.success) {
      return res.status(400).json({
        success: false,
        message: profileResult.message
      });
    }

    // Check if connector already exists
    let connector = await Connector.findOne({
      userId: req.user._id,
      type: 'gmail'
    });

    if (connector) {
      // Update existing connector
      connector.credentials = {
        accessToken: tokenResult.data.accessToken,
        refreshToken: tokenResult.data.refreshToken,
        expiresAt: tokenResult.data.expiresAt,
        scope: tokenResult.data.scope
      };
      connector.name = `Gmail - ${profileResult.data.emailAddress}`;
    } else {
      // Create new connector
      connector = new Connector({
        userId: req.user._id,
        type: 'gmail',
        name: `Gmail - ${profileResult.data.emailAddress}`,
        credentials: {
          accessToken: tokenResult.data.accessToken,
          refreshToken: tokenResult.data.refreshToken,
          expiresAt: tokenResult.data.expiresAt,
          scope: tokenResult.data.scope
        }
      });
    }

    await connector.save();

    res.json({
      success: true,
      data: {
        id: connector._id,
        type: connector.type,
        name: connector.name,
        emailAddress: profileResult.data.emailAddress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Google Calendar connector authentication (API-based flow)
router.post('/google-calendar/authenticate', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const tokenResult = await GoogleCalendarService.exchangeCodeForToken(code, redirectUri);
    if (!tokenResult.success) {
      return res.status(400).json({
        success: false,
        message: tokenResult.message
      });
    }

    // Get profile info
    const profileResult = await GoogleCalendarService.getProfile(
      tokenResult.data.accessToken,
      tokenResult.data.refreshToken,
      tokenResult.data.expiresAt
    );

    if (!profileResult.success) {
      return res.status(400).json({
        success: false,
        message: profileResult.message
      });
    }

    // Check if connector already exists
    let connector = await Connector.findOne({
      userId: req.user._id,
      type: 'google-calendar'
    });

    if (connector) {
      // Update existing connector
      connector.credentials = {
        accessToken: tokenResult.data.accessToken,
        refreshToken: tokenResult.data.refreshToken,
        expiresAt: tokenResult.data.expiresAt,
        scope: tokenResult.data.scope
      };
      connector.name = `Google Calendar - ${profileResult.data.calendars[0]?.summary || 'Calendar'}`;
    } else {
      // Create new connector
      connector = new Connector({
        userId: req.user._id,
        type: 'google-calendar',
        name: `Google Calendar - ${profileResult.data.calendars[0]?.summary || 'Calendar'}`,
        credentials: {
          accessToken: tokenResult.data.accessToken,
          refreshToken: tokenResult.data.refreshToken,
          expiresAt: tokenResult.data.expiresAt,
          scope: tokenResult.data.scope
        }
      });
    }

    await connector.save();

    res.json({
      success: true,
      data: {
        id: connector._id,
        type: connector.type,
        name: connector.name,
        calendars: profileResult.data.calendars
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Refresh tokens for a connector
router.post('/:id/refresh', async (req, res) => {
  try {
    const connector = await Connector.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'Connector not found'
      });
    }

    let refreshResult;

    switch (connector.type) {
      case 'acc':
        refreshResult = await ACCService.refreshToken(connector.credentials.refreshToken);
        break;
      case 'gmail':
        refreshResult = await GmailService.refreshToken(connector.credentials.refreshToken);
        break;
      case 'google-calendar':
        refreshResult = await GoogleCalendarService.refreshToken(connector.credentials.refreshToken);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported connector type'
        });
    }

    if (!refreshResult.success) {
      return res.status(400).json({
        success: false,
        message: refreshResult.message
      });
    }

    // Update connector with new tokens
    connector.credentials = {
      ...connector.credentials,
      accessToken: refreshResult.data.accessToken,
      refreshToken: refreshResult.data.refreshToken,
      expiresAt: refreshResult.data.expiresAt
    };

    await connector.save();

    res.json({
      success: true,
      data: {
        id: connector._id,
        type: connector.type,
        name: connector.name,
        message: 'Tokens refreshed successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Link temporary connectors to logged-in user
router.post('/link', async (req, res) => {
  try {
    const { connectorIds } = req.body;

    if (!connectorIds || !Array.isArray(connectorIds)) {
      return res.status(400).json({
        success: false,
        message: 'Connector IDs array is required'
      });
    }

    const connectors = await Connector.find({
      _id: { $in: connectorIds },
      userId: null // Only temporary connectors
    });

    if (connectors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No temporary connectors found'
      });
    }

    // Link connectors to user
    for (const connector of connectors) {
      connector.userId = req.user._id;
      await connector.save();
    }

    res.json({
      success: true,
      data: {
        message: `${connectors.length} connector(s) linked successfully`,
        linkedCount: connectors.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test Gmail connector by sending a test email
router.post('/gmail/test-email', async (req, res) => {
  try {
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'gmail',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'Gmail connector not found. Please connect your Gmail account first.'
      });
    }

    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'To, subject, and body are required'
      });
    }

    const emailData = { to, subject, body };
    const sendResult = await GmailService.sendEmail(
      emailData,
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt
    );

    if (!sendResult.success) {
      return res.status(400).json({
        success: false,
        message: sendResult.message
      });
    }

    // Update tokens if refreshed
    if (sendResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...sendResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: {
        message: 'Test email sent successfully',
        messageId: sendResult.data.messageId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test Google Calendar connector by creating a test event
router.post('/google-calendar/test-event', async (req, res) => {
  try {
    const connector = await Connector.findOne({
      userId: req.user._id,
      type: 'google-calendar',
      isActive: true
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'Google Calendar connector not found. Please connect your Google Calendar account first.'
      });
    }

    const { summary, description, startTime, endTime } = req.body;

    if (!summary || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Summary, start time, and end time are required'
      });
    }

    // Validate and format dates
    let formattedStartTime, formattedEndTime;
    try {
      formattedStartTime = new Date(startTime).toISOString();
      formattedEndTime = new Date(endTime).toISOString();
      
      if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Please use ISO 8601 format (e.g., 2024-01-01T10:00:00Z)'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO 8601 format (e.g., 2024-01-01T10:00:00Z)'
      });
    }

    const eventData = { 
      summary, 
      description: description || 'Test event created via ACC Workflow App', 
      startTime: formattedStartTime, 
      endTime: formattedEndTime 
    };
    const eventResult = await GoogleCalendarService.createEvent(
      eventData,
      connector.credentials.accessToken,
      connector.credentials.refreshToken,
      connector.credentials.expiresAt
    );

    if (!eventResult.success) {
      return res.status(400).json({
        success: false,
        message: eventResult.message
      });
    }

    // Update tokens if refreshed
    if (eventResult.tokensRefreshed) {
      connector.credentials = {
        ...connector.credentials,
        ...eventResult.newTokens
      };
      await connector.save();
    }

    res.json({
      success: true,
      data: {
        message: 'Test event created successfully',
        eventId: eventResult.data.eventId,
        eventLink: eventResult.data.htmlLink
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a connector
router.delete('/:id', async (req, res) => {
  try {
    const connector = await Connector.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'Connector not found'
      });
    }

    res.json({
      success: true,
      data: {
        message: 'Connector deleted successfully'
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
