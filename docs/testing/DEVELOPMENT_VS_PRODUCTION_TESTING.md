# 🚀 Development vs Production Testing Guide

## Understanding the Issue

The 404 error you encountered is because you're trying to access the **development server** with the **production path**. Here's the difference:

### Development Environment
- **Vite Dev Server**: `http://localhost:5173/`
- **Purpose**: For development and testing
- **Base Path**: Not needed in development

### Production Environment  
- **Nginx Proxy**: `http://your-domain/wastewise-30/`
- **Purpose**: For production deployment
- **Base Path**: `/wastewise-30/` (configured in Vite)

## ✅ Correct Testing Methods

### Method 1: Development Testing (Recommended for Development)

1. **Start the development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Access the application**:
   ```
   http://localhost:5173/
   ```
   
   **Note**: Don't use `/wastewise-30/` in development!

### Method 2: Production Testing with Docker

1. **Build and run the production containers**:
   ```bash
   # From project root
   docker-compose -f config/docker/docker-compose.yml up --build
   ```

2. **Access the application**:
   ```
   http://localhost:8080/wastewise-30/
   ```

### Method 3: Production Testing with Integrated Setup

1. **Build and run the integrated containers**:
   ```bash
   # From project root
   docker-compose -f config/docker/docker-compose.integrated.yml up --build
   ```

2. **Access the application**:
   ```
   http://localhost/wastewise-30/
   ```

## 🔧 Why This Happens

### Vite Configuration
```typescript
// frontend/vite.config.ts
export default defineConfig({
  base: '/wastewise-30/',  // ← This is for PRODUCTION only
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

### Nginx Configuration (Production)
```nginx
# config/nginx/nginx.conf
location /wastewise-30/ {
    proxy_pass http://frontend_backend/;  # ← Handles the base path
    # ... other settings
}
```

## 🎯 Quick Test Commands

### Development Testing
```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend  
cd frontend && npm run dev

# Access: http://localhost:5173/
```

### Production Testing
```bash
# Build and run production containers
docker-compose -f config/docker/docker-compose.yml up --build

# Access: http://localhost:8080/wastewise-30/
```

## 🚨 Common Mistakes

### ❌ Wrong (Development)
```
http://localhost:5173/wastewise-30/  # ← 404 Error
```

### ✅ Correct (Development)
```
http://localhost:5173/  # ← Works
```

### ✅ Correct (Production)
```
http://your-domain/wastewise-30/  # ← Works
```

## 🔍 Troubleshooting

### If Development Server Returns 404

1. **Check if server is running**:
   ```bash
   curl http://localhost:5173/
   ```

2. **Check Vite logs**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Clear cache and restart**:
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

### If Production Returns 404

1. **Check container status**:
   ```bash
   docker ps | grep wastewise
   ```

2. **Check nginx logs**:
   ```bash
   docker logs wastewise-nginx
   ```

3. **Verify nginx configuration**:
   ```bash
   docker exec wastewise-nginx nginx -t
   ```

## 📋 Summary

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Development** | `http://localhost:5173/` | Development & testing |
| **Production** | `http://domain/wastewise-30/` | Live deployment |

**Remember**: The `/wastewise-30/` path is only for production deployment through nginx. In development, use the root path! 