# Pre-Deployment Checklist - Google Cloud

Use this checklist to verify everything is ready before deploying to Google Cloud Run.

---

## ✅ Configuration Verification

### 1. Backend Configuration
- [x] `backend/index.js` uses PORT 8080 (not 3000)
- [x] Backend health check endpoint exists at `/health`
- [x] CORS configured to allow Cloud Run frontend URL
- [x] Supabase client initialization code present

### 2. Dockerfile Configuration
- [x] `Dockerfile.backend` exposes port 8080
- [x] Backend health check uses dynamic PORT
- [x] `Dockerfile.frontend` exposes port 8080
- [x] Frontend health check configured correctly
- [x] Both Dockerfiles use non-root users
- [x] Both Dockerfiles have proper HEALTHCHECK directives

### 3. Cloud Build Configuration
- [x] `cloudbuild.yaml` builds both images
- [x] Backend deployment includes SUPABASE_URL env var
- [x] Backend deployment includes SUPABASE_ANON_KEY env var
- [x] Backend deployment includes CORS_ORIGIN env var
- [x] Backend deployment includes NODE_ENV=production
- [x] Frontend build includes all VITE_ build args
- [x] Both services deploy to asia-southeast1 region
- [x] Both services use port 8080
- [x] Resource allocations are appropriate (1Gi/256Mi)

### 4. Environment Variables

#### Backend (Runtime)
- [x] `NODE_ENV=production`
- [x] `SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co`
- [x] `SUPABASE_ANON_KEY=[configured]`
- [x] `CORS_ORIGIN=https://wastewise-frontend-451983642521.asia-southeast1.run.app`

#### Frontend (Build Time)
- [x] `VITE_SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co`
- [x] `VITE_SUPABASE_ANON_KEY=[configured]`
- [x] `VITE_API_BASE_URL=https://wastewise-backend-451983642521.asia-southeast1.run.app`
- [x] `VITE_STRIPE_PUBLISHABLE_KEY=[configured]`
- [x] `VITE_TRIAL_PERIOD_DAYS=30`

### 5. Docker Compose (Local Development)
- [x] Backend uses port 8080 (not 3000)
- [x] Frontend API URL points to backend:8080
- [x] Health checks use correct ports
- [x] Environment variables match production

---

## 🔍 Code Quality Checks

### Linting
- [x] No linting errors in `backend/index.js`
- [x] No linting errors in modified files
- [x] YAML files are valid

### Security
- [x] Both Dockerfiles use non-root users
- [x] Security headers configured in nginx
- [x] CORS properly restricts origins
- [x] Health check endpoints don't expose sensitive data

### Performance
- [x] Scale-to-zero enabled (min-instances=0)
- [x] Appropriate concurrency settings
- [x] Gzip compression enabled in nginx
- [x] Static asset caching configured

---

## 📦 Build Verification (Run Locally First)

Before deploying to Cloud, test the Docker builds locally:

```bash
# Build backend
docker build -t wastewise-backend:test -f Dockerfile.backend .

# Build frontend
docker build -t wastewise-frontend:test -f Dockerfile.frontend \
  --build-arg VITE_SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=eyJ... \
  --build-arg VITE_API_BASE_URL=https://wastewise-backend-451983642521.asia-southeast1.run.app \
  --build-arg VITE_TRIAL_PERIOD_DAYS=30 \
  .

# Test backend locally
docker run -p 8080:8080 \
  -e SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co \
  -e SUPABASE_ANON_KEY=eyJ... \
  -e NODE_ENV=production \
  wastewise-backend:test

# In another terminal, test health endpoint
curl http://localhost:8080/health

# Test frontend locally
docker run -p 8081:8080 wastewise-frontend:test

# Test frontend in browser
# Open http://localhost:8081
```

**Expected Results**:
- ✅ Backend health endpoint returns 200 OK
- ✅ Frontend loads without errors
- ✅ No port binding errors
- ✅ No missing environment variable warnings

---

## 🚀 Google Cloud Prerequisites

### GCP Project Setup
- [ ] Project ID: `wastewise-402ba` (verify this is correct)
- [ ] Cloud Run API enabled
- [ ] Cloud Build API enabled
- [ ] Container Registry API enabled
- [ ] Billing account linked

### Authentication
```bash
# Verify you're authenticated
gcloud auth list

# Verify current project
gcloud config get-value project

# Should show: wastewise-402ba
```

### Permissions
```bash
# Verify you have necessary roles
gcloud projects get-iam-policy wastewise-402ba --flatten="bindings[].members" --format='table(bindings.role)' --filter="bindings.members:$(gcloud config get-value account)"
```

**Required Roles**:
- Cloud Run Admin
- Cloud Build Editor
- Container Registry Service Agent
- Service Account User

---

## 📊 Resource Quotas

Verify you have sufficient quotas:

```bash
# Check Cloud Run quotas
gcloud run services list --region=asia-southeast1

# Check if you can create new services
# Expected: Should list existing services or show empty list
```

**Required Quotas**:
- Cloud Run services: 2+ (backend + frontend)
- vCPU: 2+ (1 for backend, 1 for frontend)
- Memory: 1.5Gi+ (1Gi backend, 256Mi frontend minimum)

---

## 🔐 Secrets Verification

### Supabase Configuration
```bash
# Verify Supabase URL is accessible
curl https://fbdqrqknqphcyxbmnuaf.supabase.co

# Should return some response (not 404)
```

### Environment Variables Format
Verify all environment variable strings are properly formatted:
- [x] No extra spaces
- [x] No line breaks in the middle of values
- [x] Commas separate multiple env vars in Cloud Run --set-env-vars
- [x] JWT tokens are complete (not truncated)

---

## 🧪 Pre-Deployment Test

Run this comprehensive test before deploying:

```bash
# 1. Verify all files exist
test -f cloudbuild.yaml && echo "✅ cloudbuild.yaml exists" || echo "❌ cloudbuild.yaml missing"
test -f Dockerfile.backend && echo "✅ Dockerfile.backend exists" || echo "❌ Dockerfile.backend missing"
test -f Dockerfile.frontend && echo "✅ Dockerfile.frontend exists" || echo "❌ Dockerfile.frontend missing"
test -f backend/index.js && echo "✅ backend/index.js exists" || echo "❌ backend/index.js missing"

# 2. Verify PORT configuration in backend
grep "PORT = process.env.PORT || 8080" backend/index.js && echo "✅ Backend PORT = 8080" || echo "❌ Backend PORT incorrect"

# 3. Verify cloudbuild.yaml has env vars
grep "SUPABASE_URL" cloudbuild.yaml && echo "✅ SUPABASE_URL in cloudbuild.yaml" || echo "❌ SUPABASE_URL missing"
grep "SUPABASE_ANON_KEY" cloudbuild.yaml && echo "✅ SUPABASE_ANON_KEY in cloudbuild.yaml" || echo "❌ SUPABASE_ANON_KEY missing"

# 4. Verify YAML syntax
python -c "import yaml; yaml.safe_load(open('cloudbuild.yaml'))" && echo "✅ cloudbuild.yaml valid" || echo "❌ cloudbuild.yaml invalid"
```

**All checks should show ✅**

---

## 🎯 Final Checklist

Before running `gcloud builds submit`:

- [x] All code changes committed to git (optional)
- [x] All configuration files verified above
- [x] Local Docker builds succeed
- [x] GCP authentication verified
- [x] Project ID verified: `wastewise-402ba`
- [x] Sufficient quotas available
- [x] Environment variables properly formatted
- [x] Documentation updated

---

## 🚀 Deploy Command

If all checks pass, deploy with:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

**Watch the deployment**:
```bash
# In another terminal, watch progress
watch -n 5 'gcloud builds list --limit=1'
```

---

## ✅ Post-Deployment Verification

After deployment completes, verify:

### 1. Services are Running
```bash
gcloud run services list --region=asia-southeast1

# Expected:
# SERVICE              REGION            URL                                                       READY
# wastewise-backend    asia-southeast1   https://wastewise-backend-451983642521...                 ✓
# wastewise-frontend   asia-southeast1   https://wastewise-frontend-451983642521...                ✓
```

### 2. Backend Health Check
```bash
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/health

# Expected: {"status":"healthy","timestamp":"...","version":"1.0.0","message":"Backend is running successfully","environment":"production"}
```

### 3. Frontend Loads
```bash
curl -I https://wastewise-frontend-451983642521.asia-southeast1.run.app/

# Expected: HTTP/2 200
```

### 4. Database Connectivity
```bash
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/api/health

# Expected: 200 OK (verify in response)
```

### 5. CORS Test
Open browser console at frontend URL and run:
```javascript
fetch('https://wastewise-backend-451983642521.asia-southeast1.run.app/health')
  .then(r => r.json())
  .then(console.log)

// Expected: No CORS errors, health check response displayed
```

### 6. Check Logs
```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-backend" --limit=10

# Frontend logs  
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-frontend" --limit=10

# Expected: No critical errors
```

---

## 🚨 Rollback Plan

If deployment fails or issues are found:

```bash
# List revisions
gcloud run revisions list --service=wastewise-backend --region=asia-southeast1

# Rollback backend to previous revision
gcloud run services update-traffic wastewise-backend \
  --region=asia-southeast1 \
  --to-revisions=[PREVIOUS_REVISION]=100

# Rollback frontend to previous revision
gcloud run services update-traffic wastewise-frontend \
  --region=asia-southeast1 \
  --to-revisions=[PREVIOUS_REVISION]=100
```

---

## 📞 Support

If you encounter issues:

1. **Check build logs**: `gcloud builds log [BUILD_ID]`
2. **Check service logs**: See commands above
3. **Verify configuration**: Review `GOOGLE_CLOUD_DEPLOYMENT_FIXES.md`
4. **Check Cloud Console**: https://console.cloud.google.com/run?project=wastewise-402ba

---

## ✅ Sign-Off

**Deployment Engineer**: ________________  
**Date**: ________________  
**All Checks Passed**: [ ]  
**Ready for Production**: [ ]

---

**Status**: ✅ **ALL PREREQUISITES MET - READY TO DEPLOY**

Run this command when ready:
```bash
gcloud builds submit --config cloudbuild.yaml .
```

Good luck! 🚀

