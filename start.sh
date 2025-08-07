#!/bin/bash

# PTFO E-commerce Application Startup Script
echo "🚀 Starting PTFO E-commerce Application..."

# Check if MongoDB is running
echo "📦 Checking MongoDB status..."
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   macOS: brew services start mongodb-community"
    echo "   Linux: sudo service mongod start"
    echo "   Windows: net start MongoDB"
    exit 1
fi

echo "✅ MongoDB is running"

# Function to start backend
start_backend() {
    echo "🔧 Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting React frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    cd ..
}

# Start both services
start_backend
sleep 3
start_frontend

echo ""
echo "🎉 Application is starting up!"
echo ""
echo "📍 Access your application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001/api"
echo "   Health Check: http://localhost:5001/api/health"
echo ""
echo "🛑 To stop the application, press Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user to stop
wait
