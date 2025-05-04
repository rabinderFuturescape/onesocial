#!/bin/bash

# Build the local Onesso image
echo "Building local Onesso image..."
docker build -f Dockerfile.local -t postiz-app:onesso-local .

# Tag with a version based on the current date and time
VERSION=$(date +%Y%m%d%H%M%S)
echo "Tagging image with version: $VERSION"
docker tag postiz-app:onesso-local postiz-app:onesso-$VERSION

echo "Image built and tagged successfully!"
echo "You can now run the image with:"
echo "docker run -p 3000:3000 -p 3001:3001 postiz-app:onesso-local"
echo "or with the versioned tag:"
echo "docker run -p 3000:3000 -p 3001:3001 postiz-app:onesso-$VERSION"
