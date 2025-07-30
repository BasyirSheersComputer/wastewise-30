# Multi-stage build for optimized production image
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig*.json ./
COPY frontend/index.html ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./
COPY frontend/src ./src
COPY frontend/components ./components
COPY frontend/modules ./modules
COPY frontend/routes ./routes
COPY frontend/services ./services
COPY frontend/utils ./utils

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend

# Copy package files first for better caching
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend .

# Stage 3: Production runtime image
FROM nginx:alpine AS production

# Install Node.js for backend runtime
RUN apk add --no-cache nodejs npm curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built frontend assets
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy backend application
COPY --from=backend-build /app/backend /app/backend

# Set proper ownership
RUN chown -R nodejs:nodejs /app/backend && \
    chown -R nodejs:nodejs /usr/share/nginx/html

# Create optimized Nginx configuration
RUN cat > /etc/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    server {
        listen 8899;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security: Hide nginx version
        server_tokens off;
        
        # Handle SPA routing
        location / {
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                add_header Vary Accept-Encoding;
            }
        }
        
        # API routes with proper proxy configuration
        location /api {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Timeout settings
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Health check endpoint
        location /health {
            proxy_pass http://localhost:3000/health;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Health check specific settings
            proxy_connect_timeout 5s;
            proxy_send_timeout 5s;
            proxy_read_timeout 5s;
        }
        
        # Security: Block access to sensitive files
        location ~ /\. {
            deny all;
        }
        
        location ~ \.(env|log|sql)$ {
            deny all;
        }
    }
}
EOF

# Create optimized startup script
RUN cat > /start.sh << 'EOF'
#!/bin/sh
set -e

# Function to handle graceful shutdown
cleanup() {
    echo "🛑 Shutting down gracefully..."
    kill -TERM $BACKEND_PID 2>/dev/null || true
    kill -TERM $NGINX_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $NGINX_PID 2>/dev/null || true
    echo "✅ Shutdown complete"
    exit 0
}

# Set up signal handlers
trap cleanup TERM INT

# Start backend as non-root user
echo "🚀 Starting backend application..."
cd /app/backend
su nodejs -c "node index.js" &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in $(seq 1 30); do
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Backend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start"
        exit 1
    fi
    sleep 1
done

# Start Nginx
echo "🌐 Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for processes
wait $BACKEND_PID $NGINX_PID
EOF

# Make startup script executable
RUN chmod +x /start.sh

# Create health check script
RUN cat > /healthcheck.sh << 'EOF'
#!/bin/sh
# Health check for the container
curl -f http://localhost:8899/health >/dev/null 2>&1 || exit 1
EOF

RUN chmod +x /healthcheck.sh

# Expose port
EXPOSE 8899

# Set health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

# Use non-root user for security
USER nodejs

# Start the application
CMD ["/start.sh"]