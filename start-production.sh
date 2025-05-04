#!/bin/bash
set -e

echo "Starting Postiz production environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "Warning: .env file not found. Creating from example..."
  cp .env.example .env
  echo "Please edit .env with your configuration before continuing."
  exit 1
fi

# Create uploads directory if it doesn't exist
mkdir -p ./uploads

# Pull the latest image
echo "Pulling the latest Postiz image..."
docker pull ghcr.io/gitroomhq/postiz-app:latest

# Start the production environment
echo "Starting production environment..."
docker-compose -f docker-compose.production.yaml up -d

echo "Production environment started!"
echo "Frontend: http://localhost:4200"
echo "Backend: http://localhost:3000"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo "pgAdmin: http://localhost:8081"
echo "RedisInsight: http://localhost:5540"
echo ""
echo "To view logs: docker-compose -f docker-compose.production.yaml logs -f"
echo "To stop: docker-compose -f docker-compose.production.yaml down"
