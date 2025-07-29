#!/bin/bash

echo "🚀 Deploying Integrated WasteWise System..."

# Build and start all services
docker-compose -f docker-compose.integrated.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 60

# Test all services
echo "🧪 Testing integrated system..."

# Test backend
curl -f http://localhost:3000/health || echo "❌ Backend health check failed"

# Test frontend
curl -f http://localhost:5173 || echo "❌ Frontend health check failed"

# Test data platform
curl -f http://localhost:4000/health || echo "❌ Data platform health check failed"

# Test nginx proxy
curl -f http://localhost/health || echo "❌ Nginx proxy health check failed"

echo "✅ Integrated system deployment completed!"
echo ""
echo "🌐 Application URLs:"
echo "- Frontend: http://localhost"
echo "- Backend API: http://localhost/api"
echo "- Data Platform: http://localhost/data-platform"
echo "- Health Checks: http://localhost/health"