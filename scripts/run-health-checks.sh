#!/bin/bash

# Script to run health checks on the frontend and backend

echo "Running health checks on the frontend and backend..."

# Start the application if it's not already running
if ! docker ps | grep -q postiz-production; then
  echo "Starting the application..."
  docker-compose -f docker-compose.production.yml up -d
  
  # Wait for the application to start
  echo "Waiting for the application to start..."
  sleep 30
fi

# Check frontend health
echo "Checking frontend health..."
frontend_health=$(curl -s http://localhost:3000/health)

if [ "$frontend_health" == "OK" ] || echo "$frontend_health" | grep -q "healthy"; then
  echo "✅ Frontend health check passed!"
else
  echo "❌ Frontend health check failed!"
  echo "Response: $frontend_health"
fi

# Check backend health
echo "Checking backend health..."
backend_health=$(curl -s http://localhost:3001/health)

if [ "$backend_health" == "OK" ] || echo "$backend_health" | grep -q "healthy"; then
  echo "✅ Backend health check passed!"
else
  echo "❌ Backend health check failed!"
  echo "Response: $backend_health"
fi
