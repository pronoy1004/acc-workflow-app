const { google } = require('googleapis');

class GoogleCalendarService {
  static getAuthorizationUrl(redirectUri, state = '') {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google-calendar/callback'
    );

    const scopes = [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
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
        redirectUri || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5001/api/auth/google-calendar/callback'
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
      console.error('Google Calendar token exchange error:', error.message);
      
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
      console.error('Google Calendar token refresh error:', error.message);
      
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

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const calendarList = await calendar.calendarList.list();

      return {
        success: true,
        data: {
          calendars: calendarList.data.items.map(cal => ({
            id: cal.id,
            summary: cal.summary,
            primary: cal.primary || false
          }))
        },
        tokensRefreshed: tokenResult.tokensRefreshed,
        newTokens: tokenResult.newTokens
      };
    } catch (error) {
      console.error('Google Calendar getProfile error:', error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }

  static async createEvent(eventData, accessToken, refreshToken, expiresAt) {
    try {
      const tokenResult = await this.ensureValidToken(accessToken, refreshToken, expiresAt);
      if (!tokenResult.success) {
        return tokenResult;
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: tokenResult.newTokens.accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const { summary, description, startTime, endTime, attendees, calendarId = 'primary' } = eventData;
      
      const event = {
        summary,
        description,
        start: {
          dateTime: startTime,
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime,
          timeZone: 'UTC'
        },
        attendees: attendees ? attendees.map(email => ({ email })) : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };

      const res = await calendar.events.insert({
        calendarId,
        requestBody: event
      });

      return {
        success: true,
        data: {
          eventId: res.data.id,
          htmlLink: res.data.htmlLink,
          summary: res.data.summary,
          start: res.data.start,
          end: res.data.end
        },
        tokensRefreshed: tokenResult.tokensRefreshed,
        newTokens: tokenResult.newTokens
      };
    } catch (error) {
      console.error('Google Calendar createEvent error:', error.message);
      
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = GoogleCalendarService;
