#!/bin/bash
set -e

echo "Starting Postiz development environment with caching..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if the image exists
if ! docker image inspect postiz-dev:latest > /dev/null 2>&1; then
  echo "Building Docker image for the first time..."
  ./fast-build.sh
else
  echo "Using existing Docker image. To rebuild, run ./fast-build.sh"
fi

# Start the development environment
echo "Starting development environment..."
docker-compose -f docker-compose.cached.yaml up -d

echo "Development environment started!"
echo "Frontend: http://localhost:4200"
echo "Backend: http://localhost:3000"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo "pgAdmin: http://localhost:8081"
echo "RedisInsight: http://localhost:5540"
echo ""
echo "To view logs: docker-compose -f docker-compose.cached.yaml logs -f"
echo "To stop: docker-compose -f docker-compose.cached.yaml down"
