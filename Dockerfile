<<<<<<< HEAD
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
=======
# Stage 1: Build frontend
FROM node:20 AS frontend-build
WORKDIR /app
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY index.html ./
COPY ./src ./src
RUN npm install
RUN npm run build

# Stage 2: Build backend
FROM node:20 AS backend-build
WORKDIR /app/backend
COPY ./backend/package*.json ./
RUN npm install
COPY ./backend .

# Stage 3: Production image with Nginx and Node.js
FROM nginx:alpine
# Copy built frontend to Nginx html directory
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy backend code
COPY --from=backend-build /app/backend /app/backend

# Install Node.js (for backend)
RUN apk add --no-cache nodejs npm
>>>>>>> f7924341dde2cf06c089e4b07f8654bf575ec654

# Install nginx for serving frontend
RUN apk add --no-cache nginx

<<<<<<< HEAD
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
=======
# Start both backend and nginx
CMD ["sh", "-c", "node /app/backend/index.js & nginx -g 'daemon off;'"]
>>>>>>> f7924341dde2cf06c089e4b07f8654bf575ec654
