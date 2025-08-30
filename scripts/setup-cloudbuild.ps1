# Google Cloud Build Setup Script for WasteWise-30 (PowerShell)
# This script sets up automatic deployment triggers and secrets

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
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

function Write-Header {
    param([string]$Message)
    Write-Host "[SETUP] $Message" -ForegroundColor Blue
}

# Check if gcloud is installed
function Test-GCloud {
    try {
        $null = Get-Command gcloud -ErrorAction Stop
        Write-Status "gcloud CLI found"
    }
    catch {
        Write-Error "gcloud CLI is not installed. Please install it first:"
        Write-Host "https://cloud.google.com/sdk/docs/install"
        exit 1
    }
}

# Check if user is authenticated
function Test-Auth {
    $auth = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
    if (-not $auth) {
        Write-Warning "You are not authenticated with gcloud. Please run:"
        Write-Host "gcloud auth login"
        exit 1
    }
    Write-Status "Authenticated as: $auth"
}

# Set project
function Set-Project {
    Write-Status "Setting project to: $ProjectId"
    gcloud config set project $ProjectId
}

# Enable required APIs
function Enable-APIs {
    Write-Header "Enabling required Google Cloud APIs..."
    
    $APIs = @(
        "cloudbuild.googleapis.com",
        "run.googleapis.com",
        "containerregistry.googleapis.com",
        "secretmanager.googleapis.com",
        "cloudresourcemanager.googleapis.com"
    )
    
    foreach ($api in $APIs) {
        Write-Status "Enabling $api..."
        gcloud services enable $api --quiet
    }
}

# Create secrets in Secret Manager
function New-Secrets {
    Write-Header "Setting up secrets in Secret Manager..."
    
    $secrets = @{
        "supabase-url" = "Your Supabase project URL"
        "supabase-anon-key" = "Your Supabase anonymous key"
        "supabase-service-key" = "Your Supabase service role key"
        "jwt-secret" = "Your JWT secret (at least 32 characters)"
        "gemini-api-key" = "Your Google Gemini API key"
        "openai-api-key" = "Your OpenAI API key"
        "stripe-publishable-key" = "Your Stripe publishable key"
        "stripe-secret-key" = "Your Stripe secret key"
        "smtp-host" = "Your SMTP host"
        "smtp-port" = "Your SMTP port"
        "smtp-user" = "Your SMTP username"
        "smtp-pass" = "Your SMTP password"
        "api-base-url" = "https://wastewise-backend-${ProjectId}-as.a.run.app"
        "trial-period-days" = "30"
    }
    
    foreach ($secretName in $secrets.Keys) {
        $exists = gcloud secrets describe $secretName --quiet 2>$null
        if (-not $exists) {
            Write-Status "Creating secret: $secretName"
            $secrets[$secretName] | gcloud secrets create $secretName --data-file=-
        } else {
            Write-Status "Secret already exists: $secretName"
        }
    }
}

# Grant Cloud Build service account permissions
function Set-Permissions {
    Write-Header "Setting up Cloud Build permissions..."
    
    # Get the Cloud Build service account
    $projectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
    $cloudbuildSA = "${projectNumber}@cloudbuild.gserviceaccount.com"
    
    Write-Status "Cloud Build service account: $cloudbuildSA"
    
    # Grant necessary roles
    $roles = @(
        "roles/run.admin",
        "roles/secretmanager.secretAccessor",
        "roles/storage.admin",
        "roles/iam.serviceAccountUser"
    )
    
    foreach ($role in $roles) {
        Write-Status "Granting $role to Cloud Build service account..."
        gcloud projects add-iam-policy-binding $ProjectId `
            --member="serviceAccount:$cloudbuildSA" `
            --role="$role" `
            --quiet
    }
}

# Connect GitHub repository
function Connect-GitHub {
    Write-Header "Connecting GitHub repository..."
    
    # Check if repository is already connected
    $repoExists = gcloud source repos list --filter="name:github_basyirsheerscomputer_wastewise-30" --format="value(name)" 2>$null
    if (-not $repoExists) {
        Write-Status "Connecting GitHub repository..."
        gcloud source repos create github_basyirsheerscomputer_wastewise-30
    } else {
        Write-Status "GitHub repository already connected"
    }
}

# Create Cloud Build trigger
function New-Trigger {
    Write-Header "Creating Cloud Build trigger..."
    
    # Check if trigger already exists
    $triggerExists = gcloud builds triggers list --filter="name:wastewise-auto-deploy" --format="value(name)" 2>$null
    if (-not $triggerExists) {
        Write-Status "Creating auto-deploy trigger..."
        gcloud builds triggers create github `
            --name="wastewise-auto-deploy" `
            --repo-name="github_basyirsheerscomputer_wastewise-30" `
            --repo-owner="basyirsheerscomputer" `
            --branch-pattern="^main$" `
            --build-config="cloudbuild.yaml" `
            --include-files="**/*.js,**/*.ts,**/*.tsx,**/*.json,**/*.yaml,**/*.yml,Dockerfile.*,package.json,package-lock.json" `
            --ignore-files="**/*.md,**/*.txt,**/*.log,node_modules/**,.git/**,docs/**,scripts/**"
    } else {
        Write-Status "Trigger already exists: wastewise-auto-deploy"
    }
}

# Create GitHub service account for Cloud Build
function New-GitHubSA {
    Write-Header "Creating GitHub service account..."
    
    $saName = "github-cloudbuild-sa"
    $saEmail = "${saName}@${ProjectId}.iam.gserviceaccount.com"
    
    # Create service account if it doesn't exist
    $saExists = gcloud iam service-accounts describe $saEmail --quiet 2>$null
    if (-not $saExists) {
        Write-Status "Creating service account: $saEmail"
        gcloud iam service-accounts create $saName `
            --display-name="GitHub Cloud Build Service Account" `
            --description="Service account for GitHub Cloud Build integration"
    } else {
        Write-Status "Service account already exists: $saEmail"
    }
    
    # Grant necessary roles
    $roles = @(
        "roles/cloudbuild.builds.builder",
        "roles/run.admin",
        "roles/secretmanager.secretAccessor",
        "roles/storage.admin"
    )
    
    foreach ($role in $roles) {
        Write-Status "Granting $role to GitHub service account..."
        gcloud projects add-iam-policy-binding $ProjectId `
            --member="serviceAccount:$saEmail" `
            --role="$role" `
            --quiet
    }
    
    # Create and download key
    $keyFile = "github-cloudbuild-key.json"
    if (-not (Test-Path $keyFile)) {
        Write-Status "Creating service account key..."
        gcloud iam service-accounts keys create $keyFile `
            --iam-account=$saEmail
        Write-Warning "Service account key created: $keyFile"
        Write-Warning "Add this key to GitHub repository secrets as GCP_SA_KEY"
    } else {
        Write-Status "Service account key already exists: $keyFile"
    }
}

# Main setup function
function Start-Setup {
    Write-Header "Setting up Google Cloud Build for WasteWise-30"
    Write-Host "=================================================="
    
    Test-GCloud
    Test-Auth
    Set-Project
    Enable-APIs
    New-Secrets
    Set-Permissions
    Connect-GitHub
    New-Trigger
    New-GitHubSA
    
    Write-Header "Setup completed successfully!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "1. Add the service account key to GitHub repository secrets:"
    Write-Host "   - Go to your GitHub repository settings"
    Write-Host "   - Add secret: GCP_SA_KEY with the content of github-cloudbuild-key.json"
    Write-Host "   - Add secret: GCP_PROJECT_ID with your project ID: $ProjectId"
    Write-Host ""
    Write-Host "2. Push to main branch to trigger automatic deployment"
    Write-Host ""
    Write-Host "3. Monitor builds at: https://console.cloud.google.com/cloud-build/builds?project=$ProjectId"
    Write-Host ""
    Write-Host "4. View deployed services at: https://console.cloud.google.com/run?project=$ProjectId"
}

# Run main setup function
Start-Setup
