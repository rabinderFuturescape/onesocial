#!/bin/bash

# Script to toggle the mock Keycloak provider

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  touch .env
fi

# Check if USE_MOCK_KEYCLOAK is already set in .env
if grep -q "USE_MOCK_KEYCLOAK" .env; then
  # Get the current value
  current_value=$(grep "USE_MOCK_KEYCLOAK" .env | cut -d '=' -f2)
  
  if [ "$current_value" = "true" ]; then
    # Change to false
    sed -i '' 's/USE_MOCK_KEYCLOAK=true/USE_MOCK_KEYCLOAK=false/g' .env
    echo "Mock Keycloak provider disabled."
  else
    # Change to true
    sed -i '' 's/USE_MOCK_KEYCLOAK=false/USE_MOCK_KEYCLOAK=true/g' .env
    echo "Mock Keycloak provider enabled."
  fi
else
  # Add USE_MOCK_KEYCLOAK=true to .env
  echo "USE_MOCK_KEYCLOAK=true" >> .env
  echo "Mock Keycloak provider enabled."
fi

# Restart the backend
echo "Restarting the backend..."
docker-compose restart backend

echo "Done!"
