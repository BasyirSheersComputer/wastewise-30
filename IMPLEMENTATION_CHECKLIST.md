# WasteWise Subscription System - Implementation Checklist

## ✅ What's Complete

### Backend (100% Complete)
- ✅ Stripe service with Malaysian payment methods
- ✅ Billing routes (/api/billing/*)
- ✅ Access control service
- ✅ Auth middleware with subscription checks
- ✅ Webhook handling
- ✅ Plan definitions matching system prompts

### Frontend (80% Complete)
- ✅ Subscription utilities (subscriptionUtils.ts)
- ✅ Subscription context (SubscriptionContext.tsx)
- ✅ Feature locked component (FeatureLocked.tsx)
- ✅ Billing dashboard (BillingDashboard.tsx)
- ✅ Feature gates on Suppliers page
- ✅ Feature gates on Staff page

---

## 🚀 Your Implementation Tasks

### Priority 1: Critical Setup (Required before going live)

#### 1. Set Up Stripe Dashboard
**Time: 30 minutes**

Follow `STRIPE_SETUP_GUIDE.md` step-by-step:
- [ ] Create Stripe account
- [ ] Create 3 products (Quick Win, Growth, Enterprise)
- [ ] Get API keys (Publishable, Secret, Webhook Secret)
- [ ] Configure webhooks
- [ ] Enable Malaysian payment methods (FPX, Cards, E-wallets)
- [ ] Configure billing portal

**Files to Reference:**
- `STRIPE_SETUP_GUIDE.md` (complete guide)

#### 2. Update Environment Variables
**Time: 5 minutes**

**Backend `.env`:**
```env
# Add these to your existing .env file
STRIPE_SECRET_KEY=sk_test_xxxxx  # From Stripe dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From webhook configuration

# Price IDs (from Stripe products)
STRIPE_PRICE_QUICK_WIN=price_xxxxx
STRIPE_PRICE_GROWTH=price_xxxxx
STRIPE_PRICE_GROWTH_SETUP=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx

FRONTEND_URL=http://localhost:5173  # or your production URL
```

**Frontend `.env`:**
```env
# Add these to your existing .env file
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # From Stripe dashboard
VITE_API_URL=http://localhost:5000/api  # or your production API URL
```

**Verification:**
- [ ] Backend .env has all STRIPE_ variables
- [ ] Frontend .env has VITE_STRIPE_PUBLISHABLE_KEY
- [ ] Both have correct URLs

#### 3. Add Subscription Provider to App
**Time: 5 minutes**

**File: `frontend/src/App.tsx`**

Find your app's root component and wrap it with SubscriptionProvider:

```typescript
// At the top of the file
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// In your component
function App() {
  return (
    <Router>
      <SubscriptionProvider>
        {/* Your existing app content */}
        <Routes>
          ...
        </Routes>
      </SubscriptionProvider>
    </Router>
  );
}
```

**Verification:**
- [ ] SubscriptionProvider imported
- [ ] Wraps all routes/components
- [ ] App still compiles without errors

---

### Priority 2: Feature Gating (Recommended)

#### 4. Add Feature Gates to Remaining Pages
**Time: 10 minutes**

Already done:
- ✅ Suppliers Dashboard (requires Growth+)
- ✅ Staff Dashboard (requires Growth+)

Still need feature gates:
- [ ] **Forecast Dashboard** - Full AI forecasting requires Growth
- [ ] **Waste Analytics** - Full analytics requires Growth  
- [ ] **Menu Optimization** - Requires Growth+

**Template to use:**
```typescript
// Add to top of file
import { useSubscription } from '../../contexts/SubscriptionContext';
import FeatureLocked from '../Subscription/FeatureLocked';

// In component
export default function YourDashboard() {
  const { hasFeature, loading } = useSubscription();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasFeature('your_feature_name')) {
    return <FeatureLocked feature="your_feature_name" showInline={true} />;
  }

  // Normal page content...
}
```

**Feature Names by Page:**
- Forecast Dashboard: `'demand_forecasting'`
- Waste Analytics: `'waste_logging'`
- Menu Optimization: `'menu_optimization'`

**Verification:**
- [ ] Each gated page shows upgrade prompt for lower tiers
- [ ] Growth/Enterprise users see full content

---

### Priority 3: Testing (Required)

#### 5. Test Subscription Flow
**Time: 15 minutes**

**Test Mode:**
- [ ] Navigate to `/dashboard/billing`
- [ ] Click "Upgrade to Growth System"
- [ ] Payment flow opens (Stripe checkout or embedded)
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Verify subscription created in dashboard
- [ ] Verify previously locked features are now accessible

**Feature Locking:**
- [ ] Quick Win user cannot access Suppliers page (shows upgrade prompt)
- [ ] Quick Win user cannot access Staff page (shows upgrade prompt)
- [ ] Growth user can access all Growth features
- [ ] Upgrade prompts show correct ROI calculations

**Cancellation:**
- [ ] Navigate to `/dashboard/billing`
- [ ] Click "Cancel Subscription"
- [ ] Verify cancellation confirmed
- [ ] Verify features locked after cancellation

**Test Cards:**
```
Success: 4242 4242 4242 4242
3D Secure: 4000 0027 6000 3184
Declined: 4000 0000 0000 0002
```

---

### Priority 4: Optional Enhancements

#### 6. Create Stripe Checkout Component (Optional)
**Time: 30 minutes**

If you want embedded checkout instead of redirect:

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**File: `frontend/src/components/Billing/StripeCheckout.tsx`**

```typescript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function StripeCheckout({ priceId }: { priceId: string }) {
  // Implementation here
  // See Stripe docs: https://stripe.com/docs/payments/checkout
}
```

**Skip this if using Stripe hosted checkout (recommended for simplicity)**

#### 7. Add Subscription Badge to Dashboard
**Time: 10 minutes**

Show user's current tier in the UI:

```typescript
import { useSubscription } from '../../contexts/SubscriptionContext';
import { formatTierName, getTierBadgeColor } from '../../utils/subscriptionUtils';

export default function YourComponent() {
  const { subscription } = useSubscription();

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(subscription?.tier)}`}>
      {formatTierName(subscription?.tier || 'free')}
    </div>
  );
}
```

#### 8. Add Usage Limit Tracking (Optional)
**Time: 20 minutes**

Track outlets and users against limits:

```typescript
const { subscription, getTierInfo } = useSubscription();
const tierInfo = getTierInfo();

// Check if can add more outlets
if (currentOutlets >= tierInfo.limits.outlets && tierInfo.limits.outlets !== -1) {
  // Show upgrade prompt
}
```

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Quick Win subscription creates successfully
- [ ] Growth subscription creates successfully
- [ ] Feature gates work (locked features show upgrade prompt)
- [ ] Subscription cancellation works
- [ ] Subscription reactivation works
- [ ] Billing history displays correctly
- [ ] Payment methods update successfully
- [ ] Webhook events process correctly

### UI/UX Testing
- [ ] Feature locked components display correctly
- [ ] ROI calculations show correct numbers
- [ ] Upgrade prompts lead to correct plans
- [ ] Loading states show while checking subscription
- [ ] Error states handle gracefully
- [ ] Mobile responsive

### Security Testing
- [ ] Secret keys not exposed in frontend
- [ ] Webhook signatures verified
- [ ] Auth required for all billing endpoints
- [ ] HTTPS enabled for webhooks (production)

---

## 🚨 Troubleshooting

### Issue: "Feature still showing as locked after upgrade"
**Solution:**
1. Check subscription status in backend: `GET /api/billing/subscription`
2. Verify webhook was received and processed
3. Check user's `subscription_plan` in database
4. Refresh page to reload subscription state

### Issue: "Webhook not firing"
**Solution:**
1. Verify webhook URL is accessible (use Stripe CLI for local testing)
2. Check webhook signing secret is correct
3. Review webhook logs in Stripe dashboard
4. Ensure HTTPS for production webhooks

### Issue: "Payment declining"
**Solution:**
1. Verify using test mode keys for test cards
2. Check Stripe API keys are correct
3. Verify payment method enabled in Stripe dashboard
4. Check card details entered correctly

### Issue: "Subscription context not working"
**Solution:**
1. Verify SubscriptionProvider wraps app
2. Check import paths are correct
3. Verify API URL in `.env` is correct
4. Check browser console for errors

---

## 📊 Go Live Checklist

### Pre-Launch
- [ ] All test mode flows working
- [ ] Stripe account activated
- [ ] Business verification complete
- [ ] Bank account connected for payouts
- [ ] Customer portal configured
- [ ] Email templates customized
- [ ] SSL certificate installed (HTTPS)

### Launch
- [ ] Switch to production Stripe keys
- [ ] Update webhook URL to production
- [ ] Test small real transaction (RM 1.00)
- [ ] Verify webhook received
- [ ] Refund test transaction
- [ ] Monitor first real subscriptions

### Post-Launch
- [ ] Monitor payment success rate
- [ ] Check webhook delivery rate
- [ ] Review customer feedback
- [ ] Track conversion rates
- [ ] Monitor churn rate

---

## 📁 Quick File Reference

**Your Action Items:**
1. `STRIPE_SETUP_GUIDE.md` - Follow this to set up Stripe
2. `backend/.env` - Add Stripe keys here
3. `frontend/.env` - Add publishable key here
4. `frontend/src/App.tsx` - Add SubscriptionProvider
5. Remaining dashboard pages - Add feature gates

**Reference Docs:**
- `SUBSCRIPTION_SYSTEM_IMPLEMENTATION.md` - Complete system overview
- `docs/SYSTEM-PROMPT-QUICK-EXPORT.md` - Pricing reference

**Already Complete:**
- All backend files (no changes needed)
- Subscription utilities (frontend/src/utils/subscriptionUtils.ts)
- Subscription context (frontend/src/contexts/SubscriptionContext.tsx)
- Feature locked component (frontend/src/components/Subscription/FeatureLocked.tsx)
- Billing dashboard (frontend/src/components/Billing/BillingDashboard.tsx)

---

## ⏱️ Estimated Time to Complete

| Task | Time | Priority |
|------|------|----------|
| Stripe setup | 30 min | Critical |
| Environment variables | 5 min | Critical |
| Add SubscriptionProvider | 5 min | Critical |
| Test basic flow | 15 min | Critical |
| Add remaining feature gates | 10 min | High |
| Test all features | 15 min | High |
| Optional enhancements | 60 min | Low |

**Total Critical Path: ~55 minutes**
**Total with all tasks: ~2 hours**

---

## 🎯 Success Criteria

You'll know everything is working when:
- ✅ Quick Win users see upgrade prompts on Suppliers/Staff pages
- ✅ Growth users can access all Growth features
- ✅ Payment flow completes successfully
- ✅ Subscription shows in billing dashboard
- ✅ Webhooks process correctly
- ✅ Cancellation/reactivation works
- ✅ ROI calculations display correctly

---

**Ready to Start?** Begin with `STRIPE_SETUP_GUIDE.md` → Set up Stripe products → Get API keys → Update .env files → Add SubscriptionProvider → Test!

**Questions?** Reference `SUBSCRIPTION_SYSTEM_IMPLEMENTATION.md` for detailed technical information.

**Last Updated:** November 2025

