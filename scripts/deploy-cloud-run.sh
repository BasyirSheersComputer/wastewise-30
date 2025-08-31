#!/bin/bash

# Google Cloud Run Deployment Script for WasteWise
# This script deploys both frontend and backend services to Google Cloud Run
# Aligned with simplified cloudbuild.yaml approach

set -e

# Configuration (aligned with cloudbuild.yaml)
PROJECT_ID="wastewise-30"
REGION="asia-southeast1"
BACKEND_SERVICE="wastewise-backend"
FRONTEND_SERVICE="wastewise-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Not authenticated with gcloud. Please run 'gcloud auth login' first."
        exit 1
    fi
    
    # Check if project is set
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
        log_warning "Current project is $CURRENT_PROJECT, setting to $PROJECT_ID"
        gcloud config set project $PROJECT_ID
    fi
    
    log_success "Prerequisites check passed"
}

# Enable required APIs
enable_apis() {
    log_info "Enabling required APIs..."
    
    APIs=(
        "run.googleapis.com"
        "containerregistry.googleapis.com"
        "cloudbuild.googleapis.com"
        "secretmanager.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
    )
    
    for api in "${APIs[@]}"; do
        if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
            log_info "Enabling $api..."
            gcloud services enable $api
        else
            log_info "$api is already enabled"
        fi
    done
    
    log_success "All required APIs are enabled"
}

# Build and push Docker images (aligned with cloudbuild.yaml)
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -t gcr.io/$PROJECT_ID/wastewise-backend:latest -f Dockerfile.backend .
    docker push gcr.io/$PROJECT_ID/wastewise-backend:latest
    
    # Build frontend image with build args (aligned with cloudbuild.yaml)
    log_info "Building frontend image..."
    docker build -t gcr.io/$PROJECT_ID/wastewise-frontend:latest \
        --build-arg VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
        --build-arg VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
        --build-arg VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY} \
        --build-arg VITE_API_BASE_URL=https://wastewise-backend-$PROJECT_ID-as.a.run.app \
        --build-arg VITE_TRIAL_PERIOD_DAYS=30 \
        -f Dockerfile.frontend .
    docker push gcr.io/$PROJECT_ID/wastewise-frontend:latest
    
    log_success "Docker images built and pushed successfully"
}

# Deploy backend service (aligned with cloudbuild.yaml)
deploy_backend() {
    log_info "Deploying backend service..."
    
    gcloud run deploy $BACKEND_SERVICE \
        --image gcr.io/$PROJECT_ID/wastewise-backend:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 3000 \
        --memory 512Mi \
        --cpu 1 \
        --set-env-vars NODE_ENV=production \
        --set-secrets BACKEND_SECRET=wastewise-30-secret-backend:latest
    
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format="value(status.url)")
    log_success "Backend service deployed at: $BACKEND_URL"
}

# Deploy frontend service (aligned with cloudbuild.yaml)
deploy_frontend() {
    log_info "Deploying frontend service..."
    
    gcloud run deploy $FRONTEND_SERVICE \
        --image gcr.io/$PROJECT_ID/wastewise-frontend:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 8080 \
        --memory 256Mi \
        --cpu 1 \
        --set-env-vars VITE_API_BASE_URL=https://wastewise-backend-$PROJECT_ID-as.a.run.app
    
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format="value(status.url)")
    log_success "Frontend service deployed at: $FRONTEND_URL"
}

# Update CORS configuration (aligned with cloudbuild.yaml)
update_cors() {
    log_info "Updating CORS configuration..."
    
    gcloud run services update $BACKEND_SERVICE \
        --region $REGION \
        --update-env-vars CORS_ORIGIN=https://wastewise-frontend-$PROJECT_ID-as.a.run.app
    
    log_success "CORS configuration updated"
}

# Run health checks (aligned with cloudbuild.yaml smoke tests)
health_check() {
    log_info "Running health checks..."
    
    BACKEND_URL="https://wastewise-backend-$PROJECT_ID-as.a.run.app"
    FRONTEND_URL="https://wastewise-frontend-$PROJECT_ID-as.a.run.app"
    
    # Check backend health (aligned with cloudbuild.yaml)
    if curl -f -s --retry 3 --retry-delay 10 "$BACKEND_URL/health" > /dev/null; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend health (aligned with cloudbuild.yaml)
    if curl -f -s --retry 3 --retry-delay 10 "$FRONTEND_URL/" > /dev/null; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    log_success "All health checks passed"
}

# Display deployment information
display_info() {
    log_info "Deployment completed successfully!"
    echo ""
    echo "Service URLs:"
    echo "  Backend:  https://wastewise-backend-$PROJECT_ID-as.a.run.app"
    echo "  Frontend: https://wastewise-frontend-$PROJECT_ID-as.a.run.app"
    echo ""
    echo "Health Checks:"
    echo "  Backend:  https://wastewise-backend-$PROJECT_ID-as.a.run.app/health"
    echo "  Frontend: https://wastewise-frontend-$PROJECT_ID-as.a.run.app/"
    echo ""
    echo "Note: This deployment is aligned with the simplified cloudbuild.yaml approach"
}

# Main execution
main() {
    log_info "Starting WasteWise Cloud Run deployment..."
    
    check_prerequisites
    enable_apis
    build_and_push_images
    deploy_backend
    deploy_frontend
    update_cors
    health_check
    display_info
    
    log_success "Deployment completed successfully!"
}

# Run main function
main "$@"
