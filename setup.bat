@echo off
echo 🚀 Setting up ACC Workflow Application...
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% lss 16 (
    echo ❌ Node.js version 16+ is required. Current version: 
    node --version
    echo    Please update Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm is installed
npm --version

echo.
echo 📦 Installing dependencies...

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Dependencies installed successfully!
echo.
echo 🔧 Next steps:
echo ==============
echo.
echo 1. Configure environment variables:
echo    copy backend\.env.example backend\.env
echo    # Edit backend\.env with your API keys
echo.
echo 2. Set up your API keys:
echo    - Google Cloud Console (Gmail + Calendar APIs)
echo    - Autodesk Forge Developer Portal
echo.
echo 3. Start MongoDB (if using local installation):
echo    mongod
echo.
echo 4. Start the application:
echo    # Terminal 1 - Backend
echo    cd backend ^&^& npm run dev
echo.
echo    # Terminal 2 - Frontend
echo    cd frontend ^&^& npm start
echo.
echo 📚 See README.md for detailed setup instructions
echo.
echo 🎉 Setup complete! Happy coding!
pause
