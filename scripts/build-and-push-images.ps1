# Build and Push Docker Images Script for WasteWise-30 (PowerShell)
# This script builds both frontend and backend images and pushes them to DockerHub

# Stop on any error
$ErrorActionPreference = "Stop"

# Configuration
$IMAGE_NAME = "basyir/wastewise-30"
$TAG = Get-Date -Format "yyyyMMdd-HHmmss"  # Timestamp-based tag
$LATEST_TAG = "latest"

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"

# Logging function
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $BLUE
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $GREEN
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $YELLOW
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $RED
}

# Check if Docker is running
function Test-Docker {
    Write-Log "Checking Docker status..."
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }
}

# Check if we're logged into DockerHub
function Test-DockerHubLogin {
    Write-Log "Checking DockerHub login status..."
    try {
        $dockerInfo = docker system info
        if ($dockerInfo -match "Username") {
            Write-Success "Already logged into DockerHub"
        } else {
            Write-Warning "Not logged into DockerHub. Attempting to login..."
            docker login
        }
    }
    catch {
        Write-Warning "Could not determine DockerHub login status. Please login manually if needed."
    }
}

# Build Docker image
function Build-Image {
    param(
        [string]$Service,
        [string]$Dockerfile
    )
    
    $imageTag = "${IMAGE_NAME}-${Service}:${TAG}"
    $latestTag = "${IMAGE_NAME}-${Service}:${LATEST_TAG}"
    
    Write-Log "Building ${Service} image..."
    Write-Log "Dockerfile: ${Dockerfile}"
    Write-Log "Image: ${imageTag}"
    
    # Build the image
    try {
        docker build -f $Dockerfile -t $imageTag -t $latestTag .
        Write-Success "Successfully built ${Service} image"
        return $imageTag
    }
    catch {
        Write-Error "Failed to build ${Service} image"
        exit 1
    }
}

# Push Docker image
function Push-Image {
    param([string]$Service)
    
    $imageTag = "${IMAGE_NAME}-${Service}:${TAG}"
    $latestTag = "${IMAGE_NAME}-${Service}:${LATEST_TAG}"
    
    Write-Log "Pushing ${Service} image to DockerHub..."
    
    # Push tagged version
    try {
        docker push $imageTag
        Write-Success "Successfully pushed ${Service} image (tagged)"
    }
    catch {
        Write-Error "Failed to push ${Service} image (tagged)"
        exit 1
    }
    
    # Push latest version
    try {
        docker push $latestTag
        Write-Success "Successfully pushed ${Service} image (latest)"
    }
    catch {
        Write-Error "Failed to push ${Service} image (latest)"
        exit 1
    }
}

# Clean up old images (optional)
function Remove-OldImages {
    Write-Log "Cleaning up old images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Optionally remove old tagged images (keep last 5)
    Write-Warning "Keeping last 5 images, removing older ones..."
    try {
        docker images "${IMAGE_NAME}-frontend" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | Select-Object -Skip 5 | ForEach-Object { $_.Split()[0] } | ForEach-Object { docker rmi $_ }
        docker images "${IMAGE_NAME}-backend" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | Select-Object -Skip 5 | ForEach-Object { $_.Split()[0] } | ForEach-Object { docker rmi $_ }
    }
    catch {
        Write-Warning "Could not remove some old images (this is normal)"
    }
    
    Write-Success "Cleanup completed"
}

# Main execution
function Main {
    Write-Host "🚀 WasteWise-30 Docker Build and Push Script" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host "Image Name: ${IMAGE_NAME}"
    Write-Host "Tag: ${TAG}"
    Write-Host "Latest Tag: ${LATEST_TAG}"
    Write-Host ""
    
    # Pre-flight checks
    Test-Docker
    Test-DockerHubLogin
    
    # Build images
    Write-Log "Starting image builds..."
    $frontendImage = Build-Image "frontend" "Dockerfile.frontend"
    $backendImage = Build-Image "backend" "Dockerfile.backend"
    
    # Push images
    Write-Log "Starting image pushes..."
    Push-Image "frontend"
    Push-Image "backend"
    
    # Cleanup
    Remove-OldImages
    
    # Summary
    Write-Host ""
    Write-Host "🎉 Build and Push Summary" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Success "All images built and pushed successfully!"
    Write-Host "Frontend: ${frontendImage}"
    Write-Host "Backend: ${backendImage}"
    Write-Host ""
    Write-Host "📋 Next Steps:"
    Write-Host "1. Update your docker-compose.yml to use the new images"
    Write-Host "2. Deploy using: docker-compose pull && docker-compose up -d"
    Write-Host "3. Verify deployment with: docker-compose ps"
    Write-Host ""
    Write-Host "🔗 DockerHub Images:"
    Write-Host "Frontend: https://hub.docker.com/r/${IMAGE_NAME}-frontend"
    Write-Host "Backend: https://hub.docker.com/r/${IMAGE_NAME}-backend"
}

# Run main function
Main
