#!/bin/bash

echo "🚀 Setting up ACC Workflow Application..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    echo "   Please update Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Check if MongoDB is available
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "   You can:"
    echo "   1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/"
    echo "   2. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo "   3. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
    echo ""
    echo "   For now, we'll continue with the setup..."
else
    echo "✅ MongoDB is available"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "=============="
echo ""
echo "1. Configure environment variables:"
echo "   cp backend/.env.example backend/.env"
echo "   # Edit backend/.env with your API keys"
echo ""
echo "2. Set up your API keys:"
echo "   - Google Cloud Console (Gmail + Calendar APIs)"
echo "   - Autodesk Forge Developer Portal"
echo ""
echo "3. Start MongoDB (if using local installation):"
echo "   mongod"
echo ""
echo "4. Start the application:"
echo "   # Terminal 1 - Backend"
echo "   cd backend && npm run dev"
echo ""
echo "   # Terminal 2 - Frontend"
echo "   cd frontend && npm start"
echo ""
echo "📚 See README.md for detailed setup instructions"
echo ""
echo "🎉 Setup complete! Happy coding!"
