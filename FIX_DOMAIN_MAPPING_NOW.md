# 🚨 FIX DOMAIN MAPPING - QUICK GUIDE

**Issue**: `servora-ai.sheerssoft.com` → Points to wrong service `wastewise-30` ❌  
**Fix Time**: **2 minutes** ⏱️

---

## 🎯 THE PROBLEM

Your domain is mapped to a service that doesn't exist:
```
servora-ai.sheerssoft.com → wastewise-30 (DOES NOT EXIST) ❌
```

Should be:
```
servora-ai.sheerssoft.com → wastewise-frontend (EXISTS AND RUNNING) ✅
```

---

## ⚡ QUICK FIX (2 Minutes)

### Step 1: Open Cloud Run Domain Mappings Page
👉 **Click here**: https://console.cloud.google.com/run/domains?project=wastewise-402ba

### Step 2: Delete Old Mapping
1. Find the entry: `servora-ai.sheerssoft.com` → `wastewise-30`
2. Click the **three dots (⋮)** on the right
3. Click **"Delete"**
4. Confirm deletion

### Step 3: Create New Mapping
1. Click **"MAP DOMAIN"** button (top right)
2. Select **"wastewise-frontend"** from dropdown
3. Choose **"Verify a new domain"** (or use existing verification)
4. Enter: `servora-ai.sheerssoft.com`
5. Click **"CONTINUE"**
6. Click **"DONE"**

### Step 4: Wait for SSL Provisioning
- Google will automatically provision an SSL certificate
- This takes **5-15 minutes**
- You'll see status change from "Pending" to "Active"

---

## 📋 ALTERNATIVE: Using Console Services Page

If the above link doesn't work:

1. Go to: https://console.cloud.google.com/run?project=wastewise-402ba&region=asia-southeast1
2. Click on **"wastewise-frontend"** service
3. Click **"DOMAIN MAPPINGS"** tab at the top
4. Click **"MANAGE CUSTOM DOMAINS"**
5. Add `servora-ai.sheerssoft.com` to this service
6. Remove it from the old `wastewise-30` service if needed

---

## ✅ VERIFY IT WORKED

After completing the steps above:

### 1. Check Domain Mapping Status
```bash
gcloud beta run domain-mappings list --region=asia-southeast1
```

**Expected output**:
```
DOMAIN                       SERVICE              REGION           STATUS
servora-ai.sheerssoft.com    wastewise-frontend   asia-southeast1  Active
```

### 2. Test the Domain
Open in browser: https://servora-ai.sheerssoft.com

**Expected**: Your WasteWise application loads ✅

### 3. Check SSL Certificate
1. Look for the padlock icon in browser
2. Click it to view certificate
3. Should say "Issued by: Google Trust Services"

---

## 🌐 DNS CONFIGURATION (If Needed)

Your DNS should already be configured, but if `servora-ai.sheerssoft.com` doesn't resolve:

### Check DNS
```bash
nslookup servora-ai.sheerssoft.com
```

### Configure DNS at Your Domain Registrar

**Option A: Using A Records** (Recommended)
```
Type: A
Name: servora-ai
Value: [Get this from Cloud Console Domain Mappings page]
TTL: 3600
```

**Option B: Using CNAME**
```
Type: CNAME
Name: servora-ai
Value: ghs.googlehosted.com
TTL: 3600
```

**Note**: DNS changes can take 24-48 hours to propagate globally

---

## 🔧 WHAT WE ALREADY FIXED

✅ **CORS Configuration**: Backend now accepts requests from `servora-ai.sheerssoft.com`  
✅ **IAM Permissions**: Frontend allows public access  
✅ **Ingress Settings**: Frontend accepts all traffic  
✅ **New Deployment**: Services redeployed with latest configuration  

---

## 🚨 TROUBLESHOOTING

### Problem: "Cannot map domain - verification required"
**Solution**: 
1. In Domain Mappings page, click "Verify domain"
2. Follow Google's domain verification instructions
3. Add TXT record to your DNS
4. Wait for verification (5-10 minutes)

### Problem: "SSL Certificate Pending for 30+ minutes"
**Solution**:
1. Check that DNS is correctly pointing to Cloud Run
2. Remove and re-add the domain mapping
3. Wait another 15 minutes

### Problem: "ERR_CERT_COMMON_NAME_INVALID"
**Solution**:
1. Clear browser cache
2. Try incognito/private mode
3. Wait for SSL certificate to finish provisioning

### Problem: "Site can't be reached"
**Solution**:
1. Verify DNS is configured correctly
2. Check domain mapping is "Active" not "Pending"
3. Try `nslookup servora-ai.sheerssoft.com` to test DNS

---

## 📊 CURRENT STATUS

| Component | Status | Action |
|-----------|--------|--------|
| CORS Configuration | ✅ FIXED | Accepts servora-ai.sheerssoft.com |
| Backend Deployment | ✅ LIVE | Updated with CORS |
| Frontend Deployment | ✅ LIVE | Ready for custom domain |
| Domain Mapping | ⏳ **NEEDS MANUAL FIX** | Follow steps above |
| DNS Configuration | ✅ LIKELY OK | Verify if issues occur |

---

## 🎯 SUMMARY

**What You Need to Do** (2 minutes):
1. Open: https://console.cloud.google.com/run/domains?project=wastewise-402ba
2. Delete: `servora-ai.sheerssoft.com` → `wastewise-30`
3. Create: `servora-ai.sheerssoft.com` → `wastewise-frontend`
4. Wait: 5-15 minutes for SSL

**After This**:
- ✅ Your app will be accessible at `https://servora-ai.sheerssoft.com`
- ✅ Valid SSL certificate
- ✅ No CORS errors
- ✅ Fast loading

---

## 📞 HELP LINKS

- **Domain Mappings Dashboard**: https://console.cloud.google.com/run/domains?project=wastewise-402ba
- **Cloud Run Services**: https://console.cloud.google.com/run?project=wastewise-402ba
- **Google Cloud Run Docs**: https://cloud.google.com/run/docs/mapping-custom-domains

---

**IMPORTANT**: The automated CLI approach had syntax issues, so the **Cloud Console method above is the most reliable way** to fix the domain mapping.

**Estimated Total Time**: 2 minutes + 5-15 minutes SSL provisioning

🚀 **After completing these steps, your application will be live at `https://servora-ai.sheerssoft.com`!**

