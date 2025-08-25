# WasteWise Container Deployment Guide

## Overview
This guide provides step-by-step instructions for building and deploying the WasteWise frontend and backend containers to Google Cloud Run.

## Prerequisites

### 1. Install Required Tools
- **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)
- **Google Cloud SDK**: [Install here](https://cloud.google.com/sdk/docs/install)
- **Node.js 18+**: [Download here](https://nodejs.org/)

### 2. Authentication
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

## Environment Variables Setup

### Frontend Environment Variables
Create a `.env` file in the frontend directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_STRIPE_PRICING_TABLE_ID=prctbl_your_pricing_table_id

# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Trial Configuration
VITE_TRIAL_PERIOD_DAYS=30
```

### Backend Environment Variables
Create a `.env` file in the backend directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Application Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://sheerstechnologies.com
```

## Building Containers

### Option 1: Using PowerShell Script (Windows)
```powershell
# Run the build script
.\scripts\build-containers.ps1
```

### Option 2: Manual Build Commands

#### Build Backend Container
```bash
docker build -f Dockerfile.backend -t basyir/wastewise-30-backend:latest .
```

#### Build Frontend Container
```bash
docker build -f Dockerfile.frontend \
  --build-arg VITE_SUPABASE_URL=https://your-project-url.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key-here \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key \
  --build-arg VITE_API_BASE_URL=http://localhost:3000 \
  --build-arg VITE_TRIAL_PERIOD_DAYS=30 \
  -t basyir/wastewise-30-frontend:latest .
```

## Testing Containers Locally

### Using Docker Compose
```bash
# Start both services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Testing
```bash
# Test backend
docker run -p 3000:3000 --env-file backend/.env basyir/wastewise-30-backend:latest

# Test frontend
docker run -p 8899:8899 basyir/wastewise-30-frontend:latest
```

## Deploying to Google Cloud Run

### Option 1: Using PowerShell Script (Windows)
```powershell
# Update PROJECT_ID in the script first
.\scripts\deploy-to-cloud-run.ps1
```

### Option 2: Manual Deployment

#### 1. Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

#### 2. Push Images to Container Registry
```bash
# Tag images for Google Container Registry
docker tag basyir/wastewise-30-backend:latest gcr.io/YOUR_PROJECT_ID/wastewise-backend:latest
docker tag basyir/wastewise-30-frontend:latest gcr.io/YOUR_PROJECT_ID/wastewise-frontend:latest

# Push images
docker push gcr.io/YOUR_PROJECT_ID/wastewise-backend:latest
docker push gcr.io/YOUR_PROJECT_ID/wastewise-frontend:latest
```

#### 3. Deploy Backend
```bash
gcloud run deploy wastewise-backend \
  --image gcr.io/YOUR_PROJECT_ID/wastewise-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "PORT=3000" \
  --set-env-vars "CORS_ORIGIN=https://sheerstechnologies.com"
```

#### 4. Deploy Frontend
```bash
# Get backend URL first
BACKEND_URL=$(gcloud run services describe wastewise-backend --region=us-central1 --format="value(status.url)")

gcloud run deploy wastewise-frontend \
  --image gcr.io/YOUR_PROJECT_ID/wastewise-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8899 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 5 \
  --set-env-vars "VITE_API_BASE_URL=$BACKEND_URL"
```

## Environment Variables in Production

### Using Google Secret Manager
```bash
# Create secrets
echo "your-supabase-url" | gcloud secrets create wastewise-supabase-url --data-file=-
echo "your-supabase-key" | gcloud secrets create wastewise-supabase-anon-key --data-file=-
echo "your-gemini-key" | gcloud secrets create wastewise-gemini-api-key --data-file=-

# Update services to use secrets
gcloud run services update wastewise-backend \
  --update-secrets VITE_SUPABASE_URL=wastewise-supabase-url:latest \
  --update-secrets VITE_SUPABASE_ANON_KEY=wastewise-supabase-anon-key:latest \
  --update-secrets GEMINI_API_KEY=wastewise-gemini-api-key:latest
```

## Troubleshooting

### Common Issues

#### 1. Docker Desktop Not Running
- Start Docker Desktop application
- Wait for it to fully initialize
- Verify with `docker --version`

#### 2. Environment Variables Not Set
- Ensure `.env` files exist in both frontend and backend directories
- Check that all required variables are defined
- Verify variable names match exactly (case-sensitive)

#### 3. Build Failures
- Check Node.js version (requires 18+)
- Ensure all dependencies are installed
- Verify file paths in Dockerfiles

#### 4. Runtime Errors
- Check container logs: `docker logs <container-name>`
- Verify environment variables are passed correctly
- Check network connectivity between services

### Health Checks
```bash
# Backend health check
curl http://localhost:3000/health

# Frontend health check
curl http://localhost:8899/health
```

## Monitoring and Logging

### View Logs
```bash
# Cloud Run logs
gcloud logs read --service=wastewise-backend --limit=50
gcloud logs read --service=wastewise-frontend --limit=50

# Docker logs
docker logs wastewise-backend
docker logs wastewise-frontend
```

### Set Up Monitoring
```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create alerting policies (optional)
# Configure in Google Cloud Console
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Secrets Management**: Use Google Secret Manager for production secrets
3. **Network Security**: Configure proper CORS settings
4. **Container Security**: Regularly update base images
5. **Access Control**: Use IAM roles and service accounts

## Performance Optimization

1. **Container Size**: Use multi-stage builds to reduce image size
2. **Caching**: Implement proper caching strategies
3. **Scaling**: Configure appropriate min/max instances
4. **CDN**: Use Cloud CDN for static assets

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review container logs
3. Verify environment configuration
4. Test locally before deploying

## Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Set up monitoring and alerting
3. Implement CI/CD pipeline
4. Configure backup strategies
5. Set up development/staging environments
