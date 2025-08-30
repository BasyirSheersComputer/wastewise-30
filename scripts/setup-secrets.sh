#!/bin/bash

# Setup Google Secret Manager secrets for WasteWise-30
# This script helps you create the necessary secrets for Cloud Build

set -e

PROJECT_ID="wastewise-402ba"
REGION="asia-southeast1"

echo "🔧 Setting up Google Secret Manager secrets for project: $PROJECT_ID"
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

# Function to create secret
create_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3
    
    echo "🔐 Creating secret: $secret_name"
    
    # Check if secret already exists
    if gcloud secrets describe $secret_name --project=$PROJECT_ID > /dev/null 2>&1; then
        echo "⚠️  Secret $secret_name already exists. Updating..."
        echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=- --project=$PROJECT_ID
    else
        echo "📝 Creating new secret..."
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=- --project=$PROJECT_ID
    fi
    
    echo "✅ Secret $secret_name created/updated successfully"
    echo ""
}

# Get Supabase credentials
echo "📋 Please provide your Supabase credentials:"
echo ""

read -p "Enter your Supabase Project URL (e.g., https://your-project.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Enter your Stripe Publishable Key (or press Enter to skip): " STRIPE_PUBLISHABLE_KEY

# Validate inputs
if [[ -z "$SUPABASE_URL" ]]; then
    echo "❌ Error: Supabase URL is required"
    exit 1
fi

if [[ -z "$SUPABASE_ANON_KEY" ]]; then
    echo "❌ Error: Supabase Anon Key is required"
    exit 1
fi

# Create secrets
create_secret "supabase-url" "$SUPABASE_URL" "Supabase project URL"
create_secret "supabase-anon-key" "$SUPABASE_ANON_KEY" "Supabase anonymous key"

if [[ -n "$STRIPE_PUBLISHABLE_KEY" ]]; then
    create_secret "stripe-publishable-key" "$STRIPE_PUBLISHABLE_KEY" "Stripe publishable key"
else
    echo "⚠️  Skipping Stripe key (optional)"
fi

echo "🎉 All secrets have been created successfully!"
echo ""
echo "📋 Summary of created secrets:"
echo "  - supabase-url"
echo "  - supabase-anon-key"
if [[ -n "$STRIPE_PUBLISHABLE_KEY" ]]; then
    echo "  - stripe-publishable-key"
fi
echo ""
echo "🚀 You can now run your Cloud Build deployment!"
echo "   The build will automatically use these secrets."
echo ""
echo "💡 To test the deployment, run:"
echo "   gcloud builds submit --config=cloudbuild.yaml ."
