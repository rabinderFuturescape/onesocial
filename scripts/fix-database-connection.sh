#!/bin/bash

# Script to fix database connection issues

# Exit on error
set -e

# Default values
CONTAINER_NAME=${1:-"onesocial_original_v2-postiz-production-1"}
SCHEMA_PATH=${2:-"/app/libraries/nestjs-libraries/src/database/prisma/schema.prisma"}

# Function to log messages
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Check if the container exists
if ! docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
  log "Error: Container $CONTAINER_NAME does not exist."
  log "Available containers:"
  docker ps --format "{{.Names}}"
  exit 1
fi

# Check if the container has the DATABASE_URL environment variable
if ! docker exec $CONTAINER_NAME env | grep -q DATABASE_URL; then
  log "Error: Container $CONTAINER_NAME does not have the DATABASE_URL environment variable."
  log "Please update your docker-compose.override.yml file to include the DATABASE_URL environment variable."
  exit 1
fi

# Run Prisma migration with --accept-data-loss flag
log "Running Prisma migration with --accept-data-loss flag..."
docker exec $CONTAINER_NAME npx prisma db push --accept-data-loss --schema=$SCHEMA_PATH

# Restart the container
log "Restarting container $CONTAINER_NAME..."
docker restart $CONTAINER_NAME

# Wait for the container to start
log "Waiting for container $CONTAINER_NAME to start..."
sleep 5

# Check if the container is running
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
  log "Container $CONTAINER_NAME is running."
else
  log "Error: Container $CONTAINER_NAME failed to start."
  exit 1
fi

log "Database connection fix completed successfully!"
log "You should now be able to sign in without encountering the 'Can't reach database server' error."
