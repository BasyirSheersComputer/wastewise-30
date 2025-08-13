# Issue Reporting System Setup Script (PowerShell)
# This script sets up the database schema for the issue reporting system

param(
    [switch]$SkipVerification
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up Issue Reporting System..." -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required environment variables are set
if (-not $env:VITE_SUPABASE_URL -or -not $env:VITE_SUPABASE_ANON_KEY) {
    Write-Error "Missing required environment variables:"
    Write-Error "  - VITE_SUPABASE_URL"
    Write-Error "  - VITE_SUPABASE_ANON_KEY"
    Write-Error ""
    Write-Error "Please set these variables in your .env file or environment."
    exit 1
}

Write-Status "Environment variables found ✓"

# Check if SQL file exists
$SQL_FILE = "backend\setup-issue-reporting.sql"
if (-not (Test-Path $SQL_FILE)) {
    Write-Error "SQL file not found: $SQL_FILE"
    exit 1
}

Write-Status "SQL file found: $SQL_FILE ✓"

# Function to apply SQL to Supabase
function Apply-SqlToSupabase {
    param([string]$SqlFile)
    
    Write-Status "Applying SQL schema to Supabase..."
    
    # Check if psql is available
    try {
        $psqlVersion = psql --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Using psql to apply schema..."
            
            # Extract database URL from Supabase URL
            $DB_URL = $env:VITE_SUPABASE_URL -replace "https://", "postgresql://postgres:postgres@" -replace "\.supabase\.co", ".supabase.co:5432/postgres"
            
            try {
                psql $DB_URL -f $SqlFile
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "Schema applied successfully via psql"
                } else {
                    Write-Warning "Failed to apply schema via psql. You may need to apply it manually."
                }
            } catch {
                Write-Warning "Failed to apply schema via psql: $($_.Exception.Message)"
                Write-Warning "You may need to apply it manually."
            }
        } else {
            Write-Warning "psql not found. Please apply the SQL manually in the Supabase dashboard."
        }
    } catch {
        Write-Warning "psql not found. Please apply the SQL manually in the Supabase dashboard."
    }
}

# Function to verify setup
function Verify-Setup {
    if ($SkipVerification) {
        Write-Status "Skipping verification as requested."
        return
    }
    
    Write-Status "Verifying setup..."
    
    # Create a simple test script to verify the tables exist
    $verifySql = @"
-- Verify issue reporting tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('issues', 'issue_categories', 'issue_priorities', 'issue_statuses', 'issue_comments', 'issue_history', 'issue_templates') 
        THEN '✓' 
        ELSE '✗' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('issues', 'issue_categories', 'issue_priorities', 'issue_statuses', 'issue_comments', 'issue_history', 'issue_templates')
ORDER BY table_name;
"@
    
    $verifyFile = [System.IO.Path]::GetTempFileName() + ".sql"
    $verifySql | Out-File -FilePath $verifyFile -Encoding UTF8
    
    try {
        $psqlVersion = psql --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $DB_URL = $env:VITE_SUPABASE_URL -replace "https://", "postgresql://postgres:postgres@" -replace "\.supabase\.co", ".supabase.co:5432/postgres"
            
            Write-Status "Verifying tables..."
            psql $DB_URL -f $verifyFile
            
            Remove-Item $verifyFile -Force
        } else {
            Write-Warning "Cannot verify automatically. Please check manually in Supabase dashboard."
        }
    } catch {
        Write-Warning "Cannot verify automatically. Please check manually in Supabase dashboard."
    }
}

# Main execution
function Main {
    Write-Status "Starting Issue Reporting System setup..."
    
    # Apply SQL schema
    Apply-SqlToSupabase $SQL_FILE
    
    # Verify setup
    Verify-Setup
    
    Write-Success "Issue Reporting System setup completed!"
    Write-Status ""
    Write-Status "Next steps:"
    Write-Status "1. Verify tables were created in Supabase dashboard"
    Write-Status "2. Test the issue reporting functionality in your application"
    Write-Status "3. Configure any additional settings as needed"
    Write-Status ""
    Write-Status "Manual setup instructions (if automatic failed):"
    Write-Status "1. Go to your Supabase dashboard"
    Write-Status "2. Navigate to SQL Editor"
    Write-Status "3. Copy and paste the contents of: $SQL_FILE"
    Write-Status "4. Execute the SQL"
    Write-Status ""
}

# Run main function
Main
