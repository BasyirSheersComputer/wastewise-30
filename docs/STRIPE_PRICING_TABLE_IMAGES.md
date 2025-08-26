# Stripe Pricing Table SKU Images Guide

## Overview
The WasteWise application uses Stripe's pricing table component to display subscription plans. The SKU images are managed through the Stripe dashboard, not in the codebase.

## Current Configuration
- **Pricing Table ID**: `prctbl_1RwcWE1awWwGP4dI3uDwUQGp`
- **Environment Variable**: `VITE_STRIPE_PRICING_TABLE_ID`
- **Component**: `frontend/src/components/Marketing/PricingPage.tsx`

## How to Update SKU Images

### Method 1: Update Existing Pricing Table (Recommended)

1. **Log into Stripe Dashboard**
   - Go to https://dashboard.stripe.com/
   - Navigate to **Products & Prices**

2. **Find the Pricing Table**
   - Search for pricing table ID: `prctbl_1RwcWE1awWwGP4dI3uDwUQGp`
   - Or look for "WasteWise" pricing table

3. **Edit Product Images**
   - Click on each product in the pricing table
   - Upload new images for each SKU:
     - **Professional Plan**: Coffee shop interior or modern cafe
     - **Enterprise Plan**: Coffee beans and equipment
     - **Elite Plan**: Premium coffee preparation

4. **Image Requirements**
   - **Format**: JPG, PNG, or WebP
   - **Size**: 400x300px recommended
   - **Quality**: High resolution for professional appearance
   - **Content**: Relevant to each plan tier

### Method 2: Create New Pricing Table

1. **Create New Pricing Table in Stripe**
   - Go to Stripe Dashboard → Products & Prices
   - Click "Create pricing table"
   - Configure plans with appropriate images

2. **Update Environment Variable**
   ```bash
   # In frontend/.env
   VITE_STRIPE_PRICING_TABLE_ID=prctbl_your_new_table_id
   ```

3. **Deploy Changes**
   - The application will automatically use the new pricing table

## Recommended Images by Plan

### Professional Plan (RM 1,999/month)
- **Image**: Modern coffee shop interior
- **Theme**: Growing business, professional environment
- **Suggested**: Coffee shop with customers, modern equipment

### Enterprise Plan (RM 4,999/month)
- **Image**: Coffee beans and industrial equipment
- **Theme**: Scale, efficiency, established operations
- **Suggested**: Coffee roastery, bulk operations, multiple locations

### Elite Plan (RM 9,999/month)
- **Image**: Premium coffee preparation
- **Theme**: Luxury, exclusivity, industry leadership
- **Suggested**: Artisan coffee preparation, luxury cafe, executive setting

## Image Sources
- **Unsplash**: Free high-quality images
- **Shutterstock**: Premium stock photos
- **Custom Photography**: Professional photos of your operations

## Best Practices
1. **Consistent Style**: Use images with similar lighting and style
2. **Brand Alignment**: Ensure images match WasteWise premium positioning
3. **Quality**: Use high-resolution images (minimum 400x300px)
4. **Relevance**: Images should represent the scale and sophistication of each plan
5. **Professional**: Avoid stock photos that look generic

## Troubleshooting

### Images Not Updating
- Clear browser cache
- Check if pricing table ID is correct
- Verify images are properly uploaded in Stripe dashboard

### Pricing Table Not Loading
- Check environment variables
- Verify Stripe publishable key
- Check browser console for errors

## Environment Variables
```bash
# Required for Stripe pricing table
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_STRIPE_PRICING_TABLE_ID=prctbl_your_table_id
```

## Support
For issues with Stripe pricing table configuration, refer to:
- [Stripe Pricing Table Documentation](https://stripe.com/docs/payments/checkout/pricing-table)
- [Stripe Dashboard Help](https://support.stripe.com/)


