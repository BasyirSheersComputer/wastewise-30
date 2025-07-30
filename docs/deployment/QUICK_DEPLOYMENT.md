# 🚀 Quick Docker Deployment Guide

## ⚡ One-Command Deployment

```bash
# Run the automated deployment script
./deploy-all.sh

# For clean deployment (removes old data)
./deploy-all.sh --clean
```

## 📋 Manual Deployment Steps

### 1. **Prerequisites**
```bash
# Ensure Docker is running
docker --version
docker-compose --version
```

### 2. **Environment Setup**
```bash
# Copy environment template
cp env.example backend/.env
cp env.example data-platform/.env

# Edit with your API keys
# backend/.env and data-platform/.env
```

### 3. **Build Images**
```bash
# Build main application
docker build -t wastewise-30:latest .

# Build data platform
cd data-platform
docker build -t wastewise-data-platform:latest .
cd ..
```

### 4. **Deploy Services**
```bash
# Start all services
docker-compose up -d --build

# Check status
docker-compose ps
```

### 5. **Verify Deployment**
```bash
# Health checks
curl http://localhost/health
curl http://localhost:4000/health

# View logs
docker-compose logs -f
```

## 🌐 Application URLs

- **Main Application**: http://localhost
- **Direct Container**: http://localhost:8899
- **Data Platform**: http://localhost:4000
- **Health Check**: http://localhost/health

## 🛠️ Management Commands

```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs [service-name]

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Access container shell
docker-compose exec wastewise-app sh
docker-compose exec data-platform sh
docker-compose exec postgres psql -U postgres -d wastewise

# Check resource usage
docker stats
```

## 🔧 Troubleshooting

### Common Issues:

1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **API key errors**: Check `.env` files
3. **Database connection**: Check postgres logs
4. **Memory issues**: Increase Docker memory limit

### Debug Commands:

```bash
# View all logs
docker-compose logs

# Check specific service
docker-compose logs wastewise-app
docker-compose logs data-platform
docker-compose logs postgres

# Rebuild specific service
docker-compose up -d --build wastewise-app

# Check health endpoints
curl -v http://localhost/health
curl -v http://localhost:4000/health
```

## 📊 Monitoring

### Health Check Script:
```bash
# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "🔍 Checking system health..."
curl -f http://localhost/health && echo "✅ Main app OK" || echo "❌ Main app failed"
curl -f http://localhost:4000/health && echo "✅ Data platform OK" || echo "❌ Data platform failed"
docker-compose exec postgres pg_isready -U postgres && echo "✅ Database OK" || echo "❌ Database failed"
docker-compose exec redis redis-cli ping && echo "✅ Redis OK" || echo "❌ Redis failed"
EOF

chmod +x health-check.sh
./health-check.sh
```

## 🎯 Success Indicators

- ✅ All containers show "Up" status
- ✅ Health endpoints return 200 OK
- ✅ Application accessible via browser
- ✅ Database connection successful
- ✅ Redis connection successful

## 🚀 Production Deployment

For production, consider:

1. **SSL/HTTPS**: Configure SSL certificates
2. **Load Balancing**: Use multiple instances
3. **Monitoring**: Set up proper monitoring
4. **Backups**: Configure automated backups
5. **Security**: Review security settings

```bash
# Production deployment with SSL
./deploy-all.sh --production
```

Your WasteWise system is now ready for production use! 🎉 