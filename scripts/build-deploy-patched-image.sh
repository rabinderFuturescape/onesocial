#!/bin/bash

# Build the patched image
docker build -f Dockerfile.patch -t postiz-onesso:latest .

# Tag the image with a version
VERSION=$(date +%Y%m%d%H%M%S)
docker tag postiz-onesso:latest postiz-onesso:$VERSION

# Push the image to your registry (uncomment and modify as needed)
# docker push your-registry/postiz-onesso:latest
# docker push your-registry/postiz-onesso:$VERSION

echo "Built and tagged postiz-onesso:$VERSION"
echo "To deploy this image, update your deployment configuration to use this image tag."
