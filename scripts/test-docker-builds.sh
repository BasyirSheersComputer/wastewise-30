#!/bin/bash

# Test script to verify Docker builds work correctly
set -e

echo "🧪 Testing Docker builds for Cloud Build..."

# Test backend build
echo "🔧 Testing backend Docker build..."
docker build -t wastewise-backend-test -f config/docker/Dockerfile.backend . || {
    echo "❌ Backend Docker build failed"
    exit 1
}
echo "✅ Backend Docker build successful"

# Test frontend build
echo "🔧 Testing frontend Docker build..."
docker build -t wastewise-frontend-test -f config/docker/Dockerfile.frontend . || {
    echo "❌ Frontend Docker build failed"
    exit 1
}
echo "✅ Frontend Docker build successful"

# Clean up test images
echo "🧹 Cleaning up test images..."
docker rmi wastewise-backend-test wastewise-frontend-test 2>/dev/null || true

echo "🎉 All Docker builds successful! Ready for Cloud Build deployment."

