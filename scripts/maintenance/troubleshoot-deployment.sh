#!/bin/bash

echo "🔍 WasteWise-30 Deployment Troubleshooting Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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
echo "1. Checking SSH connectivity to remote host..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no basyir@192.168.20.215 "echo 'SSH connection successful'" 2>/dev/null; then
    print_status "OK" "SSH connection to 192.168.20.215 successful"
else
    print_status "ERROR" "Cannot connect to 192.168.20.215 via SSH"
    exit 1
fi

echo ""
echo "2. Checking Docker containers status..."
ssh basyir@192.168.20.215 "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep wastewise" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "WasteWise containers are running"
else
    print_status "ERROR" "WasteWise containers are not running"
fi

echo ""
echo "3. Checking container logs..."
echo "--- Frontend Container Logs ---"
ssh basyir@192.168.20.215 "docker logs wastewise-frontend --tail 20" 2>/dev/null
echo ""
echo "--- Backend Container Logs ---"
ssh basyir@192.168.20.215 "docker logs wastewise-backend --tail 20" 2>/dev/null

echo ""
echo "4. Checking if containers are listening on correct ports..."
ssh basyir@192.168.20.215 "netstat -tlnp | grep -E ':(8080|3000)'" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "Containers are listening on correct ports"
else
    print_status "ERROR" "Containers are not listening on expected ports"
fi

echo ""
echo "5. Testing local connectivity to containers..."
ssh basyir@192.168.20.215 "curl -s http://127.0.0.1:8080 | head -5" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "Frontend container responding on localhost:8080"
else
    print_status "ERROR" "Frontend container not responding on localhost:8080"
fi

ssh basyir@192.168.20.215 "curl -s http://127.0.0.1:3000/health" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "Backend container responding on localhost:3000"
else
    print_status "ERROR" "Backend container not responding on localhost:3000"
fi

echo ""
echo "6. Checking nginx configuration..."
ssh basyir@192.168.20.215 "sudo nginx -t" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "Nginx configuration is valid"
else
    print_status "ERROR" "Nginx configuration has errors"
fi

echo ""
echo "7. Checking nginx status..."
ssh basyir@192.168.20.215 "sudo systemctl status nginx --no-pager" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "Nginx is running"
else
    print_status "ERROR" "Nginx is not running"
fi

echo ""
echo "8. Testing nginx routing..."
ssh basyir@192.168.20.215 "curl -s -I http://localhost/wastewise-30" 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "Nginx routing to /wastewise-30 is working locally"
else
    print_status "ERROR" "Nginx routing to /wastewise-30 is not working locally"
fi

echo ""
echo "9. Checking environment variables in containers..."
echo "--- Frontend Environment Variables ---"
ssh basyir@192.168.20.215 "docker exec wastewise-frontend env | grep -E 'VITE_|FRONTEND|BACKEND'" 2>/dev/null
echo ""
echo "--- Backend Environment Variables ---"
ssh basyir@192.168.20.215 "docker exec wastewise-backend env | grep -E 'FRONTEND|CORS|PAYMENT'" 2>/dev/null

echo ""
echo "10. Testing external access..."
echo "Testing: https://sheerstechnologies.com/wastewise-30"
curl -s -I https://sheerstechnologies.com/wastewise-30 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "External access to /wastewise-30 is working"
else
    print_status "ERROR" "External access to /wastewise-30 is not working"
fi

echo ""
echo "11. Checking DNS resolution..."
nslookup sheerstechnologies.com 2>/dev/null
if [ $? -eq 0 ]; then
    print_status "OK" "DNS resolution for sheerstechnologies.com is working"
else
    print_status "ERROR" "DNS resolution for sheerstechnologies.com is not working"
fi

echo ""
echo "12. Checking SSL certificate..."
openssl s_client -connect sheerstechnologies.com:443 -servername sheerstechnologies.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
if [ $? -eq 0 ]; then
    print_status "OK" "SSL certificate is valid"
else
    print_status "ERROR" "SSL certificate is invalid or missing"
fi

echo ""
echo "=================================================="
echo "🔧 Recommended Actions:"
echo ""

# Check if containers are running
if ! ssh basyir@192.168.20.215 "docker ps | grep wastewise" >/dev/null 2>&1; then
    echo "1. Restart the containers:"
    echo "   ssh basyir@192.168.20.215"
    echo "   docker stop wastewise-frontend wastewise-backend"
    echo "   docker rm wastewise-frontend wastewise-backend"
    echo "   # Then redeploy via Jenkins"
fi

# Check if nginx is running
if ! ssh basyir@192.168.20.215 "sudo systemctl is-active nginx" >/dev/null 2>&1; then
    echo "2. Restart nginx:"
    echo "   ssh basyir@192.168.20.215"
    echo "   sudo systemctl restart nginx"
fi

# Check if ports are accessible
if ! ssh basyir@192.168.20.215 "curl -s http://127.0.0.1:8080" >/dev/null 2>&1; then
    echo "3. Check frontend container:"
    echo "   ssh basyir@192.168.20.215"
    echo "   docker logs wastewise-frontend"
fi

if ! ssh basyir@192.168.20.215 "curl -s http://127.0.0.1:3000/health" >/dev/null 2>&1; then
    echo "4. Check backend container:"
    echo "   ssh basyir@192.168.20.215"
    echo "   docker logs wastewise-backend"
fi

echo ""
echo "5. Manual container restart commands:"
echo "   ssh basyir@192.168.20.215"
echo "   docker pull basyir/wastewise-30-frontend:latest"
echo "   docker pull basyir/wastewise-30-backend:latest"
echo "   docker run -d --name wastewise-frontend -p 127.0.0.1:8080:8080 --restart always -e VITE_SUPABASE_URL=\"\$VITE_SUPABASE_URL\" -e VITE_SUPABASE_ANON_KEY=\"\$VITE_SUPABASE_ANON_KEY\" -e VITE_STRIPE_PUBLISHABLE_KEY=\"\$STRIPE_PUBLISHABLE_KEY\" -e VITE_FRONTEND_URL=\"https://sheerstechnologies.com/wastewise-30\" -e VITE_BACKEND_URL=\"https://sheerstechnologies.com/wastewise-30/api\" basyir/wastewise-30-frontend:latest"
echo "   docker run -d --name wastewise-backend -p 127.0.0.1:3000:3000 --restart always -e STRIPE_SECRET_KEY=\"\$STRIPE_SECRET_KEY\" -e STRIPE_PUBLISHABLE_KEY=\"\$STRIPE_PUBLISHABLE_KEY\" -e FRONTEND_URL=\"https://sheerstechnologies.com/wastewise-30\" -e CORS_ORIGIN=\"https://sheerstechnologies.com\" -e PAYMENT_PROCESSING_ENABLED=\"false\" basyir/wastewise-30-backend:latest"

echo ""
echo "Troubleshooting complete! 🎯" 