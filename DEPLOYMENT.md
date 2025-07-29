# WasteWise-30 Deployment Documentation

## 🌐 Application URLs

### Public Access
- **Main Application**: http://sheerstechnologies.com/wastewise-30/
- **Domain**: sheerstechnologies.com
- **Path**: /wastewise-30/

### Direct Container Access
- **Container URL**: http://192.168.20.215:8899
- **Server IP**: 192.168.20.215
- **Container Port**: 8899

## 🏗️ Infrastructure Setup

### Nginx Configuration
The application is served through nginx with the following configuration:

```nginx
server {
    listen 80;
    server_name sheerstechnologies.com www.sheerstechnologies.com;

    # WasteWise-30 app served at /wastewise-30
    location /wastewise-30/ {
        proxy_pass http://127.0.0.1:8899/;
        rewrite ^/wastewise-30/(.*)$ /$1 break;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Container
- **Container Name**: wastewise-30
- **Image**: basyir/wastewise-30
- **Port Mapping**: 8899:80
- **Restart Policy**: always

## 🚀 CI/CD Pipeline

### Pipeline Stages
1. **Checkout Source** - Get latest code from Git
2. **Validate Project Structure** - Verify required files exist
3. **Install Dependencies** - Install frontend and backend dependencies (parallel)
4. **Lint and Test** - Run code quality checks (parallel)
5. **Build Docker Image** - Create production Docker image
6. **Test Docker Image** - Verify container works correctly
7. **Push to DockerHub** - Upload image to registry
8. **Deploy to Production** - Deploy to Ubuntu server
9. **Health Check** - Verify deployment success

### Trigger Conditions
- **Branch**: main
- **Trigger**: Automatic on every push
- **Credentials**: 
  - `vm-ssh-key` - SSH access to production server
  - `dockerhub-creds` - DockerHub credentials

## 🔧 Deployment Commands

### Check Container Status
```bash
# SSH to production server
ssh basyir@192.168.20.215

# Check if container is running
docker ps | grep wastewise-30

# View container logs
docker logs wastewise-30

# Access container shell
docker exec -it wastewise-30 sh
```

### Test Application
```bash
# Test container directly
curl http://192.168.20.215:8899

# Test through nginx proxy
curl http://sheerstechnologies.com/wastewise-30/
```

### Monitor Deployment
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check container health
docker logs -f wastewise-30
```

## 📊 Monitoring and Troubleshooting

### Health Check URLs
- **Container Health**: http://192.168.20.215:8899
- **Public Health**: http://sheerstechnologies.com/wastewise-30/

### Common Issues

#### Container Not Starting
```bash
# Check container logs
docker logs wastewise-30

# Check if port is in use
netstat -tulpn | grep 8899

# Restart container
docker restart wastewise-30
```

#### Nginx Proxy Issues
```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### Application Not Accessible
```bash
# Check if container is running
docker ps | grep wastewise-30

# Check container port mapping
docker port wastewise-30

# Test local connectivity
curl http://127.0.0.1:8899
```

## 🔄 Update Process

### Manual Update
```bash
# Pull latest image
docker pull basyir/wastewise-30:latest

# Stop current container
docker stop wastewise-30

# Remove old container
docker rm wastewise-30

# Start new container
docker run -d --name wastewise-30 \
  -p 8899:80 \
  --restart always \
  basyir/wastewise-30:latest
```

### Automatic Update (CI/CD)
1. Push changes to `main` branch
2. Jenkins pipeline automatically triggers
3. New Docker image is built and pushed
4. Container is automatically updated on production server

## 📈 Performance Monitoring

### Container Metrics
```bash
# Check container resource usage
docker stats wastewise-30

# Check container disk usage
docker system df
```

### Application Metrics
- **Response Time**: Monitor through nginx access logs
- **Error Rate**: Check nginx error logs and container logs
- **Uptime**: Monitor container restart frequency

## 🔐 Security Considerations

### Network Security
- Container runs on internal port 8899
- External access only through nginx proxy
- SSL termination handled by nginx (if configured)

### Container Security
- Non-root user in container
- Minimal attack surface with Alpine Linux base
- Regular security updates through CI/CD

## 📝 Logs and Debugging

### Container Logs
```bash
# View real-time logs
docker logs -f wastewise-30

# View last 100 lines
docker logs --tail 100 wastewise-30

# View logs with timestamps
docker logs -t wastewise-30
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Logs
```bash
# Access application logs inside container
docker exec -it wastewise-30 sh
# Then check logs in /app/backend/logs/ or similar
```

## 🎯 Quick Reference

### URLs
- **Production**: http://sheerstechnologies.com/wastewise-30/
- **Direct**: http://192.168.20.215:8899
- **Jenkins**: http://your-jenkins-server/job/your-pipeline-name/

### Commands
```bash
# Deploy manually
ssh basyir@192.168.20.215 "docker pull basyir/wastewise-30:latest && docker restart wastewise-30"

# Check status
ssh basyir@192.168.20.215 "docker ps | grep wastewise-30"

# View logs
ssh basyir@192.168.20.215 "docker logs wastewise-30"
```

### Environment Variables
- `IMAGE_NAME`: basyir/wastewise-30
- `REMOTE_HOST`: 192.168.20.215
- `REMOTE_USER`: basyir
- `CONTAINER_NAME`: wastewise-30
- `CONTAINER_PORT`: 8899 