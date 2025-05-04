#!/bin/bash
set -e

# Enable BuildKit for faster, parallel builds
export DOCKER_BUILDKIT=1

# Set build arguments
IMAGE_NAME="postiz-dev"
TAG="${1:-latest}"

echo "Building $IMAGE_NAME:$TAG with maximum caching..."

# Build the cached Docker image with progress output
docker build \
  --file Dockerfile.cached \
  --tag "$IMAGE_NAME:$TAG" \
  --progress=plain \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --target development \
  .

echo "Build completed successfully!"
echo "You can run the development environment with: docker-compose -f docker-compose.dev.yaml up -d"
