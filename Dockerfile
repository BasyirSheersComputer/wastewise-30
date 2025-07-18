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

# Expose port 80
EXPOSE 80

# Start both backend and nginx
CMD ["sh", "-c", "node /app/backend/index.js & nginx -g 'daemon off;'"]