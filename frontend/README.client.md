# ACC Workflow Client

React frontend for the ACC Workflow Application.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API URL

# Start the development server
npm start

# Build for production
npm run build
```

## Environment Variables

Required environment variables (see `.env.example`):

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5001)

## Project Structure

```
src/
├── components/           # Main application components
│   ├── Login.js         # Authentication component
│   ├── ConnectorsPage.js # OAuth connector management
│   ├── ACCUpload.js     # ACC file upload interface
│   ├── GmailTest.js     # Gmail testing interface
│   ├── CalendarTest.js  # Google Calendar testing interface
│   └── WorkflowBuilder.js # React Flow workflow builder
├── flows/               # React Flow custom nodes
│   └── nodes/          # Custom node components
│       ├── ACCTriggerNode.js      # ACC trigger node
│       ├── GmailActionNode.js     # Gmail action node
│       └── CalendarActionNode.js  # Calendar action node
├── App.js               # Main application component
├── api.js               # API configuration and axios setup
└── index.js             # React entry point
```

## Components

### Login
- User registration and login forms
- JWT token management
- Form validation and error handling

### ConnectorsPage
- Display connected OAuth services
- Connect new services (ACC, Gmail, Calendar)
- Manage existing connectors
- Refresh and delete connectors

### ACCUpload
- ACC account and project selection
- File upload interface
- Upload progress and results display

### GmailTest
- Test Gmail connector
- Send test emails
- Email configuration interface

### CalendarTest
- Test Google Calendar connector
- Create test events
- Event configuration interface

### WorkflowBuilder
- Visual workflow designer using React Flow
- Drag and drop node creation
- Workflow configuration and validation
- Save, load, and manage workflows

## React Flow Nodes

### ACCTriggerNode
- Configuration for ACC project and folder
- Sample filename input
- Trigger node for workflow execution

### GmailActionNode
- Email recipient configuration
- Subject and body input
- Support for dynamic variables ({{fileName}})

### CalendarActionNode
- Event title and description
- Start and end time selection
- Attendee configuration

## API Integration

The frontend communicates with the backend through the `api.js` module:

```javascript
import api from './api';

// Example API calls
const response = await api.get('/api/connectors');
const result = await api.post('/api/workflows', workflowData);
```

### Authentication
- JWT tokens are automatically included in API requests
- Token expiration triggers automatic logout
- Secure token storage in localStorage

### Error Handling
- Network errors are displayed to users
- 401 responses trigger automatic logout
- User-friendly error messages

## Styling

The application uses CSS modules for component-specific styling. Each component has its own CSS file:

- `Login.css` - Authentication form styling
- `ConnectorsPage.css` - Connector management styling
- `ACCUpload.css` - File upload interface styling
- `GmailTest.css` - Email testing interface styling
- `CalendarTest.css` - Calendar testing interface styling
- `WorkflowBuilder.css` - Workflow builder styling

## Development

### Adding New Components
1. Create component file in `components/` directory
2. Create corresponding CSS file
3. Add component to App.js routing
4. Update navigation if needed

### Adding New Workflow Nodes
1. Create node component in `flows/nodes/` directory
2. Add to nodeTypes in WorkflowBuilder.js
3. Update workflow validation rules
4. Add to workflow engine execution logic

### State Management
- Uses React hooks for local state
- No external state management library
- Component state is lifted up as needed

## Testing

### Component Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Manual Testing
1. Start the development server
2. Test OAuth flows with real accounts
3. Test workflow creation and execution
4. Verify error handling and edge cases

## Build and Deployment

### Development Build
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Environment-Specific Builds
```bash
# Development
REACT_APP_API_URL=http://localhost:5001 npm start

# Production
REACT_APP_API_URL=https://your-api-domain.com npm run build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- React Flow nodes are optimized for large workflows
- Lazy loading for workflow components
- Efficient re-rendering with React hooks
- Minimal bundle size with tree shaking

## Accessibility

- Semantic HTML structure
- ARIA labels for form inputs
- Keyboard navigation support
- Screen reader compatibility

## Troubleshooting

### Common Issues

1. **OAuth Redirect Errors**
   - Check redirect URIs in OAuth app settings
   - Verify environment variables are set correctly

2. **API Connection Errors**
   - Check backend server is running
   - Verify API URL in environment variables
   - Check CORS configuration

3. **Workflow Builder Issues**
   - Clear browser cache
   - Check React Flow version compatibility
   - Verify node types are properly registered

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Maintain consistent styling patterns
4. Add proper error handling
5. Test components thoroughly
6. Update documentation as needed
