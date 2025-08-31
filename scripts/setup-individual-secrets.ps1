# Setup Individual Google Secret Manager secrets for WasteWise-30
# PowerShell version for Windows users

param(
    [string]$ProjectId = "wastewise-402ba",
    [string]$Region = "asia-southeast1"
)

Write-Host "🔧 Setting up Individual Google Secret Manager secrets for project: $ProjectId" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is authenticated
try {
    $account = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $account) {
        Write-Host "❌ Error: You are not authenticated with gcloud" -ForegroundColor Red
        Write-Host "Please run: gcloud auth login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error: gcloud CLI not found or not working" -ForegroundColor Red
    Write-Host "Please install and configure gcloud CLI" -ForegroundColor Yellow
    exit 1
}

# Check if project exists
try {
    gcloud projects describe $ProjectId 2>$null | Out-Null
    Write-Host "✅ Project $ProjectId is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Project $ProjectId does not exist or you don't have access" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Function to create secret if it doesn't exist
function Create-SecretIfNotExists {
    param(
        [string]$SecretName,
        [string]$Description
    )
    
    try {
        gcloud secrets describe $SecretName --project=$ProjectId 2>$null | Out-Null
        Write-Host "✅ Secret '$SecretName' already exists" -ForegroundColor Green
    } catch {
        Write-Host "📝 Creating secret '$SecretName'..." -ForegroundColor Yellow
        gcloud secrets create $SecretName `
            --project=$ProjectId `
            --replication-policy="automatic" `
            --data-file=/dev/null `
            --labels="app=wastewise,environment=production" `
            --description="$Description"
        Write-Host "✅ Secret '$SecretName' created successfully" -ForegroundColor Green
    }
}

# Function to add secret version with prompt
function Add-SecretVersion {
    param(
        [string]$SecretName,
        [string]$PromptMessage,
        [bool]$IsRequired
    )
    
    Write-Host ""
    if ($IsRequired) {
        Write-Host "🔑 REQUIRED: $PromptMessage" -ForegroundColor Red
        Write-Host "   Secret name: $SecretName" -ForegroundColor Gray
        $secretValue = Read-Host "   Enter the value"
        
        if ([string]::IsNullOrWhiteSpace($secretValue)) {
            Write-Host "❌ Error: Value cannot be empty for required secret" -ForegroundColor Red
            exit 1
        }
        
        $secretValue | gcloud secrets versions add $SecretName --project=$ProjectId --data-file=-
        Write-Host "✅ Secret version added for '$SecretName'" -ForegroundColor Green
    } else {
        Write-Host "🔑 OPTIONAL: $PromptMessage" -ForegroundColor Yellow
        Write-Host "   Secret name: $SecretName" -ForegroundColor Gray
        $secretValue = Read-Host "   Enter the value (or press Enter to skip)"
        
        if (-not [string]::IsNullOrWhiteSpace($secretValue)) {
            $secretValue | gcloud secrets versions add $SecretName --project=$ProjectId --data-file=-
            Write-Host "✅ Secret version added for '$SecretName'" -ForegroundColor Green
        } else {
            Write-Host "⏭️  Skipped '$SecretName'" -ForegroundColor Gray
        }
    }
}

Write-Host "🚀 Creating secrets in Secret Manager..." -ForegroundColor Cyan
Write-Host ""

# Backend Secrets
Write-Host "📋 Backend Secrets:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Gray

Create-SecretIfNotExists "supabase-url" "Supabase project URL for backend"
Create-SecretIfNotExists "supabase-anon-key" "Supabase anonymous key for backend"
Create-SecretIfNotExists "supabase-service-key" "Supabase service role key for backend"
Create-SecretIfNotExists "openai-api-key" "OpenAI API key for AI features"
Create-SecretIfNotExists "gemini-api-key" "Google Gemini API key for AI features"
Create-SecretIfNotExists "stripe-secret-key" "Stripe secret key for payments"
Create-SecretIfNotExists "stripe-webhook-secret" "Stripe webhook secret for payment events"
Create-SecretIfNotExists "jwt-secret" "JWT secret for authentication"

# Frontend Secrets
Write-Host ""
Write-Host "📋 Frontend Secrets:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Gray

Create-SecretIfNotExists "stripe-publishable-key" "Stripe publishable key for frontend"

Write-Host ""
Write-Host "🔑 Adding secret values..." -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Gray

# Required Backend Secrets
Add-SecretVersion "supabase-url" "Supabase project URL (e.g., https://your-project.supabase.co)" $true
Add-SecretVersion "supabase-anon-key" "Supabase anonymous key (public key)" $true
Add-SecretVersion "supabase-service-key" "Supabase service role key (private key)" $true
Add-SecretVersion "gemini-api-key" "Google Gemini API key (required for AI features)" $true
Add-SecretVersion "jwt-secret" "JWT secret for authentication (any secure random string)" $true

# Optional Backend Secrets
Add-SecretVersion "openai-api-key" "OpenAI API key (optional, for additional AI features)" $false
Add-SecretVersion "stripe-secret-key" "Stripe secret key (optional, for payment processing)" $false
Add-SecretVersion "stripe-webhook-secret" "Stripe webhook secret (optional, for payment events)" $false

# Required Frontend Secrets
Add-SecretVersion "stripe-publishable-key" "Stripe publishable key (required for frontend payments)" $true

Write-Host ""
Write-Host "🎉 Secret setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of created secrets:" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Gray
Write-Host "Backend Secrets:" -ForegroundColor Yellow
Write-Host "  - supabase-url"
Write-Host "  - supabase-anon-key"
Write-Host "  - supabase-service-key"
Write-Host "  - gemini-api-key"
Write-Host "  - jwt-secret"
Write-Host "  - openai-api-key (optional)"
Write-Host "  - stripe-secret-key (optional)"
Write-Host "  - stripe-webhook-secret (optional)"
Write-Host ""
Write-Host "Frontend Secrets:" -ForegroundColor Yellow
Write-Host "  - stripe-publishable-key"
Write-Host ""
Write-Host "📋 To list all secrets:" -ForegroundColor Cyan
Write-Host "   gcloud secrets list --project=$ProjectId"
Write-Host ""
Write-Host "📋 To view a specific secret:" -ForegroundColor Cyan
Write-Host "   gcloud secrets versions access latest --secret=SECRET_NAME --project=$ProjectId"
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "   1. Deploy your application using Cloud Build"
Write-Host "   2. The secrets will be automatically injected into your containers"
Write-Host "   3. Monitor the deployment logs for any issues"
