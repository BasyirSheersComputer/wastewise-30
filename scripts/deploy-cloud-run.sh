#!/bin/bash

# Google Cloud Run Deployment Script for WasteWise
# This script deploys both frontend and backend services to Google Cloud Run

set -e

# Configuration
PROJECT_ID="wastewise-30"
REGION="us-central1"
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

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    cd backend
    docker build -t gcr.io/$PROJECT_ID/backend:latest -f ../Dockerfile.backend .
    docker push gcr.io/$PROJECT_ID/backend:latest
    cd ..
    
    # Build frontend image
    log_info "Building frontend image..."
    cd frontend
    docker build -t gcr.io/$PROJECT_ID/frontend:latest -f ../Dockerfile.frontend .
    docker push gcr.io/$PROJECT_ID/frontend:latest
    cd ..
    
    log_success "Docker images built and pushed successfully"
}

# Deploy backend service
deploy_backend() {
    log_info "Deploying backend service..."
    
    gcloud run deploy $BACKEND_SERVICE \
        --image gcr.io/$PROJECT_ID/backend:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 8080 \
        --memory 1Gi \
        --cpu 1 \
        --min-instances 1 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production,PORT=8080 \
        --set-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,OPENAI_API_KEY=openai-api-key:latest,GOOGLE_GENAI_API_KEY=google-genai-key:latest,STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,JWT_SECRET=jwt-secret:latest
    
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format="value(status.url)")
    log_success "Backend service deployed at: $BACKEND_URL"
}

# Deploy frontend service
deploy_frontend() {
    log_info "Deploying frontend service..."
    
    # Get backend URL for API configuration
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format="value(status.url)")
    
    gcloud run deploy $FRONTEND_SERVICE \
        --image gcr.io/$PROJECT_ID/frontend:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 500m \
        --min-instances 1 \
        --max-instances 5 \
        --set-env-vars VITE_API_BASE_URL=$BACKEND_URL \
        --set-secrets VITE_SUPABASE_URL=supabase-url:latest,VITE_SUPABASE_ANON_KEY=supabase-anon-key:latest,VITE_STRIPE_PUBLISHABLE_KEY=stripe-publishable-key:latest,VITE_TRIAL_PERIOD_DAYS=30
    
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format="value(status.url)")
    log_success "Frontend service deployed at: $FRONTEND_URL"
}

# Update CORS configuration
update_cors() {
    log_info "Updating CORS configuration..."
    
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format="value(status.url)")
    
    gcloud run services update $BACKEND_SERVICE \
        --region $REGION \
        --set-env-vars CORS_ORIGIN=$FRONTEND_URL
    
    log_success "CORS configuration updated"
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format="value(status.url)")
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format="value(status.url)")
    
    # Check backend health
    if curl -f -s "$BACKEND_URL/health" > /dev/null; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend health
    if curl -f -s "$FRONTEND_URL/health" > /dev/null; then
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
    echo
    echo "Service URLs:"
    echo "  Backend:  $(gcloud run services describe $BACKEND_SERVICE --region $REGION --format="value(status.url)")"
    echo "  Frontend: $(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format="value(status.url)")"
    echo
    echo "Next steps:"
    echo "  1. Test the application by visiting the frontend URL"
    echo "  2. Monitor the services in Google Cloud Console"
    echo "  3. Set up custom domain (optional)"
    echo "  4. Configure monitoring and alerting"
}

# Main deployment function
main() {
    log_info "Starting Google Cloud Run deployment for WasteWise..."
    
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
