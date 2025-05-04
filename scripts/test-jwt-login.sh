#!/bin/bash

# Script to test JWT login functionality

echo "Testing JWT login functionality..."

# Start the application if it's not already running
if ! docker ps | grep -q postiz-production; then
  echo "Starting the application..."
  docker-compose -f docker-compose.production.yml up -d
  
  # Wait for the application to start
  echo "Waiting for the application to start..."
  sleep 30
fi

# Test JWT login
echo "Attempting JWT login..."
response=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo"}')

# Check if the login was successful
if echo "$response" | grep -q "token"; then
  echo "✅ JWT login successful!"
  echo "JWT login is working correctly."
else
  echo "❌ JWT login failed!"
  echo "Response: $response"
  echo "Please check the application logs for more details."
fi
