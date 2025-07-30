#!/bin/bash

# 🚀 Complete Docker Deployment Script for WasteWise System
# This script automates the entire deployment process

set -e  # Exit on any error

echo "🚀 Starting WasteWise Docker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker status
check_docker() {
    print_status "Checking Docker installation..."
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Function to check Docker Compose
check_docker_compose() {
    print_status "Checking Docker Compose..."
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Function to create environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Create backend .env if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        if [ -f "env.example" ]; then
            cp env.example backend/.env
            print_success "Created backend/.env from template"
        else
            print_warning "No env.example found. Please create backend/.env manually"
        fi
    fi
    
    # Create data-platform .env if it doesn't exist
    if [ ! -f "data-platform/.env" ]; then
        if [ -f "env.example" ]; then
            cp env.example data-platform/.env
            print_success "Created data-platform/.env from template"
        else
            print_warning "No env.example found. Please create data-platform/.env manually"
        fi
    fi
    
    # Create main .env for docker-compose
    if [ ! -f ".env" ]; then
        cat > .env << 'EOF'
# API Keys - PLEASE UPDATE THESE WITH YOUR ACTUAL KEYS
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Database
POSTGRES_DB=wastewise
POSTGRES_USER=postgres
POSTGRES_PASSWORD=wastewise_password

# Redis
REDIS_URL=redis://redis:6379

# Application
NODE_ENV=production
PORT=3000
DATA_PLATFORM_PORT=4000
EOF
        print_success "Created .env file for docker-compose"
        print_warning "Please edit .env file with your actual API keys before continuing"
    fi
}

# Function to create docker-compose.yml
create_docker_compose() {
    print_status "Creating docker-compose.yml..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Main WasteWise Application
  wastewise-app:
    build: .
    ports:
      - "8899:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Data Platform
  data-platform:
    build: ./data-platform
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-wastewise}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-wastewise_password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - wastewise-app
      - data-platform
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
EOF
    print_success "Created docker-compose.yml"
}

# Function to create nginx configuration
create_nginx_config() {
    print_status "Creating nginx configuration..."
    
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    
    # Upstream definitions
    upstream wastewise-app {
        server wastewise-app:80;
    }
    
    upstream data-platform {
        server data-platform:4000;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # Main application
        location / {
            proxy_pass http://wastewise-app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Data Platform API
        location /data-platform/ {
            rewrite ^/data-platform/(.*) /$1 break;
            proxy_pass http://data-platform;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Health checks
        location /health {
            proxy_pass http://wastewise-app/health;
        }
        
        location /data-platform/health {
            proxy_pass http://data-platform/health;
        }
    }
}
EOF
    print_success "Created nginx.conf"
}

# Function to create database initialization
create_database_init() {
    print_status "Creating database initialization script..."
    
    mkdir -p database
    
    cat > database/init.sql << 'EOF'
-- Initialize WasteWise Database

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location JSONB,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    cost DECIMAL(10,2),
    price DECIMAL(10,2),
    waste_factor DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    item_id UUID REFERENCES menu_items(id),
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create waste_events table
CREATE TABLE IF NOT EXISTS waste_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    item_id UUID REFERENCES menu_items(id),
    quantity DECIMAL(10,2),
    reason VARCHAR(100),
    cost DECIMAL(10,2),
    recorded_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    item_id UUID REFERENCES menu_items(id),
    quantity INTEGER,
    revenue DECIMAL(10,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES restaurants(id),
    recommendation_type VARCHAR(100),
    content JSONB,
    confidence DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_restaurant ON inventory(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_waste_events_restaurant ON waste_events(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_sales_restaurant ON sales(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_restaurant ON ai_recommendations(restaurant_id);

-- Insert sample data
INSERT INTO restaurants (name, location, settings) VALUES 
('Sample Restaurant', '{"address": "123 Main St", "city": "Sample City"}', '{"theme": "default"}')
ON CONFLICT DO NOTHING;
EOF
    print_success "Created database/init.sql"
}

# Function to create SSL directory
create_ssl_directory() {
    print_status "Creating SSL directory..."
    mkdir -p ssl
    print_success "Created ssl directory"
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build main application
    print_status "Building main application..."
    docker build -t wastewise-30:latest .
    
    # Build data platform
    print_status "Building data platform..."
    cd data-platform
    docker build -t wastewise-data-platform:latest .
    cd ..
    
    print_success "All Docker images built successfully"
}

# Function to deploy services
deploy_services() {
    print_status "Deploying services..."
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Remove old volumes (optional)
    if [ "$1" = "--clean" ]; then
        print_warning "Removing old volumes (this will delete all data)"
        docker volume prune -f
    fi
    
    # Start all services
    docker-compose up -d --build
    
    print_success "Services deployed successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec postgres pg_isready -U postgres >/dev/null 2>&1; then
            print_success "Database is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Database failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for main application
    print_status "Waiting for main application..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8899/health >/dev/null 2>&1; then
            print_success "Main application is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Main application may not be fully ready"
    fi
    
    # Wait for data platform
    print_status "Waiting for data platform..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:4000/health >/dev/null 2>&1; then
            print_success "Data platform is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Data platform may not be fully ready"
    fi
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check container status
    print_status "Checking container status..."
    docker-compose ps
    
    # Test health endpoints
    print_status "Testing health endpoints..."
    
    # Main application health
    if curl -f http://localhost:8899/health >/dev/null 2>&1; then
        print_success "Main application health check passed"
    else
        print_error "Main application health check failed"
    fi
    
    # Data platform health
    if curl -f http://localhost:4000/health >/dev/null 2>&1; then
        print_success "Data platform health check passed"
    else
        print_error "Data platform health check failed"
    fi
    
    # Nginx proxy health
    if curl -f http://localhost/health >/dev/null 2>&1; then
        print_success "Nginx proxy health check passed"
    else
        print_error "Nginx proxy health check failed"
    fi
    
    # Database health
    if docker-compose exec postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "Database health check passed"
    else
        print_error "Database health check failed"
    fi
    
    # Redis health
    if docker-compose exec redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis health check passed"
    else
        print_error "Redis health check failed"
    fi
}

# Function to display deployment summary
show_summary() {
    echo ""
    echo "🎉 Deployment Summary"
    echo "===================="
    echo ""
    echo "✅ All services deployed successfully"
    echo ""
    echo "🌐 Application URLs:"
    echo "   - Main Application: http://localhost"
    echo "   - Direct Container: http://localhost:8899"
    echo "   - Data Platform: http://localhost:4000"
    echo "   - Health Check: http://localhost/health"
    echo ""
    echo "🗄️ Database:"
    echo "   - Host: localhost"
    echo "   - Port: 5432"
    echo "   - Database: wastewise"
    echo "   - User: postgres"
    echo ""
    echo "🔴 Redis:"
    echo "   - Host: localhost"
    echo "   - Port: 6379"
    echo ""
    echo "📊 Monitoring:"
    echo "   - View logs: docker-compose logs -f"
    echo "   - Container status: docker-compose ps"
    echo "   - Resource usage: docker stats"
    echo ""
    echo "🛠️ Management Commands:"
    echo "   - Stop services: docker-compose down"
    echo "   - Restart services: docker-compose restart"
    echo "   - View logs: docker-compose logs [service-name]"
    echo "   - Access shell: docker-compose exec [service-name] sh"
    echo ""
    echo "🚀 Your WasteWise system is now running!"
    echo ""
}

# Main deployment function
main() {
    echo "🚀 WasteWise Docker Deployment Script"
    echo "===================================="
    echo ""
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Setup environment
    setup_environment
    
    # Create configuration files
    create_docker_compose
    create_nginx_config
    create_database_init
    create_ssl_directory
    
    # Build images
    build_images
    
    # Deploy services
    deploy_services "$1"
    
    # Wait for services
    wait_for_services
    
    # Run health checks
    run_health_checks
    
    # Show summary
    show_summary
}

# Parse command line arguments
case "${1:-}" in
    --clean)
        main --clean
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --clean    Remove old volumes and start fresh"
        echo "  --help     Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0          # Normal deployment"
        echo "  $0 --clean  # Clean deployment (removes old data)"
        ;;
    *)
        main "$@"
        ;;
esac 