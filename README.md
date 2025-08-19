# ACC Workflow Application

A full-stack single-page application that lets users create workflows connecting Autodesk Construction Cloud (ACC) to Gmail or Google Calendar. The app supports OAuth2 authentication for all services, file uploads to ACC, and automated email/calendar event creation.

## 🚨 Current Status & Known Issues

### ✅ What's Working
- **User Authentication**: JWT-based login/registration system
- **OAuth2 Integration**: ACC, Gmail, and Google Calendar OAuth flows
- **Database**: MongoDB connection and models (User, Connector, Workflow, WorkflowExecution)
- **Basic API Structure**: RESTful API endpoints for all major functions
- **Frontend Routing**: React Router with protected routes
- **Token Management**: Automatic token refresh for all services
- **Workflow Builder UI**: React Flow-based visual workflow designer

### ❌ What's NOT Working
- **ACC File Upload**: Currently fails due to API permission issues and complex ACC Data Management API requirements
- **Workflow Execution**: Workflows can be created but execution fails due to ACC upload issues
- **ACC Project/Folder Access**: Limited access to ACC projects due to API scope restrictions
- **Real-time Workflow Triggers**: No automatic workflow execution on file uploads

### 🔧 Known Issues
1. **ACC API Permissions**: The app requires elevated ACC API permissions that are not available in trial accounts
2. **File Upload Complexity**: ACC file upload requires multiple API calls and specific project/folder permissions
3. **Workflow Engine**: While the engine is implemented, it depends on successful ACC operations
4. **OAuth Scopes**: Some ACC operations require additional OAuth scopes not available in basic apps

## Features

- **OAuth2 Authentication**: Secure authentication with ACC, Gmail, and Google Calendar
- **Workflow Builder**: Visual workflow designer using React Flow
- **ACC Integration**: File uploads to ACC projects and folders (currently limited)
- **Gmail Integration**: Automated email sending with dynamic content
- **Google Calendar Integration**: Automated calendar event creation
- **MongoDB Storage**: Persistent storage of connectors and workflows
- **Token Management**: Automatic token refresh and management

## Project Structure

```
acc-workflow-app/
├── backend/                 # Express.js server
│   ├── config/             # Passport configuration
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── middleware/         # Authentication & error handling
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app setup
│   ├── server.js           # Server entry point
│   └── package.json        # Server dependencies
├── frontend/               # React client
│   ├── public/             # Static files
│   ├── src/                # React components
│   │   ├── components/     # Main components
│   │   ├── flows/          # React Flow nodes
│   │   ├── App.js          # Main app component
│   │   ├── api.js          # API configuration
│   │   └── index.js        # React entry point
│   └── package.json        # Client dependencies
└── README.md               # This file
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Google Cloud Platform account
- Autodesk Developer account

## Environment Variables

### Backend (.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/acc-workflow

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# Session Configuration
SESSION_SECRET=your-session-secret-key-here

# Autodesk Construction Cloud (ACC) Configuration
ACC_CLIENT_ID=your-acc-client-id-here
ACC_CLIENT_SECRET=your-acc-client-secret-here
ACC_REDIRECT_URI=http://localhost:5001/auth/acc/callback
ACC_API_BASE_URL=https://developer.api.autodesk.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5001/auth/google/callback

# Logging Configuration
LOG_LEVEL=info
```

### Frontend (.env)

```bash
REACT_APP_API_URL=http://localhost:5001
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd acc-workflow-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up MongoDB

#### Option 1: Local MongoDB Installation
```bash
# Start MongoDB (if not running)
mongod

# Or use Homebrew (macOS)
brew services start mongodb-community

# Or use systemctl (Linux)
sudo systemctl start mongod

# Or use Windows Service
net start MongoDB
```

#### Option 2: Docker MongoDB
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use Docker Compose
docker-compose up -d mongodb
```

#### Option 3: Automated Database Setup
```bash
# Navigate to backend directory
cd backend

# Run the setup script (macOS/Linux)
chmod +x setup-db.sh
./setup-db.sh

# Or run the Windows batch file
npm run setup-db

# Verify database setup
npm run init-db
```

### 3. Configure OAuth Applications

#### Google Cloud Platform

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API and Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5001/auth/gmail/callback`
   - `http://localhost:5001/auth/google-calendar/callback`
7. Copy Client ID and Client Secret to your `.env` file

#### Autodesk Developer

1. Go to [Autodesk Developer Portal](https://developer.autodesk.com/)
2. Create a new app
3. Add scopes: `data:read`, `data:write`, `data:create`, `bucket:read`, `bucket:create`
4. Set redirect URI to: `http://localhost:5001/auth/acc/callback`
5. Copy Client ID and Client Secret to your `.env` file

**⚠️ Important**: ACC trial accounts have limited API access. For full functionality, you need a paid ACC account with elevated API permissions.

### 4. Start the Application

```bash
# Start backend server (from backend directory)
cd backend
npm start

# Start frontend (from frontend directory, in new terminal)
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/acc` - ACC OAuth initiation
- `GET /api/auth/gmail` - Gmail OAuth initiation
- `GET /api/auth/google-calendar` - Google Calendar OAuth initiation

### Connectors
- `GET /api/connectors` - Get user's connectors
- `POST /api/connectors/acc/authenticate` - ACC connector authentication
- `POST /api/connectors/gmail/authenticate` - Gmail connector authentication
- `POST /api/connectors/google-calendar/authenticate` - Calendar connector authentication
- `POST /api/connectors/:id/refresh` - Refresh connector tokens
- `DELETE /api/connectors/:id` - Delete connector

### ACC Operations
- `GET /api/acc/accounts` - Get ACC accounts
- `GET /api/acc/accounts/:id/projects` - Get projects for account
- `GET /api/acc/projects/:id/folders` - Get folders for project
- `POST /api/acc/upload` - Upload file to ACC (currently limited)
- `GET /api/acc/files/:id` - Get file information

### Workflows
- `GET /api/workflows` - Get user's workflows
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow (currently limited)

## Testing

### Backend Test Endpoints

```bash
# Test server health (includes database status)
curl http://localhost:5001/api/health

# Test ACC API
curl http://localhost:5001/api/acc/test

# Test Gmail API
curl http://localhost:5001/api/gmail/test

# Test Calendar API
curl http://localhost:5001/api/calendar/test
```

### ACC Token Exchange (curl)

```bash
# Exchange authorization code for token
curl -v -X POST "https://developer.api.autodesk.com/authentication/v2/token" \
  -u "${ACC_CLIENT_ID}:${ACC_CLIENT_SECRET}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=THE_CODE" \
  -d "redirect_uri=${ACC_REDIRECT_URI}"

# Refresh token
curl -v -X POST "https://developer.api.autodesk.com/authentication/v2/token" \
  -u "${ACC_CLIENT_ID}:${ACC_CLIENT_SECRET}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=THE_REFRESH_TOKEN"
```

## Demo Checklist

### 2-3 Minute Screencast Steps

1. **Setup & Login** (30s)
   - Show the application starting up
   - Register a new user account
   - Login to the system

2. **Connect Services** (1m)
   - Connect ACC account (OAuth flow)
   - Connect Gmail account (OAuth flow)
   - Connect Google Calendar account (OAuth flow)
   - Show connectors page with all services connected

3. **Test Individual Services** (1m)
   - Show ACC project/folder access (limited)
   - Send a test email via Gmail
   - Create a test calendar event
   - Show successful results for Gmail and Calendar operations

4. **Create & Execute Workflow** (30s)
   - Open workflow builder
   - Create a simple workflow: ACC Trigger → Gmail Action
   - Configure the workflow (project, folder, email details)
   - Save the workflow
   - **Note**: Execution will fail due to ACC upload limitations

## Development Notes

### Current Limitations

1. **ACC API Access**: Trial accounts have limited API access
2. **File Upload**: Complex ACC Data Management API requirements
3. **Workflow Execution**: Depends on successful ACC operations
4. **OAuth Scopes**: Additional scopes needed for full ACC functionality

### Token Management

All OAuth tokens are automatically refreshed when they expire (with a 5-minute buffer). The system stores tokens securely in MongoDB and updates them transparently.

### Error Handling

The application includes comprehensive error handling:
- Network errors are logged with status codes and response data
- User-friendly error messages are displayed
- Automatic token refresh on authentication failures
- Graceful degradation for missing connectors

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **OAuth Redirect Errors**
   - Verify redirect URIs match exactly in OAuth app settings
   - Check that ports are not blocked by firewall

3. **Token Refresh Failures**
   - Ensure refresh tokens are being stored correctly
   - Check OAuth app scopes and permissions

4. **ACC API Errors**
   - Verify ACC app has correct scopes
   - Check that you have a paid ACC account with elevated permissions
   - ACC trial accounts have limited API access

5. **File Upload Failures**
   - ACC file upload requires specific project/folder permissions
   - The Data Management API has complex requirements
   - Consider using ACC Build API as an alternative

### Logs

Check the console output for detailed error messages and API responses. The application logs all network errors with status codes and response data.

## Future Improvements

### High Priority
1. **ACC API Permissions**: Obtain elevated API permissions for full functionality
2. **File Upload**: Implement robust ACC file upload with proper error handling
3. **Workflow Execution**: Fix workflow execution engine for real ACC operations

### Medium Priority
1. **Real-time Triggers**: Implement webhook-based workflow triggers
2. **Error Recovery**: Add retry mechanisms for failed operations
3. **Monitoring**: Add workflow execution monitoring and alerting

### Low Priority
1. **UI Improvements**: Enhanced workflow builder with more node types
2. **Templates**: Pre-built workflow templates for common use cases
3. **Analytics**: Workflow execution analytics and reporting

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check the console logs for error details
4. Ensure all environment variables are properly set
5. **For ACC issues**: Consider upgrading to a paid ACC account with elevated API permissions

## Contributing

This project is currently in development with several known limitations. Contributions are welcome, especially for:
- ACC API integration improvements
- Workflow execution engine fixes
- Error handling and recovery mechanisms
- UI/UX improvements
