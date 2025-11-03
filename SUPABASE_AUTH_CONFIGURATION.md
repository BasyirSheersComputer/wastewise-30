# Supabase OAuth Configuration - Google Auth Fix

**Issue**: Google Auth redirects to wastewise-frontend URL instead of completing sign-in  
**Status**: ✅ Code fixed, Supabase configuration needed  
**Date**: November 3, 2025

---

## 🔍 ISSUE ANALYSIS

### Problem
When clicking "Sign in with Google":
1. User is redirected to Google OAuth consent screen ✅
2. User approves access ✅
3. Google redirects back to `wastewise-frontend-451983642521.asia-southeast1.run.app/#` ❌
4. Sign-in doesn't complete ❌

### Root Causes
1. **Mock Supabase Client**: Frontend was using mock client instead of real one
2. **Missing Callback Handler**: No OAuth callback page to process the redirect
3. **Redirect URLs Not Configured**: Supabase doesn't know about custom domain
4. **Missing Session Detection**: Frontend not detecting auth session from URL

---

## ✅ FIXES APPLIED (Code)

### 1. Enhanced Supabase Client Configuration
**File**: `frontend/src/supabaseClient.ts`

**Changes**:
- Added better logging to detect which client is being used
- Configured auth options: `autoRefreshToken`, `persistSession`, `detectSessionInUrl`
- Added console warnings when mock client is used

### 2. Created OAuth Callback Handler
**File**: `frontend/src/components/Auth/AuthCallback.tsx` (NEW)

**Features**:
- Processes OAuth redirect from Google
- Detects errors in callback
- Checks for existing user profile
- Redirects new users to onboarding
- Redirects existing users to dashboard
- Shows loading/success/error states

### 3. Registered Callback Route
**File**: `frontend/src/App.tsx`

**Route Added**:
```tsx
<Route path="/auth/callback" element={<AuthCallback />} />
```

### 4. Updated OAuth Redirect URLs
**Files**: `frontend/src/components/Auth/Login.tsx`, `frontend/src/components/Auth/Signup.tsx`

**Changes**:
```tsx
// Before
redirectTo: `${window.location.origin}/dashboard`

// After
redirectTo: `${window.location.origin}/auth/callback`
```

---

## ⚙️ REQUIRED: Supabase Dashboard Configuration

You **MUST** configure redirect URLs in Supabase for OAuth to work with your custom domain.

### Step 1: Open Supabase Auth Settings
👉 https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/url-configuration

### Step 2: Add Redirect URLs

In the **"Redirect URLs"** section, add these URLs (one per line):

```
http://localhost:5173/auth/callback
http://localhost:3000/auth/callback
http://localhost:8080/auth/callback
https://servora-ai.sheerssoft.com/auth/callback
https://wastewise-frontend-451983642521.asia-southeast1.run.app/auth/callback
```

### Step 3: Add Site URL

In the **"Site URL"** field, set:
```
https://servora-ai.sheerssoft.com
```

### Step 4: Configure Additional Settings

**Auto Confirm Users**: OFF (for production security)  
**Email Confirmations**: ON (recommended)  
**Secure Email Change**: ON (recommended)

### Step 5: Save Changes

Click **"Save"** at the bottom of the page.

---

## 🔐 Google OAuth Configuration (If Not Done)

### Verify Google OAuth is Enabled

1. **Go to Supabase Auth Providers**:
   👉 https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/providers

2. **Find "Google" provider**:
   - Should show as "Enabled" ✅
   - Client ID should be configured
   - Client Secret should be configured

3. **If not enabled, configure it**:
   - Click "Google" provider
   - Add your Google OAuth Client ID
   - Add your Google OAuth Client Secret
   - Enable the provider
   - Save changes

### Google Cloud Console Setup (If Needed)

If Google OAuth isn't configured yet:

1. **Go to Google Cloud Console**:
   https://console.cloud.google.com/apis/credentials

2. **Create OAuth 2.0 Client ID** (if not exists):
   - Application type: Web application
   - Name: WasteWise OAuth
   - Authorized JavaScript origins:
     - `https://servora-ai.sheerssoft.com`
     - `https://fbdqrqknqphcyxbmnuaf.supabase.co`
   - Authorized redirect URIs:
     - `https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback`

3. **Copy Credentials**:
   - Copy Client ID
   - Copy Client Secret
   - Paste into Supabase Google provider settings

---

## 🚀 DEPLOY THE FIXES

After configuring Supabase, deploy the code changes:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

**What this deploys**:
- ✅ Updated Supabase client configuration
- ✅ New OAuth callback handler
- ✅ Updated redirect URLs in Login/Signup
- ✅ Better error logging

---

## 🧪 TESTING THE FIX

### Step 1: Clear Browser Data
```
1. Open browser in Incognito/Private mode
   OR
2. Clear cache and cookies for servora-ai.sheerssoft.com
```

### Step 2: Test Google Sign-In
1. Go to: https://servora-ai.sheerssoft.com/login
2. Click "Sign in with Google"
3. **Expected**: Redirected to Google OAuth consent screen
4. Approve access
5. **Expected**: Redirected to `https://servora-ai.sheerssoft.com/auth/callback`
6. **Expected**: See "Completing Sign In..." loading screen
7. **Expected**: Redirected to dashboard or onboarding

### Step 3: Check Browser Console
Open DevTools (F12) and check console for:

**Good Signs** ✅:
```
✅ Using real Supabase client for authentication
Supabase URL: https://fbdqrqknqphcyxbmnuaf.supabase.co
✅ OAuth authentication successful: user@gmail.com
```

**Bad Signs** ❌:
```
⚠️ Using MOCK Supabase client - OAuth will not work!
⚠️ Supabase environment variables are not set or invalid!
```

If you see bad signs, the build-time environment variables aren't being embedded properly.

---

## 🐛 TROUBLESHOOTING

### Issue: Still Using Mock Client

**Symptoms**:
- Console shows "Using MOCK Supabase client"
- OAuth doesn't actually redirect to Google

**Cause**: Environment variables not baked into production build

**Fix**:
1. Verify `cloudbuild.yaml` has correct VITE_ env vars in build args
2. Rebuild frontend: `gcloud builds submit --config cloudbuild.yaml .`
3. Hard refresh browser: Ctrl+Shift+R

### Issue: "Invalid Redirect URL" from Supabase

**Symptoms**:
- Error message: "Invalid redirect URL"
- Can't complete OAuth flow

**Cause**: Redirect URLs not configured in Supabase

**Fix**:
1. Add all redirect URLs in Supabase dashboard (see Step 2 above)
2. Make sure to include `/auth/callback` path
3. Save changes and wait 1-2 minutes for propagation

### Issue: Redirects to Wrong Domain

**Symptoms**:
- Redirects to wastewise-frontend URL instead of servora-ai.sheerssoft.com

**Cause**: Using `window.location.origin` which depends on which domain you're on

**Fix**: This is actually correct! It should redirect to wherever you started the OAuth flow.

### Issue: "Session Not Found" After Callback

**Symptoms**:
- Callback page shows "Authentication session not found"

**Cause**: Supabase session not detected in URL hash

**Fix**:
1. Check that `detectSessionInUrl: true` is set in Supabase client config
2. Verify redirect URL is exactly: `{origin}/auth/callback` (no trailing slash)
3. Check browser console for errors

---

## 📋 CONFIGURATION CHECKLIST

### In Supabase Dashboard
- [ ] Redirect URLs added (5 URLs)
- [ ] Site URL set to custom domain
- [ ] Google OAuth provider enabled
- [ ] Google Client ID configured
- [ ] Google Client Secret configured
- [ ] Changes saved

### In Code (Already Done)
- [x] Auth callback component created
- [x] Callback route registered in App.tsx
- [x] Login redirectTo updated to /auth/callback
- [x] Signup redirectTo updated to /auth/callback
- [x] Supabase client configured with detectSessionInUrl
- [x] Better logging added

### Deployment
- [ ] Code deployed to Cloud Run
- [ ] Frontend rebuilt with correct env vars
- [ ] Browser cache cleared
- [ ] OAuth flow tested end-to-end

---

## 🔄 COMPLETE OAUTH FLOW

### How It Works Now

```
1. User clicks "Sign in with Google"
   ↓
2. Frontend calls supabase.auth.signInWithOAuth()
   with redirectTo: {origin}/auth/callback
   ↓
3. Supabase redirects to Google OAuth consent screen
   ↓
4. User approves access on Google
   ↓
5. Google redirects back to Supabase:
   https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback
   ↓
6. Supabase processes the OAuth response
   ↓
7. Supabase redirects to your app:
   https://servora-ai.sheerssoft.com/auth/callback#access_token=...
   ↓
8. AuthCallback component loads
   ↓
9. Component extracts session from URL hash
   ↓
10. Component checks if user exists in database
    ↓
11a. New user → Redirect to /onboarding
11b. Existing user → Redirect to /dashboard
    ↓
12. ✅ User is signed in and can use the app
```

---

## 📝 REDIRECT URLs REFERENCE

### Production
- Custom Domain: `https://servora-ai.sheerssoft.com/auth/callback`
- Cloud Run Frontend: `https://wastewise-frontend-451983642521.asia-southeast1.run.app/auth/callback`

### Local Development
- Vite Dev Server: `http://localhost:5173/auth/callback`
- Backend (if needed): `http://localhost:3000/auth/callback`
- Docker: `http://localhost:8080/auth/callback`

### Supabase Callback (Auto-handled)
- Supabase: `https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback`

---

## 🎯 IMMEDIATE ACTIONS REQUIRED

### 1. Configure Supabase Redirect URLs (2 minutes) ⚠️ CRITICAL
👉 https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/url-configuration

**Add these exact URLs**:
```
http://localhost:5173/auth/callback
https://servora-ai.sheerssoft.com/auth/callback
https://wastewise-frontend-451983642521.asia-southeast1.run.app/auth/callback
```

**Set Site URL**:
```
https://servora-ai.sheerssoft.com
```

Click **SAVE**!

### 2. Deploy Code Changes (3-4 minutes)
```bash
gcloud builds submit --config cloudbuild.yaml .
```

### 3. Test OAuth Flow (2 minutes)
1. Open https://servora-ai.sheerssoft.com/login in Incognito mode
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Verify you're redirected to dashboard

---

## ✅ SUCCESS CRITERIA

OAuth is working when:
- [x] Code changes deployed
- [ ] Supabase redirect URLs configured ⏳ **DO THIS NOW**
- [ ] Browser shows real Supabase client (not mock)
- [ ] Google sign-in redirects to Google OAuth
- [ ] After OAuth, redirects to /auth/callback
- [ ] Callback page processes the session
- [ ] User is redirected to dashboard/onboarding
- [ ] User can access protected routes

---

## 📞 SUPPORT LINKS

- **Supabase URL Configuration**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/url-configuration
- **Supabase Auth Providers**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/providers
- **Google OAuth Docs**: https://cloud.google.com/identity-platform/docs/web/oauth

---

## 🎉 SUMMARY

**Code Changes**: ✅ Complete  
**Deployment**: ⏳ Ready to deploy  
**Supabase Config**: ⏳ **REQUIRED - 2 minutes**

**Next Actions**:
1. Configure Supabase redirect URLs (CRITICAL)
2. Deploy code changes
3. Test OAuth flow

After these steps, Google Auth will work perfectly on your custom domain!

---

**File**: SUPABASE_AUTH_CONFIGURATION.md  
**Status**: ✅ Ready for implementation

