#!/bin/bash
set -e

# Enable BuildKit for faster, parallel builds
export DOCKER_BUILDKIT=1

# Set build arguments
IMAGE_NAME="postiz"
TAG="${1:-latest}"

echo "Building $IMAGE_NAME:$TAG..."

# Build the optimized Docker image with progress output
docker build \
  --file Dockerfile.optimized \
  --tag "$IMAGE_NAME:$TAG" \
  --progress=plain \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  .

echo "Build completed successfully!"
echo "You can run the image with: docker run -p 4200:4200 -p 3000:3000 $IMAGE_NAME:$TAG"
