const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Connector = require('../models/Connector');
const ACCService = require('../services/accService');
const GmailService = require('../services/gmailService');
const GoogleCalendarService = require('../services/googleCalendarService');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ACC OAuth initiation
router.get('/acc', (req, res) => {
  const redirectUri = process.env.ACC_REDIRECT_URI || 'http://localhost:5001/api/auth/acc/callback';
  const state = req.query.state || '';
  
  const authUrl = `https://developer.api.autodesk.com/authentication/v2/authorize?` +
    `client_id=${process.env.ACC_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent('data:read data:write data:create bucket:read bucket:create')}&` +
    `state=${encodeURIComponent(state)}`;

  res.redirect(authUrl);
});

// ACC OAuth callback
router.get('/acc/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Extract user ID from state parameter
    let userId = null;
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
      } catch (error) {
        console.error('Error parsing state parameter:', error);
      }
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not provided in state parameter'
      });
    }

    const redirectUri = process.env.ACC_REDIRECT_URI || 'http://localhost:5001/api/auth/acc/callback';
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

    // Create connector with the user ID from state
    const connector = new Connector({
      userId: userId,
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

    await connector.save();

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/connectors?success=acc&connectorId=${connector._id}`);

  } catch (error) {
    console.error('ACC callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/connectors?error=acc&message=${encodeURIComponent(error.message)}`);
  }
});

// Gmail OAuth initiation
router.get('/gmail', (req, res) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/gmail/callback';
  const state = req.query.state || '';
  
  const authUrl = GmailService.getAuthorizationUrl(redirectUri, state);
  res.redirect(authUrl);
});

// Gmail OAuth callback
router.get('/gmail/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Extract user ID from state parameter
    let userId = null;
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
      } catch (error) {
        console.error('Error parsing state parameter:', error);
      }
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not provided in state parameter'
      });
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/gmail/callback';
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

    // Create connector with the user ID from state
    const connector = new Connector({
      userId: userId,
      type: 'gmail',
      name: `Gmail - ${profileResult.data.emailAddress}`,
      credentials: {
        accessToken: tokenResult.data.accessToken,
        refreshToken: tokenResult.data.refreshToken,
        expiresAt: tokenResult.data.expiresAt,
        scope: tokenResult.data.scope
      }
    });

    await connector.save();

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/connectors?success=gmail&connectorId=${connector._id}`);

  } catch (error) {
    console.error('Gmail callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/connectors?error=gmail&message=${encodeURIComponent(error.message)}`);
  }
});

// Google Calendar OAuth initiation
router.get('/google-calendar', (req, res) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google-calendar/callback';
  const state = req.query.state || '';
  
  const authUrl = GoogleCalendarService.getAuthorizationUrl(redirectUri, state);
  res.redirect(authUrl);
});

// Google Calendar OAuth callback
router.get('/google-calendar/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Extract user ID from state parameter
    let userId = null;
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
      } catch (error) {
        console.error('Error parsing state parameter:', error);
      }
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not provided in state parameter'
      });
    }

    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google-calendar/callback';
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

    // Create connector with the user ID from state
    const connector = new Connector({
      userId: userId,
      type: 'google-calendar',
      name: `Google Calendar - ${profileResult.data.calendars[0]?.summary || 'Calendar'}`,
      credentials: {
        accessToken: tokenResult.data.accessToken,
        refreshToken: tokenResult.data.refreshToken,
        expiresAt: tokenResult.data.expiresAt,
        scope: tokenResult.data.scope
      }
    });

    await connector.save();

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/connectors?success=calendar&connectorId=${connector._id}`);

  } catch (error) {
    console.error('Google Calendar callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/connectors?error=calendar&message=${encodeURIComponent(error.message)}`);
  }
});

module.exports = router;
