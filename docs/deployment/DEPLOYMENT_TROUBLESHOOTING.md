# Deployment Troubleshooting Guide

## 🚨 Current Issues

### 1. 404 Error on `/wastewise-30`
**Problem**: Application returns 404 when accessing `/wastewise-30`

**Solution**: 
- The application is now properly configured to be accessible at `/wastewise-30`
- Access the application at: `https://sheerstechnologies.com/wastewise-30`
- The nginx configuration properly routes `/wastewise-30` to the frontend container

### 2. Supabase Environment Variables Missing
**Problem**: Frontend shows "Supabase environment variables are not set!"

**Solution**: 
- Environment variables are now properly configured in Jenkinsfile
- Frontend container now receives:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `VITE_FRONTEND_URL`
  - `VITE_BACKEND_URL`

### 3. Stripe IntegrationError
**Problem**: "Missing value for Stripe(): apiKey should be a string"

**Solution**:
- Stripe publishable key is now passed to frontend as `VITE_STRIPE_PUBLISHABLE_KEY`
- Payment processing is disabled (`PAYMENT_PROCESSING_ENABLED="false"`)

## 🔧 Fixed Configuration

### Frontend Container Environment Variables
```bash
-e VITE_SUPABASE_URL="$VITE_SUPABASE_URL"
-e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY"
-e VITE_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY"
-e VITE_FRONTEND_URL="https://sheerstechnologies.com/wastewise-30"
-e VITE_BACKEND_URL="https://sheerstechnologies.com/wastewise-30/api"
```

### Backend Container Environment Variables
```bash
-e FRONTEND_URL="https://sheerstechnologies.com/wastewise-30"
-e CORS_ORIGIN="https://sheerstechnologies.com"
-e PAYMENT_PROCESSING_ENABLED="false"
```

## 📋 Access Information

### Correct URLs
- **Frontend**: `https://sheerstechnologies.com/wastewise-30`
- **Backend API**: `https://sheerstechnologies.com/wastewise-30/api`
- **Health Check**: `https://sheerstechnologies.com/wastewise-30/api/health`

### Container Names
- **Frontend**: `wastewise-frontend`
- **Backend**: `wastewise-backend`

## 🔍 Debugging Steps

### 1. Check Container Status
```bash
ssh basyir@192.168.20.215
docker ps
```

### 2. Check Container Logs
```bash
# Frontend logs
docker logs wastewise-frontend

# Backend logs
docker logs wastewise-backend
```

### 3. Check Environment Variables
```bash
# Frontend environment
docker exec wastewise-frontend env | grep VITE

# Backend environment
docker exec wastewise-backend env | grep -E "(STRIPE|SUPABASE|PAYMENT)"
```

### 4. Test Connectivity
```bash
# Test frontend
curl https://sheerstechnologies.com/wastewise-30

# Test backend
curl https://sheerstechnologies.com/wastewise-30/api/health
```

## 🚀 Deployment Commands

### Manual Deployment
```bash
# Pull latest images
docker pull basyir/wastewise-30-frontend:latest
docker pull basyir/wastewise-30-backend:latest

# Stop and remove existing containers
docker stop wastewise-frontend wastewise-backend
docker rm wastewise-frontend wastewise-backend

# Run with updated environment variables
docker run -d --name wastewise-frontend \
  -p 127.0.0.1:8080:8080 \
  --restart always \
  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  -e VITE_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
  -e VITE_FRONTEND_URL="https://sheerstechnologies.com/wastewise-30" \
  -e VITE_BACKEND_URL="https://sheerstechnologies.com/wastewise-30/api" \
  basyir/wastewise-30-frontend:latest

docker run -d --name wastewise-backend \
  -p 127.0.0.1:3000:3000 \
  --restart always \
  -e STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
  -e STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  -e FRONTEND_URL="https://sheerstechnologies.com/wastewise-30" \
  -e CORS_ORIGIN="https://sheerstechnologies.com" \
  -e PAYMENT_PROCESSING_ENABLED="false" \
  basyir/wastewise-30-backend:latest
```

## ✅ Expected Results

After deployment, you should see:
- ✅ Frontend accessible at `https://sheerstechnologies.com/wastewise-30`
- ✅ Backend API accessible at `https://sheerstechnologies.com/wastewise-30/api`
- ✅ No Supabase environment variable errors
- ✅ No Stripe integration errors
- ✅ Health check endpoint working

## 📞 Next Steps

1. **Deploy the updated Jenkinsfile**
2. **Access the application at the correct URL**
3. **Test the health check endpoint**
4. **Verify environment variables are set correctly**

---

**Last Updated**: $(date)
**Status**: Configuration updated to fix deployment issues
**Next Action**: Deploy updated Jenkinsfile 