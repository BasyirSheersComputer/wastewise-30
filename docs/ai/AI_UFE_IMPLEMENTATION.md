# AI Unified Forecasting Engine (AI-UFE) Implementation
## Prescriptive AI System for QSR Operations

**Document Type:** Technical Specification  
**Version:** 1.0  
**Date:** December 2024  
**Status:** ✅ Implemented

---

## Executive Summary

The AI Unified Forecasting Engine (AI-UFE) is a comprehensive prescriptive AI system designed to transform QSR operations from reactive management to proactive, real-time intervention. The system consolidates fragmented operational data into a unified intelligence layer, providing actionable prescriptive recommendations rather than mere predictions.

### Key Differentiators

- **Prescriptive vs Predictive**: Moves beyond "what will happen" to "what should we do"
- **Hyper-Granular Forecasting**: 15-minute interval, SKU-level predictions
- **Prescriptive Flow**: Automated Anomaly Detection → RCA → Mitigation
- **System Health Monitoring**: Real-time module health checks with recovery recommendations
- **Cash Flow Forecasting**: <5% variance target

---

## System Architecture

### Core Components

```
AI-UFE System
├── Prescriptive Logic Engine
│   ├── Anomaly Detection
│   ├── Root Cause Analysis (RCA)
│   └── Mitigation Recommendations
├── Forecasting Engine
│   ├── Demand Forecasting (15-min granularity)
│   ├── Inventory Optimization
│   └── Cash Flow Forecasting
├── Labor Optimization
│   ├── Schedule Optimization
│   └── Competency Measurement
├── Supply Chain Intelligence
│   └── Supplier Risk Index (SRI)
└── System Health Monitor
    ├── Database Health
    ├── API Services Health
    ├── Integration Health
    └── Recovery Recommendations
```

---

## Feature Consolidation

### Consolidated from Existing Features

#### 1. Demand Forecasting (Consolidated)
**Previous:** Multiple scattered forecasting implementations  
**AI-UFE:** Unified `forecastDemand()` with 15-minute granularity

**Consolidated From:**
- `backend/services/statisticalModels.js` - Demand forecasting
- `backend/ai/statisticalModels.js` - ARIMA, Exponential Smoothing
- `backend/routes/statisticalModels.js` - Forecast endpoints

**New Capabilities:**
- 15-minute interval forecasting (was daily/weekly)
- SKU-level granularity
- External factors integration (weather, events)
- Prescriptive ordering recommendations

#### 2. Anomaly Detection (Consolidated)
**Previous:** Basic anomaly detection in analytics  
**AI-UFE:** Integrated into Prescriptive Flow

**Consolidated From:**
- `backend/ai/analyticsModels.js` - AnomalyDetector class
- `backend/routes/statisticalModels.js` - Anomaly endpoints

**New Capabilities:**
- Correlated anomaly detection
- Severity prioritization
- Automated RCA triggering

#### 3. Inventory Optimization (Enhanced)
**Previous:** Basic inventory tracking  
**AI-UFE:** Prescriptive perpetual ordering

**Consolidated From:**
- `backend/ai/inventoryOptimization.js` - EOQ calculations
- `backend/routes/inventory.js` - Inventory management

**New Capabilities:**
- Automated ordering prescriptions
- Waste variance integration
- Perpetual ordering suggestions

---

## New Features Added

### 1. Prescriptive Flow
**Endpoint:** `POST /api/ai-ufe/prescriptive-flow`

Automated 3-phase process:
1. **Anomaly Detection**: Pattern deviation screening
2. **Root Cause Analysis**: Systematic decomposition
3. **Mitigation**: Resource-balanced action recommendations

### 2. Labor Scheduling Optimization
**Endpoint:** `POST /api/ai-ufe/schedule/labor`

- AI-driven schedule generation
- Demand-matched staffing
- Competency-aware assignments
- Cost optimization (3-10% reduction target)

### 3. Staff Competency Measurement
**Endpoint:** `GET /api/ai-ufe/competency/staff`

**KPIs Tracked:**
- Average Ticket Time (ATT)
- Waste Variance per Employee
- Order Accuracy Rate

**Outputs:**
- Competency scores (0-100)
- Training gap identification
- Targeted training recommendations

### 4. Supplier Risk Index (SRI)
**Endpoint:** `GET /api/ai-ufe/suppliers/risk-index`

**Metrics:**
- Supplier Lead Time Score
- On-Time Delivery Rate
- Order Fill Rate

**Output:**
- Risk level (low/medium/high)
- Early warning detection
- Supplier recommendations

### 5. Cash Flow Forecasting
**Endpoint:** `POST /api/ai-ufe/forecast/cash-flow`

**Target:** <5% variance between projected and actual cash flow

**Components:**
- Revenue forecasting (from demand)
- Labor cost forecasting
- Procurement cost forecasting
- Net cash flow calculation

### 6. System Health Monitoring
**Endpoint:** `GET /api/ai-ufe/system/health`

**Monitored Modules:**
- Database connectivity and performance
- API services (StoreHub, POS, ERP)
- Active integrations
- AI services (Gemini, ChatGPT)
- Cache service
- Storage service

**Features:**
- Real-time health checks
- Automatic recovery recommendations
- Issue prioritization
- Performance metrics

---

## API Endpoints

### Prescriptive Flow
```
POST /api/ai-ufe/prescriptive-flow
Body: { options: {} }
Response: { anomalies, rootCauses, prescriptions }
```

### Demand Forecasting
```
POST /api/ai-ufe/forecast/demand
Body: {
  outletId: "uuid",
  sku: "item-id",
  interval: "15min",
  horizon: 7,
  includeExternalFactors: true
}
Response: { forecast, prescription }
```

### Ordering Prescriptions
```
POST /api/ai-ufe/prescriptions/ordering
Body: { outletId: "uuid" }
Response: { prescriptions, summary }
```

### Labor Scheduling
```
POST /api/ai-ufe/schedule/labor
Body: {
  outletId: "uuid",
  weekStart: "2024-12-16",
  constraints: {}
}
Response: { schedule, optimizationMetrics }
```

### Staff Competency
```
GET /api/ai-ufe/competency/staff?outletId=uuid
Response: { metrics, summary }
```

### Supplier Risk Index
```
GET /api/ai-ufe/suppliers/risk-index
Response: { suppliers, highRiskSuppliers, summary }
```

### Cash Flow Forecasting
```
POST /api/ai-ufe/forecast/cash-flow
Body: { horizon: 30 }
Response: { forecast, accuracy }
```

### System Health
```
GET /api/ai-ufe/system/health
Response: { overall, modules, issues, recommendations }

GET /api/ai-ufe/system/health/recommendations?module=database
Response: { recommendations, overall }
```

---

## Data Flow Integration

### Real-Time Data Sources

| Domain | Data Field | Source System | Update Frequency |
|--------|------------|--------------|------------------|
| Demand | Transactional Sales | POS (StoreHub) | Real-Time |
| Labor | ATT, Clock-in/out | POS/WFM | Real-Time |
| Supply Chain | Inventory Levels | ERP/Inventory | Continuous |
| Finance | Promotions, AOV | CRM (Klaviyo) | Hourly Batches |
| Supply Chain | Supplier Metrics | ERP | Event-Driven |

---

## Prescriptive Flow Example

### Scenario: High Waste Variance Detected

**Step 1: Anomaly Detection**
```json
{
  "anomaly": {
    "type": "waste_variance",
    "severity": 9.2,
    "message": "Critical: Milk waste 45% above baseline",
    "location": "Outlet 12, Barista X"
  }
}
```

**Step 2: Root Cause Analysis**
```json
{
  "rootCause": "Staff training gap",
  "contributingFactors": [
    "Inconsistent portioning detected",
    "High ATT correlated with waste increase"
  ],
  "confidence": 0.85
}
```

**Step 3: Prescriptive Recommendation**
```json
{
  "action": "Schedule targeted training: Portion Control",
  "urgency": "high",
  "estimatedImpact": {
    "wasteReduction": "30-35%",
    "costSavings": "RM 500-800/month",
    "timeline": "7-14 days"
  },
  "prescription": "Assign Portion Control module to Barista X via WFM system. Follow-up assessment in 7 days."
}
```

---

## System Health Monitoring

### Health Check Example

```json
{
  "overall": "warning",
  "modules": {
    "database": {
      "status": "healthy",
      "responseTime": 245
    },
    "integrations": {
      "status": "warning",
      "staleSyncs": 2,
      "message": "2 integration(s) have stale sync data"
    },
    "aiServices": {
      "status": "healthy",
      "services": [
        { "name": "Gemini", "status": "healthy" },
        { "name": "ChatGPT", "status": "healthy" }
      ]
    }
  },
  "issues": [
    {
      "module": "integrations",
      "status": "warning",
      "message": "2 integration(s) have stale sync data"
    }
  ],
  "recommendations": [
    {
      "module": "integrations",
      "action": "Trigger manual sync or check integration jobs",
      "priority": "medium"
    }
  ]
}
```

---

## Implementation Status

### ✅ Completed

- [x] AI-UFE core service (`aiUfeService.js`)
- [x] Prescriptive Flow implementation
- [x] Demand forecasting consolidation
- [x] Anomaly detection integration
- [x] System health monitoring service
- [x] API routes (`/api/ai-ufe/*`)
- [x] Labor scheduling framework
- [x] Staff competency measurement
- [x] Supplier Risk Index (SRI)
- [x] Cash flow forecasting

### ⏳ Partial Implementation

- [ ] External factors integration (weather, events APIs)
- [ ] 15-minute granularity data collection
- [ ] Automated ordering execution
- [ ] WFM system integration (Lark)
- [ ] CRM integration (Klaviyo)
- [ ] IFRS-compliant reporting

### 🔄 Future Enhancements

- [ ] Computer vision inventory checks
- [ ] Real-time webhook integration
- [ ] Automated model retraining
- [ ] Advanced scenario modeling

---

## Integration with Existing Systems

### Consolidated Routes

**Old Endpoints (Still Available):**
- `/api/statistical-models/forecast` → Use `/api/ai-ufe/forecast/demand`
- `/api/statistical-models/anomalies` → Use `/api/ai-ufe/prescriptive-flow`
- `/api/inventory` → Enhanced with ordering prescriptions

**New Unified Endpoints:**
- `/api/ai-ufe/*` - All AI-UFE features

---

## Performance Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| Forecast Accuracy | 75-85% | ✅ Achievable |
| Cash Flow Variance | <5% | ⏳ In Development |
| Waste Reduction | 30-36% | ✅ With Active Use |
| Labor Cost Reduction | 3-10% | ⏳ In Development |
| Order Processing Time | 30-50% reduction | ⏳ Pending WFM Integration |

---

## Related Documents

- [AI-UFE Strategic Framework](../ai-ufe.md) - Complete strategic document
- [StoreHub Integration Guide](../integrations/STOREHUB_INTEGRATION_GUIDE.md)
- [Product Alignment](../PRODUCT_ALIGNMENT_AND_ICP_SEGMENTATION.md)
- [Architecture Specs](../architecture/WASTEWISE_TECHNICAL_SPECIFICATION.md)

---

**Last Updated:** December 2024  
**Maintained By:** Engineering Team

