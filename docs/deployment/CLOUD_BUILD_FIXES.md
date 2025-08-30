# Cloud Build Fixes Summary

## Issues Resolved

### 1. Frontend Docker Build Failure
**Problem**: Cloud Build was failing with error `COPY failed: file not found in build context or excluded by .dockerignore: stat frontend/nginx.conf: file does not exist`

**Root Cause**: The Dockerfile was trying to copy `frontend/nginx.conf` but the actual file is located at `frontend/config/nginx.conf`

**Fix**: Updated both Dockerfiles to use the correct path:
- `Dockerfile.frontend`: Changed `COPY frontend/nginx.conf` to `COPY frontend/config/nginx.conf`
- `config/docker/Dockerfile.frontend`: Changed `COPY config/nginx/nginx-frontend.conf` to `COPY frontend/config/nginx.conf`

### 2. Backend Port Mismatch
**Problem**: Backend Dockerfile was exposing port 3001 but Cloud Build expected port 8080

**Fix**: Updated `config/docker/Dockerfile.backend` to:
- Change `EXPOSE 3001` to `EXPOSE 8080`
- Update health check URLs from `localhost:3001` to `localhost:8080`
- Update startup script health checks to use port 8080

### 3. Frontend Port Mismatch
**Problem**: Frontend Dockerfile was exposing port 3000 but Cloud Build expected port 8080

**Fix**: Updated `config/docker/Dockerfile.frontend` to:
- Change `EXPOSE 3000` to `EXPOSE 8080`
- Update health check URLs from `localhost:3000` to `localhost:8080`

### 4. Hardcoded Backend URL
**Problem**: Cloud Build configuration had a hardcoded backend URL in frontend environment variables

**Fix**: Updated `config/jenkins/cloudbuild.yaml` to:
- Make frontend deployment use dynamic backend URL
- Get backend URL from deployed service and pass it to frontend environment variables

## Files Modified

1. **Dockerfile.frontend** (root level)
   - Fixed nginx.conf path: `frontend/nginx.conf` → `frontend/config/nginx.conf`

2. **config/docker/Dockerfile.frontend**
   - Fixed nginx.conf path: `config/nginx/nginx-frontend.conf` → `frontend/config/nginx.conf`
   - Fixed port: `EXPOSE 3000` → `EXPOSE 8080`
   - Fixed health check: `localhost:3000` → `localhost:8080`

3. **config/docker/Dockerfile.backend**
   - Fixed port: `EXPOSE 3001` → `EXPOSE 8080`
   - Fixed health checks: `localhost:3001` → `localhost:8080`

4. **config/jenkins/cloudbuild.yaml**
   - Made frontend deployment use dynamic backend URL instead of hardcoded value

## Testing

Created test scripts to verify builds work locally:
- `scripts/test-docker-builds.sh` (Linux/Mac)
- `scripts/test-docker-builds.ps1` (Windows)

## Verification Steps

1. Run the test script to verify local builds work:
   ```bash
   # Linux/Mac
   ./scripts/test-docker-builds.sh
   
   # Windows
   .\scripts\test-docker-builds.ps1
   ```

2. Trigger Cloud Build to verify remote builds work:
   ```bash
   gcloud builds submit --config config/jenkins/cloudbuild.yaml
   ```

## Expected Results

After these fixes:
- ✅ Frontend Docker build should complete successfully
- ✅ Backend Docker build should complete successfully
- ✅ Both containers should deploy to Cloud Run on port 8080
- ✅ Frontend should be able to communicate with backend using dynamic URLs
- ✅ Health checks should work correctly on port 8080

## Notes

- The backend application correctly uses `process.env.PORT || 3000`, so it will automatically use port 8080 when deployed
- The frontend nginx configuration is set to listen on port 8080
- All health checks and startup scripts now use the correct ports
- CORS configuration will be set up dynamically between frontend and backend services

