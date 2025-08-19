# ACC Workflow Server

Backend Express.js server for the ACC Workflow Application.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start the server
npm start

# Development mode with auto-reload
npm run dev
```

## Environment Variables

Required environment variables (see `.env.example`):

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `SESSION_SECRET` - Secret for session management
- `ACC_CLIENT_ID` - Autodesk ACC OAuth client ID
- `ACC_CLIENT_SECRET` - Autodesk ACC OAuth client secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

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
- `POST /api/acc/upload` - Upload file to ACC
- `GET /api/acc/files/:id` - Get file information

### Workflows
- `GET /api/workflows` - Get user's workflows
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Execute workflow

## Database Models

### User
- Email, password, name
- JWT authentication
- Password hashing with bcrypt

### Connector
- OAuth tokens and credentials
- Service type (acc, gmail, google-calendar)
- Automatic token refresh

### Workflow
- Nodes and edges configuration
- Workflow metadata
- User ownership

### WorkflowExecution
- Execution tracking
- Step-by-step results
- Error logging

## Services

### ACCService
- Token exchange and refresh
- Account and project information
- File upload (simulated or real)

### GmailService
- OAuth2 authentication
- Email sending
- Profile information

### GoogleCalendarService
- OAuth2 authentication
- Event creation
- Calendar management

### WorkflowEngine
- Workflow execution
- Step coordination
- Error handling

## Testing

```bash
# Test ACC API
curl http://localhost:5001/api/acc/test

# Test Gmail API
curl http://localhost:5001/api/gmail/test

# Test Calendar API
curl http://localhost:5001/api/calendar/test
```

## Development

### Adding New Services
1. Create service class in `services/` directory
2. Implement required methods (getAuthUrl, exchangeCodeForToken, etc.)
3. Add to connectors route
4. Update workflow engine if needed

### Adding New Workflow Actions
1. Create new node type in frontend
2. Add to workflow engine execution logic
3. Update validation rules

## Deployment

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT and session secrets
- Set `SIMULATE_ACC=false` for real ACC operations
- Configure proper CORS origins
- Use HTTPS in production
- Set up proper logging and monitoring

### Environment Variables for Production
```bash
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb://your-production-mongodb
JWT_SECRET=your-very-strong-jwt-secret
SESSION_SECRET=your-very-strong-session-secret
ACC_CLIENT_ID=your-production-acc-client-id
ACC_CLIENT_SECRET=your-production-acc-client-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
SIMULATE_ACC=false
LOG_LEVEL=warn
```
