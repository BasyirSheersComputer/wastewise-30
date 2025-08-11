# 🔧 Nginx Configuration Fix for /wastewise-30/ Path

## Problem
The WasteWise-30 application was returning a 404 error when accessed at `domainname/wastewise-30/` despite having the correct Vite base path configuration.

## Root Cause
The nginx configuration was only set up to handle requests at the root path `/` and didn't have a specific location block for the `/wastewise-30/` path.

## Solution Applied

### 1. Updated Main Nginx Configuration (`config/nginx/nginx.conf`)
Added a new location block to handle `/wastewise-30/` requests:

```nginx
# Handle /wastewise-30/ path
location /wastewise-30/ {
    proxy_pass http://frontend_backend/;
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
```

### 2. Updated Integrated Nginx Configuration (`config/nginx/nginx.integrated.conf`)
Added a new location block for the integrated setup:

```nginx
# Handle /wastewise-30/ path
location /wastewise-30/ {
    proxy_pass http://wastewise-frontend/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 3. Updated Frontend Nginx Configuration (`config/nginx/nginx-frontend.conf`)
Added a new location block for static file serving:

```nginx
# Handle /wastewise-30/ path
location /wastewise-30/ {
    try_files $uri $uri/ /index.html;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }
}
```

## Key Changes Explained

1. **Proxy Pass with Trailing Slash**: Using `proxy_pass http://frontend_backend/;` (with trailing slash) ensures that the `/wastewise-30/` path is stripped when forwarding to the frontend container.

2. **Maintained API Routes**: The `/api` location blocks remain unchanged, so API calls from the frontend will continue to work correctly.

3. **SPA Routing Support**: The frontend nginx configuration includes `try_files $uri $uri/ /index.html;` to handle client-side routing.

## Verification Steps

1. **Restart Nginx Container**:
   ```bash
   docker restart wastewise-nginx
   ```

2. **Test the Application**:
   - Access: `http://your-domain/wastewise-30/`
   - Should load the application without 404 errors
   - API calls should work correctly
   - Client-side routing should function properly

3. **Check Nginx Logs**:
   ```bash
   docker logs wastewise-nginx
   ```

## Expected Behavior

- ✅ Application loads at `domainname/wastewise-30/`
- ✅ Static assets (JS, CSS, images) load correctly
- ✅ API calls to `/api/*` work properly
- ✅ Client-side routing functions correctly
- ✅ WebSocket connections work (if applicable)

## Configuration Files Updated

- `config/nginx/nginx.conf`
- `config/nginx/nginx.integrated.conf`
- `config/nginx/nginx-frontend.conf`

## Notes

- The Vite configuration already had the correct `base: '/wastewise-30/'` setting
- API routes remain at `/api` and are handled by nginx routing
- The solution maintains backward compatibility with root path access
- All nginx configurations now support the `/wastewise-30/` path

## Troubleshooting

If the application still returns 404:

1. **Check Container Status**:
   ```bash
   docker ps | grep wastewise
   ```

2. **Verify Nginx Configuration**:
   ```bash
   docker exec wastewise-nginx nginx -t
   ```

3. **Check Application Logs**:
   ```bash
   docker logs wastewise-frontend
   docker logs wastewise-backend
   ```

4. **Test Direct Access**:
   ```bash
   curl -I http://localhost:3000/
   curl -I http://localhost:3001/health
   ``` 