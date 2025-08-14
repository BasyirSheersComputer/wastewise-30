#!/bin/bash

# Google Cloud Secret Manager Setup Script for WasteWise
# This script creates all required secrets in Google Cloud Secret Manager

set -e

# Configuration
PROJECT_ID="wastewise-30"

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

# Check if secret exists
secret_exists() {
    local secret_name=$1
    gcloud secrets describe "$secret_name" --project="$PROJECT_ID" >/dev/null 2>&1
}

# Create secret if it doesn't exist
create_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    if secret_exists "$secret_name"; then
        log_warning "Secret '$secret_name' already exists, updating value..."
        echo "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=-
    else
        log_info "Creating secret '$secret_name'..."
        echo "$secret_value" | gcloud secrets create "$secret_name" --data-file=- --replication-policy="automatic"
    fi
    
    # Add description if provided
    if [ -n "$description" ]; then
        gcloud secrets update "$secret_name" --description="$description" >/dev/null 2>&1 || true
    fi
    
    log_success "Secret '$secret_name' is ready"
}

# Main setup function
main() {
    log_info "Setting up Google Cloud Secret Manager for WasteWise..."
    
    # Check if gcloud is authenticated
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
    
    # Enable Secret Manager API
    log_info "Enabling Secret Manager API..."
    gcloud services enable secretmanager.googleapis.com
    
    log_info "Creating secrets..."
    
    # Supabase secrets
    create_secret "supabase-url" "YOUR_SUPABASE_URL" "Supabase project URL"
    create_secret "supabase-anon-key" "YOUR_SUPABASE_ANON_KEY" "Supabase anonymous key for frontend"
    create_secret "supabase-service-key" "YOUR_SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key for backend"
    
    # AI API keys
    create_secret "openai-api-key" "YOUR_OPENAI_API_KEY" "OpenAI API key for ChatGPT integration"
    create_secret "google-genai-key" "YOUR_GOOGLE_GENAI_API_KEY" "Google Gemini API key for AI recommendations"
    
    # Stripe secrets
    create_secret "stripe-secret-key" "YOUR_STRIPE_SECRET_KEY" "Stripe secret key for payment processing"
    create_secret "stripe-publishable-key" "YOUR_STRIPE_PUBLISHABLE_KEY" "Stripe publishable key for frontend"
    create_secret "stripe-webhook-secret" "YOUR_STRIPE_WEBHOOK_SECRET" "Stripe webhook secret for payment events"
    
    # JWT secret
    create_secret "jwt-secret" "YOUR_JWT_SECRET_KEY" "JWT secret for token signing"
    
    log_success "All secrets have been created successfully!"
    echo
    echo "Next steps:"
    echo "  1. Update the secret values with your actual credentials:"
    echo "     gcloud secrets versions add supabase-url --data-file=- <<< 'your_actual_supabase_url'"
    echo "  2. Repeat for all other secrets with your actual values"
    echo "  3. Run the deployment script to deploy your application"
    echo
    echo "Secret names created:"
    echo "  - supabase-url"
    echo "  - supabase-anon-key"
    echo "  - supabase-service-key"
    echo "  - openai-api-key"
    echo "  - google-genai-key"
    echo "  - stripe-secret-key"
    echo "  - stripe-publishable-key"
    echo "  - stripe-webhook-secret"
    echo "  - jwt-secret"
}

# Run main function
main "$@"
