#!/bin/bash

# Google Cloud Build Setup Script for WasteWise-30
# This script sets up automatic deployment triggers and secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if gcloud is installed
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first:"
        echo "https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    print_status "gcloud CLI found"
}

# Check if user is authenticated
check_auth() {
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_warning "You are not authenticated with gcloud. Please run:"
        echo "gcloud auth login"
        exit 1
    fi
    print_status "Authenticated as: $(gcloud auth list --filter=status:ACTIVE --format="value(account)")"
}

# Set project
set_project() {
    if [ -z "$PROJECT_ID" ]; then
        print_error "PROJECT_ID environment variable is not set"
        echo "Please set it: export PROJECT_ID=your-project-id"
        exit 1
    fi
    
    print_status "Setting project to: $PROJECT_ID"
    gcloud config set project $PROJECT_ID
}

# Enable required APIs
enable_apis() {
    print_header "Enabling required Google Cloud APIs..."
    
    APIs=(
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "containerregistry.googleapis.com"
        "secretmanager.googleapis.com"
        "cloudresourcemanager.googleapis.com"
    )
    
    for api in "${APIs[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable $api --quiet
    done
}

# Create secrets in Secret Manager
create_secrets() {
    print_header "Setting up secrets in Secret Manager..."
    
    # List of required secrets
    declare -A secrets=(
        ["supabase-url"]="Your Supabase project URL"
        ["supabase-anon-key"]="Your Supabase anonymous key"
        ["supabase-service-key"]="Your Supabase service role key"
        ["jwt-secret"]="Your JWT secret (at least 32 characters)"
        ["gemini-api-key"]="Your Google Gemini API key"
        ["openai-api-key"]="Your OpenAI API key"
        ["stripe-publishable-key"]="Your Stripe publishable key"
        ["stripe-secret-key"]="Your Stripe secret key"
        ["smtp-host"]="Your SMTP host"
        ["smtp-port"]="Your SMTP port"
        ["smtp-user"]="Your SMTP username"
        ["smtp-pass"]="Your SMTP password"
        ["api-base-url"]="https://wastewise-backend-${PROJECT_ID}-as.a.run.app"
        ["trial-period-days"]="30"
    )
    
    for secret_name in "${!secrets[@]}"; do
        if ! gcloud secrets describe $secret_name --quiet 2>/dev/null; then
            print_status "Creating secret: $secret_name"
            echo "${secrets[$secret_name]}" | gcloud secrets create $secret_name --data-file=-
        else
            print_status "Secret already exists: $secret_name"
        fi
    done
}

# Grant Cloud Build service account permissions
setup_permissions() {
    print_header "Setting up Cloud Build permissions..."
    
    # Get the Cloud Build service account
    PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
    CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
    
    print_status "Cloud Build service account: $CLOUDBUILD_SA"
    
    # Grant necessary roles
    ROLES=(
        "roles/run.admin"
        "roles/secretmanager.secretAccessor"
        "roles/storage.admin"
        "roles/iam.serviceAccountUser"
    )
    
    for role in "${ROLES[@]}"; do
        print_status "Granting $role to Cloud Build service account..."
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$CLOUDBUILD_SA" \
            --role="$role" \
            --quiet
    done
}

# Connect GitHub repository
connect_github() {
    print_header "Connecting GitHub repository..."
    
    # Check if repository is already connected
    if ! gcloud source repos list --filter="name:github_basyirsheerscomputer_wastewise-30" --format="value(name)" | grep -q .; then
        print_status "Connecting GitHub repository..."
        gcloud source repos create github_basyirsheerscomputer_wastewise-30
    else
        print_status "GitHub repository already connected"
    fi
}

# Create Cloud Build trigger
create_trigger() {
    print_header "Creating Cloud Build trigger..."
    
    # Check if trigger already exists
    if ! gcloud builds triggers list --filter="name:wastewise-auto-deploy" --format="value(name)" | grep -q .; then
        print_status "Creating auto-deploy trigger..."
        gcloud builds triggers create github \
            --name="wastewise-auto-deploy" \
            --repo-name="github_basyirsheerscomputer_wastewise-30" \
            --repo-owner="basyirsheerscomputer" \
            --branch-pattern="^main$" \
            --build-config="cloudbuild.yaml" \
            --include-files="**/*.js,**/*.ts,**/*.tsx,**/*.json,**/*.yaml,**/*.yml,Dockerfile.*,package.json,package-lock.json" \
            --ignore-files="**/*.md,**/*.txt,**/*.log,node_modules/**,.git/**,docs/**,scripts/**"
    else
        print_status "Trigger already exists: wastewise-auto-deploy"
    fi
}

# Create GitHub service account for Cloud Build
create_github_sa() {
    print_header "Creating GitHub service account..."
    
    SA_NAME="github-cloudbuild-sa"
    SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
    
    # Create service account if it doesn't exist
    if ! gcloud iam service-accounts describe $SA_EMAIL --quiet 2>/dev/null; then
        print_status "Creating service account: $SA_EMAIL"
        gcloud iam service-accounts create $SA_NAME \
            --display-name="GitHub Cloud Build Service Account" \
            --description="Service account for GitHub Cloud Build integration"
    else
        print_status "Service account already exists: $SA_EMAIL"
    fi
    
    # Grant necessary roles
    ROLES=(
        "roles/cloudbuild.builds.builder"
        "roles/run.admin"
        "roles/secretmanager.secretAccessor"
        "roles/storage.admin"
    )
    
    for role in "${ROLES[@]}"; do
        print_status "Granting $role to GitHub service account..."
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SA_EMAIL" \
            --role="$role" \
            --quiet
    done
    
    # Create and download key
    KEY_FILE="github-cloudbuild-key.json"
    if [ ! -f "$KEY_FILE" ]; then
        print_status "Creating service account key..."
        gcloud iam service-accounts keys create $KEY_FILE \
            --iam-account=$SA_EMAIL
        print_warning "Service account key created: $KEY_FILE"
        print_warning "Add this key to GitHub repository secrets as GCP_SA_KEY"
    else
        print_status "Service account key already exists: $KEY_FILE"
    fi
}

# Test the setup
test_setup() {
    print_header "Testing Cloud Build setup..."
    
    # Test if we can submit a build
    print_status "Testing build submission..."
    gcloud builds submit --config cloudbuild.yaml --no-source
    
    print_status "Setup test completed successfully!"
}

# Main setup function
main() {
    print_header "Setting up Google Cloud Build for WasteWise-30"
    echo "=================================================="
    
    check_gcloud
    check_auth
    set_project
    enable_apis
    create_secrets
    setup_permissions
    connect_github
    create_trigger
    create_github_sa
    
    print_header "Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Add the service account key to GitHub repository secrets:"
    echo "   - Go to your GitHub repository settings"
    echo "   - Add secret: GCP_SA_KEY with the content of github-cloudbuild-key.json"
    echo "   - Add secret: GCP_PROJECT_ID with your project ID: $PROJECT_ID"
    echo ""
    echo "2. Push to main branch to trigger automatic deployment"
    echo ""
    echo "3. Monitor builds at: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
    echo ""
    echo "4. View deployed services at: https://console.cloud.google.com/run?project=$PROJECT_ID"
}

# Check if PROJECT_ID is provided
if [ -z "$PROJECT_ID" ]; then
    print_error "PROJECT_ID environment variable is required"
    echo "Usage: PROJECT_ID=your-project-id ./scripts/setup-cloudbuild.sh"
    exit 1
fi

# Run main function
main
