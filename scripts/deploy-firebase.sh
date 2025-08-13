#!/bin/bash

# 🚀 Firebase Deployment Script for WasteWise
# This script handles the complete deployment process for Firebase hosting and functions

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wastewise-30"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
BUILD_DIR="dist"

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

# Check if Firebase CLI is installed
check_firebase_cli() {
    log "Checking Firebase CLI installation..."
    if ! command -v firebase &> /dev/null; then
        error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    success "Firebase CLI is installed"
}

# Check if user is logged in to Firebase
check_firebase_auth() {
    log "Checking Firebase authentication..."
    if ! firebase projects:list &> /dev/null; then
        error "Not authenticated with Firebase. Please login first:"
        echo "firebase login"
        exit 1
    fi
    success "Firebase authentication verified"
}

# Check if project exists and user has access
check_project_access() {
    log "Checking project access..."
    if ! firebase use $PROJECT_NAME &> /dev/null; then
        error "Cannot access project '$PROJECT_NAME'. Please check your permissions."
        exit 1
    fi
    success "Project access verified"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Frontend dependencies
    log "Installing frontend dependencies..."
    cd $FRONTEND_DIR
    npm ci --silent
    success "Frontend dependencies installed"
    
    # Backend dependencies
    log "Installing backend dependencies..."
    cd ../$BACKEND_DIR
    npm ci --silent
    success "Backend dependencies installed"
    
    cd ..
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Frontend tests
    log "Running frontend tests..."
    cd $FRONTEND_DIR
    if npm test --silent; then
        success "Frontend tests passed"
    else
        warning "Frontend tests failed, but continuing deployment..."
    fi
    
    # Backend tests
    log "Running backend tests..."
    cd ../$BACKEND_DIR
    if npm test --silent; then
        success "Backend tests passed"
    else
        warning "Backend tests failed, but continuing deployment..."
    fi
    
    cd ..
}

# Build frontend
build_frontend() {
    log "Building frontend..."
    cd $FRONTEND_DIR
    
    # Clean previous build
    rm -rf $BUILD_DIR
    
    # Build for production
    if npm run build; then
        success "Frontend built successfully"
        
        # Check if build files exist
        if [ ! -d "$BUILD_DIR" ]; then
            error "Build directory not found. Build may have failed."
            exit 1
        fi
        
        # Check build size
        BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
        log "Build size: $BUILD_SIZE"
        
    else
        error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Validate environment configuration
validate_environment() {
    log "Validating environment configuration..."
    
    # Check if .env files exist
    if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
        warning "Production environment file not found: $FRONTEND_DIR/.env.production"
        warning "Using development environment variables"
    fi
    
    # Check Firebase configuration
    if ! firebase functions:config:get &> /dev/null; then
        warning "Firebase Functions configuration not found"
        warning "Please set up your environment variables:"
        echo "firebase functions:config:set supabase.url=\"your-supabase-url\""
        echo "firebase functions:config:set supabase.anon_key=\"your-anon-key\""
        echo "firebase functions:config:set auth.jwt_secret=\"your-jwt-secret\""
    else
        success "Firebase configuration found"
    fi
}

# Deploy backend functions
deploy_functions() {
    log "Deploying backend functions..."
    
    if firebase deploy --only functions --non-interactive; then
        success "Backend functions deployed successfully"
        
        # Get function URL
        FUNCTION_URL=$(firebase functions:config:get | grep -o 'https://[^"]*')
        if [ ! -z "$FUNCTION_URL" ]; then
            log "Function URL: $FUNCTION_URL"
        fi
        
    else
        error "Backend functions deployment failed"
        exit 1
    fi
}

# Deploy frontend hosting
deploy_hosting() {
    log "Deploying frontend hosting..."
    
    if firebase deploy --only hosting --non-interactive; then
        success "Frontend hosting deployed successfully"
        
        # Get hosting URL
        HOSTING_URL=$(firebase hosting:channel:list | grep -o 'https://[^"]*' | head -1)
        if [ ! -z "$HOSTING_URL" ]; then
            log "Hosting URL: $HOSTING_URL"
        fi
        
    else
        error "Frontend hosting deployment failed"
        exit 1
    fi
}

# Deploy Firestore rules and indexes
deploy_firestore() {
    log "Deploying Firestore rules and indexes..."
    
    if firebase deploy --only firestore --non-interactive; then
        success "Firestore rules and indexes deployed successfully"
    else
        warning "Firestore deployment failed, but continuing..."
    fi
}

# Deploy Storage rules
deploy_storage() {
    log "Deploying Storage rules..."
    
    if firebase deploy --only storage --non-interactive; then
        success "Storage rules deployed successfully"
    else
        warning "Storage deployment failed, but continuing..."
    fi
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    # Wait for deployment to propagate
    sleep 10
    
    # Check function health
    FUNCTION_URL="https://us-central1-$PROJECT_NAME.cloudfunctions.net/api"
    if curl -f -s "$FUNCTION_URL/health" > /dev/null; then
        success "Backend health check passed"
    else
        warning "Backend health check failed"
    fi
    
    # Check hosting
    HOSTING_URL="https://$PROJECT_NAME.web.app"
    if curl -f -s "$HOSTING_URL" > /dev/null; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed"
    fi
}

# Show deployment summary
show_summary() {
    echo ""
    echo "🎉 Deployment Summary"
    echo "===================="
    echo "Project: $PROJECT_NAME"
    echo "Frontend URL: https://$PROJECT_NAME.web.app"
    echo "Backend URL: https://us-central1-$PROJECT_NAME.cloudfunctions.net/api"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test the application at: https://$PROJECT_NAME.web.app"
    echo "2. Check Firebase Console for monitoring"
    echo "3. Set up custom domain if needed"
    echo "4. Configure analytics and monitoring"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 Starting Firebase deployment for WasteWise"
    echo "=============================================="
    
    # Pre-deployment checks
    check_firebase_cli
    check_firebase_auth
    check_project_access
    
    # Setup
    install_dependencies
    validate_environment
    
    # Testing (optional)
    if [ "$1" != "--skip-tests" ]; then
        run_tests
    else
        warning "Skipping tests as requested"
    fi
    
    # Build
    build_frontend
    
    # Deploy
    deploy_functions
    deploy_hosting
    deploy_firestore
    deploy_storage
    
    # Post-deployment
    health_check
    show_summary
    
    success "Deployment completed successfully! 🎉"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --skip-tests    Skip running tests before deployment"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0              Deploy with tests"
        echo "  $0 --skip-tests Deploy without tests"
        exit 0
        ;;
    --skip-tests)
        main --skip-tests
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
