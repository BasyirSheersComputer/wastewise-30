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
        id: 'basic',
        name: 'Basic',
        price: 49.99,
        currency: 'MYR',
        interval: 'month',
        features: [
          'Waste tracking & analytics',
          'Basic AI recommendations',
          'Email support',
          'Up to 3 locations',
          'Standard reports'
        ],
        stripePriceId: process.env.STRIPE_PRICE_BASIC
      },
      {
        id: 'pro',
        name: 'Professional',
        price: 99.99,
        currency: 'MYR',
        interval: 'month',
        features: [
          'Everything in Basic',
          'Advanced AI recommendations',
          'Priority support',
          'Up to 10 locations',
          'Custom integrations',
          'Advanced analytics',
          'Staff training modules'
        ],
        stripePriceId: process.env.STRIPE_PRICE_PRO
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 299.99,
        currency: 'MYR',
        interval: 'month',
        features: [
          'Everything in Pro',
          'Unlimited locations',
          'Custom AI training',
          'Dedicated support',
          'API access',
          'White-label options',
          'Custom integrations',
          'Advanced compliance'
        ],
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE
      }
    ];

    res.json({ plans });
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

// Stripe webhook handler - DISABLED
// router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // DISABLED - Stripe webhook functionality disabled

//   let event;

//   try {
//     event = stripeService.stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//     logger.error('Webhook signature verification failed', err);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   try {
//     await stripeService.handleWebhook(event);
//     res.json({ received: true });
//   } catch (error) {
//     logger.error('Error handling webhook', error);
//     res.status(500).json({ error: 'Webhook handler failed' });
//   }
// });

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
