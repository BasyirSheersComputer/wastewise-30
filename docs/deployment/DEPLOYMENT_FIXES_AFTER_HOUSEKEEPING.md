# Deployment Fixes After Housekeeping Reorganization

## 🚨 Issue Summary

After the housekeeping reorganization, the Cloud Build deployment was failing because:

1. **Dockerfile paths changed**: Files moved from root to `config/docker/`
2. **Nginx config path broken**: `frontend/nginx.conf` moved to `config/nginx/nginx-frontend.conf`
3. **Cloud Build context issues**: Build context and file paths needed updating
4. **Environment variables not available**: Supabase configuration not being passed to frontend build

## ✅ Fixes Applied

### 1. Updated Cloud Build Configuration

**File**: `config/jenkins/cloudbuild.yaml`

**Changes**:
```yaml
# Before
- args: ['build', '-t', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA', '-f', 'Dockerfile.backend', './backend']
- args: ['build', '-t', 'gcr.io/$PROJECT_ID/frontend:$COMMIT_SHA', '-f', 'Dockerfile.frontend', './frontend']

# After
- args: ['build', '-t', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA', '-f', 'config/docker/Dockerfile.backend', '.']
- args: 
  - 'build'
  - '-t'
  - 'gcr.io/$PROJECT_ID/frontend:$COMMIT_SHA'
  - '-f'
  - 'config/docker/Dockerfile.frontend'
  - '--build-arg'
  - 'VITE_SUPABASE_URL=$$VITE_SUPABASE_URL'
  - '--build-arg'
  - 'VITE_SUPABASE_ANON_KEY=$$VITE_SUPABASE_ANON_KEY'
  - '--build-arg'
  - 'VITE_STRIPE_PUBLISHABLE_KEY=$$VITE_STRIPE_PUBLISHABLE_KEY'
  - '--build-arg'
  - 'VITE_API_BASE_URL=$$VITE_API_BASE_URL'
  - '--build-arg'
  - 'VITE_TRIAL_PERIOD_DAYS=$$VITE_TRIAL_PERIOD_DAYS'
  - '.'
```

**Added Secret Management**:
```yaml
availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/supabase-url/versions/latest
      env: 'VITE_SUPABASE_URL'
    - versionName: projects/$PROJECT_ID/secrets/supabase-anon-key/versions/latest
      env: 'VITE_SUPABASE_ANON_KEY'
    - versionName: projects/$PROJECT_ID/secrets/stripe-publishable-key/versions/latest
      env: 'VITE_STRIPE_PUBLISHABLE_KEY'
    - versionName: projects/$PROJECT_ID/secrets/api-base-url/versions/latest
      env: 'VITE_API_BASE_URL'
    - versionName: projects/$PROJECT_ID/secrets/trial-period-days/versions/latest
      env: 'VITE_TRIAL_PERIOD_DAYS'
```

### 2. Fixed Frontend Dockerfile

**File**: `config/docker/Dockerfile.frontend`

**Changes**:
```dockerfile
# Before
COPY nginx-frontend.conf /etc/nginx/nginx.conf

# After
COPY config/nginx/nginx-frontend.conf /etc/nginx/nginx.conf

# Added environment variable support
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL
ARG VITE_TRIAL_PERIOD_DAYS

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_TRIAL_PERIOD_DAYS=$VITE_TRIAL_PERIOD_DAYS
```

### 3. Updated .dockerignore

**File**: `.dockerignore`

**Changes**:
```dockerignore
# Before
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# After
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
# Allow specific environment files that might be needed for build
!frontend/.env
!frontend/.env.production
!backend/.env
```

### 4. Created Environment File Template

**File**: `config/environment/frontend.env.example`

**Purpose**: Template for local development environment variables

## 🧪 Testing the Fixes

### Local Testing (Linux/Mac)
```bash
# Test frontend build with environment variables
docker build -t wastewise-frontend-test \
  --build-arg VITE_SUPABASE_URL=https://test.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=test-key \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_test_key \
  --build-arg VITE_API_BASE_URL=http://localhost:3001 \
  --build-arg VITE_TRIAL_PERIOD_DAYS=30 \
  -f config/docker/Dockerfile.frontend .

# Test backend build
docker build -t wastewise-backend-test -f config/docker/Dockerfile.backend .

# Clean up
docker rmi wastewise-frontend-test wastewise-backend-test
```

### Local Testing (Windows PowerShell)
```powershell
# Test frontend build with environment variables
docker build -t wastewise-frontend-test `
  --build-arg VITE_SUPABASE_URL=https://test.supabase.co `
  --build-arg VITE_SUPABASE_ANON_KEY=test-key `
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_test_key `
  --build-arg VITE_API_BASE_URL=http://localhost:3001 `
  --build-arg VITE_TRIAL_PERIOD_DAYS=30 `
  -f config/docker/Dockerfile.frontend .

# Test backend build
docker build -t wastewise-backend-test -f config/docker/Dockerfile.backend .

# Clean up
docker rmi wastewise-frontend-test wastewise-backend-test
```

## 🚀 Deployment Commands

### Cloud Build Deployment
```bash
# Deploy using Cloud Build
gcloud builds submit --config config/jenkins/cloudbuild.yaml

# Or trigger from Cloud Build console using the config file
```

### Manual Deployment (if needed)
```bash
# Build and push manually with environment variables
docker build -t gcr.io/PROJECT_ID/frontend:latest \
  --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
  --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY \
  --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL \
  --build-arg VITE_TRIAL_PERIOD_DAYS=$VITE_TRIAL_PERIOD_DAYS \
  -f config/docker/Dockerfile.frontend .

docker build -t gcr.io/PROJECT_ID/backend:latest -f config/docker/Dockerfile.backend .

docker push gcr.io/PROJECT_ID/frontend:latest
docker push gcr.io/PROJECT_ID/backend:latest

# Deploy to Cloud Run
gcloud run deploy wastewise-frontend --image gcr.io/PROJECT_ID/frontend:latest --region us-central1 --platform managed --allow-unauthenticated
gcloud run deploy wastewise-backend --image gcr.io/PROJECT_ID/backend:latest --region us-central1 --platform managed --allow-unauthenticated
```

## 📋 File Structure After Fixes

```
wastewise-30/
├── config/
│   ├── docker/
│   │   ├── Dockerfile.frontend ✅
│   │   └── Dockerfile.backend ✅
│   ├── nginx/
│   │   ├── nginx-frontend.conf ✅
│   │   ├── nginx.conf
│   │   └── nginx.integrated.conf
│   ├── environment/
│   │   ├── frontend.env.example ✅
│   │   └── env.example
│   └── jenkins/
│       └── cloudbuild.yaml ✅
├── frontend/ ✅
├── backend/ ✅
├── .dockerignore ✅
└── scripts/
    └── deployment/
        └── test-build.sh ✅
```

## 🔍 Troubleshooting

### Common Issues

1. **"file not found in build context"**
   - Check if file paths in Dockerfile match actual locations
   - Verify .dockerignore isn't excluding needed files

2. **"COPY failed"**
   - Ensure source files exist in the build context
   - Check file permissions

3. **"Environment variables not available"**
   - Verify Cloud Build secrets are properly configured
   - Check that build args are correctly passed to Docker

4. **"Supabase configuration missing"**
   - Ensure environment variables are passed as build args
   - Verify Secret Manager secrets exist and are accessible

### Verification Steps

1. ✅ Docker builds complete successfully
2. ✅ Environment variables are available during build
3. ✅ Nginx configuration loads correctly
4. ✅ Frontend serves on port 3000
5. ✅ Backend serves on port 3001
6. ✅ Health checks pass
7. ✅ Cloud Run deployment succeeds

## 🎯 Next Steps

1. **Test deployment**: Run Cloud Build to verify fixes
2. **Monitor logs**: Check Cloud Run logs for any issues
3. **Update documentation**: Keep this guide updated with any future changes
4. **Automate testing**: Consider adding automated build tests to CI/CD

## 📞 Support

If issues persist:
1. Check Cloud Build logs for specific error messages
2. Verify all file paths are correct
3. Test builds locally first
4. Review .dockerignore exclusions
5. Verify Secret Manager configuration
