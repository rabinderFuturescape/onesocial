#!/bin/bash
set -e

# Configuration
IMAGE="ghcr.io/gitroomhq/postiz-app:latest"
CONTAINER_NAME="postiz-production"
ENV_FILE=".env"
UPLOADS_DIR="./uploads"

echo "Running Postiz production image from GitHub Container Registry..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Warning: $ENV_FILE file not found. Creating from example..."
  cp .env.example "$ENV_FILE"
  echo "Please edit $ENV_FILE with your configuration before continuing."
  exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p "$UPLOADS_DIR"

# Pull the latest image
echo "Pulling the latest Postiz image..."
docker pull "$IMAGE"

# Stop and remove existing container if it exists
echo "Stopping and removing existing container if it exists..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Start the database and Redis if they're not already running
echo "Ensuring database and Redis are running..."
docker-compose -f docker-compose.dev.yaml up -d postiz-postgres postiz-redis

# Run the production container
echo "Starting Postiz production container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p 4200:4200 \
  -p 3000:3000 \
  -v "$(pwd)/$ENV_FILE:/config/postiz.env" \
  -v "$(pwd)/$UPLOADS_DIR:/uploads" \
  --network onesocial_original_v2_postiz-network \
  -e DATABASE_URL="postgresql://postiz-local:postiz-local-pwd@postiz-postgres:5432/postiz-db-local" \
  -e REDIS_URL="redis://postiz-redis:6379" \
  -e FRONTEND_PORT=4200 \
  -e BACKEND_PORT=3000 \
  -e FRONTEND_URL="http://localhost:4200" \
  -e NEXT_PUBLIC_BACKEND_URL="http://localhost:3000" \
  -e BACKEND_INTERNAL_URL="http://localhost:3000" \
  -e JWT_SECRET="postiz-dev-jwt-secret-for-local-development-environment" \
  -e STORAGE_PROVIDER="local" \
  -e NOT_SECURED=true \
  "$IMAGE"

echo "Postiz production container started!"
echo "Frontend: http://localhost:4200"
echo "Backend: http://localhost:3000"
echo ""
echo "To view logs: docker logs -f $CONTAINER_NAME"
echo "To stop: docker stop $CONTAINER_NAME"
