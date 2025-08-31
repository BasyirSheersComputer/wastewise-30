#!/bin/bash

# Setup Individual Google Secret Manager secrets for WasteWise-30
# This script creates separate secrets for each environment variable

set -e

PROJECT_ID="wastewise-402ba"
REGION="asia-southeast1"

echo "🔧 Setting up Individual Google Secret Manager secrets for project: $PROJECT_ID"
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: You are not authenticated with gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Check if project exists
if ! gcloud projects describe $PROJECT_ID > /dev/null 2>&1; then
    echo "❌ Error: Project $PROJECT_ID does not exist or you don't have access"
    exit 1
fi

echo "✅ Project $PROJECT_ID is accessible"
echo ""

# Function to create secret if it doesn't exist
create_secret_if_not_exists() {
    local secret_name=$1
    local description=$2
    
    if gcloud secrets describe $secret_name --project=$PROJECT_ID > /dev/null 2>&1; then
        echo "✅ Secret '$secret_name' already exists"
    else
        echo "📝 Creating secret '$secret_name'..."
        gcloud secrets create $secret_name \
            --project=$PROJECT_ID \
            --replication-policy="automatic" \
            --data-file=/dev/null \
            --labels="app=wastewise,environment=production" \
            --description="$description"
        echo "✅ Secret '$secret_name' created successfully"
    fi
}

# Function to add secret version with prompt
add_secret_version() {
    local secret_name=$1
    local prompt_message=$2
    local is_required=$3
    
    echo ""
    if [ "$is_required" = "true" ]; then
        echo "🔑 REQUIRED: $prompt_message"
        echo "   Secret name: $secret_name"
        read -p "   Enter the value: " secret_value
        
        if [ -z "$secret_value" ]; then
            echo "❌ Error: Value cannot be empty for required secret"
            exit 1
        fi
        
        echo "$secret_value" | gcloud secrets versions add $secret_name --project=$PROJECT_ID --data-file=-
        echo "✅ Secret version added for '$secret_name'"
    else
        echo "🔑 OPTIONAL: $prompt_message"
        echo "   Secret name: $secret_name"
        read -p "   Enter the value (or press Enter to skip): " secret_value
        
        if [ ! -z "$secret_value" ]; then
            echo "$secret_value" | gcloud secrets versions add $secret_name --project=$PROJECT_ID --data-file=-
            echo "✅ Secret version added for '$secret_name'"
        else
            echo "⏭️  Skipped '$secret_name'"
        fi
    fi
}

echo "🚀 Creating secrets in Secret Manager..."
echo ""

# Backend Secrets
echo "📋 Backend Secrets:"
echo "=================="

create_secret_if_not_exists "supabase-url" "Supabase project URL for backend"
create_secret_if_not_exists "supabase-anon-key" "Supabase anonymous key for backend"
create_secret_if_not_exists "supabase-service-key" "Supabase service role key for backend"
create_secret_if_not_exists "openai-api-key" "OpenAI API key for AI features"
create_secret_if_not_exists "gemini-api-key" "Google Gemini API key for AI features"
create_secret_if_not_exists "stripe-secret-key" "Stripe secret key for payments"
create_secret_if_not_exists "stripe-webhook-secret" "Stripe webhook secret for payment events"
create_secret_if_not_exists "jwt-secret" "JWT secret for authentication"

# Frontend Secrets
echo ""
echo "📋 Frontend Secrets:"
echo "==================="

create_secret_if_not_exists "stripe-publishable-key" "Stripe publishable key for frontend"

echo ""
echo "🔑 Adding secret values..."
echo "========================="

# Required Backend Secrets
add_secret_version "supabase-url" "Supabase project URL (e.g., https://your-project.supabase.co)" "true"
add_secret_version "supabase-anon-key" "Supabase anonymous key (public key)" "true"
add_secret_version "supabase-service-key" "Supabase service role key (private key)" "true"
add_secret_version "gemini-api-key" "Google Gemini API key (required for AI features)" "true"
add_secret_version "jwt-secret" "JWT secret for authentication (any secure random string)" "true"

# Optional Backend Secrets
add_secret_version "openai-api-key" "OpenAI API key (optional, for additional AI features)" "false"
add_secret_version "stripe-secret-key" "Stripe secret key (optional, for payment processing)" "false"
add_secret_version "stripe-webhook-secret" "Stripe webhook secret (optional, for payment events)" "false"

# Required Frontend Secrets
add_secret_version "stripe-publishable-key" "Stripe publishable key (required for frontend payments)" "true"

echo ""
echo "🎉 Secret setup completed!"
echo ""
echo "📋 Summary of created secrets:"
echo "=============================="
echo "Backend Secrets:"
echo "  - supabase-url"
echo "  - supabase-anon-key"
echo "  - supabase-service-key"
echo "  - gemini-api-key"
echo "  - jwt-secret"
echo "  - openai-api-key (optional)"
echo "  - stripe-secret-key (optional)"
echo "  - stripe-webhook-secret (optional)"
echo ""
echo "Frontend Secrets:"
echo "  - stripe-publishable-key"
echo ""
echo "📋 To list all secrets:"
echo "   gcloud secrets list --project=$PROJECT_ID"
echo ""
echo "📋 To view a specific secret:"
echo "   gcloud secrets versions access latest --secret=SECRET_NAME --project=$PROJECT_ID"
echo ""
echo "🚀 Next steps:"
echo "   1. Deploy your application using Cloud Build"
echo "   2. The secrets will be automatically injected into your containers"
echo "   3. Monitor the deployment logs for any issues"
