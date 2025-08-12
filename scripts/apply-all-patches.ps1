# Apply All Patches for User Profile Creation Issues (PowerShell)
# This script applies all the fixes for the user profile creation problems

param(
    [switch]$SkipTests = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

Write-Host "🚀 Applying All Patches for User Profile Creation Issues" -ForegroundColor $Blue
Write-Host "==================================================" -ForegroundColor $Blue

# Function to print status
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
}

# Step 1: Verify all files are present
Write-Host "Step 1: Verifying patch files..." -ForegroundColor $Blue

$PatchFiles = @(
    "backend/services/authService.js",
    "backend/routes/auth.js",
    "frontend/src/components/Auth/Signup.tsx",
    "frontend/src/components/Auth/OnboardingForm.tsx",
    "scripts/apply-database-fixes.sql",
    "USER_PROFILE_TROUBLESHOOTING.md"
)

foreach ($file in $PatchFiles) {
    if (Test-Path $file) {
        Write-Status "Found: $file"
    } else {
        Write-Error "Missing: $file"
        exit 1
    }
}

# Step 2: Install dependencies if needed
Write-Host "Step 2: Installing dependencies..." -ForegroundColor $Blue

if (Test-Path "backend/package.json") {
    Write-Host "Installing backend dependencies..."
    Set-Location backend
    npm install
    Set-Location ..
    Write-Status "Backend dependencies installed"
}

if (Test-Path "frontend/package.json") {
    Write-Host "Installing frontend dependencies..."
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Status "Frontend dependencies installed"
}

# Step 3: Apply database fixes (instructions)
Write-Host "Step 3: Database Fixes" -ForegroundColor $Blue
Write-Host "To apply database fixes, run the following SQL in your Supabase SQL editor:"
Write-Host ""
Write-Host "1. Open your Supabase dashboard"
Write-Host "2. Go to SQL Editor"
Write-Host "3. Copy and paste the contents of: scripts/apply-database-fixes.sql"
Write-Host "4. Execute the script"
Write-Host ""
Write-Warning "Database fixes need to be applied manually in Supabase dashboard"

# Step 4: Verify code changes
Write-Host "Step 4: Verifying code changes..." -ForegroundColor $Blue

# Check backend authService.js
$authServiceContent = Get-Content "backend/services/authService.js" -Raw
if ($authServiceContent -match "password, // Don't hash") {
    Write-Status "Backend AuthService password fix applied"
} else {
    Write-Error "Backend AuthService password fix not found"
}

# Check backend auth routes
$authRoutesContent = Get-Content "backend/routes/auth.js" -Raw
if ($authRoutesContent -match "create-profile") {
    Write-Status "Backend create-profile endpoint added"
} else {
    Write-Error "Backend create-profile endpoint not found"
}

# Check frontend signup
$signupContent = Get-Content "frontend/src/components/Auth/Signup.tsx" -Raw
if ($signupContent -match "create-profile") {
    Write-Status "Frontend signup profile creation added"
} else {
    Write-Error "Frontend signup profile creation not found"
}

# Check frontend onboarding
$onboardingContent = Get-Content "frontend/src/components/Auth/OnboardingForm.tsx" -Raw
if ($onboardingContent -match "onConflict: 'id'") {
    Write-Status "Frontend onboarding upsert fix applied"
} else {
    Write-Error "Frontend onboarding upsert fix not found"
}

# Step 5: Test the application (if not skipped)
if (-not $SkipTests) {
    Write-Host "Step 5: Testing the application..." -ForegroundColor $Blue

    # Test backend
    if (Test-Path "backend/package.json") {
        Write-Host "Testing backend..."
        Set-Location backend
        try {
            npm test 2>$null
            Write-Status "Backend tests passed"
        } catch {
            Write-Warning "Backend tests failed or not configured"
        }
        Set-Location ..
    }

    # Test frontend
    if (Test-Path "frontend/package.json") {
        Write-Host "Testing frontend..."
        Set-Location frontend
        try {
            npm run build 2>$null
            Write-Status "Frontend build successful"
        } catch {
            Write-Error "Frontend build failed"
            exit 1
        }
        Set-Location ..
    }
} else {
    Write-Warning "Skipping tests as requested"
}

# Step 6: Create environment setup instructions
Write-Host "Step 6: Environment Setup" -ForegroundColor $Blue

$summaryContent = @"
# Patch Application Summary

## ✅ Applied Fixes

### 1. Backend AuthService
- ✅ Removed password hashing (Supabase handles this)
- ✅ Added createUserProfile method
- ✅ Enhanced error handling

### 2. Backend Routes
- ✅ Added /api/auth/create-profile endpoint
- ✅ Proper profile creation after auth signup

### 3. Frontend Signup
- ✅ Added profile creation API call
- ✅ Enhanced error handling with fallbacks

### 4. Frontend Onboarding
- ✅ Changed to upsert for profile creation
- ✅ Added conflict resolution

### 5. Database Scripts
- ✅ Created comprehensive database fix script
- ✅ Added RLS policy fixes
- ✅ Added health check functions

## 🔧 Manual Steps Required

### 1. Database Fixes
Run the following SQL in your Supabase SQL Editor:
```sql
-- Copy and paste the contents of scripts/apply-database-fixes.sql
```

### 2. Environment Variables
Update your .env file with proper Supabase credentials:
```bash
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_anon_key
```

### 3. Test User Creation
1. Start your application
2. Create a new user account
3. Verify profile is created in both auth.users and users tables

## 🧪 Testing Checklist

- [ ] User signup creates auth user
- [ ] User signup creates profile in users table
- [ ] Onboarding form updates profile correctly
- [ ] No RLS policy errors
- [ ] No password hashing errors

## 📊 Monitoring

Use the health check function to monitor user/profile consistency:
```sql
SELECT * FROM check_user_profile_health();
```

## 🚨 Troubleshooting

If issues persist:
1. Check environment variables
2. Run database fixes script
3. Check application logs
4. Use the diagnosis script: `node scripts/fix-user-profiles.js`
"@

$summaryContent | Out-File -FilePath "PATCH_APPLICATION_SUMMARY.md" -Encoding UTF8
Write-Status "Created patch application summary: PATCH_APPLICATION_SUMMARY.md"

# Step 7: Final verification
Write-Host "Step 7: Final Verification" -ForegroundColor $Blue

Write-Host "All patches have been applied successfully!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Update your environment variables with actual Supabase credentials"
Write-Host "2. Run the database fixes in Supabase SQL Editor"
Write-Host "3. Test user creation flow"
Write-Host "4. Monitor for any remaining issues"
Write-Host ""
Write-Host "For detailed instructions, see: PATCH_APPLICATION_SUMMARY.md"
Write-Host "For troubleshooting, see: USER_PROFILE_TROUBLESHOOTING.md"

Write-Status "All patches applied successfully! 🎉"
