# Quick Deploy to Google Cloud - WasteWise

**All deployment issues have been fixed!** ✅

---

## 🚀 One-Command Deployment

```bash
gcloud builds submit --config cloudbuild.yaml .
```

**That's it!** Cloud Build will:
1. Build backend Docker image (~2 min)
2. Build frontend Docker image (~2 min)
3. Push images to Container Registry (~1 min)
4. Deploy backend to Cloud Run (~1 min)
5. Deploy frontend to Cloud Run (~1 min)

**Total Time**: ~7-10 minutes

---

## 📍 Your Deployed URLs

After deployment completes:

- **Frontend**: https://wastewise-frontend-451983642521.asia-southeast1.run.app
- **Backend**: https://wastewise-backend-451983642521.asia-southeast1.run.app
- **Backend Health**: https://wastewise-backend-451983642521.asia-southeast1.run.app/health

---

## ✅ Quick Health Check

```bash
# Check backend is running
curl https://wastewise-backend-451983642521.asia-southeast1.run.app/health

# Check frontend is running
curl https://wastewise-frontend-451983642521.asia-southeast1.run.app/
```

---

## 🔍 Monitor Deployment

```bash
# Watch build progress
gcloud builds list --limit=1

# View build logs (get BUILD_ID from above command)
gcloud builds log [BUILD_ID]

# Check service status
gcloud run services list --region=asia-southeast1
```

---

## 🎯 What's Been Fixed

All critical deployment issues have been resolved:

1. ✅ **Backend PORT** - Now uses 8080 (Cloud Run standard)
2. ✅ **Environment Variables** - Supabase credentials configured
3. ✅ **Health Checks** - Properly configured for Cloud Run
4. ✅ **CORS** - Backend allows frontend requests
5. ✅ **Docker Compose** - Local development matches production
6. ✅ **Resource Allocation** - Optimized for performance and cost

See `GOOGLE_CLOUD_DEPLOYMENT_FIXES.md` for complete details.

---

## 💰 Cost Estimate

With scale-to-zero enabled:
- **Idle**: $0/day
- **Light usage**: $1-3/day
- **Moderate usage**: $5-10/day

**Monthly estimate**: $10-40 during trial

---

## 🚨 If Deployment Fails

```bash
# Get the latest build ID
gcloud builds list --limit=1

# View detailed logs
gcloud builds log [BUILD_ID]

# Check for common issues:
# - Docker build errors → Check Dockerfile syntax
# - Permission errors → Verify service account has required roles
# - Resource errors → Check if you have enough quota
```

---

## 📞 Quick Links

- [Cloud Run Console](https://console.cloud.google.com/run?project=wastewise-402ba)
- [Cloud Build History](https://console.cloud.google.com/cloud-build/builds?project=wastewise-402ba)
- [Cloud Logging](https://console.cloud.google.com/logs?project=wastewise-402ba)

---

## 🎉 Post-Deployment

After deployment succeeds:

1. ✅ Test the frontend URL in your browser
2. ✅ Verify backend health endpoint
3. ✅ Test a complete user journey
4. ✅ Check Cloud Logging for any errors
5. ✅ Monitor performance for first hour

---

**Ready to deploy?** Just run:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Good luck! 🚀

