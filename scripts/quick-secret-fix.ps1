# Quick Secret Fix Script for WasteWise-30
# This script helps fix the missing secrets identified by the verification

param(
    [string]$ProjectId = "wastewise-402ba"
)

Write-Host "🔧 Quick Secret Fix for WasteWise-30" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray
Write-Host ""

# Check current status
Write-Host "📊 Current Issues Identified:" -ForegroundColor Yellow
Write-Host "  1. AI Service failing - Missing Gemini API key" -ForegroundColor Red
Write-Host "  2. Database connection partially working (25% tests passing)" -ForegroundColor Red
Write-Host "  3. API keys showing as undefined" -ForegroundColor Red
Write-Host ""

Write-Host "🚀 Let's fix these issues step by step..." -ForegroundColor Green
Write-Host ""

# Function to check if secret exists
function Test-SecretExists {
    param([string]$SecretName)
    try {
        gcloud secrets describe $SecretName --project=$ProjectId 2>$null | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to create secret if it doesn't exist
function Create-SecretIfNotExists {
    param(
        [string]$SecretName,
        [string]$Description
    )
    
    if (Test-SecretExists $SecretName) {
        Write-Host "✅ Secret '$SecretName' already exists" -ForegroundColor Green
    } else {
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

# Function to add secret value
function Add-SecretValue {
    param(
        [string]$SecretName,
        [string]$PromptMessage,
        [bool]$IsRequired = $true
    )
    
    Write-Host ""
    if ($IsRequired) {
        Write-Host "🔑 REQUIRED: $PromptMessage" -ForegroundColor Red
    } else {
        Write-Host "🔑 OPTIONAL: $PromptMessage" -ForegroundColor Yellow
    }
    Write-Host "   Secret name: $SecretName" -ForegroundColor Gray
    
    $secretValue = Read-Host "   Enter the value"
    
    if ([string]::IsNullOrWhiteSpace($secretValue)) {
        if ($IsRequired) {
            Write-Host "❌ Error: Value cannot be empty for required secret" -ForegroundColor Red
            return $false
        } else {
            Write-Host "⏭️  Skipped '$SecretName'" -ForegroundColor Gray
            return $true
        }
    }
    
    try {
        $secretValue | gcloud secrets versions add $SecretName --project=$ProjectId --data-file=-
        Write-Host "✅ Secret value added for '$SecretName'" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Error adding secret value for '$SecretName': $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Step 1: Create missing secrets
Write-Host "Step 1: Creating missing secrets..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray

Create-SecretIfNotExists "gemini-api-key" "Google Gemini API key for AI features"
Create-SecretIfNotExists "openai-api-key" "OpenAI API key for additional AI features"
Create-SecretIfNotExists "jwt-secret" "JWT secret for authentication"

# Step 2: Add secret values
Write-Host ""
Write-Host "Step 2: Adding secret values..." -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Gray

$success = $true

# Required secrets
$success = $success -and (Add-SecretValue "gemini-api-key" "Google Gemini API key (required for AI features)" $true)
$success = $success -and (Add-SecretValue "jwt-secret" "JWT secret for authentication (any secure random string)" $true)

# Optional secrets
$success = $success -and (Add-SecretValue "openai-api-key" "OpenAI API key (optional, for additional AI features)" $false)

# Step 3: Verify existing secrets
Write-Host ""
Write-Host "Step 3: Verifying existing secrets..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray

$requiredSecrets = @(
    "supabase-url",
    "supabase-anon-key", 
    "supabase-service-key",
    "gemini-api-key",
    "jwt-secret"
)

$missingSecrets = @()

foreach ($secret in $requiredSecrets) {
    if (Test-SecretExists $secret) {
        Write-Host "✅ $secret exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $secret missing" -ForegroundColor Red
        $missingSecrets += $secret
    }
}

# Step 4: Summary and next steps
Write-Host ""
Write-Host "Step 4: Summary and Next Steps" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Gray

if ($success -and $missingSecrets.Count -eq 0) {
    Write-Host "🎉 All secrets are now properly configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Deploy your application:" -ForegroundColor White
    Write-Host "      gcloud builds submit --config=config/jenkins/cloudbuild.yaml ." -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Monitor the deployment:" -ForegroundColor White
    Write-Host "      gcloud builds list --limit=5" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Test the deployment:" -ForegroundColor White
    Write-Host "      node scripts/verify-secrets.js" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some issues remain:" -ForegroundColor Yellow
    if (-not $success) {
        Write-Host "   - Failed to add some secret values" -ForegroundColor Red
    }
    if ($missingSecrets.Count -gt 0) {
        Write-Host "   - Missing secrets: $($missingSecrets -join ', ')" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "🔧 Manual Steps Required:" -ForegroundColor Yellow
    Write-Host "   1. Create missing secrets manually:" -ForegroundColor White
    foreach ($secret in $missingSecrets) {
        Write-Host "      gcloud secrets create $secret --project=$ProjectId --replication-policy=automatic" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "   2. Add secret values:" -ForegroundColor White
    Write-Host "      gcloud secrets versions add SECRET_NAME --data-file=- <<< 'your-value'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "   List all secrets: gcloud secrets list --project=$ProjectId" -ForegroundColor Gray
Write-Host "   View secret: gcloud secrets describe SECRET_NAME --project=$ProjectId" -ForegroundColor Gray
Write-Host "   Test deployment: node scripts/verify-secrets.js" -ForegroundColor Gray
