# Google Cloud Run Deployment Script for WasteWise (PowerShell)
# This script deploys both frontend and backend services to Google Cloud Run

param(
    [string]$ProjectId = "wastewise-30",
    [string]$Region = "us-central1",
    [string]$BackendService = "wastewise-backend",
    [string]$FrontendService = "wastewise-frontend"
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if gcloud is installed
    try {
        $null = Get-Command gcloud -ErrorAction Stop
    }
    catch {
        Write-Error "gcloud CLI is not installed. Please install it first."
        exit 1
    }
    
    # Check if Docker is installed
    try {
        $null = Get-Command docker -ErrorAction Stop
    }
    catch {
        Write-Error "Docker is not installed. Please install it first."
        exit 1
    }
    
    # Check if user is authenticated
    $authResult = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $authResult) {
        Write-Error "Not authenticated with gcloud. Please run 'gcloud auth login' first."
        exit 1
    }
    
    # Check if project is set
    $currentProject = gcloud config get-value project 2>$null
    if ($currentProject -ne $ProjectId) {
        Write-Warning "Current project is $currentProject, setting to $ProjectId"
        gcloud config set project $ProjectId
    }
    
    Write-Success "Prerequisites check passed"
}

# Enable required APIs
function Enable-APIs {
    Write-Info "Enabling required APIs..."
    
    $apis = @(
        "run.googleapis.com",
        "containerregistry.googleapis.com",
        "cloudbuild.googleapis.com",
        "secretmanager.googleapis.com",
        "logging.googleapis.com",
        "monitoring.googleapis.com"
    )
    
    foreach ($api in $apis) {
        $enabled = gcloud services list --enabled --filter="name:$api" --format="value(name)" 2>$null
        if (-not $enabled) {
            Write-Info "Enabling $api..."
            gcloud services enable $api
        }
        else {
            Write-Info "$api is already enabled"
        }
    }
    
    Write-Success "All required APIs are enabled"
}

# Build and push Docker images
function Build-AndPush-Images {
    Write-Info "Building and pushing Docker images..."
    
    # Build backend image
    Write-Info "Building backend image..."
    Set-Location backend
    docker build -t "gcr.io/$ProjectId/backend:latest" -f ../Dockerfile.backend .
    docker push "gcr.io/$ProjectId/backend:latest"
    Set-Location ..
    
    # Build frontend image
    Write-Info "Building frontend image..."
    Set-Location frontend
    docker build -t "gcr.io/$ProjectId/frontend:latest" -f ../Dockerfile.frontend .
    docker push "gcr.io/$ProjectId/frontend:latest"
    Set-Location ..
    
    Write-Success "Docker images built and pushed successfully"
}

# Deploy backend service
function Deploy-Backend {
    Write-Info "Deploying backend service..."
    
    gcloud run deploy $BackendService `
        --image "gcr.io/$ProjectId/backend:latest" `
        --platform managed `
        --region $Region `
        --allow-unauthenticated `
        --port 8080 `
        --memory 1Gi `
        --cpu 1 `
        --min-instances 1 `
        --max-instances 10 `
        --set-env-vars "NODE_ENV=production,PORT=8080" `
        --set-secrets "SUPABASE_URL=supabase-url:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,OPENAI_API_KEY=openai-api-key:latest,GOOGLE_GENAI_API_KEY=google-genai-key:latest,STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,JWT_SECRET=jwt-secret:latest"
    
    $backendUrl = gcloud run services describe $BackendService --region $Region --format="value(status.url)"
    Write-Success "Backend service deployed at: $backendUrl"
}

# Deploy frontend service
function Deploy-Frontend {
    Write-Info "Deploying frontend service..."
    
    # Get backend URL for API configuration
    $backendUrl = gcloud run services describe $BackendService --region $Region --format="value(status.url)"
    
    gcloud run deploy $FrontendService `
        --image "gcr.io/$ProjectId/frontend:latest" `
        --platform managed `
        --region $Region `
        --allow-unauthenticated `
        --port 8080 `
        --memory 512Mi `
        --cpu 500m `
        --min-instances 1 `
        --max-instances 5 `
        --set-env-vars "VITE_API_BASE_URL=$backendUrl" `
        --set-secrets "VITE_SUPABASE_URL=supabase-url:latest,VITE_SUPABASE_ANON_KEY=supabase-anon-key:latest,VITE_STRIPE_PUBLISHABLE_KEY=stripe-publishable-key:latest,VITE_TRIAL_PERIOD_DAYS=30"
    
    $frontendUrl = gcloud run services describe $FrontendService --region $Region --format="value(status.url)"
    Write-Success "Frontend service deployed at: $frontendUrl"
}

# Update CORS configuration
function Update-CORS {
    Write-Info "Updating CORS configuration..."
    
    $frontendUrl = gcloud run services describe $FrontendService --region $Region --format="value(status.url)"
    
    gcloud run services update $BackendService `
        --region $Region `
        --set-env-vars "CORS_ORIGIN=$frontendUrl"
    
    Write-Success "CORS configuration updated"
}

# Run health checks
function Test-Health {
    Write-Info "Running health checks..."
    
    $backendUrl = gcloud run services describe $BackendService --region $Region --format="value(status.url)"
    $frontendUrl = gcloud run services describe $FrontendService --region $Region --format="value(status.url)"
    
    # Check backend health
    try {
        $response = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend health check passed"
        }
        else {
            Write-Error "Backend health check failed with status code: $($response.StatusCode)"
            return 1
        }
    }
    catch {
        Write-Error "Backend health check failed: $($_.Exception.Message)"
        return 1
    }
    
    # Check frontend health
    try {
        $response = Invoke-WebRequest -Uri "$frontendUrl/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend health check passed"
        }
        else {
            Write-Error "Frontend health check failed with status code: $($response.StatusCode)"
            return 1
        }
    }
    catch {
        Write-Error "Frontend health check failed: $($_.Exception.Message)"
        return 1
    }
    
    Write-Success "All health checks passed"
}

# Display deployment information
function Show-DeploymentInfo {
    Write-Info "Deployment completed successfully!"
    Write-Host ""
    Write-Host "Service URLs:"
    Write-Host "  Backend:  $(gcloud run services describe $BackendService --region $Region --format="value(status.url)")"
    Write-Host "  Frontend: $(gcloud run services describe $FrontendService --region $Region --format="value(status.url)")"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Test the application by visiting the frontend URL"
    Write-Host "  2. Monitor the services in Google Cloud Console"
    Write-Host "  3. Set up custom domain (optional)"
    Write-Host "  4. Configure monitoring and alerting"
}

# Main deployment function
function Start-Deployment {
    Write-Info "Starting Google Cloud Run deployment for WasteWise..."
    
    Test-Prerequisites
    Enable-APIs
    Build-AndPush-Images
    Deploy-Backend
    Deploy-Frontend
    Update-CORS
    Test-Health
    Show-DeploymentInfo
    
    Write-Success "Deployment completed successfully!"
}

# Run main function
Start-Deployment
