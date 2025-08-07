#!/bin/bash

echo "🔄 Restarting WasteWise-30 containers..."

ssh basyir@192.168.20.215 << 'EOF'

echo "1. Stopping existing containers..."
docker stop wastewise-frontend wastewise-backend 2>/dev/null || true
docker rm wastewise-frontend wastewise-backend 2>/dev/null || true

echo "2. Pulling latest images..."
docker pull basyir/wastewise-30-frontend:latest
docker pull basyir/wastewise-30-backend:latest

echo "3. Starting frontend container..."
docker run -d --name wastewise-frontend \
  -p 127.0.0.1:8899:8899 \
  --restart always \
  -e VITE_SUPABASE_URL="https://your-project-url.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-anon-key-here" \
  -e VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key" \
  -e VITE_FRONTEND_URL="https://sheerstechnologies.com/wastewise-30" \
  -e VITE_BACKEND_URL="https://sheerstechnologies.com/wastewise-30/api" \
  basyir/wastewise-30-frontend:latest

echo "4. Starting backend container..."
docker run -d --name wastewise-backend \
  -p 127.0.0.1:3000:3000 \
  --restart always \
  -e VITE_SUPABASE_URL="https://your-project-url.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-anon-key-here" \
  -e STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key" \
  -e STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key" \
  -e STRIPE_PRICE_BASIC="price_basic_monthly" \
  -e STRIPE_PRICE_PRO="price_pro_monthly" \
  -e STRIPE_PRICE_ENTERPRISE="price_enterprise_monthly" \
  -e GEMINI_API_KEY="your_gemini_api_key" \
  -e OPENAI_API_KEY="your_openai_api_key" \
  -e JWT_SECRET="your_jwt_secret_key_here" \
  -e SMTP_USER="your_email@gmail.com" \
  -e SMTP_PASS="your_app_password" \
  -e TWILIO_ACCOUNT_SID="your_twilio_account_sid" \
  -e TWILIO_AUTH_TOKEN="your_twilio_auth_token" \
  -e TWILIO_PHONE_NUMBER="+1234567890" \
  -e DATABASE_URL="postgresql://username:password@localhost:5432/wastewise" \
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

echo "5. Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep wastewise

echo "6. Testing connectivity..."
echo "Frontend:"
curl -s -I http://127.0.0.1:8899 | head -1

echo "Backend:"
curl -s -I http://127.0.0.1:3000/health | head -1

echo "Nginx routing:"
curl -s -I http://localhost/wastewise-30 | head -1

echo "✅ Containers restarted successfully!"
echo "🌐 Access your application at: https://sheerstechnologies.com/wastewise-30"

EOF 