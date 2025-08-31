#!/bin/bash

echo "🚀 Manual Deployment Script for WasteWise-30"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

echo ""
echo "1. Connecting to remote host..."
ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no basyir@192.168.20.215 << 'EOF'

echo "2. Stopping existing containers..."
docker stop wastewise-frontend wastewise-backend 2>/dev/null || true
docker rm wastewise-frontend wastewise-backend 2>/dev/null || true

echo "3. Pulling latest images..."
docker pull basyir/wastewise-30-frontend:latest
docker pull basyir/wastewise-30-backend:latest

echo "4. Starting frontend container..."
docker run -d --name wastewise-frontend \
  -p 127.0.0.1:8080:8080 \
  --restart always \
  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  -e VITE_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
  -e VITE_FRONTEND_URL="https://sheerstechnologies.com/wastewise-30" \
  -e VITE_BACKEND_URL="https://sheerstechnologies.com/wastewise-30/api" \
  basyir/wastewise-30-frontend:latest

echo "5. Starting backend container..."
docker run -d --name wastewise-backend \
  -p 127.0.0.1:3000:3000 \
  --restart always \
  -e STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  -e STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
  -e STRIPE_PRICE_BASIC="$STRIPE_PRICE_BASIC" \
  -e STRIPE_PRICE_PRO="$STRIPE_PRICE_PRO" \
  -e STRIPE_PRICE_ENTERPRISE="$STRIPE_PRICE_ENTERPRISE" \
  -e GEMINI_API_KEY="$GEMINI_API_KEY" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e SMTP_USER="$SMTP_USER" \
  -e SMTP_PASS="$SMTP_PASS" \
  -e TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID" \
  -e TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN" \
  -e TWILIO_PHONE_NUMBER="$TWILIO_PHONE_NUMBER" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NODE_ENV="development" \
  -e PORT="3000" \
  -e FRONTEND_URL="https://sheerstechnologies.com/wastewise-30" \
  -e LOG_LEVEL="info" \
  -e CORS_ORIGIN="https://sheerstechnologies.com" \
  -e RATE_LIMIT_WINDOW_MS="900000" \
  -e RATE_LIMIT_MAX_REQUESTS="100" \
  -e FPX_BANKS_ENABLED="true" \
  -e EWALLET_ENABLED="true" \
  -e CARD_PAYMENTS_ENABLED="true" \
  -e TRIAL_DURATION_DAYS="30" \
  -e TRIAL_EXTENSION_DAYS="7" \
  -e AI_RECOMMENDATIONS_ENABLED="true" \
  -e PAYMENT_PROCESSING_ENABLED="false" \
  -e EMAIL_NOTIFICATIONS_ENABLED="true" \
  -e SMS_NOTIFICATIONS_ENABLED="false" \
  basyir/wastewise-30-backend:latest

echo "6. Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep wastewise

echo "7. Testing local connectivity..."
echo "Testing frontend on localhost:8080..."
curl -s -I http://127.0.0.1:8080 | head -1

echo "Testing backend on localhost:3000..."
curl -s -I http://127.0.0.1:3000/health | head -1

echo "8. Testing nginx routing..."
echo "Testing nginx routing to /wastewise-30..."
curl -s -I http://localhost/wastewise-30 | head -1

echo "9. Checking nginx status..."
sudo systemctl status nginx --no-pager | head -5

echo "10. Restarting nginx to ensure configuration is loaded..."
sudo systemctl restart nginx

echo "11. Final test of external access..."
echo "Testing: https://sheerstechnologies.com/wastewise-30"
curl -s -I https://sheerstechnologies.com/wastewise-30 | head -1

echo ""
echo "🎯 Deployment complete!"
echo "Access your application at: https://sheerstechnologies.com/wastewise-30"

EOF

echo ""
echo "✅ Manual deployment completed!"
echo "🔍 If you still get 404 errors, run the troubleshooting script:"
echo "   ./troubleshoot-deployment.sh" 