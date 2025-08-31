# 🚀 WasteWise-30 Deployment with Nginx Integration

## 📋 **Updated Configuration Overview**

The Docker configuration has been updated to work seamlessly with your existing Nginx setup at `sheerstechnologies.com`.

## 🔧 **Key Changes Made**

### **1. Dockerfile Updates**
- **Port Change**: Container now listens on port `8080` (instead of 80)
- **Nginx Configuration**: Updated to handle `/wastewise-30/` path structure
- **Health Check**: Added dedicated health check endpoint
- **Static Assets**: Added caching for better performance

### **2. Jenkinsfile Updates**
- **Port Mapping**: Updated to `8080:8080` (host:container)
- **Health Check**: Updated to use correct port `8080`
- **Success Messages**: Added health check URL

## 🌐 **URL Structure**

### **Production URLs:**
- **Main Application**: `http://sheerstechnologies.com/wastewise-30/`
- **Direct Container**: `http://192.168.20.215:8080`
- **Health Check**: `http://192.168.20.215:8080/health`
- **API Endpoints**: `http://sheerstechnologies.com/wastewise-30/api/*`

### **Local Development URLs:**
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/health`

## 🔄 **Deployment Flow**

### **1. Nginx Configuration (Already in place)**
```nginx
# WasteWise-30 app served at /wastewise-30
location /wastewise-30/ {
    proxy_pass http://127.0.0.1:8080/;
    rewrite ^/wastewise-30/(.*)$ /$1 break;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### **2. Docker Container Configuration**
```dockerfile
# Container listens on port 8080
EXPOSE 8080

# Nginx configuration inside container
server {
    listen 8080;
    # ... rest of configuration
}
```

### **3. Jenkins Pipeline**
```bash
# Container deployment
docker run -d --name wastewise-30 \
  -p 8080:8080 \
  --restart always \
  --health-cmd "curl -f http://localhost:8080/ || exit 1" \
  basyir/wastewise-30:latest
```

## 🚀 **Deployment Commands**

### **Manual Deployment:**
```bash
# Build the image
docker build -t basyir/wastewise-30:latest .

# Run the container
docker run -d --name wastewise-30 \
  -p 8080:8080 \
  --restart always \
  basyir/wastewise-30:latest

# Check status
docker ps | grep wastewise-30
```

### **Automated Deployment (Jenkins):**
```bash
# The Jenkins pipeline will automatically:
# 1. Build the Docker image
# 2. Push to Docker Hub
# 3. Deploy to production server
# 4. Run health checks
```

## 🏥 **Health Checks**

### **Container Health Check:**
```bash
# Direct container access
curl -f http://192.168.20.215:8080/health

# Through Nginx proxy
curl -f http://sheerstechnologies.com/wastewise-30/health
```

### **Application Health Check:**
```bash
# Backend API health
curl -f http://192.168.20.215:8080/api/health

# Frontend accessibility
curl -f http://sheerstechnologies.com/wastewise-30/
```

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Port Conflicts**
```bash
# Check if port 8080 is already in use
netstat -tulpn | grep 8080

# Stop conflicting container
docker stop <container-name>
```

#### **2. Nginx Proxy Issues**
```bash
# Check Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### **3. Container Health Issues**
```bash
# Check container logs
docker logs wastewise-30

# Check container status
docker ps -a | grep wastewise-30

# Restart container
docker restart wastewise-30
```

### **Debug Commands:**
```bash
# Test container directly
curl -v http://192.168.20.215:8080/

# Test through Nginx
curl -v http://sheerstechnologies.com/wastewise-30/

# Check container health
docker exec wastewise-30 curl -f http://localhost:8080/health
```

## 📊 **Monitoring**

### **Container Monitoring:**
```bash
# View container stats
docker stats wastewise-30

# Check resource usage
docker exec wastewise-30 top

# Monitor logs
docker logs -f wastewise-30
```

### **Application Monitoring:**
```bash
# Health check script
#!/bin/bash
echo "🔍 Checking WasteWise-30 health..."
curl -f http://192.168.20.215:8080/health && echo "✅ Container OK" || echo "❌ Container failed"
curl -f http://sheerstechnologies.com/wastewise-30/ && echo "✅ Nginx proxy OK" || echo "❌ Nginx proxy failed"
```

## 🎯 **Success Indicators**

### **✅ Deployment Success:**
- Container running on port 8080
- Health check endpoint responding
- Nginx proxy working correctly
- Application accessible via domain
- API endpoints functional

### **✅ Application Features:**
- Dashboard loading correctly
- AI recommendations working
- Waste tracking functional
- Menu management operational
- Analytics displaying data

## 🔄 **Update Process**

### **1. Code Changes:**
```bash
# Make your changes
git add .
git commit -m "Update feature"
git push origin main
```

### **2. Jenkins Pipeline:**
- Automatically triggers on push
- Builds new Docker image
- Deploys to production
- Runs health checks

### **3. Verification:**
```bash
# Check deployment status
curl -f http://sheerstechnologies.com/wastewise-30/

# Verify new features
# Test application functionality
```

## 🏆 **Deployment Summary**

### **✅ Configuration Complete:**
- Docker container configured for port 8080
- Nginx proxy set up for `/wastewise-30/` path
- Jenkins pipeline updated for new configuration
- Health checks configured
- Monitoring in place

### **✅ Ready for Production:**
- Application accessible at `http://sheerstechnologies.com/wastewise-30/`
- Direct container access at `http://192.168.20.215:8080`
- Health monitoring active
- Automated deployment pipeline ready

**🎉 Your WasteWise-30 application is now properly configured for production deployment!** 