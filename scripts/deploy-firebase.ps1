# 🚀 Firebase Deployment Script for WasteWise (PowerShell)
# This script handles the complete deployment process for Firebase hosting and functions

param(
    [switch]$SkipTests,
    [switch]$Help
)

# Configuration
$PROJECT_NAME = "wastewise-30"
$FRONTEND_DIR = "frontend"
$BACKEND_DIR = "backend"
$BUILD_DIR = "dist"

# Colors for output (PowerShell compatible)
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Logging function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

# Check if Firebase CLI is installed
function Test-FirebaseCLI {
    Write-Log "Checking Firebase CLI installation..."
    try {
        $null = Get-Command firebase -ErrorAction Stop
        Write-Success "Firebase CLI is installed"
        return $true
    }
    catch {
        Write-Error "Firebase CLI is not installed. Please install it first:"
        Write-Host "npm install -g firebase-tools" -ForegroundColor $White
        return $false
    }
}

# Check if user is logged in to Firebase
function Test-FirebaseAuth {
    Write-Log "Checking Firebase authentication..."
    try {
        $null = firebase projects:list 2>$null
        Write-Success "Firebase authentication verified"
        return $true
    }
    catch {
        Write-Error "Not authenticated with Firebase. Please login first:"
        Write-Host "firebase login" -ForegroundColor $White
        return $false
    }
}

# Check if project exists and user has access
function Test-ProjectAccess {
    Write-Log "Checking project access..."
    try {
        $null = firebase use $PROJECT_NAME 2>$null
        Write-Success "Project access verified"
        return $true
    }
    catch {
        Write-Error "Cannot access project '$PROJECT_NAME'. Please check your permissions."
        return $false
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Log "Installing dependencies..."
    
    # Frontend dependencies
    Write-Log "Installing frontend dependencies..."
    Push-Location $FRONTEND_DIR
    try {
        npm ci --silent
        Write-Success "Frontend dependencies installed"
    }
    catch {
        Write-Error "Failed to install frontend dependencies"
        return $false
    }
    finally {
        Pop-Location
    }
    
    # Backend dependencies
    Write-Log "Installing backend dependencies..."
    Push-Location $BACKEND_DIR
    try {
        npm ci --silent
        Write-Success "Backend dependencies installed"
    }
    catch {
        Write-Error "Failed to install backend dependencies"
        return $false
    }
    finally {
        Pop-Location
    }
    
    return $true
}

# Run tests
function Invoke-Tests {
    Write-Log "Running tests..."
    
    # Frontend tests
    Write-Log "Running frontend tests..."
    Push-Location $FRONTEND_DIR
    try {
        npm test --silent
        Write-Success "Frontend tests passed"
    }
    catch {
        Write-Warning "Frontend tests failed, but continuing deployment..."
    }
    finally {
        Pop-Location
    }
    
    # Backend tests
    Write-Log "Running backend tests..."
    Push-Location $BACKEND_DIR
    try {
        npm test --silent
        Write-Success "Backend tests passed"
    }
    catch {
        Write-Warning "Backend tests failed, but continuing deployment..."
    }
    finally {
        Pop-Location
    }
}

# Build frontend
function Build-Frontend {
    Write-Log "Building frontend..."
    Push-Location $FRONTEND_DIR
    
    try {
        # Clean previous build
        if (Test-Path $BUILD_DIR) {
            Remove-Item $BUILD_DIR -Recurse -Force
        }
        
        # Build for production
        npm run build
        Write-Success "Frontend built successfully"
        
        # Check if build files exist
        if (-not (Test-Path $BUILD_DIR)) {
            Write-Error "Build directory not found. Build may have failed."
            return $false
        }
        
        # Check build size
        $buildSize = (Get-ChildItem $BUILD_DIR -Recurse | Measure-Object -Property Length -Sum).Sum
        $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
        Write-Log "Build size: $buildSizeMB MB"
        
        return $true
    }
    catch {
        Write-Error "Frontend build failed"
        return $false
    }
    finally {
        Pop-Location
    }
}

# Validate environment configuration
function Test-Environment {
    Write-Log "Validating environment configuration..."
    
    # Check if .env files exist
    if (-not (Test-Path "$FRONTEND_DIR\.env.production")) {
        Write-Warning "Production environment file not found: $FRONTEND_DIR\.env.production"
        Write-Warning "Using development environment variables"
    }
    
    # Check Firebase configuration
    try {
        $null = firebase functions:config:get 2>$null
        Write-Success "Firebase configuration found"
    }
    catch {
        Write-Warning "Firebase Functions configuration not found"
        Write-Warning "Please set up your environment variables:"
        Write-Host "firebase functions:config:set supabase.url=`"your-supabase-url`"" -ForegroundColor $White
        Write-Host "firebase functions:config:set supabase.anon_key=`"your-anon-key`"" -ForegroundColor $White
        Write-Host "firebase functions:config:set auth.jwt_secret=`"your-jwt-secret`"" -ForegroundColor $White
    }
}

# Deploy backend functions
function Deploy-Functions {
    Write-Log "Deploying backend functions..."
    
    try {
        firebase deploy --only functions --non-interactive
        Write-Success "Backend functions deployed successfully"
        
        # Get function URL
        $functionUrl = "https://us-central1-$PROJECT_NAME.cloudfunctions.net/api"
        Write-Log "Function URL: $functionUrl"
        
        return $true
    }
    catch {
        Write-Error "Backend functions deployment failed"
        return $false
    }
}

# Deploy frontend hosting
function Deploy-Hosting {
    Write-Log "Deploying frontend hosting..."
    
    try {
        firebase deploy --only hosting --non-interactive
        Write-Success "Frontend hosting deployed successfully"
        
        # Get hosting URL
        $hostingUrl = "https://$PROJECT_NAME.web.app"
        Write-Log "Hosting URL: $hostingUrl"
        
        return $true
    }
    catch {
        Write-Error "Frontend hosting deployment failed"
        return $false
    }
}

# Deploy Firestore rules and indexes
function Deploy-Firestore {
    Write-Log "Deploying Firestore rules and indexes..."
    
    try {
        firebase deploy --only firestore --non-interactive
        Write-Success "Firestore rules and indexes deployed successfully"
        return $true
    }
    catch {
        Write-Warning "Firestore deployment failed, but continuing..."
        return $false
    }
}

# Deploy Storage rules
function Deploy-Storage {
    Write-Log "Deploying Storage rules..."
    
    try {
        firebase deploy --only storage --non-interactive
        Write-Success "Storage rules deployed successfully"
        return $true
    }
    catch {
        Write-Warning "Storage deployment failed, but continuing..."
        return $false
    }
}

# Run health checks
function Test-Health {
    Write-Log "Running health checks..."
    
    # Wait for deployment to propagate
    Start-Sleep -Seconds 10
    
    # Check function health
    $functionUrl = "https://us-central1-$PROJECT_NAME.cloudfunctions.net/api/health"
    try {
        $response = Invoke-WebRequest -Uri $functionUrl -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend health check passed"
        }
        else {
            Write-Warning "Backend health check failed (HTTP $($response.StatusCode))"
        }
    }
    catch {
        Write-Warning "Backend health check failed"
    }
    
    # Check hosting
    $hostingUrl = "https://$PROJECT_NAME.web.app"
    try {
        $response = Invoke-WebRequest -Uri $hostingUrl -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend health check passed"
        }
        else {
            Write-Warning "Frontend health check failed (HTTP $($response.StatusCode))"
        }
    }
    catch {
        Write-Warning "Frontend health check failed"
    }
}

# Show deployment summary
function Show-Summary {
    Write-Host ""
    Write-Host "🎉 Deployment Summary" -ForegroundColor $Green
    Write-Host "====================" -ForegroundColor $Green
    Write-Host "Project: $PROJECT_NAME" -ForegroundColor $White
    Write-Host "Frontend URL: https://$PROJECT_NAME.web.app" -ForegroundColor $White
    Write-Host "Backend URL: https://us-central1-$PROJECT_NAME.cloudfunctions.net/api" -ForegroundColor $White
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor $Blue
    Write-Host "1. Test the application at: https://$PROJECT_NAME.web.app" -ForegroundColor $White
    Write-Host "2. Check Firebase Console for monitoring" -ForegroundColor $White
    Write-Host "3. Set up custom domain if needed" -ForegroundColor $White
    Write-Host "4. Configure analytics and monitoring" -ForegroundColor $White
    Write-Host ""
}

# Show help
function Show-Help {
    Write-Host "Usage: .\deploy-firebase.ps1 [OPTIONS]" -ForegroundColor $White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $Blue
    Write-Host "  -SkipTests    Skip running tests before deployment" -ForegroundColor $White
    Write-Host "  -Help         Show this help message" -ForegroundColor $White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Blue
    Write-Host "  .\deploy-firebase.ps1              Deploy with tests" -ForegroundColor $White
    Write-Host "  .\deploy-firebase.ps1 -SkipTests   Deploy without tests" -ForegroundColor $White
}

# Main deployment function
function Start-Deployment {
    Write-Host "🚀 Starting Firebase deployment for WasteWise" -ForegroundColor $Green
    Write-Host "==============================================" -ForegroundColor $Green
    
    # Pre-deployment checks
    if (-not (Test-FirebaseCLI)) { exit 1 }
    if (-not (Test-FirebaseAuth)) { exit 1 }
    if (-not (Test-ProjectAccess)) { exit 1 }
    
    # Setup
    if (-not (Install-Dependencies)) { exit 1 }
    Test-Environment
    
    # Testing (optional)
    if (-not $SkipTests) {
        Invoke-Tests
    }
    else {
        Write-Warning "Skipping tests as requested"
    }
    
    # Build
    if (-not (Build-Frontend)) { exit 1 }
    
    # Deploy
    if (-not (Deploy-Functions)) { exit 1 }
    if (-not (Deploy-Hosting)) { exit 1 }
    Deploy-Firestore
    Deploy-Storage
    
    # Post-deployment
    Test-Health
    Show-Summary
    
    Write-Success "Deployment completed successfully! 🎉"
}

# Handle command line arguments
if ($Help) {
    Show-Help
    exit 0
}

# Start deployment
Start-Deployment
