# Stripe Setup Guide - WasteWise Subscription System

## Overview

This guide will help you set up Stripe products, prices, and payment gateway integration for the WasteWise subscription system with tier-based feature access control.

---

## Step 1: Create Stripe Account & Configure Settings

### 1.1 Create/Login to Stripe Account
1. Go to https://dashboard.stripe.com
2. Create account or login
3. Complete business profile (for Malaysian business)

### 1.2 Configure Business Settings
```
Business Details:
- Business Name: WasteWise / Your Company Name
- Country: Malaysia
- Currency: MYR (Malaysian Ringgit)
- Tax ID: Your Malaysian tax ID
```

### 1.3 Enable Malaysian Payment Methods
1. Go to **Settings** → **Payment methods**
2. Enable the following:
   - ✅ **FPX (Online Banking)** - Most popular in Malaysia
   - ✅ **Cards** (Visa, Mastercard, Amex)
   - ✅ **GrabPay**
   - ✅ **Touch 'n Go eWallet**
   - ✅ **Boost**

---

## Step 2: Create Products in Stripe Dashboard

### Product 1: Quick Win Solution

1. Go to **Products** → **Add product**

**Product Details:**
```
Product Name: Quick Win Solution
Description: One solution of your choice - AI Forecasting, Waste Logging, OR Compliance Automation
Statement Descriptor: WASTEWISE-QUICK
```

**Pricing (Monthly):**
```
Price: RM 2,997.00
Billing Period: Monthly (recurring every 1 month)
Currency: MYR
```

**Pricing (Annual) - Optional:**
```
Price: RM 2,547.45 per month
Billing Period: Yearly (recurring every 12 months)
Total: RM 30,569.40 (15% discount)
Currency: MYR
```

**Metadata** (add these custom fields):
```
plan_id: quick-win
waste_reduction: 20-30%
time_saved: 10-15 hours/week
monthly_savings: RM 15,000-25,000
roi: 500-800%
features: ai_forecasting OR waste_logging OR compliance
max_outlets: 5
max_users: 10
guarantee: 30-day money-back
```

### Product 2: Growth System (MOST POPULAR)

1. Go to **Products** → **Add product**

**Product Details:**
```
Product Name: Growth System
Description: Full WasteWise platform - AI forecasting, automated waste logging, inventory tracking, supplier integration, compliance automation
Statement Descriptor: WASTEWISE-GROWTH
```

**Pricing (Monthly):**
```
Price: RM 5,997.00
Billing Period: Monthly (recurring every 1 month)
Currency: MYR
```

**One-time Setup Fee:**
```
Price: RM 4,997.00
Type: One-time
Currency: MYR
```

**Pricing (Annual) - Optional:**
```
Price: RM 5,097.45 per month
Billing Period: Yearly (recurring every 12 months)
Total: RM 61,169.40 (15% discount)
Currency: MYR
```

**Metadata:**
```
plan_id: growth
waste_reduction: 35-45%
time_saved: 20-30 hours/week
monthly_savings: RM 35,000-50,000
roi: 600-1000%
features: full_platform
max_outlets: 20
max_users: -1 (unlimited)
guarantee: 60-day RM 30k savings or pay nothing
support: priority_4hr_response
includes: dedicated_success_manager
```

### Product 3: Enterprise Transformation

1. Go to **Products** → **Add product**

**Product Details:**
```
Product Name: Enterprise Transformation
Description: Everything in Growth + custom integrations, multi-location dashboard, quarterly strategic planning, on-site training
Statement Descriptor: WASTEWISE-ENT
```

**Pricing:**
```
Type: Custom pricing
Note: Contact sales for quote
```

**For Testing/Demo (Monthly):**
```
Price: RM 12,000.00
Billing Period: Monthly (recurring every 1 month)
Currency: MYR
```

**Metadata:**
```
plan_id: enterprise
waste_reduction: 40-50%
operational_efficiency: 50-70% improvement
monthly_savings: RM 100,000-300,000+
roi: 10-20x at scale
features: custom_integrations,multi_location,dedicated_tam
max_outlets: -1 (unlimited)
max_users: -1 (unlimited)
guarantee: 90-day transformation or free until achieved
support: 24_7_priority
includes: dedicated_technical_account_manager,onsite_training
```

---

## Step 3: Get Stripe API Keys

### 3.1 Development/Test Keys
1. Go to **Developers** → **API keys**
2. Toggle to **Test mode** (top right)
3. Copy:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### 3.2 Production Keys
1. Toggle to **Live mode**
2. Copy:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### 3.3 Get Price IDs
1. Go to **Products**
2. Click each product
3. Copy the Price ID (format: `price_xxxxx...`)

**Save these for your `.env` file:**
```
Price IDs for Products:
- Quick Win Monthly: price_1xxxxx (copy from Stripe)
- Quick Win Annual: price_1xxxxx
- Growth Monthly: price_1xxxxx
- Growth Setup Fee: price_1xxxxx (one-time)
- Growth Annual: price_1xxxxx
- Enterprise Monthly: price_1xxxxx
```

---

## Step 4: Configure Webhooks

### 4.1 Create Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**

**Webhook Details:**
```
Endpoint URL: https://your-backend-domain.com/api/billing/webhook
Description: WasteWise Subscription Events
```

**Events to Listen For:**
Select these events:
```
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ customer.created
✅ customer.updated
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
```

3. Click **Add endpoint**
4. Copy the **Signing secret** (format: `whsec_xxxxx...`)

### 4.2 Test Webhook Locally (Development)
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe CLI
stripe login

# Forward webhooks to local backend
stripe listen --forward-to localhost:5000/api/billing/webhook
```

---

## Step 5: Update Environment Variables

### 5.1 Backend .env File (`backend/.env`)
```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxx  # Use sk_live_xxxxx for production
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Use pk_live_xxxxx for production
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From webhook configuration

# Price IDs (from Step 3.3)
STRIPE_PRICE_QUICK_WIN=price_1xxxxx  # Quick Win monthly
STRIPE_PRICE_QUICK_WIN_ANNUAL=price_1xxxxx
STRIPE_PRICE_GROWTH=price_1xxxxx  # Growth monthly
STRIPE_PRICE_GROWTH_SETUP=price_1xxxxx  # One-time setup
STRIPE_PRICE_GROWTH_ANNUAL=price_1xxxxx
STRIPE_PRICE_ENTERPRISE=price_1xxxxx

# Frontend URL (for redirects)
FRONTEND_URL=https://your-frontend-domain.com  # or http://localhost:5173 for dev
```

### 5.2 Frontend .env File (`frontend/.env`)
```env
# Stripe Publishable Key (safe to expose in frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # Use pk_live_xxxxx for production

# Backend API URL
VITE_API_URL=https://your-backend-domain.com/api  # or http://localhost:5000/api for dev
```

---

## Step 6: Configure Billing Portal (Customer Self-Service)

### 6.1 Enable Customer Portal
1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate**

### 6.2 Configure Portal Settings
```
Business Information:
- Name: WasteWise
- Email: support@wastewise.com
- Phone: Your support phone
- Logo: Upload WasteWise logo

Customer Features:
✅ Allow customers to update payment method
✅ Allow customers to update billing information
✅ Allow customers to view invoice history
✅ Allow customers to cancel subscriptions
✅ Allow customers to switch plans (only upgrades recommended)

Cancellation Settings:
- Cancellation Reason: Required
- Retention Strategy: Show discount offer (optional)
- Cancel at Period End: Yes (recommended)
```

### 6.3 Get Portal Configuration
No additional keys needed - portal URL is generated dynamically via API

---

## Step 7: Set Up Payment Methods Configuration

### 7.1 FPX (Malaysian Online Banking)
1. Go to **Settings** → **Payment methods**
2. Enable **FPX**
3. Configure:
```
Supported Banks:
✅ Maybank
✅ CIMB Bank
✅ Public Bank
✅ RHB Bank
✅ Hong Leong Bank
✅ AmBank
✅ All other Malaysian banks
```

### 7.2 Configure Card Payments
```
3D Secure:
✅ Enable 3D Secure for enhanced security
✅ Adaptive 3D Secure (recommended)

Accepted Cards:
✅ Visa
✅ Mastercard
✅ American Express
```

### 7.3 E-Wallets
```
✅ GrabPay
✅ Touch 'n Go eWallet
✅ Boost
```

---

## Step 8: Configure Email Receipts & Invoices

### 8.1 Email Settings
1. Go to **Settings** → **Emails**
2. Configure:
```
From Email: billing@wastewise.com
Reply-to: support@wastewise.com

Enabled Emails:
✅ Successful payments
✅ Failed payments
✅ Upcoming invoice reminders
✅ Subscription cancelled
✅ Trial ending reminders
```

### 8.2 Customize Email Templates
1. Go to **Settings** → **Email branding**
2. Upload logo and customize colors to match WasteWise brand:
```
Primary Color: #00A7A7 (Teal)
Accent Color: #FF6B35 (CTA Orange)
Logo: Upload WasteWise logo
```

---

## Step 9: Testing the Integration

### 9.1 Test Cards (Test Mode Only)
```
Successful Payment:
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any valid ZIP

3D Secure Required:
Card Number: 4000 0027 6000 3184
Expiry: Any future date
CVC: Any 3 digits

Declined Card:
Card Number: 4000 0000 0000 0002
```

### 9.2 Test FPX (Test Mode)
```
Bank: Any Malaysian bank
Test Account: Use Stripe test mode credentials
Result: Will simulate success/failure based on test mode
```

### 9.3 Test Webhooks
```bash
# Using Stripe CLI
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

---

## Step 10: Go Live Checklist

### Before Switching to Live Mode:

- [ ] All products configured with correct pricing
- [ ] Webhooks configured and tested
- [ ] Email templates customized
- [ ] Customer portal configured
- [ ] Payment methods enabled (FPX, Cards, E-wallets)
- [ ] Test mode thoroughly tested with all payment flows
- [ ] Environment variables updated with live keys
- [ ] Frontend updated with live publishable key
- [ ] SSL certificate installed (HTTPS required for live mode)
- [ ] Business verification completed in Stripe
- [ ] Bank account connected for payouts
- [ ] Tax settings configured

### Switch to Live Mode:

1. **Complete Account Activation**
   - Stripe Dashboard → **Account** → **Complete activation**
   - Provide business details, bank account, identity verification

2. **Update Environment Variables**
   - Replace all `_test_` keys with `_live_` keys
   - Update webhook secrets to live webhook secret
   - Deploy updated environment variables

3. **Update Webhook Endpoint**
   - Create new webhook endpoint for production URL
   - Copy new webhook signing secret
   - Update environment variables

4. **Test with Real Small Transaction**
   - Process a small real payment (RM 1.00)
   - Verify webhook received
   - Verify subscription created in database
   - Verify email sent
   - Refund test transaction

---

## Step 11: Monitoring & Maintenance

### 11.1 Dashboard Monitoring
1. **Daily Checks** (Go to **Dashboard**):
   - Successful payments
   - Failed payments
   - New subscriptions
   - Cancellations

2. **Weekly Reviews**:
   - Payment success rate
   - Churn rate
   - MRR (Monthly Recurring Revenue)
   - Failed payment recovery

### 11.2 Webhook Monitoring
1. Go to **Developers** → **Webhooks**
2. Check webhook delivery status
3. Review any failed webhooks
4. Retry failed webhooks if needed

### 11.3 Customer Support
1. **Billing Issues**:
   - Use **Customers** section to find customer
   - View payment history
   - Issue refunds if needed
   - Update payment method

2. **Subscription Changes**:
   - Upgrade/downgrade plans
   - Apply discounts/coupons
   - Extend trial periods
   - Cancel subscriptions

---

## Quick Reference: API Endpoints

```
Base URL: https://your-backend.com/api

Public Endpoints:
GET  /billing/plans - Get all subscription plans
GET  /billing/guarantees - Get risk reversal guarantees

Authenticated Endpoints:
GET  /billing/subscription - Get user's subscription status
POST /billing/subscription - Create new subscription
DEL  /billing/subscription - Cancel subscription
POST /billing/subscription/reactivate - Reactivate cancelled subscription
GET  /billing/history - Get payment history
POST /billing/customer-portal - Get customer portal URL

Webhook Endpoint:
POST /billing/webhook - Stripe webhook handler (Stripe signature required)
```

---

## Pricing Quick Reference

| Plan | Monthly | Setup Fee | Annual (15% off) | Outlets | Users |
|------|---------|-----------|------------------|---------|-------|
| **Quick Win** | RM 2,997 | RM 0 | RM 30,569/year | Up to 5 | Up to 10 |
| **Growth** | RM 5,997 | RM 4,997 | RM 61,169/year | Up to 20 | Unlimited |
| **Enterprise** | Custom | Custom | Custom | Unlimited | Unlimited |

---

## Support & Resources

**Stripe Documentation:**
- API Docs: https://stripe.com/docs/api
- Payment Methods: https://stripe.com/docs/payments/payment-methods
- Webhooks: https://stripe.com/docs/webhooks
- Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal

**WasteWise Integration:**
- Backend Service: `backend/services/stripeService.js`
- Billing Routes: `backend/routes/billing.js`
- Access Control: `backend/services/accessControlService.js`

**Contact:**
- Stripe Support: https://support.stripe.com
- WasteWise Support: support@wastewise.com

---

## Troubleshooting

### Common Issues:

**1. Webhook not receiving events**
```
Solution:
- Check webhook URL is correct and accessible
- Verify HTTPS is enabled (required for live mode)
- Check webhook signing secret is correct
- Review webhook logs in Stripe dashboard
```

**2. Payment declined**
```
Solution:
- Check card details are correct
- Verify 3D Secure authentication completed
- Check customer has sufficient funds
- Review declined payment reason in Stripe dashboard
```

**3. Subscription not created in database**
```
Solution:
- Check webhook handler is processing events correctly
- Verify Supabase connection is working
- Review backend logs for errors
- Manually trigger webhook event for testing
```

**4. FPX payment failing**
```
Solution:
- Verify FPX is enabled in payment methods
- Check Malaysian bank is supported
- Test mode: Use Stripe test credentials
- Live mode: Verify customer's bank account has funds
```

---

**Last Updated:** November 2025
**Version:** 1.0

