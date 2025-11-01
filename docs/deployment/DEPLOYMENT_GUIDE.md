# WasteWise Cloud Run Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the WasteWise application using the simplified Google Cloud Build and Cloud Run approach.

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

### Frontend Environment Variables (aligned with cloudbuild.yaml)
Create a `.env` file in the frontend directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# API Configuration (aligned with cloudbuild.yaml)
VITE_API_BASE_URL=https://wastewise-backend-your-project-id-as.a.run.app

# Trial Configuration (aligned with cloudbuild.yaml)
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
CORS_ORIGIN=https://wastewise-frontend-your-project-id-as.a.run.app
```

## Google Cloud Setup

### 1. Enable Required APIs
```bash
# Enable required services
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Set Up Secret Manager
```bash
# Create secrets for frontend
echo "your-supabase-url" | gcloud secrets create wastewise-30-secret --data-file=-
echo "your-supabase-anon-key" | gcloud secrets create wastewise-30-secret --data-file=-
echo "your-stripe-publishable-key" | gcloud secrets create wastewise-30-secret --data-file=-

# Create secrets for backend
echo "your-backend-secrets" | gcloud secrets create wastewise-30-secret-backend --data-file=-
```

## Deployment Options

### Option 1: Cloud Build (Recommended)
```bash
# Deploy using the simplified cloudbuild.yaml
gcloud builds submit --config cloudbuild.yaml

# Or trigger via GitHub push
git push origin main
```

### Option 2: Manual Cloud Run Deployment
```bash
# Use the deployment script
./scripts/deploy-cloud-run.sh
```

### Option 3: Local Development
```bash
# Start services locally
docker-compose up -d

# Check status
docker-compose ps
```

## Building Containers (Local Development)

### Build Backend Container
```bash
docker build -f Dockerfile.backend -t wastewise-backend:latest .
```

### Build Frontend Container (aligned with cloudbuild.yaml)
```bash
docker build -f Dockerfile.frontend \
  --build-arg VITE_SUPABASE_URL=https://your-project-url.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key-here \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key \
  --build-arg VITE_API_BASE_URL=https://wastewise-backend-your-project-id-as.a.run.app \
  --build-arg VITE_TRIAL_PERIOD_DAYS=30 \
  -t wastewise-frontend:latest .
```

## Testing

### Local Testing
```bash
# Test backend health
curl http://localhost:3000/health

# Test frontend
curl http://localhost:8080/
```

### Production Testing
```bash
# Test backend health (aligned with cloudbuild.yaml smoke tests)
curl -f --retry 3 --retry-delay 10 https://wastewise-backend-your-project-id-as.a.run.app/health

# Test frontend (aligned with cloudbuild.yaml smoke tests)
curl -f --retry 3 --retry-delay 10 https://wastewise-frontend-your-project-id-as.a.run.app/
```

## Service URLs

### Production URLs (Asia Southeast Region)
- **Frontend**: `https://wastewise-frontend-{PROJECT_ID}-as.a.run.app`
- **Backend API**: `https://wastewise-backend-{PROJECT_ID}-as.a.run.app`
- **Health Check**: `https://wastewise-backend-{PROJECT_ID}-as.a.run.app/health`

### Local Development URLs
- **Frontend**: `http://localhost:8080/`
- **Backend API**: `http://localhost:3000/`
- **Health Check**: `http://localhost:3000/health`

## Configuration Details

### Cloud Build Configuration
The `cloudbuild.yaml` file defines:
- **Build stages**: Backend and frontend image building
- **Deployment stages**: Cloud Run service deployment
- **Health checks**: Smoke tests using curl
- **Secret management**: Google Secret Manager integration
- **30-day trial period**: Built into frontend configuration

### Service Configuration
- **Backend**: Port 3000, 512Mi memory, 1 CPU
- **Frontend**: Port 8080, 256Mi memory, 1 CPU
- **Region**: Asia Southeast (asia-southeast1)
- **Authentication**: Unauthenticated access enabled

## Troubleshooting

### Common Issues
1. **Build failures**: Check Dockerfile syntax and build args
2. **Deployment failures**: Verify Cloud Run permissions and API enablement
3. **Health check failures**: Ensure services are responding on correct ports
4. **Secret access issues**: Verify Secret Manager permissions

### Logs and Monitoring
```bash
# View Cloud Build logs
gcloud builds log [BUILD_ID]

# View Cloud Run logs
gcloud logs read --service=wastewise-backend
gcloud logs read --service=wastewise-frontend
```

## Next Steps
- Set up custom domain mapping
- Configure monitoring and alerting
- Set up automated backups
- Implement CI/CD pipeline with GitHub integration
