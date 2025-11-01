# Resource Optimization Summary for WasteWise

**Date**: October 15, 2025  
**Region**: Asia-Southeast1 (Singapore)  
**Optimization Goal**: Right-size resources for Southeast Asian users while minimizing costs

---

## 🌏 Regional Deployment

### Selected Region: `asia-southeast1` (Singapore)
**Rationale**: 
- **Optimal for Southeast Asia**: Singapore is the best Google Cloud region for users in Malaysia, Indonesia, Thailand, Philippines, Vietnam, and surrounding countries
- **Low Latency**: ~10-50ms latency for most Southeast Asian countries
- **High Availability**: Google's premier Asia-Pacific hub with excellent reliability
- **Proximity to Target Market**: Closest to Malaysian F&B businesses (primary target market)

### Alternative Regions (Not Recommended)
- `asia-southeast2` (Jakarta) - Limited services, higher costs
- `asia-east1` (Taiwan) - Higher latency for Malaysia/Singapore
- `australia-southeast1` (Sydney) - Too far, adds 100ms+ latency

---

## 📊 Resource Optimization Summary

### Before Optimization
| Service | CPU | Memory | Min Inst | Max Inst | Monthly Cost Est. |
|---------|-----|--------|----------|----------|-------------------|
| Backend | 1 | 1Gi | 1 | 10 | ~$45-60 |
| Frontend | 1 | 512Mi | 1 | 5 | ~$30-40 |
| **TOTAL** | - | - | - | - | **$75-100** |

### After Optimization
| Service | CPU | Memory | Min Inst | Max Inst | Monthly Cost Est. |
|---------|-----|--------|----------|----------|-------------------|
| Backend | 1 | 1Gi | 0 | 5 | ~$10-25 |
| Frontend | 1 | 256Mi | 0 | 3 | ~$5-15 |
| **TOTAL** | - | - | - | - | **$15-40** |

**Cost Savings**: ~60-75% reduction (~$35-60/month savings)

---

## ⚙️ Current Configuration Details

### Backend Service (`wastewise-backend`)
```yaml
Region: asia-southeast1 (Singapore)
URL: https://wastewise-backend-451983642521.asia-southeast1.run.app
Resources:
  - CPU: 1 vCPU
  - Memory: 1Gi
  - Min Instances: 0 (scale to zero when idle)
  - Max Instances: 5 (sufficient for trial users)
  - Concurrency: 80 requests per instance
  - Timeout: 300 seconds (5 minutes for AI operations)
  
Rationale:
  - 1Gi memory required for AI/ML operations (Gemini, ChatGPT)
  - 1 CPU for processing analytics and recommendations
  - Scale to zero saves ~$45/month during idle periods
  - Max 5 instances handles ~400 concurrent users
```

### Frontend Service (`wastewise-frontend`)
```yaml
Region: asia-southeast1 (Singapore)
URL: https://wastewise-frontend-451983642521.asia-southeast1.run.app
Resources:
  - CPU: 1 vCPU
  - Memory: 256Mi (reduced from 512Mi)
  - Min Instances: 0 (scale to zero when idle)
  - Max Instances: 3 (sufficient for trial users)
  - Concurrency: 100 requests per instance
  - Timeout: 60 seconds
  
Rationale:
  - 256Mi sufficient for serving static React build
  - 1 CPU handles Nginx serving efficiently
  - Scale to zero saves ~$30/month during idle periods
  - Max 3 instances handles ~300 concurrent users
  - Reduced memory from 512Mi saves additional costs
```

---

## 💡 Key Optimizations Made

### 1. **Scale-to-Zero Configuration**
- **Before**: Min instances = 1 (always running)
- **After**: Min instances = 0 (only run when needed)
- **Impact**: 60-75% cost reduction during idle periods
- **Cold Start**: ~2-5 seconds (acceptable for trial users)

### 2. **Memory Optimization**
- **Frontend**: Reduced from 512Mi → 256Mi (50% reduction)
- **Backend**: Maintained 1Gi (required for AI workloads)
- **Impact**: ~30% cost reduction on frontend

### 3. **Instance Limits**
- **Backend**: Reduced max from 10 → 5 instances
- **Frontend**: Reduced max from 5 → 3 instances
- **Impact**: Prevents runaway costs, still handles 300+ concurrent users

### 4. **Concurrency & Timeout**
- Added explicit concurrency limits (80 backend, 100 frontend)
- Backend timeout: 300s (supports long AI operations)
- Frontend timeout: 60s (fast static serving)

---

## 📈 Performance Characteristics

### Expected Performance
- **Cold Start Time**: 2-5 seconds (when scaling from zero)
- **Warm Response Time**: 50-200ms (active instances)
- **Latency from Malaysia**: 10-30ms
- **Latency from Singapore**: 5-15ms
- **Latency from Indonesia**: 20-50ms
- **Latency from Thailand**: 30-60ms

### Capacity
- **Backend**: Can handle 400 concurrent requests (5 instances × 80 concurrency)
- **Frontend**: Can handle 300 concurrent requests (3 instances × 100 concurrency)
- **Typical Usage**: Trial users will see instant response (well within capacity)

---

## 💰 Cost Breakdown

### Monthly Cost Estimate (Trial Phase)
```
Scenario 1: Low Usage (10 active users, 100 requests/day)
- Backend: $5-10/month
- Frontend: $2-5/month
- Total: $7-15/month

Scenario 2: Medium Usage (50 active users, 1000 requests/day)
- Backend: $15-20/month
- Frontend: $5-10/month
- Total: $20-30/month

Scenario 3: High Usage (200 active users, 5000 requests/day)
- Backend: $20-25/month
- Frontend: $10-15/month
- Total: $30-40/month
```

### Additional Costs
- **Container Registry**: $1-3/month
- **Cloud Build**: $0 (free tier covers typical usage)
- **Networking**: $1-5/month
- **Supabase**: $0-25/month (separate service)

**Total Estimated Monthly Cost**: $10-70/month (depends on usage)

---

## 🚀 Scaling Strategy

### Current Phase: Trial/MVP
- Min instances: 0 (cost optimization)
- Max instances: 5 backend / 3 frontend
- **Good for**: 0-200 concurrent users

### Growth Phase Recommendations
When you reach 200+ active daily users:
```bash
# Scale up backend
gcloud run services update wastewise-backend \
  --region=asia-southeast1 \
  --min-instances=1 \
  --max-instances=10

# Scale up frontend
gcloud run services update wastewise-frontend \
  --region=asia-southeast1 \
  --min-instances=1 \
  --max-instances=5
```
**Cost Impact**: +$40-60/month, eliminates cold starts

### Enterprise Phase Recommendations
When you reach 1000+ active daily users:
```bash
# Scale up significantly
Backend: min=2, max=20, memory=2Gi
Frontend: min=2, max=10
Consider: Cloud CDN for static assets
```
**Cost Impact**: +$150-300/month, handles enterprise load

---

## 🛠️ Maintenance Commands

### Check Current Status
```bash
# List all services
gcloud run services list --region=asia-southeast1

# Check backend details
gcloud run services describe wastewise-backend --region=asia-southeast1

# Check frontend details
gcloud run services describe wastewise-frontend --region=asia-southeast1
```

### Monitor Usage
```bash
# View backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-backend" --limit=50

# Check metrics
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'
```

### Quick Adjustments
```bash
# Temporarily boost during high traffic
gcloud run services update wastewise-backend \
  --region=asia-southeast1 \
  --min-instances=2 \
  --max-instances=10

# Return to optimized state
gcloud run services update wastewise-backend \
  --region=asia-southeast1 \
  --min-instances=0 \
  --max-instances=5
```

---

## ✅ Verification Checklist

- [x] Services deployed in `asia-southeast1` (Singapore)
- [x] Backend: 1 CPU, 1Gi memory, 0-5 instances
- [x] Frontend: 1 CPU, 256Mi memory, 0-3 instances
- [x] Scale-to-zero enabled for cost savings
- [x] Concurrency limits configured
- [x] Timeouts optimized for workload
- [x] `cloudbuild.yaml` updated with new configuration
- [x] Both services verified and operational

---

## 📍 Current Service URLs

- **Backend API**: https://wastewise-backend-451983642521.asia-southeast1.run.app
- **Frontend App**: https://wastewise-frontend-451983642521.asia-southeast1.run.app

**Status**: ✅ Both services are live and optimized for Southeast Asian users

---

## 🎯 Next Steps

1. **Monitor Usage**: Track actual usage patterns over 2-4 weeks
2. **Adjust Resources**: Fine-tune based on real-world data
3. **Consider CDN**: Add Cloud CDN if serving static assets globally
4. **Plan Scaling**: Set up alerts for when to increase min-instances
5. **Cost Review**: Review monthly costs and optimize further if needed

---

## 📞 Support

For scaling recommendations or issues:
- Check logs: `gcloud logging read ...`
- Monitor metrics in Google Cloud Console
- Adjust resources as needed with `gcloud run services update`

**Last Updated**: October 15, 2025


