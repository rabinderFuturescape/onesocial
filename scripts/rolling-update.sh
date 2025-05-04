#!/bin/bash

# Script for performing a rolling update with minimal downtime

echo "Starting rolling update process..."

# Pull the latest images
echo "Pulling latest images..."
docker-compose -f docker-compose.production.yml pull postiz-production

# Start or update the Keycloak service
echo "Starting/updating Keycloak service..."
docker-compose -f docker-compose.production.yml up -d keycloak

# Wait for Keycloak to be healthy
echo "Waiting for Keycloak to be healthy..."
until curl -s http://localhost:8080 > /dev/null; do
  echo "Waiting for Keycloak to start..."
  sleep 5
done

# Start or update the postiz-production service
echo "Starting/updating postiz-production service..."
docker-compose -f docker-compose.production.yml up -d postiz-production

# Wait for the postiz-production service to be healthy
echo "Waiting for postiz-production to be healthy..."
until curl -s http://localhost:3001/health > /dev/null; do
  echo "Waiting for postiz-production to start..."
  sleep 5
done

echo "Rolling update completed successfully!"
