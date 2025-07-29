# 🐳 Complete Docker Deployment Guide

## 🎯 Overview

This guide provides step-by-step instructions to deploy all components of the WasteWise system to Docker, including the main application, data platform, and integrated services.

## 📋 Prerequisites

### System Requirements
- Docker Desktop installed and running
- Docker Compose installed
- At least 4GB RAM available
- 10GB free disk space
- Git for version control

### Required API Keys
- `GEMINI_API_KEY` - Google Gemini API key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## 🚀 Step-by-Step Deployment

### Step 1: Environment Setup

```bash
# 1.1 Clone or navigate to project directory
cd wastewise-30

# 1.2 Create environment files
cp env.example backend/.env
cp env.example data-platform/.env

# 1.3 Edit environment files with your API keys
# Edit backend/.env and data-platform/.env with your actual API keys
```

### Step 2: Build Individual Components

```bash
# 2.1 Build main application
docker build -t wastewise-30:latest .

# 2.2 Build data platform
cd data-platform
docker build -t wastewise-data-platform:latest .
cd ..

# 2.3 Verify images were created
docker images | grep wastewise
```

### Step 3: Create Docker Compose Configuration

```bash
# 3.1 Create integrated docker-compose.yml
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
      POSTGRES_DB: wastewise
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: wastewise_password
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
```

### Step 4: Create Nginx Configuration

```bash
# 4.1 Create nginx.conf
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
```

### Step 5: Create Database Initialization Script

```bash
# 5.1 Create database directory
mkdir -p database

# 5.2 Create init.sql
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
```

### Step 6: Set Environment Variables

```bash
# 6.1 Create .env file for docker-compose
cat > .env << 'EOF'
# API Keys
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

# 6.2 Edit .env file with your actual API keys
echo "Please edit .env file with your actual API keys"
```

### Step 7: Deploy the System

```bash
# 7.1 Stop any existing containers
docker-compose down

# 7.2 Remove old volumes (optional - will delete data)
docker volume prune -f

# 7.3 Build and start all services
docker-compose up -d --build

# 7.4 Check service status
docker-compose ps

# 7.5 View logs
docker-compose logs -f
```

### Step 8: Verify Deployment

```bash
# 8.1 Check all containers are running
docker-compose ps

# 8.2 Test health endpoints
curl -f http://localhost/health
curl -f http://localhost/data-platform/health

# 8.3 Test main application
curl -f http://localhost

# 8.4 Test data platform
curl -f http://localhost/data-platform

# 8.5 Check database connection
docker-compose exec postgres psql -U postgres -d wastewise -c "SELECT version();"
```

### Step 9: Monitor and Troubleshoot

```bash
# 9.1 View all container logs
docker-compose logs

# 9.2 View specific service logs
docker-compose logs wastewise-app
docker-compose logs data-platform
docker-compose logs postgres
docker-compose logs redis
docker-compose logs nginx

# 9.3 Check container resource usage
docker stats

# 9.4 Access container shell for debugging
docker-compose exec wastewise-app sh
docker-compose exec data-platform sh
docker-compose exec postgres psql -U postgres -d wastewise
```

## 🔧 Advanced Configuration

### SSL/HTTPS Setup

```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate (for development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/nginx.key -out ssl/nginx.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Update nginx.conf to include SSL
cat >> nginx.conf << 'EOF'

    # HTTPS server
    server {
        listen 443 ssl;
        server_name localhost;
        
        ssl_certificate /etc/nginx/ssl/nginx.crt;
        ssl_certificate_key /etc/nginx/ssl/nginx.key;
        
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
    }
EOF
```

### Production Deployment

```bash
# Create production docker-compose override
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  wastewise-app:
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  data-platform:
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  postgres:
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

  redis:
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
EOF

# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash

echo "🔍 Checking system health..."

# Check main application
echo "📱 Main Application:"
curl -f http://localhost/health || echo "❌ Main app health check failed"

# Check data platform
echo "🤖 Data Platform:"
curl -f http://localhost/data-platform/health || echo "❌ Data platform health check failed"

# Check database
echo "🗄️ Database:"
docker-compose exec postgres pg_isready -U postgres || echo "❌ Database health check failed"

# Check redis
echo "🔴 Redis:"
docker-compose exec redis redis-cli ping || echo "❌ Redis health check failed"

# Check nginx
echo "🌐 Nginx:"
curl -f http://localhost || echo "❌ Nginx health check failed"

echo "✅ Health check completed"
EOF

chmod +x health-check.sh
```

### Backup and Restore

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

echo "📦 Creating backup: $DATE"

# Backup database
docker-compose exec postgres pg_dump -U postgres wastewise > $BACKUP_DIR/database_$DATE.sql

# Backup volumes
docker run --rm -v wastewise-30_postgres_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/postgres_$DATE.tar.gz -C /data .

echo "✅ Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh

# Create restore script
cat > restore.sh << 'EOF'
#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_date>"
    echo "Example: ./restore.sh 20250101_120000"
    exit 1
fi

DATE=$1
BACKUP_DIR="./backups"

echo "🔄 Restoring from backup: $DATE"

# Stop services
docker-compose down

# Restore database
docker-compose up -d postgres
sleep 10
docker-compose exec -T postgres psql -U postgres -d wastewise < $BACKUP_DIR/database_$DATE.sql

# Restore volumes (if needed)
# docker run --rm -v wastewise-30_postgres_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar xzf /backup/postgres_$DATE.tar.gz -C /data

# Start all services
docker-compose up -d

echo "✅ Restore completed"
EOF

chmod +x restore.sh
```

## 🚀 Quick Deployment Commands

```bash
# Complete deployment in one command
./deploy-all.sh

# Or step by step:
docker-compose down
docker-compose up -d --build
docker-compose ps
./health-check.sh
```

## 📋 Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] API keys configured in .env file
- [ ] All Docker images built successfully
- [ ] All containers running (docker-compose ps)
- [ ] Health checks passing
- [ ] Database initialized with schema
- [ ] SSL certificates configured (for production)
- [ ] Monitoring and backup scripts created
- [ ] Firewall ports opened (80, 443, 8899, 4000)
- [ ] Domain DNS configured (for production)

## 🎯 Success Indicators

- ✅ All containers show "Up" status
- ✅ Health endpoints return 200 OK
- ✅ Database connection successful
- ✅ Redis connection successful
- ✅ Nginx proxy working
- ✅ SSL certificate valid (if configured)
- ✅ Application accessible via browser
- ✅ Data platform API responding

## 🔧 Troubleshooting

### Common Issues:

1. **Port conflicts**: Change ports in docker-compose.yml
2. **API key errors**: Verify .env file has correct keys
3. **Database connection**: Check postgres container logs
4. **Memory issues**: Increase Docker memory limit
5. **SSL errors**: Regenerate certificates or use HTTP only

### Debug Commands:

```bash
# View all logs
docker-compose logs

# Restart specific service
docker-compose restart wastewise-app

# Rebuild specific service
docker-compose up -d --build wastewise-app

# Access container shell
docker-compose exec wastewise-app sh

# Check resource usage
docker stats
```

Your WasteWise system is now fully deployed and ready for production use! 🎉 