# Docker Build Script with Environment Variable Handling (PowerShell)
# This script builds Docker images with proper secret management

param(
    [switch]$SkipValidation
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Warning ".env file not found. Creating from template..."
    if (Test-Path "config/environment/docker.env.example") {
        Copy-Item "config/environment/docker.env.example" ".env"
        Write-Status "Created .env file from template. Please edit it with your actual values."
        exit 1
    } else {
        Write-Error "No .env template found. Please create a .env file manually."
        exit 1
    }
}

# Load environment variables from .env file
Write-Status "Loading environment variables..."
$envContent = Get-Content ".env" | Where-Object { $_ -match '^[^#].*=.*' }
foreach ($line in $envContent) {
    $key, $value = $line -split '=', 2
    if ($key -and $value) {
        Set-Variable -Name $key.Trim() -Value $value.Trim() -Scope Script
    }
}

# Validate required environment variables
Write-Status "Validating required environment variables..."

# Frontend build variables
$frontendVars = @(
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_API_BASE_URL"
)

# Backend runtime variables
$backendVars = @(
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "JWT_SECRET"
)

# Check frontend variables
foreach ($var in $frontendVars) {
    if (-not (Get-Variable -Name $var -ErrorAction SilentlyContinue) -or 
        [string]::IsNullOrEmpty((Get-Variable -Name $var).Value)) {
        Write-Warning "$var is not set. Using default value."
    }
}

# Check backend variables
foreach ($var in $backendVars) {
    if (-not (Get-Variable -Name $var -ErrorAction SilentlyContinue) -or 
        [string]::IsNullOrEmpty((Get-Variable -Name $var).Value)) {
        Write-Warning "$var is not set. Backend may not function properly."
    }
}

# Build frontend image
Write-Status "Building frontend Docker image..."
$frontendArgs = @(
    "build",
    "--build-arg", "VITE_SUPABASE_URL=$VITE_SUPABASE_URL",
    "--build-arg", "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY",
    "--build-arg", "VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY",
    "--build-arg", "VITE_API_BASE_URL=$($VITE_API_BASE_URL ?? 'http://wastewise-backend:3000')",
    "--build-arg", "VITE_TRIAL_PERIOD_DAYS=$($VITE_TRIAL_PERIOD_DAYS ?? '30')",
    "-f", "Dockerfile.frontend",
    "-t", "wastewise-frontend:latest",
    "."
)

$frontendResult = docker $frontendArgs

if ($LASTEXITCODE -eq 0) {
    Write-Status "Frontend image built successfully!"
} else {
    Write-Error "Frontend build failed!"
    exit 1
}

# Build backend image
Write-Status "Building backend Docker image..."
$backendArgs = @(
    "build",
    "-f", "Dockerfile.backend",
    "-t", "wastewise-backend:latest",
    "."
)

$backendResult = docker $backendArgs

if ($LASTEXITCODE -eq 0) {
    Write-Status "Backend image built successfully!"
} else {
    Write-Error "Backend build failed!"
    exit 1
}

Write-Status "All Docker images built successfully!"
Write-Status "You can now run: docker-compose up -d"
