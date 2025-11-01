# Servora AI Design System - Quick Reference Guide

## Color Usage Guide

### When to Use Each Color

#### Primary Teal (#00A7A7)
**Use for:**
- Brand logo and main branding elements
- Key statistics and metrics
- Primary buttons (when not CTA)
- Trust indicators
- Links and interactive elements
- Section highlights

**CSS Classes:**
```css
bg-primary-500
text-primary-500
border-primary-500
hover:bg-primary-700
```

#### CTA Orange (#FF6B35)
**Use for:**
- All call-to-action buttons
- "Most Popular" badges
- Conversion-focused elements
- High-priority actions
- Limited-time offers

**CSS Classes:**
```css
.btn-cta
bg-cta-500
text-cta-500
hover:bg-cta-600
```

**Critical Rule:** Use CTA orange **only** for actions you want users to take. Overuse dilutes effectiveness.

#### Success Green (#2D9F4B)
**Use for:**
- Savings amounts
- Positive metrics
- Success states
- Checkmarks
- Growth indicators

**CSS Classes:**
```css
text-success-500
bg-success-500
```

#### Neutral Grays
**Use for:**
- Body text (neutral-900)
- Secondary text (neutral-600)
- Backgrounds (neutral-50, neutral-100)
- Borders (neutral-200, neutral-300)

**CSS Classes:**
```css
text-neutral-900    /* Primary text */
text-neutral-600    /* Secondary text */
text-neutral-500    /* Tertiary text */
bg-neutral-50       /* Light backgrounds */
bg-neutral-100      /* Slightly darker backgrounds */
border-neutral-200  /* Subtle borders */
```

---

## Typography Scale

### Headline Hierarchy

```tsx
// Display - Hero Headlines (72px)
<h1 className="text-display font-bold text-neutral-900">
  Reduce Food Waste by 30-40% in 60 Days
</h1>

// Headline - Section Headers (48px)
<h2 className="text-headline font-bold text-neutral-900">
  Proven Solutions, Measurable Results
</h2>

// Title - Subsection Headers (32px)
<h3 className="text-title font-bold text-neutral-900">
  AI Forecasting
</h3>

// Subtitle - Card Titles (24px)
<h4 className="text-subtitle font-semibold text-neutral-900">
  Expected Outcomes
</h4>
```

### Body Text

```tsx
// Large Body - Important text (18px)
<p className="text-body-lg text-neutral-600">
  Stop losing RM 15,000-25,000 monthly to preventable waste.
</p>

// Regular Body - Standard text (16px)
<p className="text-body text-neutral-600">
  Our proven system helps F&B businesses increase profits.
</p>

// Small Body - Fine print (14px)
<p className="text-body-sm text-neutral-500">
  No credit card required
</p>
```

---

## Button Patterns

### Primary Actions (CTA)

```tsx
// Main conversion action
<button className="btn-cta">
  Get Your Free Audit
  <ArrowRight className="w-5 h-5 ml-2 inline" />
</button>

// With loading state
<button className="btn-cta" disabled={isLoading}>
  {isLoading ? 'Processing...' : 'Start Now'}
</button>
```

### Secondary Actions

```tsx
// Alternative action
<button className="btn-secondary">
  View Pricing
</button>

// Ghost button for less emphasis
<button className="btn-ghost">
  Learn More
</button>
```

### Primary Brand Button (Non-CTA)

```tsx
// Important but not conversion-focused
<button className="btn-primary">
  Continue
</button>
```

---

## Card Components

### Standard Card

```tsx
<div className="card">
  <h3 className="text-subtitle mb-4">Card Title</h3>
  <p className="text-neutral-600">Card content goes here.</p>
</div>
```

### Elevated Card (with hover)

```tsx
<div className="card-elevated hover-lift">
  <h3 className="text-subtitle mb-4">Elevated Card</h3>
  <p className="text-neutral-600">Hovers and lifts on interaction.</p>
</div>
```

### Stat Card

```tsx
<div className="stat-card bg-white rounded-lg shadow-sm p-4">
  <div className="stat-value text-primary-500">30-40%</div>
  <div className="stat-label">waste reduced</div>
</div>
```

---

## Form Patterns

### Input Field

```tsx
<div>
  <label className="label">Full Name</label>
  <input
    type="text"
    className="input-field w-full"
    placeholder="John Tan"
    required
  />
</div>
```

### Complete Form

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="label">Email Address</label>
    <input
      type="email"
      className="input-field w-full"
      placeholder="john@restaurant.com"
      required
    />
  </div>
  
  <button type="submit" className="btn-cta w-full">
    Submit
  </button>
</form>
```

---

## Section Layouts

### Hero Section

```tsx
<section className="section-hero bg-neutral-50">
  <div className="container">
    <h1 className="text-display font-bold text-neutral-900 mb-6">
      Hero Headline
    </h1>
    <p className="text-body-lg text-neutral-600 mb-8">
      Supporting text with value proposition.
    </p>
    <button className="btn-cta">Primary CTA</button>
  </div>
</section>
```

### Standard Section

```tsx
<section className="section">
  <div className="container">
    <h2 className="text-headline mb-8">Section Title</h2>
    <div className="grid md:grid-cols-3 gap-8">
      {/* Content grid */}
    </div>
  </div>
</section>
```

### FAQ Section

```tsx
<section className="section-faq">
  <div className="container">
    <h2 className="text-headline mb-12">FAQs</h2>
    {/* FAQ content */}
  </div>
</section>
```

---

## Trust Indicators

### Badge Pattern

```tsx
<div className="flex gap-4">
  <div className="trust-badge">
    <Check className="w-4 h-4 text-success-500" />
    <span>30-day money-back guarantee</span>
  </div>
  <div className="trust-badge">
    <Check className="w-4 h-4 text-success-500" />
    <span>No credit card required</span>
  </div>
</div>
```

### Guarantee Card

```tsx
<div className="card">
  <Shield className="w-12 h-12 text-primary-500 mb-4" />
  <h4 className="font-bold text-neutral-900 mb-2">
    30-Day Money-Back Guarantee
  </h4>
  <p className="text-sm text-neutral-600">
    See measurable improvement or full refund
  </p>
</div>
```

---

## Value Proposition Components

### Using Reusable Components

```tsx
import { StatCard, OutcomeCard, IndustryDataCard } from '@/components/UI/ValueProposition';

// Stat display
<StatCard 
  value="30-40%" 
  label="waste reduced" 
  highlighted 
/>

// Solution outcome
<OutcomeCard 
  icon={Zap}
  title="AI Forecasting"
  description="85-95% accuracy"
  outcome="Reduce overproduction by 30-40%"
  savings="RM 10,000-20,000 monthly"
  timeline="30 days"
/>

// Industry data
<IndustryDataCard 
  stat="25-40%"
  description="Waste reduction with automation"
  source="World Resources Institute, 2023"
  link="https://www.wri.org"
/>
```

---

## Spacing Guidelines

### Consistent Gaps

```tsx
// Between cards
<div className="grid md:grid-cols-3 gap-8">

// Between sections
<div className="space-y-16">

// Within cards
<div className="space-y-4">

// Between inline elements
<div className="flex gap-4">
```

### Section Padding

```tsx
// Standard section
<section className="section">  // py-20 (80px)

// Hero section
<section className="section-hero">  // pt-12 pb-24 (48px/96px)

// FAQ section
<section className="section-faq">  // pt-12 pb-4 (48px/16px)
```

---

## Responsive Patterns

### Grid Layouts

```tsx
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

// 1 column mobile, 2 desktop
<div className="grid md:grid-cols-2 gap-8">

// 1 column mobile, 4 desktop
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
```

### Flex Patterns

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col sm:flex-row gap-4">

// Center on mobile, justify on desktop
<div className="flex flex-col sm:flex-row justify-center sm:justify-between">
```

### Text Sizing

```tsx
// Responsive headline
<h1 className="text-headline md:text-display">
  Responsive Headline
</h1>

// Hide on mobile
<div className="hidden md:block">
  Desktop only content
</div>

// Show only on mobile
<div className="md:hidden">
  Mobile only content
</div>
```

---

## Content Patterns

### Outcome-Focused Headlines

```tsx
// ✅ Good - Specific outcome
<h2 className="text-headline">
  Reduce Food Waste by 30-40% in 60 Days
</h2>

// ❌ Bad - Feature-focused
<h2 className="text-headline">
  AI-Powered Waste Tracking Platform
</h2>
```

### Value Propositions

```tsx
// ✅ Good - Specific numbers with proof
<p className="text-body-lg">
  Save RM 15,000-25,000 monthly per outlet
  <span className="text-sm text-neutral-500">
    (Industry average: 25-40% reduction - WRI 2023)
  </span>
</p>

// ❌ Bad - Vague claims
<p className="text-body-lg">
  Save thousands with our platform
</p>
```

### Call-to-Action Text

```tsx
// ✅ Good - Clear value
<button className="btn-cta">
  Get Your Free Audit
</button>

// ✅ Good - Action-oriented
<button className="btn-cta">
  Start Saving Today
</button>

// ❌ Bad - Generic
<button className="btn-cta">
  Learn More
</button>
```

---

## Common Layouts

### Two-Column Hero

```tsx
<section className="section-hero bg-neutral-50">
  <div className="container">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Left: Content */}
      <div>
        <h1 className="text-display mb-6">Headline</h1>
        <p className="text-body-lg mb-8">Description</p>
        <button className="btn-cta">CTA</button>
      </div>
      
      {/* Right: Form or Image */}
      <div>
        <LeadCaptureForm />
      </div>
    </div>
  </div>
</section>
```

### Feature Grid

```tsx
<section className="section">
  <div className="container">
    <h2 className="text-headline text-center mb-12">
      Section Title
    </h2>
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <div key={feature.id} className="card">
          <Icon className="w-12 h-12 text-primary-500 mb-4" />
          <h3 className="text-subtitle mb-2">{feature.title}</h3>
          <p className="text-neutral-600">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Pricing Table

```tsx
<section className="section">
  <div className="container">
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div 
          key={plan.id}
          className={plan.popular ? 'card-elevated border-2 border-cta-500' : 'card'}
        >
          {plan.popular && (
            <div className="bg-cta-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
              MOST POPULAR
            </div>
          )}
          
          <h3 className="text-subtitle mb-4">{plan.name}</h3>
          <div className="text-4xl font-bold mb-6">
            RM {plan.price.toLocaleString()}
          </div>
          
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check className="w-5 h-5 text-success-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          <button className={plan.popular ? 'btn-cta w-full' : 'btn-primary w-full'}>
            {plan.cta}
          </button>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## Icons Usage

Using Lucide React icons:

```tsx
import { Check, ArrowRight, Shield, TrendingUp, DollarSign } from 'lucide-react';

// In button
<button className="btn-cta">
  Get Started
  <ArrowRight className="w-5 h-5 ml-2 inline" />
</button>

// As feature icon
<TrendingUp className="w-12 h-12 text-primary-500" />

// In badge
<Check className="w-4 h-4 text-success-500" />
```

---

## Animation & Transitions

### Hover Effects

```tsx
// Lift card on hover
<div className="card hover-lift">

// Color transition
<button className="text-neutral-600 hover:text-neutral-900 transition-colors">

// Background transition
<button className="bg-primary-500 hover:bg-primary-700 transition-all duration-200">
```

### Loading States

```tsx
<button className="btn-cta" disabled={isLoading}>
  {isLoading ? (
    <span className="flex items-center gap-2">
      <span className="animate-spin">⏳</span>
      Processing...
    </span>
  ) : (
    'Submit'
  )}
</button>
```

---

## Accessibility Checklist

- [ ] All buttons have descriptive text
- [ ] Images have alt text
- [ ] Forms have proper labels
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Headings follow proper hierarchy
- [ ] Links are distinguishable

---

## Common Mistakes to Avoid

### ❌ Don't

```tsx
// Don't use CTA orange for everything
<button className="btn-cta">Learn More</button>
<button className="btn-cta">View Details</button>
<button className="btn-cta">Contact Us</button>

// Don't use vague text
<p>Save money with our platform</p>

// Don't mix fonts
<h1 style={{ fontFamily: 'Comic Sans' }}>

// Don't use custom spacing
<div className="pt-7 pb-9">
```

### ✅ Do

```tsx
// Use CTA orange sparingly for main actions
<button className="btn-cta">Start Free Trial</button>
<button className="btn-secondary">Learn More</button>
<button className="btn-ghost">View Details</button>

// Use specific numbers
<p>Save RM 15,000-25,000 monthly per outlet</p>

// Use system fonts
<h1 className="font-bold">

// Use spacing scale
<div className="section">
```

---

## Quick Copy-Paste Templates

### Hero Section

```tsx
<section className="section-hero bg-neutral-50">
  <div className="container text-center">
    <h1 className="text-display font-bold text-neutral-900 mb-6">
      Your Outcome-Focused Headline
    </h1>
    <p className="text-body-lg text-neutral-600 mb-8 max-w-3xl mx-auto">
      Your value proposition with specific numbers and timeframes.
    </p>
    <button className="btn-cta">
      Primary CTA
      <ArrowRight className="w-5 h-5 ml-2 inline" />
    </button>
  </div>
</section>
```

### Stats Grid

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  <div className="stat-card bg-white rounded-lg shadow-sm p-4">
    <div className="stat-value text-primary-500">30-40%</div>
    <div className="stat-label">waste reduced</div>
  </div>
  {/* Repeat for other stats */}
</div>
```

### Feature Card

```tsx
<div className="card hover-lift">
  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-white" />
  </div>
  <h3 className="text-subtitle mb-2">Feature Title</h3>
  <p className="text-neutral-600 mb-4">Feature description</p>
  <div className="space-y-2">
    <div className="flex gap-2">
      <Check className="w-4 h-4 text-success-500" />
      <span className="text-sm">Specific outcome</span>
    </div>
  </div>
</div>
```

---

**Last Updated**: November 2025
**For**: Servora AI Development Team

