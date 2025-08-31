# 🐳 Docker-Focused Deployment Architecture

## 🎯 **Architecture Principle**

**Jenkins = CI/CD Orchestration Only**
**Docker = All Deployment & Runtime Operations**

## 📋 **Separation of Concerns**

### **Jenkins Responsibilities (CI/CD Only):**
- ✅ **Code Validation**: Project structure, linting, testing
- ✅ **Dependency Management**: Install dependencies in Docker containers
- ✅ **Docker Image Building**: Build application Docker images
- ✅ **Image Testing**: Test Docker images locally
- ✅ **Image Publishing**: Push images to Docker Hub
- ✅ **Deployment Orchestration**: Trigger Docker deployment commands
- ✅ **Deployment Verification**: Verify deployment success

### **Docker Responsibilities (All Runtime Operations):**
- ✅ **Application Runtime**: Run the application
- ✅ **Process Management**: Start, stop, restart containers
- ✅ **Health Monitoring**: Container health checks
- ✅ **Resource Management**: CPU, memory, disk usage
- ✅ **Network Management**: Port mapping, networking
- ✅ **Data Persistence**: Volumes, data management
- ✅ **Service Discovery**: Container communication
- ✅ **Scaling**: Horizontal and vertical scaling

## 🚀 **Updated Pipeline Flow**

```
Git Push → GitHub Webhook → Jenkins CI/CD → Docker Build → Docker Deploy → Docker Runtime
```

### **Jenkins CI/CD Stages:**
1. **Validate Project Structure** ✅
2. **Install Dependencies** (Docker containers) ✅
3. **Lint and Test** (Docker containers) ✅
4. **Build Docker Image** ✅
5. **Test Docker Image** ✅
6. **Push to DockerHub** ✅
7. **Deploy with Docker** (Orchestrate Docker commands) ✅
8. **Verify Deployment** (Check Docker container health) ✅

## 🐳 **Docker Deployment Commands**

### **Production Deployment:**
```bash
# Pull latest image
docker pull basyir/wastewise-30:latest

# Stop existing container
docker stop wastewise-30 || true
docker rm wastewise-30 || true

# Deploy new container
docker run -d \
  --name wastewise-30 \
  -p 8080:8080 \
  --restart always \
  --health-cmd "curl -f http://localhost:8080/ || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  basyir/wastewise-30:latest
```

### **Container Management:**
```bash
# Check container status
docker ps | grep wastewise-30

# View container logs
docker logs wastewise-30

# Restart container
docker restart wastewise-30

# Stop container
docker stop wastewise-30

# Remove container
docker rm wastewise-30

# Check container health
docker inspect wastewise-30 --format="{{.State.Health.Status}}"
```

### **Image Management:**
```bash
# List images
docker images | grep wastewise-30

# Remove old images
docker image prune -f

# Pull latest image
docker pull basyir/wastewise-30:latest

# Build image locally
docker build -t wastewise-30:latest .
```

## 🔧 **Docker Compose Alternative**

For more complex deployments, consider using Docker Compose:

### **docker-compose.yml:**
```yaml
version: '3.8'
services:
  wastewise-app:
    image: basyir/wastewise-30:latest
    container_name: wastewise-30
    ports:
      - "8080:8080"
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 10s
      retries: 3
    environment:
      - NODE_ENV=production
    volumes:
      - app-logs:/app/logs
      - app-data:/app/data

volumes:
  app-logs:
  app-data:
```

### **Docker Compose Commands:**
```bash
# Deploy with Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f wastewise-app

# Restart service
docker-compose restart wastewise-app

# Stop and remove
docker-compose down

# Update and redeploy
docker-compose pull
docker-compose up -d
```

## 📊 **Monitoring and Health Checks**

### **Container Health Monitoring:**
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"

# Monitor resource usage
docker stats wastewise-30

# Check container logs
docker logs -f wastewise-30

# Inspect container details
docker inspect wastewise-30
```

### **Application Health Checks:**
```bash
# Health endpoint
curl -f http://192.168.20.215:8080/health

# Main application
curl -f http://192.168.20.215:8080/

# API endpoint
curl -f http://192.168.20.215:8080/api
```

## 🔄 **Automated Deployment Scripts**

### **deploy.sh (Production):**
```bash
#!/bin/bash
set -e

IMAGE_NAME="basyir/wastewise-30"
CONTAINER_NAME="wastewise-30"
PORT="8080"

echo "🚀 Deploying WasteWise-30..."

# Pull latest image
echo "📥 Pulling latest image..."
docker pull $IMAGE_NAME:latest

# Stop existing container
echo "🛑 Stopping existing container..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

# Deploy new container
echo "🚀 Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:8080 \
  --restart always \
  --health-cmd "curl -f http://localhost:8080/ || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  $IMAGE_NAME:latest

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
timeout 60 bash -c 'until docker inspect $CONTAINER_NAME --format="{{.State.Health.Status}}" | grep -q healthy; do sleep 2; done' || echo "Container started but health check pending"

# Verify deployment
echo "✅ Verifying deployment..."
curl -f http://localhost:$PORT/health || exit 1

echo "🎉 Deployment completed successfully!"
echo "🌐 Application: http://sheerstechnologies.com/wastewise-30/"
echo "🔗 Direct: http://192.168.20.215:$PORT"
```

### **rollback.sh (Emergency Rollback):**
```bash
#!/bin/bash
set -e

IMAGE_NAME="basyir/wastewise-30"
CONTAINER_NAME="wastewise-30"
PREVIOUS_TAG="previous"

echo "🔄 Rolling back WasteWise-30..."

# Stop current container
echo "🛑 Stopping current container..."
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

# Deploy previous version
echo "🚀 Deploying previous version..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 8080:8080 \
  --restart always \
  --health-cmd "curl -f http://localhost:8080/ || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  $IMAGE_NAME:$PREVIOUS_TAG

echo "✅ Rollback completed!"
```

## 🛡️ **Security Best Practices**

### **Docker Security:**
```bash
# Run container as non-root user
docker run -d --user 1000:1000 --name wastewise-30 ...

# Use read-only root filesystem
docker run -d --read-only --name wastewise-30 ...

# Limit container resources
docker run -d --memory=512m --cpus=1 --name wastewise-30 ...

# Use specific image tags (not latest)
docker run -d --name wastewise-30 basyir/wastewise-30:v1.2.3
```

### **Network Security:**
```bash
# Use custom network
docker network create wastewise-network
docker run -d --network wastewise-network --name wastewise-30 ...

# Expose only necessary ports
docker run -d -p 8080:8080 --name wastewise-30 ...
```

## 📈 **Scaling with Docker**

### **Horizontal Scaling:**
```bash
# Scale to multiple containers
docker run -d --name wastewise-30-1 -p 8080:8080 basyir/wastewise-30:latest
docker run -d --name wastewise-30-2 -p 8900:8080 basyir/wastewise-30:latest
docker run -d --name wastewise-30-3 -p 8901:8080 basyir/wastewise-30:latest
```

### **Load Balancing:**
```nginx
# Nginx configuration for multiple containers
upstream wastewise_backend {
    server 192.168.20.215:8080;
    server 192.168.20.215:8900;
    server 192.168.20.215:8901;
}

location /wastewise-30/ {
    proxy_pass http://wastewise_backend/;
    # ... other proxy settings
}
```

## 🎯 **Benefits of Docker-Focused Architecture**

### **✅ Jenkins Benefits:**
- **Lightweight**: No runtime dependencies on Jenkins server
- **Focused**: Jenkins only handles CI/CD orchestration
- **Scalable**: Can easily add more Jenkins agents
- **Maintainable**: Clear separation of concerns

### **✅ Docker Benefits:**
- **Consistent**: Same environment across development and production
- **Isolated**: Applications run in isolated containers
- **Portable**: Easy to move between environments
- **Scalable**: Easy horizontal and vertical scaling
- **Reliable**: Built-in health checks and restart policies

### **✅ Operational Benefits:**
- **Easy Rollbacks**: Just switch to previous Docker image
- **Zero Downtime**: Deploy new container before stopping old one
- **Resource Efficiency**: Better resource utilization
- **Monitoring**: Rich container metrics and logs
- **Security**: Container isolation and security features

## 🚀 **Next Steps**

### **1. Implement Docker Compose:**
- Create `docker-compose.yml` for production
- Add environment-specific configurations
- Implement proper logging and monitoring

### **2. Add Monitoring:**
- Set up container monitoring (Prometheus, Grafana)
- Implement log aggregation (ELK stack)
- Add alerting for container failures

### **3. Implement Blue-Green Deployment:**
- Deploy new version alongside old version
- Switch traffic when new version is healthy
- Rollback capability for failed deployments

### **4. Add Security Scanning:**
- Scan Docker images for vulnerabilities
- Implement image signing
- Add runtime security monitoring

**🎉 This Docker-focused architecture ensures Jenkins stays lightweight and focused on CI/CD, while Docker handles all deployment and runtime operations efficiently!** 