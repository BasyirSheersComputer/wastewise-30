#!/bin/bash

echo "Setting up .env file for WasteWise-30..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file with required variables
cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Application Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://sheerstechnologies.com

# Feature Flags
AI_RECOMMENDATIONS_ENABLED=true
PAYMENT_PROCESSING_ENABLED=false
EMAIL_NOTIFICATIONS_ENABLED=true
SMS_NOTIFICATIONS_ENABLED=false
EOF

echo "✅ .env file created successfully!"
echo ""
echo "⚠️  IMPORTANT: Please edit the .env file and replace the placeholder values with your actual API keys:"
echo "   - OPENAI_API_KEY"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - GEMINI_API_KEY"
echo "   - JWT_SECRET"
echo ""
echo "After updating the .env file, restart your containers:"
echo "   docker-compose down && docker-compose up -d"
