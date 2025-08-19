#!/bin/bash

echo "🚀 ACC Workflow Database Setup Script"
echo "====================================="

# Check if MongoDB is running
echo "Checking MongoDB status..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
    echo "Please start MongoDB first:"
    echo "  - macOS: brew services start mongodb-community"
    echo "  - Linux: sudo systemctl start mongod"
    echo "  - Windows: net start MongoDB"
    echo ""
    echo "Or start manually: mongod"
    exit 1
fi

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 3

# Check if we can connect to MongoDB
echo "Testing MongoDB connection..."
if mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful"
else
    echo "❌ Cannot connect to MongoDB"
    echo "Please ensure MongoDB is running and accessible"
    exit 1
fi

# Create database and collections
echo "Creating database and collections..."
mongosh --eval "
  use acc-workflow;
  db.createCollection('users');
  db.createCollection('connectors');
  db.createCollection('workflows');
  db.createCollection('workflowexecutions');
  
  // Create indexes
  db.users.createIndex({email: 1}, {unique: true});
  db.connectors.createIndex({userId: 1, type: 1});
  db.connectors.createIndex({userId: 1, isActive: 1});
  db.workflows.createIndex({userId: 1, isActive: 1});
  db.workflows.createIndex({userId: 1, updatedAt: -1});
  db.workflowexecutions.createIndex({workflowId: 1});
  db.workflowexecutions.createIndex({userId: 1, startedAt: -1});
  db.workflowexecutions.createIndex({status: 1});
  
  print('Database setup completed successfully!');
"

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📊 Database: acc-workflow"
    echo "📁 Collections created:"
    echo "  - users (with email unique index)"
    echo "  - connectors (with userId + type indexes)"
    echo "  - workflows (with userId + status indexes)"
    echo "  - workflowexecutions (with workflowId + userId indexes)"
    echo ""
    echo "🎯 Next steps:"
    echo "  1. Set up your .env file with MongoDB_URI"
    echo "  2. Run: npm run init-db (to verify setup)"
    echo "  3. Start the server: npm start"
else
    echo "❌ Database setup failed"
    exit 1
fi
