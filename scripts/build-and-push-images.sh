#!/bin/bash

# Build and Push Docker Images Script for WasteWise-30
# This script builds both frontend and backend images and pushes them to DockerHub

set -e  # Exit on any error

# Configuration
IMAGE_NAME="basyir/wastewise-30"
TAG=$(date +%Y%m%d-%H%M%S)  # Timestamp-based tag
LATEST_TAG="latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    log "Checking Docker status..."
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    success "Docker is running"
}

# Check if we're logged into DockerHub
check_dockerhub_login() {
    log "Checking DockerHub login status..."
    if ! docker system info | grep -q "Username"; then
        warning "Not logged into DockerHub. Attempting to login..."
        docker login
    else
        success "Already logged into DockerHub"
    fi
}

# Build Docker image
build_image() {
    local service=$1
    local dockerfile=$2
    local image_tag="${IMAGE_NAME}-${service}:${TAG}"
    local latest_tag="${IMAGE_NAME}-${service}:${LATEST_TAG}"
    
    log "Building ${service} image..."
    log "Dockerfile: ${dockerfile}"
    log "Image: ${image_tag}"
    
    # Build the image
    if docker build -f "${dockerfile}" -t "${image_tag}" -t "${latest_tag}" .; then
        success "Successfully built ${service} image"
        echo "${image_tag}"
    else
        error "Failed to build ${service} image"
        exit 1
    fi
}

# Push Docker image
push_image() {
    local service=$1
    local image_tag="${IMAGE_NAME}-${service}:${TAG}"
    local latest_tag="${IMAGE_NAME}-${service}:${LATEST_TAG}"
    
    log "Pushing ${service} image to DockerHub..."
    
    # Push tagged version
    if docker push "${image_tag}"; then
        success "Successfully pushed ${service} image (tagged)"
    else
        error "Failed to push ${service} image (tagged)"
        exit 1
    fi
    
    # Push latest version
    if docker push "${latest_tag}"; then
        success "Successfully pushed ${service} image (latest)"
    else
        error "Failed to push ${service} image (latest)"
        exit 1
    fi
}

# Clean up old images (optional)
cleanup_old_images() {
    log "Cleaning up old images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Optionally remove old tagged images (keep last 5)
    warning "Keeping last 5 images, removing older ones..."
    docker images "${IMAGE_NAME}-frontend" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +6 | awk '{print $1}' | xargs -r docker rmi || true
    docker images "${IMAGE_NAME}-backend" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +6 | awk '{print $1}' | xargs -r docker rmi || true
    
    success "Cleanup completed"
}

# Main execution
main() {
    echo "🚀 WasteWise-30 Docker Build and Push Script"
    echo "============================================="
    echo "Image Name: ${IMAGE_NAME}"
    echo "Tag: ${TAG}"
    echo "Latest Tag: ${LATEST_TAG}"
    echo ""
    
    # Pre-flight checks
    check_docker
    check_dockerhub_login
    
    # Build images
    log "Starting image builds..."
    frontend_image=$(build_image "frontend" "Dockerfile.frontend")
    backend_image=$(build_image "backend" "Dockerfile.backend")
    
    # Push images
    log "Starting image pushes..."
    push_image "frontend"
    push_image "backend"
    
    # Cleanup
    cleanup_old_images
    
    # Summary
    echo ""
    echo "🎉 Build and Push Summary"
    echo "========================"
    success "All images built and pushed successfully!"
    echo "Frontend: ${frontend_image}"
    echo "Backend: ${backend_image}"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update your docker-compose.yml to use the new images"
    echo "2. Deploy using: docker-compose pull && docker-compose up -d"
    echo "3. Verify deployment with: docker-compose ps"
    echo ""
    echo "🔗 DockerHub Images:"
    echo "Frontend: https://hub.docker.com/r/${IMAGE_NAME}-frontend"
    echo "Backend: https://hub.docker.com/r/${IMAGE_NAME}-backend"
}

# Run main function
main "$@"
