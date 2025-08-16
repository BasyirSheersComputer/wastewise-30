#!/bin/bash

# Test build script for WasteWise after housekeeping reorganization
# This script tests the Docker builds locally to ensure they work with the new file structure

set -e

echo "🧪 Testing WasteWise Docker builds after housekeeping reorganization..."
echo "================================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Test frontend build
echo ""
echo "🔨 Testing Frontend Build..."
echo "---------------------------"

if docker build -t wastewise-frontend-test -f config/docker/Dockerfile.frontend .; then
    print_status "Frontend build successful"
else
    print_error "Frontend build failed"
    exit 1
fi

# Test backend build
echo ""
echo "🔨 Testing Backend Build..."
echo "-------------------------"

if docker build -t wastewise-backend-test -f config/docker/Dockerfile.backend .; then
    print_status "Backend build successful"
else
    print_error "Backend build failed"
    exit 1
fi

# Clean up test images
echo ""
echo "🧹 Cleaning up test images..."
docker rmi wastewise-frontend-test wastewise-backend-test 2>/dev/null || true

print_status "All builds successful! 🎉"
echo ""
echo "📋 Summary:"
echo "  ✅ Frontend Dockerfile path: config/docker/Dockerfile.frontend"
echo "  ✅ Backend Dockerfile path: config/docker/Dockerfile.backend"
echo "  ✅ Nginx config path: config/nginx/nginx-frontend.conf"
echo "  ✅ Cloud Build config updated: config/jenkins/cloudbuild.yaml"
echo ""
echo "🚀 Ready for Cloud Build deployment!"
