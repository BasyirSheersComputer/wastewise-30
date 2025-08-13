#!/bin/bash

# 🔧 Firebase Environment Setup Script for WasteWise
# This script helps set up Firebase environment variables and configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wastewise-30"

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

# Set up Firebase project
setup_firebase_project() {
    log "Setting up Firebase project..."
    
    # Check if project exists
    if firebase use $PROJECT_NAME &> /dev/null; then
        success "Project '$PROJECT_NAME' is already configured"
    else
        warning "Project '$PROJECT_NAME' not found or not accessible"
        echo "Available projects:"
        firebase projects:list
        
        read -p "Enter your Firebase project ID: " PROJECT_ID
        if [ -z "$PROJECT_ID" ]; then
            error "Project ID is required"
            exit 1
        fi
        
        firebase use $PROJECT_ID
        success "Project '$PROJECT_ID' configured"
    fi
}

# Interactive environment variable setup
setup_environment_variables() {
    log "Setting up environment variables..."
    
    echo ""
    echo "🔐 Environment Variables Setup"
    echo "=============================="
    echo "This will set up your Firebase Functions configuration."
    echo ""
    
    # Supabase Configuration
    echo "📊 Supabase Configuration"
    echo "------------------------"
    read -p "Enter your Supabase URL: " SUPABASE_URL
    read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
    read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
    
    # AI Service Configuration
    echo ""
    echo "🤖 AI Service Configuration"
    echo "---------------------------"
    read -p "Enter your Gemini API Key (optional): " GEMINI_API_KEY
    read -p "Enter your OpenAI API Key (optional): " OPENAI_API_KEY
    
    # JWT Configuration
    echo ""
    echo "🔑 JWT Configuration"
    echo "-------------------"
    read -p "Enter your JWT Secret: " JWT_SECRET
    
    # Email Configuration
    echo ""
    echo "📧 Email Configuration"
    echo "---------------------"
    read -p "Enter SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
    read -p "Enter SMTP Port (e.g., 587): " SMTP_PORT
    read -p "Enter SMTP User (email): " SMTP_USER
    read -s -p "Enter SMTP Password: " SMTP_PASS
    echo ""
    
    # Google OAuth Configuration
    echo ""
    echo "🔐 Google OAuth Configuration"
    echo "----------------------------"
    read -p "Enter Google Client ID (optional): " GOOGLE_CLIENT_ID
    read -p "Enter Google Client Secret (optional): " GOOGLE_CLIENT_SECRET
    
    # Twilio Configuration
    echo ""
    echo "📱 Twilio Configuration"
    echo "----------------------"
    read -p "Enter Twilio Account SID (optional): " TWILIO_ACCOUNT_SID
    read -p "Enter Twilio Auth Token (optional): " TWILIO_AUTH_TOKEN
    read -p "Enter Twilio Phone Number (optional): " TWILIO_PHONE_NUMBER
    
    # Stripe Configuration
    echo ""
    echo "💳 Stripe Configuration"
    echo "----------------------"
    read -p "Enter Stripe Secret Key (optional): " STRIPE_SECRET_KEY
    read -p "Enter Stripe Publishable Key (optional): " STRIPE_PUBLISHABLE_KEY
    read -p "Enter Stripe Webhook Secret (optional): " STRIPE_WEBHOOK_SECRET
    
    # Security Configuration
    echo ""
    echo "🔒 Security Configuration"
    echo "------------------------"
    read -p "Enter CORS Origin (default: https://$PROJECT_NAME.web.app): " CORS_ORIGIN
    CORS_ORIGIN=${CORS_ORIGIN:-"https://$PROJECT_NAME.web.app"}
    
    # Set Firebase Functions configuration
    log "Setting Firebase Functions configuration..."
    
    # Supabase
    if [ ! -z "$SUPABASE_URL" ]; then
        firebase functions:config:set supabase.url="$SUPABASE_URL"
        success "Supabase URL configured"
    fi
    
    if [ ! -z "$SUPABASE_ANON_KEY" ]; then
        firebase functions:config:set supabase.anon_key="$SUPABASE_ANON_KEY"
        success "Supabase Anon Key configured"
    fi
    
    if [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        firebase functions:config:set supabase.service_role_key="$SUPABASE_SERVICE_ROLE_KEY"
        success "Supabase Service Role Key configured"
    fi
    
    # AI Services
    if [ ! -z "$GEMINI_API_KEY" ]; then
        firebase functions:config:set ai.gemini_key="$GEMINI_API_KEY"
        success "Gemini API Key configured"
    fi
    
    if [ ! -z "$OPENAI_API_KEY" ]; then
        firebase functions:config:set ai.openai_key="$OPENAI_API_KEY"
        success "OpenAI API Key configured"
    fi
    
    # JWT
    if [ ! -z "$JWT_SECRET" ]; then
        firebase functions:config:set auth.jwt_secret="$JWT_SECRET"
        success "JWT Secret configured"
    fi
    
    # Email
    if [ ! -z "$SMTP_HOST" ]; then
        firebase functions:config:set email.smtp_host="$SMTP_HOST"
        success "SMTP Host configured"
    fi
    
    if [ ! -z "$SMTP_PORT" ]; then
        firebase functions:config:set email.smtp_port="$SMTP_PORT"
        success "SMTP Port configured"
    fi
    
    if [ ! -z "$SMTP_USER" ]; then
        firebase functions:config:set email.smtp_user="$SMTP_USER"
        success "SMTP User configured"
    fi
    
    if [ ! -z "$SMTP_PASS" ]; then
        firebase functions:config:set email.smtp_pass="$SMTP_PASS"
        success "SMTP Password configured"
    fi
    
    # OAuth
    if [ ! -z "$GOOGLE_CLIENT_ID" ]; then
        firebase functions:config:set oauth.google_client_id="$GOOGLE_CLIENT_ID"
        success "Google Client ID configured"
    fi
    
    if [ ! -z "$GOOGLE_CLIENT_SECRET" ]; then
        firebase functions:config:set oauth.google_client_secret="$GOOGLE_CLIENT_SECRET"
        success "Google Client Secret configured"
    fi
    
    # Twilio
    if [ ! -z "$TWILIO_ACCOUNT_SID" ]; then
        firebase functions:config:set twilio.account_sid="$TWILIO_ACCOUNT_SID"
        success "Twilio Account SID configured"
    fi
    
    if [ ! -z "$TWILIO_AUTH_TOKEN" ]; then
        firebase functions:config:set twilio.auth_token="$TWILIO_AUTH_TOKEN"
        success "Twilio Auth Token configured"
    fi
    
    if [ ! -z "$TWILIO_PHONE_NUMBER" ]; then
        firebase functions:config:set twilio.phone_number="$TWILIO_PHONE_NUMBER"
        success "Twilio Phone Number configured"
    fi
    
    # Stripe
    if [ ! -z "$STRIPE_SECRET_KEY" ]; then
        firebase functions:config:set stripe.secret_key="$STRIPE_SECRET_KEY"
        success "Stripe Secret Key configured"
    fi
    
    if [ ! -z "$STRIPE_PUBLISHABLE_KEY" ]; then
        firebase functions:config:set stripe.publishable_key="$STRIPE_PUBLISHABLE_KEY"
        success "Stripe Publishable Key configured"
    fi
    
    if [ ! -z "$STRIPE_WEBHOOK_SECRET" ]; then
        firebase functions:config:set stripe.webhook_secret="$STRIPE_WEBHOOK_SECRET"
        success "Stripe Webhook Secret configured"
    fi
    
    # Security
    if [ ! -z "$CORS_ORIGIN" ]; then
        firebase functions:config:set security.cors_origin="$CORS_ORIGIN"
        success "CORS Origin configured"
    fi
    
    firebase functions:config:set security.rate_limit_window="900000"
    firebase functions:config:set security.rate_limit_max="100"
    success "Rate limiting configured"
}

# Create environment files
create_environment_files() {
    log "Creating environment files..."
    
    # Frontend production environment
    cat > frontend/.env.production << EOF
# Production Environment Variables
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_API_URL=https://us-central1-${PROJECT_NAME}.cloudfunctions.net/api
VITE_FRONTEND_URL=https://${PROJECT_NAME}.web.app
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
EOF
    success "Frontend production environment file created"
    
    # Backend environment
    cat > backend/.env << EOF
# Backend Environment Variables
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
GEMINI_API_KEY=${GEMINI_API_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}
JWT_SECRET=${JWT_SECRET}
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    success "Backend environment file created"
    
    # Add to .gitignore
    if ! grep -q ".env" .gitignore; then
        echo "" >> .gitignore
        echo "# Environment files" >> .gitignore
        echo ".env" >> .gitignore
        echo ".env.local" >> .gitignore
        echo ".env.production" >> .gitignore
        echo ".env.development" >> .gitignore
        success ".gitignore updated"
    fi
}

# Verify configuration
verify_configuration() {
    log "Verifying configuration..."
    
    echo ""
    echo "📋 Configuration Summary"
    echo "========================"
    
    # Show Firebase config
    echo "Firebase Functions Configuration:"
    firebase functions:config:get | head -20
    
    # Check environment files
    if [ -f "frontend/.env.production" ]; then
        echo ""
        echo "Frontend Environment File:"
        echo "VITE_SUPABASE_URL: ${SUPABASE_URL}"
        echo "VITE_API_URL: https://us-central1-${PROJECT_NAME}.cloudfunctions.net/api"
    fi
    
    if [ -f "backend/.env" ]; then
        echo ""
        echo "Backend Environment File:"
        echo "SUPABASE_URL: ${SUPABASE_URL}"
        echo "NODE_ENV: development"
    fi
    
    echo ""
    success "Configuration verification complete"
}

# Show next steps
show_next_steps() {
    echo ""
    echo "🎉 Environment Setup Complete!"
    echo "============================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test your configuration:"
    echo "   firebase emulators:start"
    echo ""
    echo "2. Deploy to Firebase:"
    echo "   ./scripts/deploy-firebase.sh"
    echo ""
    echo "3. Monitor your deployment:"
    echo "   firebase functions:log"
    echo ""
    echo "4. View your configuration:"
    echo "   firebase functions:config:get"
    echo ""
    echo "🔗 Useful Links:"
    echo "Firebase Console: https://console.firebase.google.com/project/${PROJECT_NAME}"
    echo "Supabase Dashboard: https://app.supabase.com"
    echo ""
}

# Main setup function
main() {
    echo "🔧 Firebase Environment Setup for WasteWise"
    echo "==========================================="
    
    # Pre-setup checks
    check_firebase_cli
    check_firebase_auth
    
    # Setup
    setup_firebase_project
    setup_environment_variables
    create_environment_files
    verify_configuration
    show_next_steps
    
    success "Environment setup completed successfully! 🎉"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "This script will:"
        echo "1. Check Firebase CLI installation"
        echo "2. Verify Firebase authentication"
        echo "3. Set up Firebase project"
        echo "4. Configure environment variables"
        echo "5. Create environment files"
        echo "6. Verify configuration"
        exit 0
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

