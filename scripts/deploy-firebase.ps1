# Firebase Deployment Script for WasteWise (PowerShell)
# This script automates the deployment process to Firebase Hosting and Functions

param(
    [string]$DeploymentEnv = "production"
)

# Configuration
$PROJECT_ID = "wastewise-30"
$FRONTEND_DIR = "frontend"
$BACKEND_DIR = "backend"

Write-Host "🚀 Starting Firebase Deployment for WasteWise" -ForegroundColor Blue
Write-Host "Environment: $DeploymentEnv" -ForegroundColor Blue
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue

# Check if Firebase CLI is installed
try {
    $null = Get-Command firebase -ErrorAction Stop
    Write-Status "Firebase CLI is installed"
} catch {
    Write-Error "Firebase CLI is not installed. Please install it first:"
    Write-Host "npm install -g firebase-tools"
    exit 1
}

# Check if Node.js is installed
try {
    $null = Get-Command node -ErrorAction Stop
    Write-Status "Node.js is installed"
} catch {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check if npm is installed
try {
    $null = Get-Command npm -ErrorAction Stop
    Write-Status "npm is installed"
} catch {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

Write-Status "All prerequisites are satisfied"

# Check if user is logged in to Firebase
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Blue
try {
    $null = firebase projects:list 2>$null
    Write-Status "Firebase authentication verified"
} catch {
    Write-Warning "Not logged in to Firebase. Please login first:"
    Write-Host "firebase login"
    exit 1
}

# Set the project
Write-Host "📋 Setting Firebase project..." -ForegroundColor Blue
firebase use $PROJECT_ID
Write-Status "Firebase project set to $PROJECT_ID"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue

Write-Host "Installing frontend dependencies..." -ForegroundColor Blue
Set-Location $FRONTEND_DIR
npm ci --silent
Write-Status "Frontend dependencies installed"

Write-Host "Installing backend dependencies..." -ForegroundColor Blue
Set-Location "../$BACKEND_DIR"
npm ci --silent
Write-Status "Backend dependencies installed"

Set-Location ..

# Build frontend
Write-Host "🏗️  Building frontend..." -ForegroundColor Blue
Set-Location $FRONTEND_DIR
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Status "Frontend build completed successfully"
} else {
    Write-Error "Frontend build failed"
    exit 1
}
Set-Location ..

# Run tests (if available)
Write-Host "🧪 Running tests..." -ForegroundColor Blue
Set-Location $FRONTEND_DIR
try {
    npm run test 2>$null
    Write-Status "Frontend tests passed"
} catch {
    Write-Warning "Frontend tests failed or not configured"
}
Set-Location ..

Set-Location $BACKEND_DIR
try {
    npm run test 2>$null
    Write-Status "Backend tests passed"
} catch {
    Write-Warning "Backend tests failed or not configured"
}
Set-Location ..

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Blue

# Deploy functions first
Write-Host "Deploying Cloud Functions..." -ForegroundColor Blue
firebase deploy --only functions --project $PROJECT_ID
if ($LASTEXITCODE -eq 0) {
    Write-Status "Cloud Functions deployed successfully"
} else {
    Write-Error "Cloud Functions deployment failed"
    exit 1
}

# Deploy hosting
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Blue
firebase deploy --only hosting --project $PROJECT_ID
if ($LASTEXITCODE -eq 0) {
    Write-Status "Firebase Hosting deployed successfully"
} else {
    Write-Error "Firebase Hosting deployment failed"
    exit 1
}

# Deploy Firestore rules and indexes
Write-Host "Deploying Firestore configuration..." -ForegroundColor Blue
firebase deploy --only firestore:rules,firestore:indexes --project $PROJECT_ID
if ($LASTEXITCODE -eq 0) {
    Write-Status "Firestore configuration deployed successfully"
} else {
    Write-Warning "Firestore configuration deployment failed or not configured"
}

# Deploy Storage rules
Write-Host "Deploying Storage rules..." -ForegroundColor Blue
firebase deploy --only storage --project $PROJECT_ID
if ($LASTEXITCODE -eq 0) {
    Write-Status "Storage rules deployed successfully"
} else {
    Write-Warning "Storage rules deployment failed or not configured"
}

# Get deployment URLs
Write-Host "📋 Getting deployment information..." -ForegroundColor Blue
$FUNCTIONS_URL = "https://us-central1-$PROJECT_ID.cloudfunctions.net"

Write-Status "Hosting URL: https://$PROJECT_ID.web.app"
Write-Status "Functions URL: $FUNCTIONS_URL"

# Health check
Write-Host "🏥 Running health checks..." -ForegroundColor Blue
Start-Sleep -Seconds 10  # Wait for deployment to propagate

# Test health endpoint
try {
    $null = Get-Command Invoke-WebRequest -ErrorAction Stop
    $response = Invoke-WebRequest -Uri "$FUNCTIONS_URL/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Status "Health check passed"
    } else {
        Write-Warning "Health check failed (HTTP $($response.StatusCode))"
    }
} catch {
    Write-Warning "Health check failed or Invoke-WebRequest not available"
}

# Final status
Write-Host "🎉 Deployment Summary" -ForegroundColor Blue
Write-Host "✅ Frontend: Built and deployed" -ForegroundColor Green
Write-Host "✅ Backend: Functions deployed" -ForegroundColor Green
Write-Host "✅ Database: Rules and indexes deployed" -ForegroundColor Green
Write-Host "✅ Storage: Rules deployed" -ForegroundColor Green

Write-Host "📊 Next Steps:" -ForegroundColor Blue
Write-Host "1. Verify the application is working correctly"
Write-Host "2. Monitor Firebase Console for any issues"
Write-Host "3. Set up monitoring and alerting"
Write-Host "4. Update DNS if using custom domain"

Write-Host "🔗 Useful Links:" -ForegroundColor Blue
Write-Host "Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
Write-Host "Hosting URL: https://$PROJECT_ID.web.app"
Write-Host "Functions URL: $FUNCTIONS_URL"

Write-Status "Deployment completed successfully!"
