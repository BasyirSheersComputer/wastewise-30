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

    // Create payment intent
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
      },
      receipt_email: user.email,
    });

    // Create or update subscription record
    const subscription = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: currency,
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
    
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { planId, userId, userEmail } = paymentIntent.metadata;

    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        stripe_payment_intent_id: paymentIntent.id,
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

    // Create subscription in Stripe
    const subscription = await stripeService.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: getStripePriceId(planId) }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId,
        planId: planId,
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
