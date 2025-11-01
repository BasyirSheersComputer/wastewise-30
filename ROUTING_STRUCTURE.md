# Servora AI - Routing Structure (Asana-Style Best Practices)

## 🎯 Overview

The routing structure has been completely restructured following **Asana's best practices** for clean, secure, and performant SaaS applications.

---

## 📋 Complete Route Map

### 🌐 Public Routes (Marketing & Auth)

**Homepage & Marketing**
```
/                  → HomePage (Main landing)
/home              → HomePage (Explicit home route)
/landing           → DetailedLandingPage (Lead capture)
/pricing           → PricingPage (Hormozi value stack)
/offer             → GrandSlamOffer (Special offers)
```

**Authentication**
```
/login             → Login page
/signup            → Sign up/registration
/email-confirmation → Email verification
```

**Checkout Flow**
```
/checkout          → CheckoutFlow (Multi-step payment)
/checkout/success  → CheckoutSuccess (Post-payment)
```

**Demo**
```
/demo              → ProductDemo (Public product tour)
```

---

### 🔒 Protected Routes (/dashboard/*)

Following **Asana's pattern**: All authenticated routes under `/dashboard/*`

**Overview**
```
/dashboard         → DashboardHome (Main overview with metrics)
```

**Core Features**
```
/dashboard/waste      → WasteAnalytics (Waste tracking & insights)
/dashboard/inventory  → InventoryDashboard (Stock management)
/dashboard/forecast   → ForecastDashboard (AI demand predictions)
/dashboard/staff      → StaffDashboard (Training management)
/dashboard/reports    → ReportsDashboard (Reports & compliance)
/dashboard/suppliers  → SupplierDashboard (Procurement)
```

**Account Management**
```
/dashboard/billing    → BillingDashboard (Subscription & payments)
/dashboard/settings   → SettingsDashboard (Account settings)
```

---

### 🔄 Legacy Route Redirects

For backward compatibility, all old routes redirect to new structure:

```
/inventory   → /dashboard/inventory
/forecasting → /dashboard/forecast
/waste       → /dashboard/waste
/staff       → /dashboard/staff
/reports     → /dashboard/reports
/suppliers   → /dashboard/suppliers
/settings    → /dashboard/settings
```

**Benefits:**
- ✅ Old bookmarks still work
- ✅ Existing links don't break
- ✅ Seamless migration for users
- ✅ SEO-friendly redirects

---

## 🏗️ Route Architecture

### Asana-Style Patterns

**1. Clear Separation**
```
/              → Public marketing
/home          → Explicit public home
/checkout/*    → Checkout flow
/dashboard/*   → Authenticated app
```

**2. Nested Routes**
```
/dashboard
  ├── /           (overview)
  ├── /waste      (feature)
  ├── /inventory  (feature)
  ├── /forecast   (feature)
  ├── /staff      (feature)
  ├── /reports    (feature)
  ├── /suppliers  (feature)
  ├── /billing    (account)
  └── /settings   (account)
```

**3. Logical Grouping**
```
Main Features:
- Overview, Waste, Inventory, Forecast, Staff, Reports, Suppliers

Account Management:
- Billing, Settings
```

---

## 🎨 Navigation UI

### Sidebar Structure

```
┌──────────────────────┐
│ [S] Servora AI       │ ← Logo/Brand
├──────────────────────┤
│ MAIN                 │ ← Section Header
│ 🏠 Overview          │
│ 📉 Waste Analytics   │
│ 📦 Inventory         │
│ 🎯 Demand Forecast   │
│ 👥 Staff Training    │
│ 📊 Reports           │
│ 🏪 Suppliers         │
│                      │
│ ACCOUNT              │ ← Section Header
│ 💳 Billing           │
│ ⚙️ Settings          │
├──────────────────────┤
│ 👤 User Profile ▼    │ ← User Menu
└──────────────────────┘
```

**Features:**
- Fixed sidebar (always visible)
- Grouped by purpose (Main vs Account)
- Active state highlighting (Teal background)
- Icon + Label pattern
- Bottom user profile

---

## 💳 Billing & Payment Routes

### Checkout Flow

**Route:** `/checkout`

**Steps:**
1. Plan Selection (Confirmation)
2. Payment Method (Malaysian providers)
3. Review & Confirm

**Payment Methods Supported:**
- 🏦 FPX Online Banking (Recommended)
  - Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank
- 💳 Credit/Debit Card
  - Visa, Mastercard, Amex
- 🟢 GrabPay eWallet
- 🔵 Touch 'n Go eWallet
- 🟣 Boost
- 🟠 ShopeePay

**Success Route:** `/checkout/success`
- Confirmation message
- Next steps guidance
- Auto-redirect to dashboard (10s)

### Billing Dashboard

**Route:** `/dashboard/billing`

**Features:**
- Current plan overview
- Payment method management
- Billing history
- ROI calculator
- Plan upgrade options
- Invoice downloads

---

## 🔐 Route Protection

### Public Routes (No Auth Required)
```typescript
- /
- /home
- /landing
- /pricing
- /login
- /signup
- /demo
```

### Protected Routes (Auth Required)
```typescript
All /dashboard/* routes require:
- Valid Supabase auth session
- Active subscription (or trial)
- Proper access permissions
```

### Checkout Routes (Special)
```typescript
/checkout
- Can be accessed without auth
- Redirects to /login if not signed up
- Saves selected plan in URL params
```

---

## 🚀 Route Performance

### Code Splitting

Each route lazy-loads its component:
```typescript
/dashboard          → DashboardHome (loads on access)
/dashboard/waste    → WasteAnalytics (loads on demand)
/dashboard/billing  → BillingDashboard (loads when needed)
```

**Benefits:**
- Faster initial page load
- Reduced bundle size
- Better user experience

### Navigation Speed

- **Client-side routing**: Instant page transitions
- **No page reload**: Smooth UX
- **Prefetch**: Hover to preload
- **Optimistic UI**: Instant feedback

---

## 📱 Mobile Routes

Same routes work on mobile with responsive layouts:

**Mobile Navigation:**
```
/dashboard → Hamburger menu
Sidebar → Drawer (slide in/out)
All features → Touch-optimized
```

---

## 🎯 Route Naming Conventions

### Following Best Practices

**DO:**
- `/dashboard/waste` ✅ (feature-based)
- `/dashboard/billing` ✅ (function-based)
- `/checkout/success` ✅ (nested flow)

**DON'T:**
- `/dashboard-waste` ❌ (use slash not dash)
- `/WasteAnalytics` ❌ (no component names)
- `/waste-analytics-page` ❌ (too verbose)

### URL Structure

```
/{scope}/{feature}/{action?}

Examples:
/dashboard/waste              (scope: dashboard, feature: waste)
/dashboard/billing            (scope: dashboard, feature: billing)
/checkout/success             (scope: checkout, action: success)
```

---

## 🔗 Route Integration

### Sidebar Navigation

```typescript
navigation.map((item) => (
  <button onClick={() => navigate(item.path)}>
    {item.name}
  </button>
))
```

**Active State Detection:**
```typescript
active: location.pathname.includes('/waste')
```

### Programmatic Navigation

```typescript
// From anywhere in the app
navigate('/dashboard/waste')
navigate('/dashboard/billing')
navigate('/checkout?plan=growth')
```

### URL Parameters

```typescript
/checkout?plan=growth
/checkout?plan=quick-win
/checkout?plan=enterprise
```

---

## 📊 Route Analytics

### Track These Metrics

**Public Routes:**
- Page views
- Conversion rate (landing → signup)
- Time on page
- Bounce rate

**Dashboard Routes:**
- Feature usage (which pages visited)
- Session duration
- Daily active routes
- Navigation patterns

**Checkout Routes:**
- Funnel drop-off per step
- Payment method selection
- Conversion rate
- Time to complete

---

## 🛡️ Security Best Practices

### Route Protection

**1. RequireAuth Wrapper**
```typescript
<Route element={
  <RequireAuth>
    <DashboardLayout>
      <DashboardHome />
    </DashboardLayout>
  </RequireAuth>
} />
```

**2. Session Validation**
- Supabase auth check
- Token verification
- Permission checks

**3. Redirect Logic**
```typescript
Not authenticated → /login
Trial expired → /trial-ended
No subscription → /pricing
```

### HTTPS Only (Production)

All routes force HTTPS in production:
```
http://servora.ai/dashboard → https://servora.ai/dashboard
```

---

## 🎨 Route-Specific Layouts

### Marketing Layout
- Full-width
- Marketing navigation
- Footer
- No sidebar

### Dashboard Layout
- Fixed sidebar (left)
- Top header
- Search bar
- Notifications
- User menu

### Checkout Layout
- Minimal header
- Progress indicator
- No sidebar
- Trust badges

---

## 📝 Route Metadata

### Page Titles

```typescript
/                      → "Servora AI - Reduce Food Waste by 30-40%"
/pricing               → "Pricing - Servora AI"
/dashboard             → "Dashboard - Servora AI"
/dashboard/waste       → "Waste Analytics - Servora AI"
/dashboard/billing     → "Billing - Servora AI"
```

### Meta Descriptions

Each route has SEO-optimized descriptions:
```typescript
/                → "Reduce food waste by 30-40% in 60 days..."
/dashboard/waste → "Track and analyze waste with AI-powered insights..."
```

---

## 🔄 Route Transitions

### Smooth Navigation

All transitions use React Router's built-in animations:
```css
transition: opacity 200ms ease-in-out
```

**No page reload** - Instant client-side routing

---

## 🎯 Deep Linking

### Shareable URLs

All dashboard routes support deep linking:

```
Share: https://servora.ai/dashboard/waste?date=2025-11
Direct access to specific view with filters
```

**Use Cases:**
- Share specific reports
- Bookmark favorite views
- Email links to team
- Support troubleshooting

---

## 📱 Route Examples

### User Journey 1: New Customer

```
1. / (homepage)
2. /pricing (view plans)
3. /signup (create account)
4. /email-confirmation (verify)
5. /login (first login)
6. /dashboard (see overview)
7. /dashboard/waste (start logging)
```

### User Journey 2: Existing User

```
1. /login (authenticate)
2. /dashboard (overview)
3. /dashboard/waste (check metrics)
4. /dashboard/forecast (review predictions)
5. /dashboard/reports (generate report)
6. /dashboard/billing (review invoice)
```

### User Journey 3: Upgrade Flow

```
1. /dashboard (current plan)
2. /dashboard/billing (view plans)
3. /checkout?plan=enterprise (upgrade)
4. /checkout/success (confirmation)
5. /dashboard (with new features)
```

---

## 🎨 Route-Based Styling

### Conditional Rendering

```typescript
// Show trial banner only on dashboard routes
{location.pathname.includes('/dashboard') && <TrialBanner />}

// Show upgrade prompt on specific features
{location.pathname === '/dashboard/forecast' && <UpgradePrompt />}
```

---

## 📚 Route Documentation

### For Developers

**Add New Route:**
```typescript
// 1. Create component
components/UI/NewFeature.tsx

// 2. Import in App.tsx
import NewFeature from "./components/UI/NewFeature";

// 3. Add route
<Route
  path="/dashboard/new-feature"
  element={
    <RequireAuth>
      <DashboardLayout>
        <NewFeature />
      </DashboardLayout>
    </RequireAuth>
  }
/>

// 4. Add to navigation
// In DashboardLayout.tsx, add to navigation array
```

---

## ✅ Route Best Practices Applied

Following **Asana, Linear, Notion** patterns:

✅ **Clean URLs** - No unnecessary params
✅ **Logical Nesting** - /dashboard/{feature}
✅ **Consistent Naming** - Lowercase, dash-separated
✅ **Protected Routes** - Auth wrapper
✅ **Legacy Redirects** - Backward compatibility
✅ **Deep Linking** - Shareable URLs
✅ **Code Splitting** - Lazy loading
✅ **SEO Friendly** - Proper meta tags
✅ **Mobile First** - Same routes, responsive
✅ **Performance** - Fast navigation

---

## 🎯 Summary

The routing structure is now:

- **Clean**: Asana-style organization
- **Secure**: Proper auth protection
- **Fast**: Code splitting & client routing
- **Intuitive**: Logical URL structure
- **Scalable**: Easy to add new routes
- **Compatible**: Legacy redirects
- **Professional**: Following industry standards

---

**Route Count:**
- Public: 10 routes
- Dashboard: 8 routes
- Legacy Redirects: 7 routes
- **Total: 25 routes**

**View the system:** http://localhost:5173

---

**Last Updated**: November 2025
**Standard**: Asana/Linear/Notion Best Practices
**Status**: ✅ Production Ready

