# WasteWise Subscription System - Complete Implementation Guide

## 🎯 Overview

Complete tier-based subscription system with Stripe integration, feature access control, and automatic feature gating across the dashboard. Aligned 100% with system prompt pricing and outcomes.

---

## 📋 System Prompt Alignment

### Tier Definitions (Exact Match)

| Tier | Price | Features | Outcomes |
|------|-------|----------|----------|
| **Quick Win** | RM 2,997/month | ONE solution (AI/Waste/Compliance) | 20-30% reduction, RM 15-25k savings |
| **Growth** | RM 5,997/month + RM 4,997 setup | Full platform | 35-45% reduction, RM 35-50k savings |
| **Enterprise** | Custom | Everything + custom | 40-50% reduction, RM 100-300k+ savings |

---

## 🏗️ Architecture

### Backend Components

#### 1. Stripe Service (`backend/services/stripeService.js`)
- ✅ Complete Stripe integration
- ✅ Malaysian payment methods (FPX, Cards, E-wallets)
- ✅ Webhook handling
- ✅ Subscription lifecycle management
- ✅ Demo user support

#### 2. Billing Routes (`backend/routes/billing.js`)
- ✅ GET `/api/billing/plans` - List all plans
- ✅ GET `/api/billing/subscription` - Get user subscription
- ✅ POST `/api/billing/subscription` - Create subscription
- ✅ DEL `/api/billing/subscription` - Cancel subscription
- ✅ POST `/api/billing/subscription/reactivate` - Reactivate
- ✅ GET `/api/billing/history` - Payment history
- ✅ POST `/api/billing/customer-portal` - Get portal URL
- ✅ POST `/api/billing/webhook` - Stripe webhooks
- ✅ GET `/api/billing/guarantees` - Risk reversal guarantees

#### 3. Access Control Service (`backend/services/accessControlService.js`)
- ✅ Plan feature definitions
- ✅ User access checking
- ✅ Usage limit enforcement
- ✅ Feature comparison
- ✅ Plan transition validation

#### 4. Auth Middleware (`backend/utils/authMiddleware.js`)
- ✅ `requireSubscription` - Check active subscription
- ✅ `requirePlan(tier)` - Check specific tier access
- ✅ Plan hierarchy enforcement

### Frontend Components

#### 1. Subscription Utils (`frontend/src/utils/subscriptionUtils.ts`)
- ✅ Tier feature definitions
- ✅ `hasFeatureAccess()` - Check feature access
- ✅ `hasModuleAccess()` - Check module access
- ✅ `canAccessRoute()` - Check route access
- ✅ `getUpgradeMessage()` - Get upgrade prompts
- ✅ `calculateROI()` - Calculate returns
- ✅ Module-tier mapping

#### 2. Subscription Context (`frontend/src/contexts/SubscriptionContext.tsx`)
- ✅ Global subscription state
- ✅ Auto-refresh subscription data
- ✅ Feature/module access helpers
- ✅ React hooks integration

#### 3. Feature Locked Component (`frontend/src/components/Subscription/FeatureLocked.tsx`)
- ✅ Modal and inline versions
- ✅ ROI showcase
- ✅ Feature highlights
- ✅ Upgrade CTAs
- ✅ Guarantee badges

#### 4. Billing Dashboard (`frontend/src/components/Billing/BillingDashboard.tsx`)
- ✅ Current plan display
- ✅ Payment method management
- ✅ Available plans showcase
- ✅ Payment history
- ✅ ROI calculator

---

## 🔒 Feature Access Control

### Quick Win Tier (RM 2,997/month)

**Access:**
- ✅ Basic Dashboard
- ✅ ONE of: AI Forecasting, Waste Logging, OR Compliance
- ✅ Basic Inventory (read-only advanced)
- ✅ Basic Reports
- ✅ Settings & Billing

**Limitations:**
- ❌ No Supplier Integration
- ❌ No Staff Training
- ❌ No Menu Optimization
- ❌ No Custom Integrations
- ❌ Max 5 outlets
- ❌ Max 10 users

### Growth System (RM 5,997/month)

**Access:**
- ✅ Full Dashboard
- ✅ AI Forecasting (full)
- ✅ Waste Logging (full)
- ✅ Compliance (full)
- ✅ Inventory Tracking (real-time)
- ✅ **Supplier Integration** (automated ordering)
- ✅ **Staff Training** (full program)
- ✅ Menu Optimization
- ✅ Demand Forecasting
- ✅ Reports & Compliance

**Limitations:**
- ❌ No Custom Integrations
- ❌ Max 20 outlets
- ✅ Unlimited users
- ✅ Dedicated Success Manager
- ✅ Priority Support (4-hour response)

### Enterprise Transformation (Custom)

**Access:**
- ✅ Everything in Growth
- ✅ **Custom Integrations**
- ✅ **Multi-Location Dashboard**
- ✅ Advanced Analytics
- ✅ Strategic Planning
- ✅ On-Site Training
- ✅ White-Label Options

**No Limitations:**
- ✅ Unlimited outlets
- ✅ Unlimited users
- ✅ 24/7 Support
- ✅ Technical Account Manager
- ✅ Custom Development

---

## 🚀 Implementation Steps

### Step 1: Stripe Dashboard Setup

Follow `STRIPE_SETUP_GUIDE.md`:

1. Create Products:
   - Quick Win Solution
   - Growth System
   - Enterprise Transformation

2. Get API Keys:
   - Publishable Key
   - Secret Key
   - Webhook Secret

3. Configure Webhooks:
   - URL: `https://your-backend.com/api/billing/webhook`
   - Events: subscription.*, invoice.*, payment_intent.*

4. Enable Malaysian Payment Methods:
   - FPX (Online Banking)
   - Cards (Visa, Mastercard, Amex)
   - E-Wallets (GrabPay, TNG, Boost)

### Step 2: Environment Variables

**Backend `.env`:**
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

STRIPE_PRICE_QUICK_WIN=price_xxxxx
STRIPE_PRICE_GROWTH=price_xxxxx
STRIPE_PRICE_GROWTH_SETUP=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx

FRONTEND_URL=https://your-frontend.com
```

**Frontend `.env`:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_URL=https://your-backend.com/api
```

### Step 3: Update App.tsx to Include Subscription Provider

```typescript
// frontend/src/App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        {/* Your app content */}
      </SubscriptionProvider>
    </AuthProvider>
  );
}
```

### Step 4: Add Feature Gates to Dashboard Pages

#### Example: Suppliers Page
```typescript
// frontend/src/components/UI/SupplierDashboard.tsx
import { useSubscription } from '../../contexts/SubscriptionContext';
import FeatureLocked from '../Subscription/FeatureLocked';

export default function SupplierDashboard() {
  const { hasFeature } = useSubscription();
  
  if (!hasFeature('supplier_integration')) {
    return <FeatureLocked feature="supplier_integration" showInline />;
  }
  
  // Normal page content
  return <div>...</div>;
}
```

#### Example: Staff Training Page
```typescript
// frontend/src/components/UI/StaffDashboard.tsx
import { useSubscription } from '../../contexts/SubscriptionContext';
import FeatureLocked from '../Subscription/FeatureLocked';

export default function StaffDashboard() {
  const { hasFeature } = useSubscription();
  
  if (!hasFeature('staff_training')) {
    return <FeatureLocked feature="staff_training" showInline />;
  }
  
  // Normal page content
  return <div>...</div>;
}
```

### Step 5: Add Route Guards (Optional)

```typescript
// frontend/src/components/Auth/RequireFeature.tsx
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../../contexts/SubscriptionContext';

export function RequireFeature({ 
  feature, 
  children 
}: { 
  feature: string; 
  children: React.ReactNode 
}) {
  const { hasFeature, loading } = useSubscription();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!hasFeature(feature)) {
    return <Navigate to="/dashboard/billing" replace />;
  }
  
  return <>{children}</>;
}
```

### Step 6: Update Billing Dashboard to Handle Upgrades

```typescript
// Check for upgrade query parameter
const searchParams = new URLSearchParams(window.location.search);
const upgradeToTier = searchParams.get('upgrade');

if (upgradeToTier) {
  // Highlight the suggested tier
  // Show upgrade flow
}
```

---

## 💳 Payment Flow

### 1. User Clicks "Upgrade" or "Subscribe"

```
User Action → BillingDashboard → 
  → Opens Stripe Checkout (embedded or redirect) → 
    → User completes payment → 
      → Stripe sends webhook → 
        → Backend updates subscription → 
          → Frontend refreshes subscription state
```

### 2. Stripe Checkout Options

**Option A: Stripe Checkout (Recommended)**
- Hosted by Stripe
- Handles all payment methods
- PCI compliant automatically
- Simplest implementation

```javascript
// Create checkout session
const response = await fetch('/api/billing/create-checkout-session', {
  method: 'POST',
  body: JSON.stringify({ priceId: 'price_xxxxx' })
});

const { url } = await response.json();
window.location.href = url;  // Redirect to Stripe
```

**Option B: Stripe Payment Element (Embedded)**
- Embedded in your page
- More control over UX
- Still PCI compliant
- Requires more frontend code

### 3. Webhook Processing

When payment succeeds:
```
Stripe → POST /api/billing/webhook → 
  → Verify signature → 
    → Handle event (subscription.created/updated) → 
      → Update database (users table) → 
        → Sendwebhook confirmation
```

---

## 🧪 Testing

### Test Mode Credentials

**Test Cards:**
```
Success: 4242 4242 4242 4242
3D Secure: 4000 0027 6000 3184
Declined: 4000 0000 0000 0002
```

**Test FPX:**
```
Any Malaysian bank in test mode
Will simulate success/failure
```

### Test Checklist

- [ ] Quick Win subscription creation
- [ ] Growth subscription creation
- [ ] Enterprise contact flow
- [ ] Feature access control (locked features show upgrade prompt)
- [ ] Subscription cancellation
- [ ] Subscription reactivation
- [ ] Payment method update
- [ ] Billing history display
- [ ] Webhook event handling
- [ ] Trial expiration behavior
- [ ] Multi-user access limits
- [ ] Outlet limits enforcement

---

## 📊 Dashboard Integration Status

### ✅ Completed

1. **Subscription Utilities** - Feature/module access checking
2. **Subscription Context** - Global state management
3. **Feature Locked Component** - Upgrade prompts with ROI
4. **Billing Dashboard** - Full plan management UI
5. **Access Control Service** - Backend enforcement
6. **Stripe Service** - Payment processing
7. **Auth Middleware** - Route protection

### 🚧 To Implement (Your Tasks)

1. **Add Feature Gates to Each Dashboard Page:**
   ```typescript
   // Template for each page:
   import { useSubscription } from '../../contexts/SubscriptionContext';
   import FeatureLocked from '../Subscription/FeatureLocked';

   export default function YourPage() {
     const { hasFeature } = useSubscription();
     
     if (!hasFeature('your_feature_name')) {
       return <FeatureLocked feature="your_feature_name" showInline />;
     }
     
     return <div>Your page content</div>;
   }
   ```

2. **Pages Requiring Feature Gates:**
   - ✅ `/dashboard/suppliers` - Requires 'supplier_integration' (Growth+)
   - ⏳ `/dashboard/staff` - Requires 'staff_training' (Growth+)
   - ⏳ `/dashboard/forecast` - Already has AI, may need tier restrictions
   - ⏳ `/dashboard/waste` - Full analytics requires Growth
   - ⏳ Custom integrations UI - Requires 'custom_integrations' (Enterprise)

3. **Create Stripe Checkout Component** (if using embedded):
   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js
   ```

4. **Add Subscription Provider to App.tsx:**
   ```typescript
   <SubscriptionProvider>
     <Router>...</Router>
   </SubscriptionProvider>
   ```

5. **Test Everything:**
   - Create test subscriptions
   - Verify feature gating
   - Test upgrades/downgrades
   - Verify webhooks

---

## 🎨 UI Components Reference

### Feature-Locked Inline Display
```typescript
<FeatureLocked 
  feature="supplier_integration" 
  showInline={true}
/>
```

### Feature-Locked Modal
```typescript
const [showModal, setShowModal] = useState(false);

<FeatureLocked 
  feature="staff_training" 
  showInline={false}
  onClose={() => setShowModal(false)}
/>
```

### Custom Upgrade Message
```typescript
<FeatureLocked 
  feature="custom_integrations"
  title="Enterprise Features Required"
  message="Custom integrations with your POS/ERP system are available in the Enterprise plan."
  showInline={true}
/>
```

### Check Feature Access Programmatically
```typescript
const { hasFeature, getTierInfo } = useSubscription();

if (hasFeature('supplier_integration')) {
  // Show full features
} else {
  // Show limited or locked state
}
```

---

## 📈 ROI Display Integration

Every upgrade prompt includes:
- Current investment cost
- Expected monthly savings
- ROI multiplier
- Payback period

Example for Growth System:
```
Investment: RM 5,997/month + RM 4,997 setup
Savings: RM 35,000-50,000/month
ROI: 6-10x return
Payback: Setup recovered in first month
```

---

## 🔐 Security Considerations

1. **API Keys:** Never expose secret keys in frontend
2. **Webhook Signature:** Always verify Stripe signatures
3. **Auth Tokens:** Use bearer tokens for API calls
4. **HTTPS:** Required for production Stripe integration
5. **PCI Compliance:** Use Stripe Elements/Checkout (never handle raw card data)

---

## 📞 Support & Troubleshooting

### Common Issues

**1. Feature gate not working:**
- Check subscription context is wrapped around app
- Verify user is authenticated
- Check API response from `/api/billing/subscription`

**2. Webhook not firing:**
- Verify webhook URL is accessible (HTTPS required for live mode)
- Check webhook signing secret is correct
- Review webhook logs in Stripe dashboard

**3. Payment failing:**
- Check Stripe keys are correct (test vs live)
- Verify payment method is enabled
- Check customer has sufficient funds

**4. Feature showing as locked when it shouldn't:**
- Check plan configuration in `subscriptionUtils.ts`
- Verify backend plan matches frontend expectations
- Check user's subscription_plan in database

---

## 🎯 Next Steps

1. ✅ Complete Stripe setup (follow STRIPE_SETUP_GUIDE.md)
2. ⏳ Add feature gates to remaining dashboard pages
3. ⏳ Test subscription flows end-to-end
4. ⏳ Configure Customer Portal in Stripe
5. ⏳ Set up email notifications
6. ⏳ Go live with production keys

---

## 📁 File Reference

### Backend
- `backend/services/stripeService.js` - Stripe integration
- `backend/routes/billing.js` - Billing API endpoints
- `backend/services/accessControlService.js` - Feature access logic
- `backend/utils/authMiddleware.js` - Auth & subscription middleware

### Frontend
- `frontend/src/utils/subscriptionUtils.ts` - Subscription utilities
- `frontend/src/contexts/SubscriptionContext.tsx` - Global state
- `frontend/src/components/Subscription/FeatureLocked.tsx` - Upgrade prompts
- `frontend/src/components/Billing/BillingDashboard.tsx` - Billing UI

### Documentation
- `STRIPE_SETUP_GUIDE.md` - Complete Stripe setup guide
- `SUBSCRIPTION_SYSTEM_IMPLEMENTATION.md` - This file
- `docs/SYSTEM-PROMPT-QUICK-EXPORT.md` - Pricing & outcomes reference

---

**Status:** ✅ Core System Complete | ⏳ Integration in Progress
**Version:** 1.0
**Last Updated:** November 2025

