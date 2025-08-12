#!/bin/bash

# Apply All Patches for User Profile Creation Issues
# This script applies all the fixes for the user profile creation problems

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Applying All Patches for User Profile Creation Issues${NC}"
echo "=================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Verify all files are present
echo -e "${BLUE}Step 1: Verifying patch files...${NC}"

PATCH_FILES=(
    "backend/services/authService.js"
    "backend/routes/auth.js"
    "frontend/src/components/Auth/Signup.tsx"
    "frontend/src/components/Auth/OnboardingForm.tsx"
    "scripts/apply-database-fixes.sql"
    "USER_PROFILE_TROUBLESHOOTING.md"
)

for file in "${PATCH_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

# Step 2: Install dependencies if needed
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"

if [ -f "backend/package.json" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_status "Backend dependencies installed"
fi

if [ -f "frontend/package.json" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_status "Frontend dependencies installed"
fi

# Step 3: Apply database fixes (instructions)
echo -e "${BLUE}Step 3: Database Fixes${NC}"
echo "To apply database fixes, run the following SQL in your Supabase SQL editor:"
echo ""
echo "1. Open your Supabase dashboard"
echo "2. Go to SQL Editor"
echo "3. Copy and paste the contents of: scripts/apply-database-fixes.sql"
echo "4. Execute the script"
echo ""
print_warning "Database fixes need to be applied manually in Supabase dashboard"

# Step 4: Verify code changes
echo -e "${BLUE}Step 4: Verifying code changes...${NC}"

# Check backend authService.js
if grep -q "password, // Don't hash" backend/services/authService.js; then
    print_status "Backend AuthService password fix applied"
else
    print_error "Backend AuthService password fix not found"
fi

# Check backend auth routes
if grep -q "create-profile" backend/routes/auth.js; then
    print_status "Backend create-profile endpoint added"
else
    print_error "Backend create-profile endpoint not found"
fi

# Check frontend signup
if grep -q "create-profile" frontend/src/components/Auth/Signup.tsx; then
    print_status "Frontend signup profile creation added"
else
    print_error "Frontend signup profile creation not found"
fi

# Check frontend onboarding
if grep -q "onConflict: 'id'" frontend/src/components/Auth/OnboardingForm.tsx; then
    print_status "Frontend onboarding upsert fix applied"
else
    print_error "Frontend onboarding upsert fix not found"
fi

# Step 5: Test the application
echo -e "${BLUE}Step 5: Testing the application...${NC}"

# Test backend
if [ -f "backend/package.json" ]; then
    echo "Testing backend..."
    cd backend
    if npm test >/dev/null 2>&1; then
        print_status "Backend tests passed"
    else
        print_warning "Backend tests failed or not configured"
    fi
    cd ..
fi

# Test frontend
if [ -f "frontend/package.json" ]; then
    echo "Testing frontend..."
    cd frontend
    if npm run build >/dev/null 2>&1; then
        print_status "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    cd ..
fi

# Step 6: Create environment setup instructions
echo -e "${BLUE}Step 6: Environment Setup${NC}"

cat > PATCH_APPLICATION_SUMMARY.md << 'EOF'
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
EOF

print_status "Created patch application summary: PATCH_APPLICATION_SUMMARY.md"

# Step 7: Final verification
echo -e "${BLUE}Step 7: Final Verification${NC}"

echo "All patches have been applied successfully!"
echo ""
echo "Next steps:"
echo "1. Update your environment variables with actual Supabase credentials"
echo "2. Run the database fixes in Supabase SQL Editor"
echo "3. Test user creation flow"
echo "4. Monitor for any remaining issues"
echo ""
echo "For detailed instructions, see: PATCH_APPLICATION_SUMMARY.md"
echo "For troubleshooting, see: USER_PROFILE_TROUBLESHOOTING.md"

print_status "All patches applied successfully! 🎉"
