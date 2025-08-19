const mongoose = require('mongoose');
require('dotenv').config();

// Import models to ensure they're registered
require('./models/User');
require('./models/Connector');
require('./models/Workflow');
require('./models/WorkflowExecution');

async function initializeDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acc-workflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // Create collections if they don't exist
    const collections = ['users', 'connectors', 'workflows', 'workflowexecutions'];
    
    for (const collectionName of collections) {
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${collectionName}`);
      }
    }
    
    // Create indexes for better performance
    console.log('Creating database indexes...');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created index on users.email');
    
    // Connectors collection indexes
    await db.collection('connectors').createIndex({ userId: 1, type: 1 });
    await db.collection('connectors').createIndex({ userId: 1, isActive: 1 });
    console.log('✅ Created indexes on connectors.userId and connectors.type');
    
    // Workflows collection indexes
    await db.collection('workflows').createIndex({ userId: 1, isActive: 1 });
    await db.collection('workflows').createIndex({ userId: 1, updatedAt: -1 });
    console.log('✅ Created indexes on workflows.userId and workflows.updatedAt');
    
    // WorkflowExecutions collection indexes
    await db.collection('workflowexecutions').createIndex({ workflowId: 1 });
    await db.collection('workflowexecutions').createIndex({ userId: 1, startedAt: -1 });
    await db.collection('workflowexecutions').createIndex({ status: 1 });
    console.log('✅ Created indexes on workflowexecutions');
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\nCollections created:');
    console.log('- users (with email unique index)');
    console.log('- connectors (with userId + type indexes)');
    console.log('- workflows (with userId + status indexes)');
    console.log('- workflowexecutions (with workflowId + userId indexes)');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
