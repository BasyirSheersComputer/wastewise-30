# 🔐 Secret Manager Setup Guide for WasteWise-30

## 📋 Overview

This guide explains how to set up individual secrets in Google Secret Manager and configure them to be accessible by both frontend and backend containers on Cloud Run.

## 🎯 What We're Setting Up

### **Backend Secrets** (Required for API functionality)
- `supabase-url` - Supabase project URL
- `supabase-anon-key` - Supabase anonymous key (public)
- `supabase-service-key` - Supabase service role key (private)
- `gemini-api-key` - Google Gemini API key for AI features
- `jwt-secret` - JWT signing secret for authentication

### **Backend Secrets** (Optional)
- `openai-api-key` - OpenAI API key for additional AI features
- `stripe-secret-key` - Stripe secret key for payment processing
- `stripe-webhook-secret` - Stripe webhook secret for payment events

### **Frontend Secrets** (Required for client-side functionality)
- `stripe-publishable-key` - Stripe publishable key for frontend payments

## 🚀 Quick Setup

### **Option 1: Automated Setup (Recommended)**

#### For Windows Users:
```powershell
# Run the PowerShell setup script
.\scripts\setup-individual-secrets.ps1
```

#### For Linux/Mac Users:
```bash
# Make the script executable
chmod +x scripts/setup-individual-secrets.sh

# Run the setup script
./scripts/setup-individual-secrets.sh
```

### **Option 2: Manual Setup**

If you prefer to create secrets manually, follow these steps:

#### 1. Create Backend Secrets
```bash
# Required secrets
gcloud secrets create supabase-url --project=wastewise-402ba --replication-policy="automatic"
gcloud secrets create supabase-anon-key --project=wastewise-402ba --replication-policy="automatic"
gcloud secrets create supabase-service-key --project=wastewise-402ba --replication-policy="automatic"
gcloud secrets create gemini-api-key --project=wastewise-402ba --replication-policy="automatic"
gcloud secrets create jwt-secret --project=wastewise-402ba --replication-policy="automatic"

# Optional secrets
gcloud secrets create openai-api-key --project=wastewise-402ba --replication-policy="automatic"
gcloud secrets create stripe-secret-key --project=wastewise-402ba --replication-policy="automatic"
gcloud secrets create stripe-webhook-secret --project=wastewise-402ba --replication-policy="automatic"
```

#### 2. Create Frontend Secrets
```bash
gcloud secrets create stripe-publishable-key --project=wastewise-402ba --replication-policy="automatic"
```

#### 3. Add Secret Values
```bash
# Add values to each secret
echo "your-supabase-url" | gcloud secrets versions add supabase-url --data-file=-
echo "your-supabase-anon-key" | gcloud secrets versions add supabase-anon-key --data-file=-
echo "your-supabase-service-key" | gcloud secrets versions add supabase-service-key --data-file=-
echo "your-gemini-api-key" | gcloud secrets versions add gemini-api-key --data-file=-
echo "your-jwt-secret" | gcloud secrets versions add jwt-secret --data-file=-
echo "your-stripe-publishable-key" | gcloud secrets versions add stripe-publishable-key --data-file=-
```

## 🔧 Configuration Details

### **Cloud Build Configuration**

The `config/jenkins/cloudbuild.yaml` file is configured to:

1. **Backend Deployment**: Maps secrets to environment variables
   ```yaml
   --set-secrets 'SUPABASE_URL=supabase-url:latest,SUPABASE_ANON_KEY=supabase-anon-key:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest,OPENAI_API_KEY=openai-api-key:latest,GEMINI_API_KEY=gemini-api-key:latest,STRIPE_SECRET_KEY=stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET=stripe-webhook-secret:latest,JWT_SECRET=jwt-secret:latest'
   ```

2. **Frontend Deployment**: Maps secrets to VITE_ environment variables
   ```yaml
   --set-secrets 'VITE_SUPABASE_URL=supabase-url:latest,VITE_SUPABASE_ANON_KEY=supabase-anon-key:latest,VITE_STRIPE_PUBLISHABLE_KEY=stripe-publishable-key:latest'
   ```

### **Available Secrets Section**

The Cloud Build configuration includes an `availableSecrets` section that defines which secrets are available during the build process:

```yaml
availableSecrets:
  secretManager:
    # Backend secrets
    - versionName: projects/$PROJECT_ID/secrets/supabase-url/versions/latest
      env: 'SUPABASE_URL'
    - versionName: projects/$PROJECT_ID/secrets/supabase-anon-key/versions/latest
      env: 'SUPABASE_ANON_KEY'
    # ... more secrets
```

## 🔍 Verification

### **1. Check Secret Creation**
```bash
# List all secrets
gcloud secrets list --project=wastewise-402ba

# View a specific secret (metadata only)
gcloud secrets describe supabase-url --project=wastewise-402ba
```

### **2. Test Secret Access**
```bash
# Access secret value (be careful with this in production)
gcloud secrets versions access latest --secret=supabase-url --project=wastewise-402ba
```

### **3. Verify Deployment**
After deployment, test the endpoints:

```bash
# Test backend health
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/health

# Test backend secrets
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/api/test

# Test database connection
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/api/test-db
```

### **4. Run Verification Script**
```bash
# Run the automated verification
node scripts/verify-secrets.js
```

## 🚀 Deployment

### **Deploy with Cloud Build**
```bash
# Deploy using the updated configuration
gcloud builds submit --config=config/jenkins/cloudbuild.yaml .
```

### **Monitor Deployment**
```bash
# Check build status
gcloud builds list --limit=5

# View build logs
gcloud builds log BUILD_ID

# Check Cloud Run services
gcloud run services list --region=asia-southeast1
```

## 🔒 Security Best Practices

### **1. Secret Rotation**
- Regularly rotate API keys and secrets
- Use different keys for development and production
- Monitor secret access logs

### **2. Access Control**
- Limit who can access secrets in Secret Manager
- Use IAM roles to control access
- Enable audit logging

### **3. Environment Separation**
- Use different projects for dev/staging/production
- Never share secrets between environments
- Use environment-specific secret names

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Secret Not Found**
```
Error: Secret 'supabase-url' not found
```
**Solution**: Create the secret first using the setup script or manual commands.

#### **2. Permission Denied**
```
Error: Permission denied on secret
```
**Solution**: Check IAM permissions for Secret Manager access.

#### **3. Environment Variable Not Set**
```
Error: SUPABASE_URL is undefined
```
**Solution**: Verify the secret mapping in Cloud Build configuration.

#### **4. AI Service Failing**
```
Error getting recommendations from AI service
```
**Solution**: Check if `gemini-api-key` secret is properly configured.

### **Debug Commands**

```bash
# Check Cloud Run service configuration
gcloud run services describe wastewise-backend --region=asia-southeast1

# View service logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-backend" --limit=10

# Test secret access from Cloud Run
gcloud run services update wastewise-backend --region=asia-southeast1 --set-env-vars DEBUG_SECRETS=true
```

## 📞 Support

If you encounter issues:

1. **Check the verification script output**
2. **Review Cloud Build logs**
3. **Verify secret values are correct**
4. **Ensure proper IAM permissions**

## 🎉 Success Indicators

Your setup is working correctly when:

- ✅ Backend health check returns 200 OK
- ✅ Database connection test shows 75%+ success rate
- ✅ AI service returns recommendations (not error messages)
- ✅ Frontend can connect to backend API
- ✅ All required secrets show "Configured" in test endpoint

---

**Next Steps**: After setting up secrets, deploy your application using Cloud Build and monitor the deployment logs for any issues.
