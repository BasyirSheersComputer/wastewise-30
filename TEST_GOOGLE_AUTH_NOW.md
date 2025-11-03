# 🧪 Test Google Auth - Complete Guide

**Status**: ✅ Code deployed, Supabase configuration required  
**Build**: 2d7c949e-a13d-4228-8b8b-4ae2a58e7006 (SUCCESS)  
**Date**: November 3, 2025

---

## ⚠️ CRITICAL: Configure Supabase First!

Before testing, you **MUST** configure redirect URLs in Supabase:

### Quick Setup (2 minutes)
1. **Open**: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/url-configuration

2. **Add Redirect URLs** (paste these):
   ```
   http://localhost:5173/auth/callback
   https://servora-ai.sheerssoft.com/auth/callback
   https://wastewise-frontend-451983642521.asia-southeast1.run.app/auth/callback
   ```

3. **Set Site URL**:
   ```
   https://servora-ai.sheerssoft.com
   ```

4. **Click SAVE** at the bottom

**Wait 1-2 minutes** for changes to propagate, then proceed to testing.

---

## 🧪 TESTING PROCEDURE

### Test 1: Check Supabase Client Status

1. **Open** (in Incognito mode): https://servora-ai.sheerssoft.com
2. **Press F12** to open DevTools
3. **Go to Console** tab
4. **Refresh the page**

**Look for these messages**:

✅ **GOOD** (Real client):
```
✅ Using real Supabase client for authentication
Supabase URL: https://fbdqrqknqphcyxbmnuaf.supabase.co
```

❌ **BAD** (Mock client):
```
⚠️ Using MOCK Supabase client - OAuth will not work!
⚠️ Supabase environment variables are not set or invalid!
```

**If you see BAD**:
- The build-time environment variables aren't being embedded
- Hard refresh: Ctrl+Shift+R
- Wait 2-3 minutes and try again (Cloud Run deployment might be still propagating)

---

### Test 2: Test Google Sign-In Flow

1. **Navigate to Login**:
   - Go to: https://servora-ai.sheerssoft.com/login
   - Or click "Sign In" button from homepage

2. **Click "Sign in with Google"** button

3. **Expected Behavior**:
   - ✅ Redirected to Google OAuth consent screen (accounts.google.com)
   - ✅ Shows: "WasteWise wants to access your Google Account"
   - ✅ Shows your Google email options

4. **Select Google Account** and click "Continue"

5. **Expected After Google OAuth**:
   - ✅ Redirected to: `https://servora-ai.sheerssoft.com/auth/callback#access_token=...`
   - ✅ Shows "Completing Sign In..." loading screen
   - ✅ Brief loading (1-2 seconds)
   - ✅ Redirected to `/dashboard` or `/onboarding`

6. **Verify You're Signed In**:
   - ✅ Dashboard loads (not login page)
   - ✅ User avatar/name shows in top right
   - ✅ Can access protected routes
   - ✅ Session persists after page refresh

---

### Test 3: Test Google Sign-Up Flow

1. **Navigate to Signup**:
   - Go to: https://servora-ai.sheerssoft.com/signup

2. **Click "Sign up with Google"** button

3. **Follow same OAuth flow** as Test 2

4. **Expected After OAuth**:
   - ✅ Redirected to `/auth/callback`
   - ✅ System detects this is a new user
   - ✅ Redirected to `/onboarding` (not dashboard)
   - ✅ Can complete onboarding process

---

## 🔍 DEBUGGING CHECKLIST

### Check 1: Browser Console
**Open DevTools (F12) → Console tab**

Look for:
- ✅ "Using real Supabase client" message
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ "OAuth authentication successful" message

**Red flags**:
- ❌ "Using MOCK Supabase client"
- ❌ "Failed to fetch" errors
- ❌ CORS policy errors
- ❌ "Invalid redirect URL" errors

### Check 2: Network Tab
**DevTools → Network tab**

When clicking "Sign in with Google":
1. **First request**: Should be to Supabase auth endpoint
2. **Redirect to**: accounts.google.com
3. **Callback to**: supabase.co/auth/v1/callback
4. **Final redirect**: /auth/callback on your domain

### Check 3: Application Tab
**DevTools → Application tab → Local Storage**

After successful auth:
- Should see `sb-[project-id]-auth-token` entry
- Contains access_token and refresh_token
- Session should persist

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: "Using MOCK Supabase client"
**Cause**: Environment variables not embedded in production build

**Fix**:
```bash
# Verify env vars in cloudbuild.yaml
grep "VITE_SUPABASE" cloudbuild.yaml

# Should show:
# VITE_SUPABASE_URL=https://fbdqrqknqphcyxbmnuaf.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# If missing or wrong, redeploy:
gcloud builds submit --config cloudbuild.yaml .
```

### Issue 2: "Invalid redirect URL" from Supabase
**Cause**: Redirect URLs not configured in Supabase dashboard

**Fix**:
1. Go to Supabase URL configuration (link above)
2. Add ALL redirect URLs including /auth/callback
3. Save and wait 1-2 minutes

### Issue 3: Redirects to # (hash only)
**Cause**: Supabase callback returns to base URL without processing

**Fix**:
1. Check that AuthCallback route is registered: `/auth/callback`
2. Verify browser console for errors
3. Check that detectSessionInUrl is true in Supabase client config

### Issue 4: "Session not found" after callback
**Cause**: Supabase session not being detected from URL hash

**Fix**:
1. Verify Supabase client has `detectSessionInUrl: true`
2. Check browser console for session data
3. Try in Incognito mode (clear cookies)

### Issue 5: Still redirects to wastewise-frontend URL
**Cause**: Using wrong domain in redirect configuration

**Fix**:
This is actually OK! The redirect uses `window.location.origin`, so:
- If you start at servora-ai.sheerssoft.com → redirects there
- If you start at wastewise-frontend URL → redirects there
Both work fine as long as URLs are configured in Supabase.

---

## 📊 VERIFICATION COMMANDS

### Check Frontend Build
```bash
# Should show recent deployment
gcloud run services describe wastewise-frontend --region=asia-southeast1 --format="value(status.latestReadyRevisionName)"
```

### Check Supabase Configuration
```bash
# Can't check via CLI - must use dashboard
# Open: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/url-configuration
```

### Test API Connectivity
```bash
# Should return version 1.1.0
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/health
```

---

## 🎯 STEP-BY-STEP TEST PROCEDURE

### Pre-Test Setup
```
1. Open Incognito/Private browser window
2. Clear any existing auth cookies
3. Open DevTools (F12)
4. Go to Console tab
```

### Test Execution
```
1. Navigate to: https://servora-ai.sheerssoft.com/login
2. Check console for "Using real Supabase client" message
3. Click "Sign in with Google" button
4. Approve Google OAuth consent
5. Watch URL change to /auth/callback
6. Wait for redirect to dashboard
7. Verify you're logged in
```

### Success Indicators
```
✅ Google OAuth consent screen appears
✅ Redirects to /auth/callback (not just #)
✅ "Completing Sign In..." screen shows
✅ Redirected to dashboard
✅ User avatar appears in top-right
✅ Can access protected routes
✅ Session persists on page refresh
```

---

## 📝 WHAT WE DEPLOYED

### New Files
- `frontend/src/components/Auth/AuthCallback.tsx` - OAuth callback handler

### Modified Files
- `frontend/src/App.tsx` - Added callback route
- `frontend/src/components/Auth/Login.tsx` - Updated redirectTo
- `frontend/src/components/Auth/Signup.tsx` - Updated redirectTo
- `frontend/src/supabaseClient.ts` - Enhanced client config

### Documentation
- `SUPABASE_AUTH_CONFIGURATION.md` - Complete setup guide

---

## ⏱️ TIMELINE

| Time | Action |
|------|--------|
| Now | Deploy completed (2m 59s) ✅ |
| +2 min | Configure Supabase redirect URLs ⏳ |
| +3 min | Wait for propagation |
| +5 min | Test OAuth flow ⏳ |
| +7 min | Verify sign-in works ⏳ |

**Total Time**: ~7-10 minutes from now

---

## 🎯 IMMEDIATE NEXT STEPS

### 1. Configure Supabase (CRITICAL - 2 minutes)
👉 https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf/auth/url-configuration

Add these redirect URLs:
```
http://localhost:5173/auth/callback
https://servora-ai.sheerssoft.com/auth/callback
https://wastewise-frontend-451983642521.asia-southeast1.run.app/auth/callback
```

Set site URL:
```
https://servora-ai.sheerssoft.com
```

**SAVE!**

### 2. Wait 2-3 Minutes
Allow time for:
- Supabase configuration to propagate
- Cloud Run deployment to fully roll out

### 3. Test OAuth (2 minutes)
1. Open https://servora-ai.sheerssoft.com/login in Incognito
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify dashboard loads

---

## ✅ SUCCESS CHECKLIST

- [x] Code changes deployed
- [ ] Supabase redirect URLs configured ⏳ **DO THIS NOW**
- [ ] Site URL set in Supabase
- [ ] Waited 2-3 minutes for propagation
- [ ] Tested in Incognito mode
- [ ] Google OAuth consent appears
- [ ] Callback page processes auth
- [ ] User redirected to dashboard
- [ ] Session persists

---

## 🎉 AFTER THIS WORKS

Once Google Auth is working:
- ✅ Users can sign in with Google
- ✅ Users can sign up with Google
- ✅ Sessions persist across page loads
- ✅ Protected routes are accessible
- ✅ Seamless auth experience

---

**Deployment**: ✅ COMPLETE  
**Supabase Config**: ⏳ **REQUIRED - 2 minutes**  
**Testing**: ⏳ Ready after Supabase config

**Next Action**: Configure Supabase redirect URLs NOW!

