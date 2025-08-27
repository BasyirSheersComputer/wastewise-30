# Auto-Trigger Setup Guide for Google Cloud Build

This guide explains how to set up automatic deployment triggers for the WasteWise-30 application using Google Cloud Build and GitHub integration.

## Overview

The auto-trigger system provides:
- **Automatic builds** on every push to the main branch
- **Seamless deployment** to Google Cloud Run
- **Environment variable management** through Secret Manager
- **Multi-stage CI/CD pipeline** with testing and validation
- **GitHub Actions integration** for additional quality checks

## Architecture

```
GitHub Push → Cloud Build Trigger → Build & Test → Deploy to Cloud Run
     ↓              ↓                    ↓              ↓
  Main Branch   Auto-Trigger        Multi-Stage     Production
     ↓              ↓                    ↓              ↓
  Code Change   Build Pipeline      Validation      Live Services
```

## Prerequisites

### 1. Google Cloud Project
- Active Google Cloud project with billing enabled
- Project ID for configuration

### 2. GitHub Repository
- Repository connected to Google Cloud Build
- Admin access to repository settings

### 3. Local Setup
- Google Cloud CLI (gcloud) installed and authenticated
- Node.js 18+ for local development

## Quick Setup

### Step 1: Run Setup Script

**Linux/macOS:**
```bash
export PROJECT_ID=your-project-id
./scripts/setup-cloudbuild.sh
```

**Windows PowerShell:**
```powershell
.\scripts\setup-cloudbuild.ps1 -ProjectId "your-project-id"
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository settings
2. Navigate to Secrets and variables → Actions
3. Add the following secrets:
   - `GCP_SA_KEY`: Content of `github-cloudbuild-key.json`
   - `GCP_PROJECT_ID`: Your Google Cloud project ID

### Step 3: Update Secret Values

1. Go to Google Cloud Console → Secret Manager
2. Update each secret with your actual values:
   - `supabase-url`: Your Supabase project URL
   - `supabase-anon-key`: Your Supabase anonymous key
   - `jwt-secret`: Your JWT secret (32+ characters)
   - `gemini-api-key`: Your Google Gemini API key
   - `openai-api-key`: Your OpenAI API key
   - And other required secrets

### Step 4: Test the Setup

Push a change to the main branch:
```bash
git add .
git commit -m "Test auto-deployment"
git push origin main
```

## Configuration Files

### 1. Cloud Build Configuration (`cloudbuild.yaml`)

The main build configuration includes:
- Multi-stage Docker builds
- Environment variable injection
- Automated testing
- Cloud Run deployment
- Health checks and validation

### 2. GitHub Actions (`/.github/workflows/ci-cd.yml`)

Provides additional quality checks:
- Code linting and type checking
- Unit tests
- Security scanning
- Integration tests
- Deployment notifications

### 3. Build Scripts

- `scripts/setup-cloudbuild.sh` - Linux/macOS setup
- `scripts/setup-cloudbuild.ps1` - Windows PowerShell setup
- `scripts/build-docker.sh` - Local Docker builds
- `scripts/build-docker.ps1` - Windows Docker builds

## Build Pipeline Stages

### Stage 1: Code Quality
- Linting and type checking
- Security vulnerability scanning
- Code quality validation

### Stage 2: Build & Test
- Docker image building
- Unit test execution
- Integration test validation

### Stage 3: Deployment
- Push images to Container Registry
- Deploy to Cloud Run
- Configure environment variables
- Update CORS settings

### Stage 4: Validation
- Health check verification
- Smoke tests
- Service availability confirmation

## Environment Variables

### Frontend Build Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_TRIAL_PERIOD_DAYS`: Trial period duration

### Backend Runtime Variables
- `NODE_ENV`: Environment (production)
- `PORT`: Server port (3000)
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `JWT_SECRET`: JWT signing secret
- `GEMINI_API_KEY`: Google Gemini API key
- `OPENAI_API_KEY`: OpenAI API key

## Monitoring and Debugging

### 1. Build Logs
- View build logs: https://console.cloud.google.com/cloud-build/builds
- Filter by trigger name: `wastewise-auto-deploy`

### 2. Service Logs
- Backend logs: https://console.cloud.google.com/run/detail/asia-southeast1/wastewise-backend/logs
- Frontend logs: https://console.cloud.google.com/run/detail/asia-southeast1/wastewise-frontend/logs

### 3. GitHub Actions
- View workflow runs: https://github.com/basyirsheerscomputer/wastewise-30/actions

### 4. Service URLs
- Backend: `https://wastewise-backend-{PROJECT_ID}-as.a.run.app`
- Frontend: `https://wastewise-frontend-{PROJECT_ID}-as.a.run.app`

## Troubleshooting

### Common Issues

1. **Build Fails with Secret Errors**
   - Verify all secrets exist in Secret Manager
   - Check secret names match configuration
   - Ensure Cloud Build has access to secrets

2. **Deployment Fails**
   - Check Cloud Run service account permissions
   - Verify environment variables are set correctly
   - Review service logs for specific errors

3. **GitHub Trigger Not Working**
   - Verify repository connection in Cloud Build
   - Check trigger configuration
   - Ensure push is to main branch

4. **CORS Issues**
   - Verify CORS_ORIGIN is set correctly
   - Check frontend and backend URLs match
   - Review Cloud Run service configuration

### Debug Commands

```bash
# Check build triggers
gcloud builds triggers list

# View recent builds
gcloud builds list --limit=10

# Check service status
gcloud run services list

# View service logs
gcloud logs read "resource.type=cloud_run_revision" --limit=50
```

## Security Best Practices

### 1. Secret Management
- Use Secret Manager for all sensitive data
- Rotate secrets regularly
- Limit access to secrets

### 2. Service Accounts
- Use least privilege principle
- Create dedicated service accounts
- Regularly review permissions

### 3. Network Security
- Use HTTPS for all communications
- Configure proper CORS settings
- Implement rate limiting

### 4. Code Security
- Regular security scans
- Dependency vulnerability checks
- Code quality gates

## Performance Optimization

### 1. Build Optimization
- Use Docker layer caching
- Optimize Dockerfile instructions
- Use multi-stage builds

### 2. Deployment Optimization
- Configure appropriate resource limits
- Use auto-scaling policies
- Monitor performance metrics

### 3. Cost Optimization
- Use appropriate machine types
- Configure auto-scaling limits
- Monitor resource usage

## Free Tier Optimization

The configuration has been optimized to stay within Google Cloud's free tier limits:

### Cloud Run Free Tier Limits
- **2 million requests per month** (shared across all services)
- **360,000 vCPU-seconds per month**
- **180,000 GiB-seconds per month**
- **1 GB network egress per month**

### Current Configuration
- **Backend**: 512Mi memory, 0-2 instances, 1 vCPU
- **Frontend**: 256Mi memory, 0-2 instances, 1 vCPU
- **Min instances**: 0 (scales to zero when not in use)
- **Max instances**: 2 (prevents excessive scaling)

### Cost-Saving Features
- **Scale to zero**: Services stop when not in use
- **Optimized memory**: Minimal memory allocation
- **Limited instances**: Maximum 2 instances per service
- **Efficient builds**: Smaller build machines and disk space

### Monitoring Free Tier Usage
```bash
# Check Cloud Run usage
gcloud run services list --region=asia-southeast1

# Monitor billing
gcloud billing accounts list
gcloud billing projects describe $PROJECT_ID
```

## Advanced Configuration

### 1. Custom Domains
```bash
# Map custom domain to Cloud Run service
gcloud run domain-mappings create \
  --service=wastewise-frontend \
  --domain=your-domain.com \
  --region=asia-southeast1
```

### 2. SSL Certificates
- Cloud Run automatically provisions SSL certificates
- Custom domains require domain verification

### 3. Load Balancing
- Use Cloud Load Balancing for multiple regions
- Configure health checks
- Set up failover policies

## Maintenance

### 1. Regular Updates
- Update dependencies regularly
- Monitor for security patches
- Review and update secrets

### 2. Backup and Recovery
- Backup configuration files
- Document deployment procedures
- Test recovery procedures

### 3. Monitoring
- Set up alerting for failures
- Monitor resource usage
- Track performance metrics

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Cloud Build documentation
3. Check GitHub Actions logs
4. Contact the development team

## Next Steps

1. Complete the setup process
2. Test the auto-deployment
3. Configure monitoring and alerting
4. Set up custom domains (if needed)
5. Implement additional security measures
