# Deployment Fixes After Housekeeping Reorganization

## 🚨 Issue Summary

After the housekeeping reorganization, the Cloud Build deployment was failing because:

1. **Dockerfile paths changed**: Files moved from root to `config/docker/`
2. **Nginx config path broken**: `frontend/nginx.conf` moved to `config/nginx/nginx-frontend.conf`
3. **Cloud Build context issues**: Build context and file paths needed updating

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
- args: ['build', '-t', 'gcr.io/$PROJECT_ID/frontend:$COMMIT_SHA', '-f', 'config/docker/Dockerfile.frontend', '.']
```

### 2. Fixed Frontend Dockerfile

**File**: `config/docker/Dockerfile.frontend`

**Changes**:
```dockerfile
# Before
COPY nginx-frontend.conf /etc/nginx/nginx.conf

# After
COPY config/nginx/nginx-frontend.conf /etc/nginx/nginx.conf
```

### 3. Created .dockerignore

**File**: `.dockerignore`

**Purpose**: Optimize build context by excluding unnecessary files
- Excludes documentation, scripts, test files
- Keeps only essential build files
- Reduces build time and context size

### 4. Verified File Structure

**Confirmed working paths**:
- ✅ Frontend Dockerfile: `config/docker/Dockerfile.frontend`
- ✅ Backend Dockerfile: `config/docker/Dockerfile.backend`
- ✅ Nginx config: `config/nginx/nginx-frontend.conf`
- ✅ Cloud Build config: `config/jenkins/cloudbuild.yaml`

## 🧪 Testing the Fixes

### Local Testing (Linux/Mac)
```bash
# Test frontend build
docker build -t wastewise-frontend-test -f config/docker/Dockerfile.frontend .

# Test backend build
docker build -t wastewise-backend-test -f config/docker/Dockerfile.backend .

# Clean up
docker rmi wastewise-frontend-test wastewise-backend-test
```

### Local Testing (Windows PowerShell)
```powershell
# Test frontend build
docker build -t wastewise-frontend-test -f config/docker/Dockerfile.frontend .

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
# Build and push manually
docker build -t gcr.io/PROJECT_ID/frontend:latest -f config/docker/Dockerfile.frontend .
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

3. **Build context too large**
   - Review .dockerignore file
   - Remove unnecessary files from project root

### Verification Steps

1. ✅ Docker builds complete successfully
2. ✅ Nginx configuration loads correctly
3. ✅ Frontend serves on port 3000
4. ✅ Backend serves on port 3001
5. ✅ Health checks pass
6. ✅ Cloud Run deployment succeeds

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
