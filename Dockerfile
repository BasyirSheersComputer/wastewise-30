# Multi-stage build for frontend and backend
FROM node:18-alpine AS base

# Frontend build stage
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Backend build stage
FROM base AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Copy backend
COPY --from=backend-build /app/backend ./backend

# Copy frontend build to nginx
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 3000

# Start both nginx and backend
COPY start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]