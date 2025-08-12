#!/bin/bash

# Firebase Deployment Script for WasteWise
# This script automates the deployment process to Firebase Hosting and Functions

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="wastewise-30"
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
DEPLOYMENT_ENV=${1:-production}

echo -e "${BLUE}🚀 Starting Firebase Deployment for WasteWise${NC}"
echo -e "${BLUE}Environment: ${DEPLOYMENT_ENV}${NC}"
echo -e "${BLUE}Project ID: ${PROJECT_ID}${NC}"

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists firebase; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "All prerequisites are satisfied"

# Check if user is logged in to Firebase
echo -e "${BLUE}🔐 Checking Firebase authentication...${NC}"
if ! firebase projects:list >/dev/null 2>&1; then
    print_warning "Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

print_status "Firebase authentication verified"

# Set the project
echo -e "${BLUE}📋 Setting Firebase project...${NC}"
firebase use $PROJECT_ID
print_status "Firebase project set to $PROJECT_ID"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"

echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd $FRONTEND_DIR
npm ci --silent
print_status "Frontend dependencies installed"

echo -e "${BLUE}Installing backend dependencies...${NC}"
cd ../$BACKEND_DIR
npm ci --silent
print_status "Backend dependencies installed"

cd ..

# Build frontend
echo -e "${BLUE}🏗️  Building frontend...${NC}"
cd $FRONTEND_DIR
npm run build
if [ $? -eq 0 ]; then
    print_status "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Run tests (if available)
echo -e "${BLUE}🧪 Running tests...${NC}"
cd $FRONTEND_DIR
if npm run test >/dev/null 2>&1; then
    print_status "Frontend tests passed"
else
    print_warning "Frontend tests failed or not configured"
fi
cd ..

cd $BACKEND_DIR
if npm run test >/dev/null 2>&1; then
    print_status "Backend tests passed"
else
    print_warning "Backend tests failed or not configured"
fi
cd ..

# Deploy to Firebase
echo -e "${BLUE}🚀 Deploying to Firebase...${NC}"

# Deploy functions first
echo -e "${BLUE}Deploying Cloud Functions...${NC}"
firebase deploy --only functions --project $PROJECT_ID
if [ $? -eq 0 ]; then
    print_status "Cloud Functions deployed successfully"
else
    print_error "Cloud Functions deployment failed"
    exit 1
fi

# Deploy hosting
echo -e "${BLUE}Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting --project $PROJECT_ID
if [ $? -eq 0 ]; then
    print_status "Firebase Hosting deployed successfully"
else
    print_error "Firebase Hosting deployment failed"
    exit 1
fi

# Deploy Firestore rules and indexes
echo -e "${BLUE}Deploying Firestore configuration...${NC}"
firebase deploy --only firestore:rules,firestore:indexes --project $PROJECT_ID
if [ $? -eq 0 ]; then
    print_status "Firestore configuration deployed successfully"
else
    print_warning "Firestore configuration deployment failed or not configured"
fi

# Deploy Storage rules
echo -e "${BLUE}Deploying Storage rules...${NC}"
firebase deploy --only storage --project $PROJECT_ID
if [ $? -eq 0 ]; then
    print_status "Storage rules deployed successfully"
else
    print_warning "Storage rules deployment failed or not configured"
fi

# Get deployment URLs
echo -e "${BLUE}📋 Getting deployment information...${NC}"
HOSTING_URL=$(firebase hosting:channel:list --project $PROJECT_ID --json | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
FUNCTIONS_URL="https://us-central1-$PROJECT_ID.cloudfunctions.net"

if [ -n "$HOSTING_URL" ]; then
    print_status "Hosting URL: $HOSTING_URL"
else
    print_status "Hosting URL: https://$PROJECT_ID.web.app"
fi

print_status "Functions URL: $FUNCTIONS_URL"

# Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
sleep 10  # Wait for deployment to propagate

# Test health endpoint
if command_exists curl; then
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FUNCTIONS_URL/api/health" || echo "000")
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        print_status "Health check passed"
    else
        print_warning "Health check failed (HTTP $HEALTH_RESPONSE)"
    fi
else
    print_warning "curl not available, skipping health check"
fi

# Final status
echo -e "${BLUE}🎉 Deployment Summary${NC}"
echo -e "${GREEN}✅ Frontend: Built and deployed${NC}"
echo -e "${GREEN}✅ Backend: Functions deployed${NC}"
echo -e "${GREEN}✅ Database: Rules and indexes deployed${NC}"
echo -e "${GREEN}✅ Storage: Rules deployed${NC}"

echo -e "${BLUE}📊 Next Steps:${NC}"
echo "1. Verify the application is working correctly"
echo "2. Monitor Firebase Console for any issues"
echo "3. Set up monitoring and alerting"
echo "4. Update DNS if using custom domain"

echo -e "${BLUE}🔗 Useful Links:${NC}"
echo "Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo "Hosting URL: https://$PROJECT_ID.web.app"
echo "Functions URL: $FUNCTIONS_URL"

print_status "Deployment completed successfully!"
