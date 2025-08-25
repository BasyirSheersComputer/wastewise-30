# Build Containers Script for WasteWise
# This script builds both frontend and backend containers with proper environment variables

Write-Host "Building WasteWise Containers..." -ForegroundColor Green

# Set default environment variables (these should be overridden in production)
$env:VITE_SUPABASE_URL = "https://placeholder.supabase.co"
$env:VITE_SUPABASE_ANON_KEY = "placeholder-key"
$env:VITE_STRIPE_PUBLISHABLE_KEY = "pk_test_placeholder"
$env:VITE_API_BASE_URL = "http://localhost:3000"
$env:VITE_TRIAL_PERIOD_DAYS = "30"

# Backend environment variables
$env:VITE_SUPABASE_URL_BACKEND = "https://placeholder.supabase.co"
$env:VITE_SUPABASE_ANON_KEY_BACKEND = "placeholder-key"
$env:GEMINI_API_KEY = "placeholder-key"
$env:OPENAI_API_KEY = "placeholder-key"
$env:JWT_SECRET = "placeholder-secret"

Write-Host "Building Backend Container..." -ForegroundColor Blue
docker build -f Dockerfile.backend -t basyir/wastewise-30-backend:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend container built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Backend container build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Building Frontend Container..." -ForegroundColor Blue
docker build -f Dockerfile.frontend `
    --build-arg VITE_SUPABASE_URL=$env:VITE_SUPABASE_URL `
    --build-arg VITE_SUPABASE_ANON_KEY=$env:VITE_SUPABASE_ANON_KEY `
    --build-arg VITE_STRIPE_PUBLISHABLE_KEY=$env:VITE_STRIPE_PUBLISHABLE_KEY `
    --build-arg VITE_API_BASE_URL=$env:VITE_API_BASE_URL `
    --build-arg VITE_TRIAL_PERIOD_DAYS=$env:VITE_TRIAL_PERIOD_DAYS `
    -t basyir/wastewise-30-frontend:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend container built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend container build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 All containers built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Push containers to registry: docker push basyir/wastewise-30-backend:latest" -ForegroundColor White
Write-Host "2. Push containers to registry: docker push basyir/wastewise-30-frontend:latest" -ForegroundColor White
Write-Host "3. Deploy to Google Cloud Run" -ForegroundColor White
Write-Host ""
Write-Host "Note: Update environment variables with real values before production deployment!" -ForegroundColor Red
