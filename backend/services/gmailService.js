const { google } = require('googleapis');

class GmailService {
  static getAuthorizationUrl(redirectUri, state = '') {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/gmail/callback'
    );

    const scopes = [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: state
    });

    return url;
  }

  static async exchangeCodeForToken(code, redirectUri) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/gmail/callback'
      );

      const { tokens } = await oauth2Client.getToken(code);
      
      return {
        success: true,
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expiry_date || (Date.now() + (tokens.expires_in * 1000)),
          scope: tokens.scope
        }
      };
    } catch (error) {
      console.error('Gmail token exchange error:', error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async refreshToken(refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await oauth2Client.refreshAccessToken();
      
      return {
        success: true,
        data: {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || refreshToken,
          expiresAt: credentials.expiry_date || (Date.now() + (credentials.expires_in * 1000)),
          scope: credentials.scope
        }
      };
    } catch (error) {
      console.error('Gmail token refresh error:', error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async ensureValidToken(accessToken, refreshToken, expiresAt) {
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    if (Date.now() >= (expiresAt - bufferTime)) {
      const refreshResult = await this.refreshToken(refreshToken);
      if (refreshResult.success) {
        return {
          success: true,
          tokensRefreshed: true,
          newTokens: refreshResult.data
        };
      } else {
        return {
          success: false,
          message: 'Failed to refresh token'
        };
      }
    }
    
    return {
      success: true,
      tokensRefreshed: false,
      newTokens: { accessToken, refreshToken, expiresAt }
    };
  }

  static async getProfile(accessToken, refreshToken, expiresAt) {
    try {
      const tokenResult = await this.ensureValidToken(accessToken, refreshToken, expiresAt);
      if (!tokenResult.success) {
        return tokenResult;
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: tokenResult.newTokens.accessToken
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: 'me' });

      return {
        success: true,
        data: {
          emailAddress: profile.data.emailAddress,
          messagesTotal: profile.data.messagesTotal,
          threadsTotal: profile.data.threadsTotal,
          historyId: profile.data.historyId
        },
        tokensRefreshed: tokenResult.tokensRefreshed,
        newTokens: tokenResult.newTokens
      };
    } catch (error) {
      console.error('Gmail getProfile error:', error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async sendEmail(emailData, accessToken, refreshToken, expiresAt) {
    try {
      const tokenResult = await this.ensureValidToken(accessToken, refreshToken, expiresAt);
      if (!tokenResult.success) {
        return tokenResult;
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: tokenResult.newTokens.accessToken
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const { to, subject, body, from } = emailData;
      
      const emailLines = [
        `From: ${from || 'me'}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ];

      const email = emailLines.join('\r\n');
      const base64EncodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: base64EncodedEmail
        }
      });

      return {
        success: true,
        data: {
          messageId: res.data.id,
          threadId: res.data.threadId,
          labelIds: res.data.labelIds
        },
        tokensRefreshed: tokenResult.tokensRefreshed,
        newTokens: tokenResult.newTokens
      };
    } catch (error) {
      console.error('Gmail sendEmail error:', error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = GmailService;
