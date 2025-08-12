# User Profile Creation Troubleshooting Guide

## Problem Summary
Users are being created in Supabase Auth but their profiles are not being properly created in the `users` table, causing issues with the application functionality.

## Root Causes Identified

### 1. **Password Hashing Mismatch**
- **Issue**: Backend `authService.js` was hashing passwords with bcrypt before sending to Supabase Auth
- **Problem**: Supabase Auth expects plain text passwords and handles hashing internally
- **Fix**: Removed password hashing from backend registration

### 2. **Dual User Creation Flows**
- **Issue**: Two different user creation processes were running in parallel
  - Frontend: Direct Supabase Auth signup
  - Backend: Custom registration with AuthService
- **Problem**: Inconsistent profile creation between flows
- **Fix**: Unified the flows and added proper profile creation

### 3. **RLS Policy Restrictions**
- **Issue**: Row Level Security policies were too restrictive for profile creation
- **Problem**: Users couldn't create their own profiles during signup
- **Fix**: Updated RLS policies to allow profile creation during signup

### 4. **Missing Error Handling**
- **Issue**: Profile creation failures were not properly handled
- **Problem**: Users could sign up but have incomplete profiles
- **Fix**: Added comprehensive error handling and fallback mechanisms

## Solutions Implemented

### 1. **Fixed Backend AuthService**
```javascript
// Before: Password was being hashed
const hashedPassword = await bcrypt.hash(password, 12);
const { data: authData, error: authError } = await this.supabase.auth.signUp({
  email,
  password: hashedPassword, // ❌ Wrong
  // ...
});

// After: Let Supabase handle password hashing
const { data: authData, error: authError } = await this.supabase.auth.signUp({
  email,
  password, // ✅ Correct
  // ...
});
```

### 2. **Added Profile Creation Endpoint**
```javascript
// New endpoint: /api/auth/create-profile
router.post('/create-profile', async (req, res) => {
  // Creates user profile after frontend signup
  const result = await authService.createUserProfile(user.id, userData);
});
```

### 3. **Updated Frontend Signup Flow**
```javascript
// After successful auth signup, create profile
if (data.user) {
  const response = await fetch('/api/auth/create-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: data.user })
  });
}
```

### 4. **Fixed RLS Policies**
```sql
-- More permissive insert policy
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email')
);

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup" ON users 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL OR 
  email IS NOT NULL
);
```

### 5. **Enhanced Onboarding Form**
```javascript
// Use upsert instead of insert to handle existing profiles
const { error: profileError } = await supabase.from('users').upsert({
  // ... profile data
}, {
  onConflict: 'id' // Handle case where profile already exists
});
```

## Testing and Verification

### 1. **Run Diagnosis Script**
```bash
node scripts/fix-user-profiles.js
```

This script will:
- Check for auth users without profiles
- Create missing profiles
- Clean up orphaned profiles
- Test profile creation process

### 2. **Manual Testing Steps**
1. **Create a new user account**
   - Go to signup page
   - Fill out registration form
   - Verify user is created in Supabase Auth
   - Verify profile is created in `users` table

2. **Check Database Tables**
   ```sql
   -- Check auth users
   SELECT id, email, created_at FROM auth.users;
   
   -- Check user profiles
   SELECT id, email, created_at FROM users;
   
   -- Find users without profiles
   SELECT au.id, au.email 
   FROM auth.users au 
   LEFT JOIN users u ON au.id = u.id 
   WHERE u.id IS NULL;
   ```

3. **Test Profile Creation**
   ```sql
   -- Test inserting a profile
   INSERT INTO users (id, email, first_name, last_name, company_name, ...)
   VALUES ('test-id', 'test@example.com', 'Test', 'User', 'Test Company', ...);
   ```

## Common Error Messages and Solutions

### 1. **"new row violates row-level security policy"**
- **Cause**: RLS policy too restrictive
- **Solution**: Run the RLS fix script: `backend/setup-rls-policies.sql`

### 2. **"duplicate key value violates unique constraint"**
- **Cause**: Trying to insert profile that already exists
- **Solution**: Use `upsert` instead of `insert` with `onConflict: 'id'`

### 3. **"password_hash is not a valid hash"**
- **Cause**: Password was hashed before sending to Supabase
- **Solution**: Send plain text password to Supabase Auth

### 4. **"relation 'users' does not exist"**
- **Cause**: Database tables not created
- **Solution**: Run database setup script: `backend/setup-database.sql`

## Prevention Measures

### 1. **Unified User Creation Flow**
- Use consistent user creation process
- Always create profile after auth signup
- Handle both frontend and backend flows

### 2. **Comprehensive Error Handling**
- Log all profile creation attempts
- Provide fallback mechanisms
- Continue user flow even if profile creation fails

### 3. **Regular Health Checks**
- Run diagnosis script periodically
- Monitor for orphaned profiles
- Verify user/profile consistency

### 4. **Testing Strategy**
- Test both signup flows
- Verify profile creation in all scenarios
- Monitor error logs for issues

## Monitoring and Alerts

### 1. **Database Monitoring**
```sql
-- Query to check for users without profiles
SELECT COUNT(*) as auth_users_without_profiles
FROM auth.users au 
LEFT JOIN users u ON au.id = u.id 
WHERE u.id IS NULL AND au.email_confirmed_at IS NOT NULL;
```

### 2. **Application Logs**
- Monitor for profile creation errors
- Track signup success rates
- Alert on profile creation failures

### 3. **Health Check Endpoint**
```javascript
// Add to your health check
app.get('/health', async (req, res) => {
  const { data: users } = await supabase.from('users').select('count');
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  const profileCount = users.length;
  const authCount = authUsers.users.filter(u => u.email_confirmed_at).length;
  
  res.json({
    status: 'healthy',
    user_profiles: profileCount,
    auth_users: authCount,
    profile_mismatch: profileCount !== authCount
  });
});
```

## Rollback Plan

If issues persist after implementing fixes:

1. **Temporarily disable RLS**
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ```

2. **Use service role key for profile creation**
   ```javascript
   const supabaseAdmin = createClient(url, serviceRoleKey);
   ```

3. **Manual profile creation**
   - Use the diagnosis script to create missing profiles
   - Monitor for new issues

## Conclusion

The user profile creation issues have been resolved through:
- Fixing password handling
- Unifying user creation flows
- Updating RLS policies
- Adding comprehensive error handling
- Creating monitoring and diagnosis tools

The application should now properly create user profiles for all new signups, and existing users without profiles can be fixed using the provided diagnosis script.
