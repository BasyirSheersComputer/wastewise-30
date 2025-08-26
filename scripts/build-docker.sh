#!/bin/bash

# Docker Build Script with Environment Variable Handling
# This script builds Docker images with proper secret management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f "config/environment/docker.env.example" ]; then
        cp config/environment/docker.env.example .env
        print_status "Created .env file from template. Please edit it with your actual values."
        exit 1
    else
        print_error "No .env template found. Please create a .env file manually."
        exit 1
    fi
fi

# Load environment variables
print_status "Loading environment variables..."
source .env

# Validate required environment variables
print_status "Validating required environment variables..."

# Frontend build variables
FRONTEND_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_API_BASE_URL"
)

# Backend runtime variables
BACKEND_VARS=(
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "JWT_SECRET"
)

# Check frontend variables
for var in "${FRONTEND_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "$var is not set. Using default value."
    fi
done

# Check backend variables
for var in "${BACKEND_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "$var is not set. Backend may not function properly."
    fi
done

# Build frontend image
print_status "Building frontend Docker image..."
docker build \
    --build-arg VITE_SUPABASE_URL="${VITE_SUPABASE_URL}" \
    --build-arg VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}" \
    --build-arg VITE_STRIPE_PUBLISHABLE_KEY="${VITE_STRIPE_PUBLISHABLE_KEY}" \
    --build-arg VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://wastewise-backend:3000}" \
    --build-arg VITE_TRIAL_PERIOD_DAYS="${VITE_TRIAL_PERIOD_DAYS:-30}" \
    -f Dockerfile.frontend \
    -t wastewise-frontend:latest \
    .

if [ $? -eq 0 ]; then
    print_status "Frontend image built successfully!"
else
    print_error "Frontend build failed!"
    exit 1
fi

# Build backend image
print_status "Building backend Docker image..."
docker build \
    -f Dockerfile.backend \
    -t wastewise-backend:latest \
    .

if [ $? -eq 0 ]; then
    print_status "Backend image built successfully!"
else
    print_error "Backend build failed!"
    exit 1
fi

print_status "All Docker images built successfully!"
print_status "You can now run: docker-compose up -d"
