# Test script to verify Docker builds work correctly
param(
    [switch]$Cleanup
)

Write-Host "🧪 Testing Docker builds for Cloud Build..." -ForegroundColor Green

# Test backend build
Write-Host "🔧 Testing backend Docker build..." -ForegroundColor Yellow
try {
    docker build -t wastewise-backend-test -f config/docker/Dockerfile.backend .
    Write-Host "✅ Backend Docker build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Docker build failed" -ForegroundColor Red
    exit 1
}

# Test frontend build
Write-Host "🔧 Testing frontend Docker build..." -ForegroundColor Yellow
try {
    docker build -t wastewise-frontend-test -f config/docker/Dockerfile.frontend .
    Write-Host "✅ Frontend Docker build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Docker build failed" -ForegroundColor Red
    exit 1
}

# Clean up test images if requested
if ($Cleanup) {
    Write-Host "🧹 Cleaning up test images..." -ForegroundColor Yellow
    docker rmi wastewise-backend-test wastewise-frontend-test 2>$null
}

Write-Host "🎉 All Docker builds successful! Ready for Cloud Build deployment." -ForegroundColor Green

