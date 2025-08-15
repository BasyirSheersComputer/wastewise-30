#!/usr/bin/env pwsh

# Google Cloud Secret Manager Setup Script for WasteWise
# PowerShell version for Windows

Write-Host "🔐 Setting up Google Cloud Secret Manager secrets for WasteWise..." -ForegroundColor Green

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Google Cloud SDK (gcloud) is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check if user is authenticated
$authStatus = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
if (-not $authStatus) {
    Write-Host "❌ Not authenticated with Google Cloud" -ForegroundColor Red
    Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Get project ID
$projectId = gcloud config get-value project 2>$null
if (-not $projectId) {
    Write-Host "❌ No Google Cloud project configured" -ForegroundColor Red
    Write-Host "Please run: gcloud config set project YOUR_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Using project: $projectId" -ForegroundColor Green

# Enable Secret Manager API
Write-Host "🔧 Enabling Secret Manager API..." -ForegroundColor Blue
gcloud services enable secretmanager.googleapis.com --project=$projectId

# Function to create or update secret
function Set-Secret {
    param(
        [string]$SecretName,
        [string]$Description,
        [string]$PlaceholderValue
    )
    
    Write-Host "📝 Setting up secret: $SecretName" -ForegroundColor Cyan
    
    # Check if secret exists
    $exists = gcloud secrets describe $SecretName --project=$projectId 2>$null
    
    if ($exists) {
        Write-Host "   Secret exists, updating version..." -ForegroundColor Yellow
        echo $PlaceholderValue | gcloud secrets versions add $SecretName --data-file=- --project=$projectId
    } else {
        Write-Host "   Creating new secret..." -ForegroundColor Yellow
        echo $PlaceholderValue | gcloud secrets create $SecretName --data-file=- --project=$projectId
    }
    
    Write-Host "   ✅ Secret '$SecretName' configured" -ForegroundColor Green
}

# Create secrets
Write-Host "`n🔑 Creating secrets..." -ForegroundColor Blue

# Supabase secrets
Set-Secret -SecretName "wastewise-supabase-url" -Description "Supabase project URL" -PlaceholderValue "https://your-project.supabase.co"
Set-Secret -SecretName "wastewise-supabase-anon-key" -Description "Supabase anonymous key" -PlaceholderValue "your-supabase-anon-key"
Set-Secret -SecretName "wastewise-supabase-service-role-key" -Description "Supabase service role key" -PlaceholderValue "your-supabase-service-role-key"

# OpenAI secrets
Set-Secret -SecretName "wastewise-openai-api-key" -Description "OpenAI API key" -PlaceholderValue "your-openai-api-key"

# Google GenAI secrets
Set-Secret -SecretName "wastewise-google-genai-api-key" -Description "Google GenAI API key" -PlaceholderValue "your-google-genai-api-key"

# Stripe secrets
Set-Secret -SecretName "wastewise-stripe-secret-key" -Description "Stripe secret key" -PlaceholderValue "sk_test_your-stripe-secret-key"
Set-Secret -SecretName "wastewise-stripe-publishable-key" -Description "Stripe publishable key" -PlaceholderValue "pk_test_your-stripe-publishable-key"
Set-Secret -SecretName "wastewise-stripe-webhook-secret" -Description "Stripe webhook secret" -PlaceholderValue "whsec_your-stripe-webhook-secret"

# JWT secrets
Set-Secret -SecretName "wastewise-jwt-secret" -Description "JWT signing secret" -PlaceholderValue "your-jwt-secret-key"

Write-Host "`n✅ All secrets have been created/updated!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update the secret values with your actual credentials:" -ForegroundColor White
Write-Host "   gcloud secrets versions add SECRET_NAME --data-file=-" -ForegroundColor Gray
Write-Host "2. Run the deployment script:" -ForegroundColor White
Write-Host "   .\scripts\deploy-cloud-run.ps1" -ForegroundColor Gray
Write-Host "`n⚠️  IMPORTANT: Replace placeholder values with your actual credentials!" -ForegroundColor Red

