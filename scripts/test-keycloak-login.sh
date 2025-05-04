#!/bin/bash

# Script to test Keycloak login and user provisioning

echo "Testing Keycloak login and user provisioning..."

# Start the application if it's not already running
if ! docker ps | grep -q postiz-production; then
  echo "Starting the application..."
  docker-compose -f docker-compose.production.yml up -d
  
  # Wait for the application to start
  echo "Waiting for the application to start..."
  sleep 30
fi

# Check if Keycloak is running
if ! curl -s http://localhost:8080 > /dev/null; then
  echo "❌ Keycloak is not running!"
  echo "Please start Keycloak and try again."
  exit 1
fi

echo "✅ Keycloak is running."

# Get the Keycloak authorization URL
echo "Getting Keycloak authorization URL..."
auth_url=$(curl -s http://localhost:3001/auth/oauth/ONESSO)

echo "Keycloak authorization URL: $auth_url"
echo ""
echo "To test the Keycloak login:"
echo "1. Open the following URL in your browser:"
echo "$auth_url"
echo ""
echo "2. Log in with the test user credentials:"
echo "   Username: demo"
echo "   Password: demo"
echo ""
echo "3. You should be redirected back to the application and logged in."
echo ""
echo "4. Check the application logs to verify user provisioning:"
echo "   docker-compose -f docker-compose.production.yml logs postiz-production | grep 'User provisioned'"
