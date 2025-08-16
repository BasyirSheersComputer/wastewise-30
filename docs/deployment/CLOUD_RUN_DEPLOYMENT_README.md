# Google Cloud Run Deployment Guide for WasteWise

This guide provides step-by-step instructions for deploying the WasteWise application to Google Cloud Run with separate containers for frontend and backend, connected to Supabase database.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Supabase     │
│   Container     │◄──►│   Container     │◄──►│    Database     │
│   (React)       │    │   (Node.js)     │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloud Run      │    │  Cloud Run      │    │  External       │
│  Frontend       │    │  Backend        │    │  Supabase       │
│  Service        │    │  Service        │    │  Service        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### 1. Google Cloud Account
- [ ] Create a Google Cloud account
- [ ] Create a new project: `wastewise-30`
- [ ] Enable billing for the project

### 2. Development Environment
- [ ] Install [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
- [ ] Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [ ] Install [Node.js](https://nodejs.org/) (v18 or later)

### 3. Authentication
```bash
# Login to Google Cloud
gcloud auth login

# Set the project
gcloud config set project wastewise-30

# Configure Docker for Google Cloud
gcloud auth configure-docker
```

## Quick Start

### 1. Setup Secrets
```bash
# Make the script executable
chmod +x scripts/setup-secrets.sh

# Run the secrets setup script
./scripts/setup-secrets.sh
```

### 2. Update Secret Values
After running the setup script, update the secrets with your actual values:

```bash
# Update Supabase URL
gcloud secrets versions add supabase-url --data-file=- <<< 'https://your-project.supabase.co'

# Update Supabase keys
gcloud secrets versions add supabase-anon-key --data-file=- <<< 'your_anon_key'
gcloud secrets versions add supabase-service-key --data-file=- <<< 'your_service_key'

# Update API keys
gcloud secrets versions add openai-api-key --data-file=- <<< 'your_openai_key'
gcloud secrets versions add google-genai-key --data-file=- <<< 'your_gemini_key'

# Update Stripe keys
gcloud secrets versions add stripe-secret-key --data-file=- <<< 'your_stripe_secret'
gcloud secrets versions add stripe-publishable-key --data-file=- <<< 'your_stripe_publishable'
gcloud secrets versions add stripe-webhook-secret --data-file=- <<< 'your_webhook_secret'

# Update JWT secret
gcloud secrets versions add jwt-secret --data-file=- <<< 'your_jwt_secret'
```

### 3. Deploy Application

#### Option A: Using Deployment Script (Recommended)
```bash
# Make the script executable
chmod +x scripts/deploy-cloud-run.sh

# Run the deployment script
./scripts/deploy-cloud-run.sh
```

#### Option B: Using PowerShell (Windows)
```powershell
# Run the PowerShell deployment script
.\scripts\deploy-cloud-run.ps1
```

#### Option C: Manual Deployment
```bash
# Build and push backend image
cd backend
docker build -t gcr.io/wastewise-30/backend:latest -f ../Dockerfile.backend .
docker push gcr.io/wastewise-30/backend:latest
cd ..

# Build and push frontend image
cd frontend
docker build -t gcr.io/wastewise-30/frontend:latest -f ../Dockerfile.frontend .
docker push gcr.io/wastewise-30/frontend:latest
cd ..

# Deploy backend service
gcloud run deploy wastewise-backend \
  --image gcr.io/wastewise-30/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --set-secrets SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,OPENAI_API_KEY=openai-api-key:latest,GOOGLE_GENAI_API_KEY=google-genai-key:latest,STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,JWT_SECRET=jwt-secret:latest

# Deploy frontend service
gcloud run deploy wastewise-frontend \
  --image gcr.io/wastewise-30/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 500m \
  --min-instances 1 \
  --max-instances 5 \
  --set-env-vars VITE_API_BASE_URL=https://wastewise-backend-xxxxx-uc.a.run.app \
  --set-secrets VITE_SUPABASE_URL=supabase-url:latest,VITE_SUPABASE_ANON_KEY=supabase-anon-key:latest,VITE_STRIPE_PUBLISHABLE_KEY=stripe-publishable-key:latest,VITE_TRIAL_PERIOD_DAYS=30
```

## Configuration Files

### Docker Configuration
- `Dockerfile.frontend` - Multi-stage build for React frontend
- `Dockerfile.backend` - Node.js backend container
- `nginx.conf` - Nginx configuration for frontend serving

### Cloud Run Configuration
- `backend-service.yaml` - Backend service configuration
- `frontend-service.yaml` - Frontend service configuration
- `cloudbuild.yaml` - CI/CD pipeline configuration

### Deployment Scripts
- `scripts/deploy-cloud-run.sh` - Bash deployment script
- `scripts/deploy-cloud-run.ps1` - PowerShell deployment script
- `scripts/setup-secrets.sh` - Secret Manager setup script

## Environment Variables

### Frontend Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://backend-service-url.run.app
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_TRIAL_PERIOD_DAYS=30
```

### Backend Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GENAI_API_KEY=your_google_genai_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://frontend-service-url.run.app
```

## Service URLs

After deployment, you'll get URLs like:
- **Backend**: `https://wastewise-backend-xxxxx-uc.a.run.app`
- **Frontend**: `https://wastewise-frontend-xxxxx-uc.a.run.app`

## Monitoring and Logging

### View Logs
```bash
# View backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-backend" --limit=50

# View frontend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-frontend" --limit=50
```

### Monitor Services
```bash
# List services
gcloud run services list --region=us-central1

# Get service details
gcloud run services describe wastewise-backend --region=us-central1
gcloud run services describe wastewise-frontend --region=us-central1
```

## Health Checks

Both services include health check endpoints:
- **Backend**: `https://backend-url/health`
- **Frontend**: `https://frontend-url/health`

## Scaling Configuration

### Backend Service
- **Min instances**: 1
- **Max instances**: 10
- **CPU**: 1 vCPU
- **Memory**: 1GB
- **Concurrency**: 80 requests per instance

### Frontend Service
- **Min instances**: 1
- **Max instances**: 5
- **CPU**: 500m vCPU
- **Memory**: 512MB
- **Concurrency**: 100 requests per instance

## Security

### Secrets Management
All sensitive data is stored in Google Cloud Secret Manager:
- API keys
- Database credentials
- JWT secrets
- Stripe keys

### CORS Configuration
Backend is configured to accept requests from:
- Frontend service URL
- Local development URLs
- Any Cloud Run service URL

### Network Security
- Services are deployed with public access (can be restricted with IAM)
- HTTPS is enforced
- Security headers are configured in nginx

## Cost Optimization

### Estimated Monthly Costs
- **Cloud Run**: $50-200/month (depending on usage)
- **Container Registry**: $5-20/month
- **Secret Manager**: $1-5/month
- **Monitoring**: $10-30/month

### Cost Optimization Tips
- Set appropriate min/max instances
- Monitor usage and adjust resources
- Use Cloud Run's pay-per-use model
- Implement proper caching strategies

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check Docker build logs
docker build -t test-image -f Dockerfile.backend ./backend

# Verify Dockerfile syntax
docker run --rm -v ${PWD}:/app -w /app hadolint/hadolint Dockerfile.backend
```

#### 2. Deployment Failures
```bash
# Check service status
gcloud run services describe wastewise-backend --region=us-central1

# View deployment logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-backend" --limit=10
```

#### 3. CORS Issues
```bash
# Update CORS configuration
FRONTEND_URL=$(gcloud run services describe wastewise-frontend --region us-central1 --format="value(status.url)")
gcloud run services update wastewise-backend --region us-central1 --set-env-vars CORS_ORIGIN=$FRONTEND_URL
```

#### 4. Secret Access Issues
```bash
# Verify secrets exist
gcloud secrets list

# Check secret versions
gcloud secrets versions list supabase-url
```

### Debug Commands
```bash
# Test backend locally
cd backend
docker build -t local-backend -f ../Dockerfile.backend .
docker run -p 8080:8080 --env-file .env.local local-backend

# Test frontend locally
cd frontend
docker build -t local-frontend -f ../Dockerfile.frontend .
docker run -p 3000:8080 --env-file .env.local local-frontend
```

## CI/CD Pipeline

### Automated Deployment
The `cloudbuild.yaml` file configures automated deployment:
1. Build Docker images
2. Push to Container Registry
3. Deploy to Cloud Run
4. Update CORS configuration
5. Run health checks

### Trigger Setup
```bash
# Create Cloud Build trigger
gcloud builds triggers create github \
  --repo-name=wastewise-30 \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## Custom Domain Setup

### 1. Map Custom Domain
```bash
# Map domain to frontend service
gcloud run domain-mappings create \
  --service wastewise-frontend \
  --domain your-domain.com \
  --region us-central1
```

### 2. SSL Certificate
SSL certificates are automatically provisioned by Google Cloud.

## Backup and Recovery

### Database Backup
- Supabase provides automatic backups
- Configure additional backup strategies in Supabase dashboard

### Application Backup
- Docker images are stored in Container Registry
- Service configurations are versioned
- Secrets are replicated across regions

## Support and Maintenance

### Regular Maintenance
- [ ] Monitor service performance
- [ ] Update dependencies regularly
- [ ] Review and rotate secrets
- [ ] Monitor costs and optimize

### Support Resources
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

## Next Steps

After successful deployment:
1. Test all application features
2. Set up monitoring and alerting
3. Configure custom domain (optional)
4. Set up CI/CD pipeline
5. Implement backup strategies
6. Plan for scaling

## Conclusion

This deployment provides a scalable, secure, and cost-effective solution for the WasteWise application. The containerized approach allows for independent scaling and deployment of frontend and backend services, while the connection to Supabase provides a robust and scalable database solution.

For additional support or questions, refer to the Google Cloud documentation or contact the development team.
