# WasteWise Database Restoration Script
# Run this script to automatically restore your Supabase database

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   WasteWise Database Restoration Tool" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists in backend
if (!(Test-Path "backend\.env")) {
    Write-Host "⚠️  No .env file found in backend folder!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 To restore the database, you need to:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/settings/api" -ForegroundColor White
    Write-Host "   2. Find your SERVICE_ROLE key (not the anon key!)" -ForegroundColor White
    Write-Host "   3. Create backend\.env with the following content:" -ForegroundColor White
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host "SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co" -ForegroundColor Green
    Write-Host "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI" -ForegroundColor Green
    Write-Host "SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE" -ForegroundColor Yellow
    Write-Host "PORT=3000" -ForegroundColor Green
    Write-Host "NODE_ENV=development" -ForegroundColor Green
    Write-Host "CORS_ORIGIN=http://localhost:5173" -ForegroundColor Green
    Write-Host "JWT_SECRET=wastewise-secret-2024" -ForegroundColor Green
    Write-Host "----------------------------------------" -ForegroundColor Gray
    Write-Host ""
    
    $createEnv = Read-Host "Would you like me to create this file now? (y/n)"
    
    if ($createEnv -eq "y" -or $createEnv -eq "Y") {
        Write-Host "`n📝 Please paste your SERVICE_ROLE key: " -NoNewline -ForegroundColor Cyan
        $serviceKey = Read-Host
        
        if ([string]::IsNullOrWhiteSpace($serviceKey)) {
            Write-Host "❌ No key provided. Exiting..." -ForegroundColor Red
            exit 1
        }
        
        $envContent = @"
SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI
SUPABASE_SERVICE_ROLE_KEY=$serviceKey
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=wastewise-secret-2024
"@
        
        $envContent | Out-File -FilePath "backend\.env" -Encoding UTF8 -NoNewline
        Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Cannot proceed without .env file." -ForegroundColor Red
        Write-Host "   Please create backend\.env manually and run this script again." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "🔍 Checking backend/.env file..." -ForegroundColor Cyan

# Read .env and check for SERVICE_ROLE_KEY
$envContent = Get-Content "backend\.env" -Raw
if ($envContent -match "SUPABASE_SERVICE_ROLE_KEY=(\S+)") {
    $serviceKey = $Matches[1]
    if ($serviceKey -eq "YOUR_SERVICE_ROLE_KEY_HERE" -or $serviceKey.Length -lt 100) {
        Write-Host "❌ SERVICE_ROLE_KEY not set properly in .env!" -ForegroundColor Red
        Write-Host "   Please update backend\.env with your actual service role key." -ForegroundColor Yellow
        Write-Host "   Get it from: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/settings/api" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "✅ .env file configured properly" -ForegroundColor Green
    }
} else {
    Write-Host "❌ SUPABASE_SERVICE_ROLE_KEY not found in .env!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting database restoration..." -ForegroundColor Cyan
Write-Host "   This will restore all tables, indexes, and data..." -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Change to backend directory and run restoration
Push-Location backend

Write-Host "`n🔨 Executing restoration script..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

node database/restore-database-complete.js

$exitCode = $LASTEXITCODE

Pop-Location

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan

if ($exitCode -eq 0) {
    Write-Host "🎉 Database restoration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Populate with sample data:" -ForegroundColor White
    Write-Host "      cd backend && node populate-coffee-industry-simple.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Test the connection:" -ForegroundColor White
    Write-Host "      cd backend && node test-connection.js" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Start the backend server:" -ForegroundColor White
    Write-Host "      cd backend && npm start" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Database restoration completed with warnings." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Alternative method:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/sql/new" -ForegroundColor White
    Write-Host "   2. Open file: backend\database\setup-database-integrated.sql" -ForegroundColor White
    Write-Host "   3. Copy and paste ALL the content into the SQL Editor" -ForegroundColor White
    Write-Host "   4. Click RUN button" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

exit $exitCode


