#!/bin/bash
set -e

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
NETWORK_NAME="wastewise-network"

echo "🚀 Deploying WasteWise Multi-Container Setup..."

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE not found!"
    echo "📋 Please create $ENV_FILE with the following variables:"
    echo "   DATABASE_URL=postgresql://username:password@localhost:5432/wastewise"
    echo "   JWT_SECRET=your-super-secret-jwt-key-here"
    echo "   SUPABASE_URL=https://your-project.supabase.co"
    echo "   SUPABASE_KEY=your-supabase-anon-key"
    echo "   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key"
    echo "   GOOGLE_API_KEY=your-google-api-key"
    exit 1
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans || true

# Remove old images
echo "🧹 Cleaning up old images..."
docker image prune -f || true

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."

# Check frontend
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
fi

# Check backend
if curl -f http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check nginx proxy
if curl -f http://localhost:8899/health >/dev/null 2>&1; then
    echo "✅ Nginx proxy is healthy"
else
    echo "❌ Nginx proxy health check failed"
fi

# Show service status
echo "📊 Service Status:"
docker-compose -f $COMPOSE_FILE ps

# Show logs
echo "📋 Recent logs:"
docker-compose -f $COMPOSE_FILE logs --tail=20

echo "🎉 Multi-container deployment completed!"
echo "🌐 Application URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Nginx Proxy: http://localhost:8899"
echo "   - Health Check: http://localhost:8899/health"

echo "🔧 Management Commands:"
echo "   - View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   - Stop services: docker-compose -f $COMPOSE_FILE down"
echo "   - Restart services: docker-compose -f $COMPOSE_FILE restart"
echo "   - Scale services: docker-compose -f $COMPOSE_FILE up -d --scale backend=2" 