# 🔐 Google OAuth Setup Guide for WasteWise-30

## 🎯 **Objective**
Enable Google OAuth authentication in Supabase so that both user login and Google OAuth work properly from the frontend.

## 📋 **Current Status**
- ✅ Frontend environment variables configured
- ✅ Backend authentication endpoints working
- ✅ Supabase connection established
- ❌ Google OAuth not configured in Supabase dashboard

---

## 🚀 **Step-by-Step Setup Instructions**

### **Step 1: Google Cloud Console Setup**

#### **1.1 Create Google OAuth 2.0 Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
5. Choose **Web application** as the application type
6. Set the following:
   - **Name**: `WasteWise-30 OAuth Client`
   - **Authorized JavaScript origins**:
     ```
     https://wastewise-frontend-451983642521.asia-southeast1.run.app
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     ```
7. Click **Create**
8. **Save the Client ID and Client Secret** (you'll need these for Supabase)

#### **1.2 Enable Google+ API (if not already enabled)**
1. Go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity"
3. Enable the API if it's not already enabled

### **Step 2: Supabase Dashboard Configuration**

#### **2.1 Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `fbdqrqknqphcyxbmnuaf`

#### **2.2 Configure Authentication Settings**
1. Navigate to **Authentication** > **Settings**
2. Under **Site URL**, ensure it's set to:
   ```
   https://wastewise-frontend-451983642521.asia-southeast1.run.app
   ```
3. Under **Redirect URLs**, add:
   ```
   https://wastewise-frontend-451983642521.asia-southeast1.run.app/dashboard
   https://wastewise-frontend-451983642521.asia-southeast1.run.app/onboarding
   https://wastewise-frontend-451983642521.asia-southeast1.run.app/auth/callback
   ```

#### **2.3 Enable Google OAuth Provider**
1. Navigate to **Authentication** > **Providers**
2. Find **Google** in the list
3. Click **Enable**
4. Enter the following details:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
   - **Redirect URL**: `https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback`
5. Click **Save**

#### **2.4 Configure OAuth Scopes (Optional)**
1. In the Google provider settings, you can configure additional scopes:
   ```
   email
   profile
   openid
   ```

### **Step 3: Test the Configuration**

#### **3.1 Test Email/Password Authentication**
1. Open the frontend: https://wastewise-frontend-451983642521.asia-southeast1.run.app
2. Navigate to login/signup page
3. Try creating an account with email/password
4. Check browser console for any errors
5. Monitor network tab for Supabase API calls

#### **3.2 Test Google OAuth Authentication**
1. On the same page, click "Sign in with Google"
2. You should be redirected to Google's OAuth consent screen
3. After authorization, you should be redirected back to the application
4. Check browser console for any errors
5. Monitor network tab for OAuth flow

---

## 🔍 **Troubleshooting Common Issues**

### **Issue 1: "Invalid redirect URI" Error**
**Symptoms**: Google OAuth returns "Invalid redirect URI" error
**Solution**:
1. Check that the redirect URI in Google Cloud Console matches exactly:
   ```
   https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback
   ```
2. Ensure there are no extra spaces or characters
3. Verify the Supabase project URL is correct

### **Issue 2: "OAuth provider not configured" Error**
**Symptoms**: Frontend shows "OAuth provider not configured" error
**Solution**:
1. Verify Google OAuth is enabled in Supabase dashboard
2. Check that Client ID and Client Secret are correctly entered
3. Ensure the redirect URL is properly configured

### **Issue 3: "CORS Error" in Browser Console**
**Symptoms**: Browser console shows CORS-related errors
**Solution**:
1. Check that the authorized origins in Google Cloud Console include:
   ```
   https://wastewise-frontend-451983642521.asia-southeast1.run.app
   ```
2. Verify Supabase site URL is correctly set

### **Issue 4: "Authentication failed" Error**
**Symptoms**: OAuth flow completes but authentication fails
**Solution**:
1. Check Supabase logs for authentication errors
2. Verify user creation in Supabase Auth dashboard
3. Check if user profile is being created in the `users` table

---

## 📊 **Verification Checklist**

### **✅ Google Cloud Console**
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized JavaScript origins configured
- [ ] Authorized redirect URIs configured
- [ ] Google+ API enabled

### **✅ Supabase Dashboard**
- [ ] Google OAuth provider enabled
- [ ] Client ID and Client Secret entered
- [ ] Redirect URL configured
- [ ] Site URL set correctly
- [ ] Redirect URLs configured

### **✅ Frontend Testing**
- [ ] Email/password authentication works
- [ ] Google OAuth button appears
- [ ] OAuth flow redirects to Google
- [ ] User is redirected back after authorization
- [ ] User session is created successfully
- [ ] User profile is created in database

### **✅ Backend Testing**
- [ ] Authentication endpoints respond correctly
- [ ] OAuth callback handling works
- [ ] User profile creation works
- [ ] Session management works

---

## 🛠️ **Useful Commands for Testing**

### **Test Frontend Authentication**
```bash
node scripts/test-frontend-authentication.js
```

### **Test Backend Authentication**
```bash
node scripts/test-authentication.js
```

### **Check Supabase Connection**
```bash
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/api/test-db
```

### **Monitor Backend Logs**
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-backend" --limit=10
```

---

## 📞 **Support Information**

### **Google Cloud Console**
- **Project**: Your Google Cloud project
- **OAuth Client**: `WasteWise-30 OAuth Client`
- **Redirect URI**: `https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback`

### **Supabase Project**
- **Project URL**: `https://fbdqrqknqphcyxbmnuaf.supabase.co`
- **Project ID**: `fbdqrqknqphcyxbmnuaf`
- **Site URL**: `https://wastewise-frontend-451983642521.asia-southeast1.run.app`

### **Frontend Application**
- **URL**: `https://wastewise-frontend-451983642521.asia-southeast1.run.app`
- **Backend API**: `https://wastewise-backend-451983642521.asia-southeast1.run.app`

---

## 🎯 **Expected Results**

After completing this setup:

1. **Email/Password Authentication**: Users can sign up and log in with email/password
2. **Google OAuth**: Users can sign in with their Google account
3. **User Profiles**: Both authentication methods create user profiles in the database
4. **Session Management**: Users remain logged in across page refreshes
5. **Redirect Handling**: Users are properly redirected after authentication

---

**🎉 Success**: Once Google OAuth is configured, both authentication methods should work seamlessly from the frontend, calling Supabase directly for authentication.
