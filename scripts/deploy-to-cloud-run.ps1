# Deploy to Google Cloud Run Script for WasteWise
# This script deploys the built containers to Google Cloud Run

Write-Host "Deploying WasteWise to Google Cloud Run..." -ForegroundColor Green

# Configuration
$PROJECT_ID = "your-project-id"  # Replace with your actual project ID
$REGION = "us-central1"
$BACKEND_SERVICE = "wastewise-backend"
$FRONTEND_SERVICE = "wastewise-frontend"

# Check if gcloud is installed and authenticated
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Google Cloud SDK (gcloud) is not installed" -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
$authStatus = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $authStatus) {
    Write-Host "ERROR: Not authenticated with Google Cloud" -ForegroundColor Red
    Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Set project
Write-Host "Setting project to: $PROJECT_ID" -ForegroundColor Blue
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "Enabling required APIs..." -ForegroundColor Blue
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Deploy Backend
Write-Host "Deploying Backend to Cloud Run..." -ForegroundColor Blue
gcloud run deploy $BACKEND_SERVICE `
    --image basyir/wastewise-30-backend:latest `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 3000 `
    --memory 1Gi `
    --cpu 1 `
    --max-instances 10 `
    --set-env-vars "NODE_ENV=production" `
    --set-env-vars "PORT=3000" `
    --set-env-vars "CORS_ORIGIN=https://sheerstechnologies.com"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    exit 1
}

# Get backend URL
$BACKEND_URL = gcloud run services describe $BACKEND_SERVICE --region=$REGION --format="value(status.url)"

# Deploy Frontend
Write-Host "Deploying Frontend to Cloud Run..." -ForegroundColor Blue
gcloud run deploy $FRONTEND_SERVICE `
    --image basyir/wastewise-30-frontend:latest `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 8899 `
    --memory 512Mi `
    --cpu 1 `
    --max-instances 5 `
    --set-env-vars "VITE_API_BASE_URL=$BACKEND_URL"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

# Get frontend URL
$FRONTEND_URL = gcloud run services describe $FRONTEND_SERVICE --region=$REGION --format="value(status.url)")

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "Backend: $BACKEND_URL" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure custom domain (optional)" -ForegroundColor White
Write-Host "2. Set up environment variables in Secret Manager" -ForegroundColor White
Write-Host "3. Configure monitoring and logging" -ForegroundColor White
