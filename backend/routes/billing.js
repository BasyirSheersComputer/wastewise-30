import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import dotenv from 'dotenv';
import stripeService from '../services/stripeService.js';
import logger from '../utils/logger.js';

dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Get subscription status
router.get('/subscription', async (req, res) => {
  try {
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
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { plan, paymentMethodId } = req.body;

    if (!plan || !['basic', 'pro', 'enterprise'].includes(plan)) {
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
      basic: process.env.STRIPE_PRICE_BASIC,
      pro: process.env.STRIPE_PRICE_PRO,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan configuration' });
    }

    // Create subscription
    const subscription = await stripeService.createSubscription(customerId, priceId, paymentMethodId);

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
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel subscription in Stripe
    await stripeService.cancelSubscription(userData.stripe_subscription_id);

    // Update local database
    await supabase
      .from('users')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling subscription', error);
    res.status(500).json({ error: error.message });
  }
});

// Reactivate subscription
router.post('/subscription/reactivate', async (req, res) => {
  try {
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

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'professional',
        name: 'Professional',
        price: 1999,
        originalPrice: 2499,
        currency: 'MYR',
        interval: 'month',
        popular: true,
        savings: 20,
        targetMarket: 'Top 10% revenue makers (RM 2M-10M annually)',
        annualRevenue: 'RM 2M-10M',
        valueProposition: 'Reduce waste by 25-30% and save RM 100K-300K/month',
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
        price: 4999,
        originalPrice: 6499,
        currency: 'MYR',
        interval: 'month',
        popular: false,
        savings: 23,
        targetMarket: 'Top 1% revenue makers (RM 50M+ annually)',
        annualRevenue: 'RM 50M+',
        valueProposition: 'Reduce waste by 30-40% and save RM 500K-1M/month',
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
        price: 9999,
        originalPrice: 12999,
        currency: 'MYR',
        interval: 'month',
        popular: false,
        savings: 23,
        targetMarket: 'Ultra-premium segment (RM 100M+ annually)',
        annualRevenue: 'RM 100M+',
        valueProposition: 'Reduce waste by 35-45% and save RM 1M-2M/month',
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

    // Add annual pricing options
    const annualPlans = plans.map(plan => ({
      ...plan,
      id: `${plan.id}_annual`,
      name: `${plan.name} (Annual)`,
      price: Math.round(plan.price * 0.9), // 10% discount for annual
      originalPrice: plan.price * 12,
      interval: 'year',
      savings: 10,
      billingType: 'annual',
      stripePriceId: process.env[`STRIPE_PRICE_${plan.id.toUpperCase()}_ANNUAL`]
    }));

    const allPlans = [...plans, ...annualPlans];

    res.json({ 
      plans: allPlans,
      pricingInfo: {
        currency: 'MYR',
        billingCycles: ['monthly', 'annual'],
        discounts: {
          annual: '10% discount for annual billing',
          multiYear: '15-25% discount for multi-year contracts',
          volume: '20-40% discount for multiple locations',
          enterprise: 'Custom pricing for large deployments'
        },
        specialOffers: [
          '30-day free trial with full access',
          'No setup fees for annual contracts',
          'Custom enterprise agreements available',
          'Strategic partnership opportunities'
        ],
        marketFocus: {
          target: 'Top 10% revenue makers in Malaysian F&B',
          enterprise: 'Top 1% revenue makers',
          elite: 'Ultra-premium segment (RM 100M+ annually)',
          positioning: 'Premium AI-powered waste reduction platform'
        }
      }
    });
  } catch (error) {
    logger.error('Error getting plans', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Malaysian payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const paymentMethods = await stripeService.getMalaysianPaymentMethods();
    res.json(paymentMethods);
  } catch (error) {
    logger.error('Error getting payment methods', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create payment intent for one-time payments
router.post('/payment-intent', async (req, res) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { amount, currency = 'myr' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const customerId = userData?.stripe_customer_id || null;
    const paymentIntent = await stripeService.createPaymentIntent(amount, currency, customerId);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    logger.error('Error creating payment intent', error);
    res.status(500).json({ error: error.message });
  }
});

// Create payment intent for checkout
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { planId, amount, currency = 'usd' } = req.body;

    if (!planId || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user from session/token
    const user = req.user; // This should be set by auth middleware
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

         // Create payment intent for trial setup
     const paymentIntent = await stripeService.stripe.paymentIntents.create({
       amount: amount,
       currency: currency,
       automatic_payment_methods: {
         enabled: true,
       },
       metadata: {
         planId: planId,
         userId: user.id,
         userEmail: user.email,
         trialPeriod: '30',
       },
       receipt_email: user.email,
       description: `Setup payment for ${planId} plan - 30-day free trial`,
     });

         // Create or update subscription record
     const subscription = await supabase
       .from('subscriptions')
       .upsert({
         user_id: user.id,
         plan_id: planId,
         status: 'trialing',
         stripe_payment_intent_id: paymentIntent.id,
         amount: amount,
         currency: currency,
         trial_start: new Date().toISOString(),
         trial_end: new Date(Date.now() + (process.env.TRIAL_PERIOD_DAYS || 30) * 24 * 60 * 60 * 1000).toISOString(),
         created_at: new Date().toISOString(),
       })
       .select()
       .single();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      subscription: subscription,
    });
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Get subscription by payment intent ID
router.get('/subscription/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({ subscription });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripeService.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

     // Handle the event
   switch (event.type) {
     case 'payment_intent.succeeded':
       const paymentIntent = event.data.object;
       await handlePaymentSuccess(paymentIntent);
       break;
     
     case 'payment_intent.payment_failed':
       const failedPayment = event.data.object;
       await handlePaymentFailure(failedPayment);
       break;
     
     case 'customer.subscription.created':
       const subscription = event.data.object;
       await handleSubscriptionCreated(subscription);
       break;
     
     case 'customer.subscription.updated':
       const updatedSubscription = event.data.object;
       await handleSubscriptionUpdated(updatedSubscription);
       break;
     
     case 'customer.subscription.deleted':
       const deletedSubscription = event.data.object;
       await handleSubscriptionDeleted(deletedSubscription);
       break;
     
     case 'customer.subscription.trial_will_end':
       const trialEndingSubscription = event.data.object;
       await handleTrialEnding(trialEndingSubscription);
       break;
     
     default:
       logger.info(`Unhandled event type: ${event.type}`);
   }

  res.json({ received: true });
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { planId, userId, userEmail } = paymentIntent.metadata;

         // Update subscription status for trial
     const { error } = await supabase
       .from('subscriptions')
       .update({
         status: 'trialing',
         stripe_payment_intent_id: paymentIntent.id,
         trial_start: new Date().toISOString(),
         trial_end: new Date(Date.now() + (process.env.TRIAL_PERIOD_DAYS || 30) * 24 * 60 * 60 * 1000).toISOString(),
         updated_at: new Date().toISOString(),
       })
       .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      logger.error('Error updating subscription:', error);
    }

    // Create or update user subscription in Stripe
    let customer = await stripeService.stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customer.data.length === 0) {
      customer = await stripeService.stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });
    } else {
      customer = customer.data[0];
    }

         // Create subscription in Stripe with trial period
     const trialPeriodDays = process.env.TRIAL_PERIOD_DAYS || 30;
     const subscription = await stripeService.stripe.subscriptions.create({
       customer: customer.id,
       items: [{ price: getStripePriceId(planId) }],
       trial_period_days: parseInt(trialPeriodDays),
       payment_behavior: 'default_incomplete',
       payment_settings: { save_default_payment_method: 'on_subscription' },
       expand: ['latest_invoice.payment_intent'],
       metadata: {
         userId: userId,
         planId: planId,
         trialPeriodDays: trialPeriodDays,
       },
     });

    // Update subscription with Stripe subscription ID
    await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    logger.info(`Payment successful for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error handling payment success:', error);
  }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
  try {
    const { userId, planId } = paymentIntent.metadata;

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    logger.info(`Payment failed for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  try {
    const { userId, planId } = subscription.metadata;

    // Update subscription with Stripe subscription details
    await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('plan_id', planId);

    logger.info(`Subscription created for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error handling subscription created:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdated(subscription) {
  try {
    const { userId, planId } = subscription.metadata;

    // Update subscription details
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    logger.info(`Subscription updated for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeleted(subscription) {
  try {
    const { userId, planId } = subscription.metadata;

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    logger.info(`Subscription canceled for user ${userId}, plan ${planId}`);
  } catch (error) {
    logger.error('Error handling subscription deleted:', error);
  }
}

 // Handle trial ending
 async function handleTrialEnding(subscription) {
   try {
     const { userId, planId } = subscription.metadata;

     // Update subscription status
     await supabase
       .from('subscriptions')
       .update({
         status: 'active',
         trial_end: new Date(subscription.trial_end * 1000).toISOString(),
         current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
         current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
         updated_at: new Date().toISOString(),
       })
       .eq('stripe_subscription_id', subscription.id);

     // Send trial ending notification email
     // TODO: Implement email notification
     logger.info(`Trial ending for user ${userId}, plan ${planId}`);
   } catch (error) {
     logger.error('Error handling trial ending:', error);
   }
 }

 // Helper function to get Stripe price ID
 function getStripePriceId(planId) {
   const priceIds = {
     basic: process.env.STRIPE_PRICE_BASIC,
     pro: process.env.STRIPE_PRICE_PRO,
     enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
   };
   return priceIds[planId];
 }

// Get customer portal URL
router.post('/customer-portal', async (req, res) => {
  try {
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

export default router;
