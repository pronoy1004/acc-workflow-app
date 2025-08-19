@echo off
echo 🚀 ACC Workflow Database Setup Script
echo =====================================

echo Checking MongoDB status...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB is running
) else (
    echo ❌ MongoDB is not running
    echo Please start MongoDB first:
    echo   - Start MongoDB service: net start MongoDB
    echo   - Or start manually: mongod
    pause
    exit /b 1
)

echo Waiting for MongoDB to be ready...
timeout /t 3 /nobreak > NUL

echo Testing MongoDB connection...
mongo --eval "db.runCommand('ping')" > NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ MongoDB connection successful
) else (
    echo ❌ Cannot connect to MongoDB
    echo Please ensure MongoDB is running and accessible
    pause
    exit /b 1
)

echo Creating database and collections...
mongo --eval "
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

if %ERRORLEVEL% EQU 0 (
    echo ✅ Database setup completed successfully!
    echo.
    echo 📊 Database: acc-workflow
    echo 📁 Collections created:
    echo   - users (with email unique index)
    echo   - connectors (with userId + type indexes)
    echo   - workflows (with userId + status indexes)
    echo   - workflowexecutions (with workflowId + userId indexes)
    echo.
    echo 🎯 Next steps:
    echo   1. Set up your .env file with MongoDB_URI
    echo   2. Run: npm run init-db (to verify setup)
    echo   3. Start the server: npm start
) else (
    echo ❌ Database setup failed
    pause
    exit /b 1
)

pause
