import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import stripeService from '../services/stripeService.js';

dotenv.config();

const router = express.Router();

// Create Supabase client only if environment variables are available
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    logger.info('Billing route: Supabase client created successfully');
  } else {
    logger.warn('Billing route: Supabase environment variables not found, billing features will be disabled');
  }
} catch (error) {
  logger.error('Billing route: Failed to create Supabase client:', error.message);
}

// Get all plans with risk reversal guarantees
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'professional',
        name: 'Professional',
        price: 5000,
        originalPrice: 6000,
        currency: 'MYR',
        interval: 'month',
        pricingUnit: 'per 10 outlets',
        popular: true,
        savings: 17,
        targetMarket: 'Top 10% revenue makers (RM 2M-10M annually)',
        annualRevenue: 'RM 2M-10M',
        valueProposition: 'Reduce waste by 25-30% and save RM 100K-300K/month',
        riskReversal: {
          guarantee: '30-Day Money-Back Guarantee',
          description: 'If you don\'t see at least 15% waste reduction within 30 days, get a full refund',
          terms: [
            'Full refund within 30 days if waste reduction < 15%',
            'No questions asked refund policy',
            'Keep all data and insights generated during trial',
            'Free consultation to optimize results'
          ],
          coverage: '100% of first month payment',
          confidence: '95% success rate'
        },
        features: {
          core: [
            'Advanced AI-powered waste analytics',
            'Multi-location dashboard (up to 25 locations)',
            'Priority support with dedicated account manager',
            'Custom integrations with existing systems',
            'Advanced analytics and reporting',
            'Multi-user access (up to 10 users)',
            'Staff training and certification programs',
            'Supplier management and analytics',
            'Menu optimization with AI insights',
            'Demand forecasting and inventory optimization',
            'API access and custom development',
            'Compliance reporting and audit trails',
            'Data export and backup capabilities',
            'White-label reporting options',
            'Advanced security and data protection'
          ],
          modules: {
            'Operational Intelligence': 'Advanced AI-powered dashboard with real-time insights',
            'Recipe & Inventory': 'Advanced inventory with AI predictions and optimization',
            'Demand Forecasting': 'AI-powered demand forecasting with machine learning',
            'Waste Tracking': 'Advanced waste analytics with AI insights and optimization',
            'Suppliers': 'Advanced supplier management and performance analytics',
            'Menu Optimization': 'AI-powered menu optimization and profitability analysis',
            'Staff Training': 'Advanced training with progress tracking and certification',
            'Reports & Compliance': 'Advanced compliance and custom reporting with audit trails',
            'CSV Upload': 'Advanced data processing with validation and AI analysis',
            'Issue Reporting': 'Advanced issue tracking and resolution with AI insights'
          },
          limitations: [
            'Limited to 25 locations',
            'Up to 10 users only',
            'No custom AI model training',
            'No white-label platform options',
            'Standard implementation services'
          ]
        },
        stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 10000,
        originalPrice: 12000,
        currency: 'MYR',
        interval: 'month',
        pricingUnit: 'per 10 outlets',
        popular: false,
        savings: 17,
        targetMarket: 'Top 1% revenue makers (RM 50M+ annually)',
        annualRevenue: 'RM 50M+',
        valueProposition: 'Reduce waste by 30-40% and save RM 500K-1M/month',
        riskReversal: {
          guarantee: '60-Day Performance Guarantee',
          description: 'Guaranteed 25% waste reduction or 3 months free + implementation refund',
          terms: [
            'Guaranteed 25% waste reduction within 60 days',
            'If not achieved: 3 months free + implementation cost refund',
            'Dedicated success manager throughout guarantee period',
            'Custom optimization strategy development',
            'Free data migration and setup services'
          ],
          coverage: '100% of first 3 months + implementation costs',
          confidence: '98% success rate'
        },
        features: {
          core: [
            'Everything in Professional',
            'Unlimited locations and users',
            'Custom AI model training and optimization',
            'Dedicated success manager and support team',
            '24/7 phone and email support',
            'Custom integrations and API development',
            'Advanced compliance and regulatory reporting',
            'White-label platform options',
            'Custom branding and UI customization',
            'Advanced security and data protection',
            'Multi-region and multi-currency support',
            'Custom analytics and reporting',
            'Data migration and implementation services',
            'Staff training and change management',
            'Strategic consulting and optimization services'
          ],
          modules: {
            'Operational Intelligence': 'Enterprise dashboard with custom AI models and insights',
            'Recipe & Inventory': 'Enterprise inventory with custom AI training and optimization',
            'Demand Forecasting': 'Custom AI models for demand forecasting and optimization',
            'Waste Tracking': 'Enterprise waste analytics with custom insights and optimization',
            'Suppliers': 'Enterprise supplier management with custom integrations and analytics',
            'Menu Optimization': 'Custom AI models for menu optimization and profitability',
            'Staff Training': 'Enterprise training platform with custom content and certification',
            'Reports & Compliance': 'Custom compliance reports and white-label options',
            'CSV Upload': 'Enterprise data processing with custom validation and AI analysis',
            'Issue Reporting': 'Enterprise issue management with custom workflows and AI insights'
          },
          limitations: [
            'No limitations on features',
            'Full customization available',
            'Dedicated support team',
            'Custom development available',
            'Strategic partnership included'
          ]
        },
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE
      },
      {
        id: 'elite',
        name: 'Elite',
        price: 12999, // Increased from 9999 to include risk reversal
        originalPrice: 15999,
        currency: 'MYR',
        interval: 'month',
        popular: false,
        savings: 19,
        targetMarket: 'Ultra-premium segment (RM 100M+ annually)',
        annualRevenue: 'RM 100M+',
        valueProposition: 'Reduce waste by 35-45% and save RM 1M-2M/month',
        riskReversal: {
          guarantee: '90-Day ROI Guarantee',
          description: 'Guaranteed 3x ROI within 90 days or full refund + penalty payment',
          terms: [
            'Guaranteed 3x ROI within 90 days of implementation',
            'If not achieved: Full refund + 50% penalty payment to customer',
            'Dedicated engineering team throughout guarantee period',
            'Custom AI model development and training',
            'Strategic business consulting included',
            'International expansion support',
            'Priority feature development'
          ],
          coverage: '100% refund + 50% penalty payment if ROI not achieved',
          confidence: '99% success rate'
        },
        features: {
          core: [
            'Everything in Enterprise',
            'Custom AI development and training',
            'Dedicated engineering team',
            'Custom platform development',
            'Strategic partnership and consulting',
            'International expansion support',
            'Custom compliance and regulatory frameworks',
            'Advanced data analytics and insights',
            'Custom integrations with enterprise systems',
            'White-label platform licensing',
            'Custom training and certification programs',
            'Strategic business consulting',
            'Market analysis and competitive intelligence',
            'Custom reporting and analytics',
            'Priority feature development'
          ],
          modules: {
            'Operational Intelligence': 'Custom AI development with dedicated engineering team',
            'Recipe & Inventory': 'Custom platform development with AI optimization',
            'Demand Forecasting': 'Custom AI models with strategic consulting',
            'Waste Tracking': 'Custom analytics with international expansion support',
            'Suppliers': 'Custom integrations with enterprise systems and white-label options',
            'Menu Optimization': 'Custom AI development with strategic business consulting',
            'Staff Training': 'Custom training programs with certification and licensing',
            'Reports & Compliance': 'Custom compliance frameworks with regulatory support',
            'CSV Upload': 'Custom data processing with advanced analytics and insights',
            'Issue Reporting': 'Custom workflows with priority feature development'
          },
          limitations: [
            'No limitations on features',
            'Full customization and development',
            'Dedicated engineering team',
            'Strategic partnership and consulting',
            'Priority feature development'
          ]
        },
        stripePriceId: process.env.STRIPE_PRICE_ELITE
      }
    ];

    // Add annual pricing options with enhanced guarantees
    const annualPlans = plans.map(plan => ({
      ...plan,
      id: `${plan.id}_annual`,
      name: `${plan.name} (Annual)`,
      price: Math.round(plan.price * 0.85), // 15% discount for annual (increased from 10%)
      originalPrice: plan.price * 12,
      interval: 'year',
      savings: 15,
      billingType: 'annual',
      riskReversal: {
        ...plan.riskReversal,
        guarantee: `${plan.riskReversal.guarantee} + Extended Coverage`,
        description: `${plan.riskReversal.description} with extended guarantee period`,
        terms: [
          ...plan.riskReversal.terms,
          'Extended guarantee period for annual contracts',
          'Additional 30 days of free support if needed',
          'Priority refund processing for annual customers'
        ],
        coverage: `${plan.riskReversal.coverage} + extended period coverage`,
        confidence: plan.riskReversal.confidence
      },
      stripePriceId: process.env[`STRIPE_PRICE_${plan.id.toUpperCase()}_ANNUAL`]
    }));

    const allPlans = [...plans, ...annualPlans];

    res.json({ 
      plans: allPlans,
      pricingInfo: {
        currency: 'MYR',
        billingCycles: ['monthly', 'annual'],
        discounts: {
          annual: '15% discount for annual billing',
          multiYear: '20-30% discount for multi-year contracts',
          volume: '25-50% discount for multiple locations',
          enterprise: 'Custom pricing for large deployments'
        },
        specialOffers: [
          '30-day free trial with full access',
          'No setup fees for annual contracts',
          'Custom enterprise agreements available',
          'Strategic partnership opportunities',
          'Risk reversal guarantees on all plans'
        ],
        marketFocus: {
          target: 'Top 10% revenue makers in Malaysian F&B',
          enterprise: 'Top 1% revenue makers',
          elite: 'Ultra-premium segment (RM 100M+ annually)',
          positioning: 'Premium AI-powered waste reduction platform with guaranteed results'
        },
        riskReversal: {
          summary: 'Comprehensive risk reversal guarantees on all plans',
          professional: '30-Day Money-Back Guarantee with 15% waste reduction target',
          enterprise: '60-Day Performance Guarantee with 25% waste reduction target',
          elite: '90-Day ROI Guarantee with 3x ROI target',
          confidence: '95-99% success rates across all plans'
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching plans', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get subscription status
router.get('/subscription', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Billing features are currently unavailable' });
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('trial_start, trial_end, subscription_status, subscription_plan, stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    const now = DateTime.now();
    const trialEnd = DateTime.fromISO(userData.trial_end);
    const isTrialExpired = now > trialEnd;

    // Get Stripe subscription details if available
    let stripeSubscription = null;
    if (userData.stripe_subscription_id) {
      try {
        stripeSubscription = await stripeService.getSubscription(userData.stripe_subscription_id);
      } catch (error) {
        logger.warn('Failed to get Stripe subscription', { error: error.message });
      }
    }

    res.json({
      trialStart: userData.trial_start,
      trialEnd: userData.trial_end,
      isTrialExpired,
      subscriptionStatus: userData.subscription_status || 'trial',
      subscriptionPlan: userData.subscription_plan || 'free',
      daysLeft: Math.max(0, trialEnd.diff(now, 'days').days),
      stripeCustomerId: userData.stripe_customer_id,
      stripeSubscription: stripeSubscription ? {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodEnd: stripeSubscription.current_period_end,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      } : null
    });
  } catch (error) {
    logger.error('Error getting subscription status', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new subscription
router.post('/subscription', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Billing features are currently unavailable' });
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { plan, paymentMethodId } = req.body;

    if (!plan || !['professional', 'enterprise', 'elite'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    // Create or get Stripe customer
    let customerId = userData.stripe_customer_id;
    if (!customerId) {
      const customer = await stripeService.createCustomer(userData);
      customerId = customer.id;
    }

    // Get price ID for the plan
    const priceIds = {
      professional: process.env.STRIPE_PRICE_PROFESSIONAL,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
      elite: process.env.STRIPE_PRICE_ELITE
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan configuration' });
    }

    // Create subscription
    const subscription = await stripeService.createSubscription(customerId, priceId, paymentMethodId, userData);

    res.json({ 
      message: 'Subscription created successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan
      }
    });
  } catch (error) {
    logger.error('Error creating subscription', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.delete('/subscription', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Billing features are currently unavailable' });
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    if (!userData.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription at period end
    await stripeService.cancelSubscription(userData.stripe_subscription_id);

    res.json({ message: 'Subscription will be cancelled at the end of the current period' });
  } catch (error) {
    logger.error('Error cancelling subscription', error);
    res.status(500).json({ error: error.message });
  }
});

// Reactivate subscription
router.post('/subscription/reactivate', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Billing features are currently unavailable' });
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData.stripe_subscription_id) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Reactivate subscription in Stripe
    await stripeService.reactivateSubscription(userData.stripe_subscription_id);

    // Update local database
    await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    res.json({ message: 'Subscription reactivated successfully' });
  } catch (error) {
    logger.error('Error reactivating subscription', error);
    res.status(500).json({ error: error.message });
  }
});

// Get billing history
router.get('/history', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Billing features are currently unavailable' });
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    let billingHistory = [];

    if (userData.stripe_customer_id) {
      try {
        // Get invoices from Stripe
        const stripe = stripeService.stripe;
        const invoices = await stripe.invoices.list({
          customer: userData.stripe_customer_id,
          limit: 20
        });

        billingHistory = invoices.data.map(invoice => ({
          id: invoice.id,
          date: new Date(invoice.created * 1000).toISOString(),
          amount: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency.toUpperCase(),
          description: invoice.description || 'Subscription payment',
          status: invoice.status,
          invoiceUrl: invoice.hosted_invoice_url
        }));
      } catch (error) {
        logger.warn('Failed to get Stripe billing history', error);
      }
    }

    res.json({ billingHistory });
  } catch (error) {
    logger.error('Error getting billing history', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get risk reversal guarantee details
router.get('/guarantees', async (req, res) => {
  try {
    const guarantees = {
      professional: {
        name: '30-Day Money-Back Guarantee',
        description: 'If you don\'t see at least 15% waste reduction within 30 days, get a full refund',
        period: '30 days',
        target: '15% waste reduction',
        coverage: '100% of first month payment',
        terms: [
          'Full refund within 30 days if waste reduction < 15%',
          'No questions asked refund policy',
          'Keep all data and insights generated during trial',
          'Free consultation to optimize results',
          'Dedicated support during guarantee period'
        ],
        confidence: '95% success rate',
        process: [
          'Submit guarantee claim within 30 days',
          'Provide waste reduction metrics',
          'Receive refund within 5 business days',
          'Keep all generated insights and data'
        ]
      },
      enterprise: {
        name: '60-Day Performance Guarantee',
        description: 'Guaranteed 25% waste reduction or 3 months free + implementation refund',
        period: '60 days',
        target: '25% waste reduction',
        coverage: '100% of first 3 months + implementation costs',
        terms: [
          'Guaranteed 25% waste reduction within 60 days',
          'If not achieved: 3 months free + implementation cost refund',
          'Dedicated success manager throughout guarantee period',
          'Custom optimization strategy development',
          'Free data migration and setup services',
          'Priority support and consultation'
        ],
        confidence: '98% success rate',
        process: [
          'Submit performance claim within 60 days',
          'Provide detailed waste reduction metrics',
          'Receive 3 months free + implementation refund if target not met',
          'Continue with optimized strategy'
        ]
      },
      elite: {
        name: '90-Day ROI Guarantee',
        description: 'Guaranteed 3x ROI within 90 days or full refund + penalty payment',
        period: '90 days',
        target: '3x ROI',
        coverage: '100% refund + 50% penalty payment if ROI not achieved',
        terms: [
          'Guaranteed 3x ROI within 90 days of implementation',
          'If not achieved: Full refund + 50% penalty payment to customer',
          'Dedicated engineering team throughout guarantee period',
          'Custom AI model development and training',
          'Strategic business consulting included',
          'International expansion support',
          'Priority feature development'
        ],
        confidence: '99% success rate',
        process: [
          'Submit ROI claim within 90 days',
          'Provide comprehensive ROI calculations',
          'Receive full refund + 50% penalty if target not met',
          'Keep all custom developments and insights'
        ]
      }
    };

    res.json({ guarantees });
  } catch (error) {
    logger.error('Error fetching guarantees', error);
    res.status(500).json({ error: 'Failed to fetch guarantee details' });
  }
});

// Get customer portal URL
router.post('/customer-portal', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Billing features are currently unavailable' });
    }

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData.stripe_customer_id) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    const session = await stripeService.stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    logger.error('Error creating customer portal session', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      logger.warn('Stripe webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    let event;

    try {
      event = stripeService.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed', err.message);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    // Handle the event
    await stripeService.handleWebhook(event);

    res.json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
