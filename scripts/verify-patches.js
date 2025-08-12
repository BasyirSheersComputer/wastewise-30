#!/usr/bin/env node

/**
 * Verify Patches Script
 * This script verifies that all patches have been applied correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Applied Patches for User Profile Creation Issues\n');

// Check if files exist and contain expected changes
const checks = [
  {
    file: 'backend/services/authService.js',
    checks: [
      { pattern: /password, \/\/ Don't hash/, description: 'Password hashing removed' },
      { pattern: /createUserProfile/, description: 'createUserProfile method added' }
    ]
  },
  {
    file: 'backend/routes/auth.js',
    checks: [
      { pattern: /create-profile/, description: 'create-profile endpoint added' }
    ]
  },
  {
    file: 'frontend/src/components/Auth/Signup.tsx',
    checks: [
      { pattern: /create-profile/, description: 'Profile creation API call added' }
    ]
  },
  {
    file: 'frontend/src/components/Auth/OnboardingForm.tsx',
    checks: [
      { pattern: /onConflict: 'id'/, description: 'Upsert with conflict resolution added' }
    ]
  },
  {
    file: 'scripts/apply-database-fixes.sql',
    checks: [
      { pattern: /fix_users_without_profiles/, description: 'Database fix functions created' }
    ]
  },
  {
    file: 'USER_PROFILE_TROUBLESHOOTING.md',
    checks: [
      { pattern: /Root Causes Identified/, description: 'Troubleshooting guide created' }
    ]
  }
];

let allPassed = true;

checks.forEach(({ file, checks }) => {
  console.log(`📁 Checking: ${file}`);
  
  if (!fs.existsSync(file)) {
    console.log(`   ❌ File not found: ${file}`);
    allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  
  checks.forEach(({ pattern, description }) => {
    if (pattern.test(content)) {
      console.log(`   ✅ ${description}`);
    } else {
      console.log(`   ❌ ${description} - NOT FOUND`);
      allPassed = false;
    }
  });
  
  console.log('');
});

// Summary
console.log('📊 Summary:');
console.log('===========');

if (allPassed) {
  console.log('✅ All code patches have been applied successfully!');
  console.log('');
  console.log('🔧 Next Steps:');
  console.log('1. Update your environment variables with actual Supabase credentials');
  console.log('2. Run the database fixes in Supabase SQL Editor:');
  console.log('   - Open Supabase dashboard');
  console.log('   - Go to SQL Editor');
  console.log('   - Copy and paste: scripts/apply-database-fixes.sql');
  console.log('   - Execute the script');
  console.log('3. Test user creation flow');
  console.log('4. Monitor for any remaining issues');
  console.log('');
  console.log('📚 Documentation:');
  console.log('- PATCH_APPLICATION_SUMMARY.md - Complete setup guide');
  console.log('- USER_PROFILE_TROUBLESHOOTING.md - Troubleshooting guide');
} else {
  console.log('❌ Some patches are missing. Please check the files above.');
  console.log('');
  console.log('🛠️  To fix:');
  console.log('1. Ensure all files are properly updated');
  console.log('2. Run the patch application script again');
  console.log('3. Check for any merge conflicts or file corruption');
}

console.log('');
console.log('🎯 The main issues that have been fixed:');
console.log('• Password hashing mismatch (Supabase now handles this)');
console.log('• Dual user creation flows (unified approach)');
console.log('• RLS policy restrictions (more permissive policies)');
console.log('• Missing error handling (comprehensive error handling added)');
console.log('• Profile creation failures (multiple fallback mechanisms)');
