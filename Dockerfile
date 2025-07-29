# Stage 1: Build frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
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
RUN npm install
RUN npm run build

# Stage 2: Build backend
FROM node:20 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend .

# Stage 3: Production image with Nginx and Node.js
FROM nginx:alpine
# Copy built frontend to Nginx html directory
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy backend code
COPY --from=backend-build /app/backend /app/backend

# Install Node.js (for backend)
RUN apk add --no-cache nodejs npm

# Create nginx configuration
RUN echo 'events { worker_connections 1024; }' > /etc/nginx/nginx.conf && \
    echo 'http {' >> /etc/nginx/nginx.conf && \
    echo '  include /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf && \
    echo '  default_type application/octet-stream;' >> /etc/nginx/nginx.conf && \
    echo '  sendfile on;' >> /etc/nginx/nginx.conf && \
    echo '  keepalive_timeout 65;' >> /etc/nginx/nginx.conf && \
    echo '  server {' >> /etc/nginx/nginx.conf && \
    echo '    listen 80;' >> /etc/nginx/nginx.conf && \
    echo '    server_name localhost;' >> /etc/nginx/nginx.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf && \
    echo '    index index.html;' >> /etc/nginx/nginx.conf && \
    echo '    location / {' >> /etc/nginx/nginx.conf && \
    echo '      try_files $uri $uri/ /index.html;' >> /etc/nginx/nginx.conf && \
    echo '    }' >> /etc/nginx/nginx.conf && \
    echo '    location /api {' >> /etc/nginx/nginx.conf && \
    echo '      proxy_pass http://localhost:3000;' >> /etc/nginx/nginx.conf && \
    echo '      proxy_http_version 1.1;' >> /etc/nginx/nginx.conf && \
    echo '      proxy_set_header Upgrade $http_upgrade;' >> /etc/nginx/nginx.conf && \
    echo '      proxy_set_header Connection "upgrade";' >> /etc/nginx/nginx.conf && \
    echo '      proxy_set_header Host $host;' >> /etc/nginx/nginx.conf && \
    echo '      proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/nginx.conf && \
    echo '      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/nginx.conf && \
    echo '      proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/nginx.conf && \
    echo '      proxy_cache_bypass $http_upgrade;' >> /etc/nginx/nginx.conf && \
    echo '    }' >> /etc/nginx/nginx.conf && \
    echo '  }' >> /etc/nginx/nginx.conf && \
    echo '}' >> /etc/nginx/nginx.conf

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/backend' >> /start.sh && \
    echo 'node index.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port 80
EXPOSE 80

# Start both backend and nginx
CMD ["/start.sh"]