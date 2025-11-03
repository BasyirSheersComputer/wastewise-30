# Custom Domain Setup Fix - servora-ai.sheerssoft.com

**Issue**: Domain `servora-ai.sheerssoft.com` is mapped to non-existent service `wastewise-30`  
**Solution**: Remap to correct service `wastewise-frontend`  
**Status**: ⚠️ **ACTION REQUIRED**

---

## 🔍 Issue Identified

The domain mapping exists but points to the wrong service:

```
Current Mapping:
servora-ai.sheerssoft.com → wastewise-30 (❌ Does not exist)

Should Be:
servora-ai.sheerssoft.com → wastewise-frontend (✅ Active service)
```

---

## 🔧 Solution: Fix Domain Mapping

### Option 1: Using Cloud Console (Recommended - Easiest)

1. **Open Cloud Run Console**:
   👉 https://console.cloud.google.com/run?project=wastewise-402ba&region=asia-southeast1

2. **Click on `wastewise-frontend` service**

3. **Go to "DOMAIN MAPPINGS" tab**

4. **Click "MANAGE CUSTOM DOMAINS"**

5. **Remove old mapping**:
   - Find `servora-ai.sheerssoft.com` → `wastewise-30`
   - Click "Delete" or "Remove"

6. **Add new mapping**:
   - Click "ADD MAPPING"
   - Select service: `wastewise-frontend`
   - Enter domain: `servora-ai.sheerssoft.com`
   - Click "CONTINUE"
   - Verify DNS settings (should already be configured)
   - Click "DONE"

### Option 2: Using gcloud CLI

```bash
# First, try to delete the old mapping (may need to adjust command syntax)
gcloud run domain-mappings delete servora-ai.sheerssoft.com \
  --platform=managed \
  --region=asia-southeast1

# Then create new mapping to wastewise-frontend
gcloud run domain-mappings create \
  --service=wastewise-frontend \
  --domain=servora-ai.sheerssoft.com \
  --platform=managed \
  --region=asia-southeast1
```

**Note**: If the CLI commands don't work due to API changes, use the Cloud Console (Option 1).

---

## 🌐 DNS Configuration

Your DNS should be configured to point to Cloud Run. Verify these records:

### Check Current DNS
```bash
nslookup servora-ai.sheerssoft.com
```

### Required DNS Records

**For apex domain (servora-ai.sheerssoft.com)**:
```
Type: A
Name: servora-ai (or @)
Value: [Cloud Run IP - check in Cloud Console]
```

**OR use CNAME** (if supported by your DNS provider):
```
Type: CNAME
Name: servora-ai
Value: ghs.googlehosted.com
```

**For SSL Certificate**:
Google Cloud Run automatically provisions SSL certificates for custom domains.

---

## 📝 Backend API Domain (Optional but Recommended)

For a better architecture, consider setting up a subdomain for your backend API:

### Recommended Setup
- **Frontend**: `https://servora-ai.sheerssoft.com` → `wastewise-frontend`
- **Backend API**: `https://api.servora-ai.sheerssoft.com` → `wastewise-backend`

### Steps to Add API Subdomain

1. **In Cloud Console**:
   - Go to `wastewise-backend` service
   - Click "MANAGE CUSTOM DOMAINS"
   - Add mapping for `api.servora-ai.sheerssoft.com`

2. **Update DNS**:
   ```
   Type: CNAME
   Name: api.servora-ai
   Value: ghs.googlehosted.com
   ```

3. **Update frontend environment variables** (see below)

---

## 🔄 Update Environment Variables

After domain mapping is fixed, update the frontend to use the new domains:

### Update cloudbuild.yaml

Find this section:
```yaml
--build-arg
- 'VITE_API_BASE_URL=https://wastewise-backend-451983642521.asia-southeast1.run.app'
```

Change to:
```yaml
--build-arg
- 'VITE_API_BASE_URL=https://api.servora-ai.sheerssoft.com'
```

**OR** if not using subdomain for backend:
```yaml
--build-arg
- 'VITE_API_BASE_URL=https://wastewise-backend-451983642521.asia-southeast1.run.app'
```
(Keep the Cloud Run URL for backend if you're only mapping the frontend)

---

## 🚀 Redeploy After Changes

After fixing the domain mapping and updating configurations:

```bash
# Rebuild and deploy
gcloud builds submit --config cloudbuild.yaml .
```

---

## ✅ Verification Steps

After completing the setup:

### 1. Check Domain Mapping
```bash
gcloud beta run domain-mappings list --region=asia-southeast1
```

Expected output:
```
DOMAIN                       SERVICE              REGION
servora-ai.sheerssoft.com    wastewise-frontend   asia-southeast1
```

### 2. Test Frontend Access
```bash
# Should return 200 OK
curl -I https://servora-ai.sheerssoft.com
```

### 3. Test Backend API
```bash
# Should return healthy status
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/health
```

### 4. Check SSL Certificate
Open in browser: `https://servora-ai.sheerssoft.com`
- Click padlock icon
- Verify certificate is valid
- Certificate should be issued by Google Trust Services

---

## 🔍 Troubleshooting

### Issue: "Service wastewise-30 not found"
**Cause**: Old domain mapping exists  
**Fix**: Delete the old mapping and create a new one (see Solution above)

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN"
**Cause**: DNS not configured properly  
**Fix**: 
1. Check your DNS settings at your domain registrar
2. Ensure A or CNAME record points to Cloud Run
3. Wait 24-48 hours for DNS propagation

### Issue: "NET::ERR_CERT_COMMON_NAME_INVALID"
**Cause**: SSL certificate not provisioned yet  
**Fix**: 
1. Wait 15-30 minutes for Google to provision SSL certificate
2. Verify domain mapping is active in Cloud Console

### Issue: CORS errors in browser
**Cause**: Backend doesn't allow custom domain  
**Fix**: Already fixed! CORS now includes `servora-ai.sheerssoft.com`

---

## 📊 Current Status

| Component | Current URL | Should Be |
|-----------|-------------|-----------|
| Frontend | wastewise-frontend-451983642521.asia-southeast1.run.app | servora-ai.sheerssoft.com |
| Backend | wastewise-backend-451983642521.asia-southeast1.run.app | api.servora-ai.sheerssoft.com (optional) |

---

## 🎯 Quick Fix Summary

**Immediate Actions Required**:

1. ✅ **CORS Updated** - Backend now accepts requests from `servora-ai.sheerssoft.com`

2. ⏳ **Fix Domain Mapping** (5 minutes):
   - Open Cloud Console: https://console.cloud.google.com/run?project=wastewise-402ba
   - Delete old mapping: `servora-ai.sheerssoft.com` → `wastewise-30`
   - Create new mapping: `servora-ai.sheerssoft.com` → `wastewise-frontend`

3. ⏳ **Verify DNS** (if needed):
   - Check if DNS points to Cloud Run
   - Wait for SSL certificate provisioning (15-30 min)

4. ⏳ **Redeploy** (3 minutes):
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```

---

## 📞 Support Links

- **Cloud Run Console**: https://console.cloud.google.com/run?project=wastewise-402ba
- **Domain Mappings**: https://console.cloud.google.com/run/domains?project=wastewise-402ba
- **Cloud Run Custom Domains Docs**: https://cloud.google.com/run/docs/mapping-custom-domains

---

**After completing these steps**, your application will be accessible at:
- ✅ `https://servora-ai.sheerssoft.com` (Frontend)
- ✅ HTTPS with valid SSL certificate
- ✅ No CORS errors

**Estimated Time**: 5-10 minutes + DNS propagation time (if needed)

