import { createClient } from '@supabase/supabase-js';
import { DateTime } from 'luxon';
import logger from '../utils/logger.js';

// Stripe is temporarily disabled - using mock implementation
// import Stripe from 'stripe';
let stripe = {
  customers: { create: () => Promise.resolve({ id: 'mock_customer_id' }) },
  subscriptions: { create: () => Promise.resolve({ id: 'mock_subscription_id' }) },
  paymentIntents: { create: () => Promise.resolve({ id: 'mock_payment_intent_id' }) },
  webhooks: { constructEvent: () => ({ type: 'mock_event' }) }
};
logger.warn('Stripe package disabled - using mock implementation');

// Create Supabase client only if environment variables are available
let supabase = null;
try {
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    logger.info('Stripe service: Supabase client created successfully');
  } else {
    logger.warn('Stripe service: Supabase environment variables not found, database features will be disabled');
  }
} catch (error) {
  logger.error('Stripe service: Failed to create Supabase client:', error.message);
}

// Malaysian payment methods configuration
const MALAYSIAN_PAYMENT_METHODS = {
  fpx: {
    name: 'FPX (Online Banking)',
    banks: [
      'affin_bank', 'alliance_bank', 'ambank', 'bank_islam', 'bank_rakyat',
      'bsn', 'cimb', 'hong_leong_bank', 'hsbc', 'kfh', 'maybank2e',
      'ocbc', 'public_bank', 'rhb', 'standard_chartered', 'uob'
    ]
  },
  card: {
    name: 'Credit/Debit Card',
    brands: ['visa', 'mastercard', 'amex']
  },
  grabpay: {
    name: 'GrabPay',
    type: 'wallet'
  },
  boost: {
    name: 'Boost',
    type: 'wallet'
  },
  touchngo: {
    name: 'Touch n Go eWallet',
    type: 'wallet'
  }
};

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.supabase = supabase;
  }

  // Create a customer in Stripe
  async createCustomer(userData) {
    try {
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        metadata: {
          user_id: userData.id,
          company_name: userData.company_name,
          company_size: userData.company_size
        }
      });

      // Update user record with Stripe customer ID
      if (this.supabase) {
        await this.supabase
          .from('users')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userData.id);
      }

      logger.info('Stripe customer created', { customer_id: customer.id, user_id: userData.id });
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer', error);
      throw error;
    }
  }

  // Create a subscription
  async createSubscription(customerId, priceId, paymentMethodId = null) {
    try {
      const subscriptionData = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          created_via: 'wastewise_saas'
        }
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      logger.info('Stripe subscription created', { 
        subscription_id: subscription.id, 
        customer_id: customerId 
      });
      return subscription;
    } catch (error) {
      logger.error('Error creating Stripe subscription', error);
      throw error;
    }
  }

  // Create a payment intent for one-time payments
  async createPaymentIntent(amount, currency = 'myr', customerId = null) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          created_via: 'wastewise_saas'
        }
      });

      logger.info('Payment intent created', { 
        payment_intent_id: paymentIntent.id, 
        amount, 
        currency 
      });
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent', error);
      throw error;
    }
  }

  // Get available payment methods for Malaysia
  async getMalaysianPaymentMethods() {
    try {
      const paymentMethods = [];

      // Get FPX banks
      const fpxBanks = await this.stripe.paymentMethods.list({
        type: 'fpx',
        limit: 100
      });

      // Get card payment methods
      const cardMethods = await this.stripe.paymentMethods.list({
        type: 'card',
        limit: 100
      });

      return {
        fpx: {
          name: 'FPX (Online Banking)',
          banks: MALAYSIAN_PAYMENT_METHODS.fpx.banks.map(bank => ({
            id: bank,
            name: this.formatBankName(bank)
          }))
        },
        card: {
          name: 'Credit/Debit Card',
          brands: MALAYSIAN_PAYMENT_METHODS.card.brands
        },
        wallets: [
          { id: 'grabpay', name: 'GrabPay' },
          { id: 'boost', name: 'Boost' },
          { id: 'touchngo', name: 'Touch n Go eWallet' }
        ]
      };
    } catch (error) {
      logger.error('Error getting Malaysian payment methods', error);
      throw error;
    }
  }

  // Format bank name for display
  formatBankName(bankId) {
    const bankNames = {
      'affin_bank': 'Affin Bank',
      'alliance_bank': 'Alliance Bank',
      'ambank': 'AmBank',
      'bank_islam': 'Bank Islam',
      'bank_rakyat': 'Bank Rakyat',
      'bsn': 'BSN',
      'cimb': 'CIMB Bank',
      'hong_leong_bank': 'Hong Leong Bank',
      'hsbc': 'HSBC Bank',
      'kfh': 'Kuwait Finance House',
      'maybank2e': 'Maybank',
      'ocbc': 'OCBC Bank',
      'public_bank': 'Public Bank',
      'rhb': 'RHB Bank',
      'standard_chartered': 'Standard Chartered',
      'uob': 'UOB Bank'
    };
    return bankNames[bankId] || bankId;
  }

  // Handle webhook events - DISABLED
  // async handleWebhook(event) {
  //   try {
  //     switch (event.type) {
  //       case 'customer.subscription.created':
  //       await this.handleSubscriptionCreated(event.data.object);
  //       break;
  //       case 'customer.subscription.updated':
  //       await this.handleSubscriptionUpdated(event.data.object);
  //       break;
  //       case 'customer.subscription.deleted':
  //       await this.handleSubscriptionDeleted(event.data.object);
  //       break;
  //       case 'invoice.payment_succeeded':
  //       await this.handlePaymentSucceeded(event.data.object);
  //       break;
  //       case 'invoice.payment_failed':
  //       await this.handlePaymentFailed(event.data.object);
  //       break;
  //       default:
  //       logger.info('Unhandled webhook event', { type: event.type });
  //     }
  //   } catch (error) {
  //     logger.error('Error handling webhook', error);
  //     throw error;
  //   }
  // }

  // Handle subscription created - DISABLED
  // async handleSubscriptionCreated(subscription) {
  //   try {
  //     const customerId = subscription.customer;
  //     
  //     // Get user by Stripe customer ID
  //     const { data: user, error } = await this.supabase
  //       .from('users')
  //       .select('*')
  //       .eq('stripe_customer_id', customerId)
  //       .single();

  //     if (error || !user) {
  //       logger.error('User not found for subscription', { customer_id: customerId });
  //       return;
  //     }

  //     // Update user subscription status
  //     await this.supabase
  //       .from('users')
  //       .update({
  //       subscription_status: 'active',
  //       subscription_plan: this.getPlanFromPriceId(subscription.items.data[0].price.id),
  //       stripe_subscription_id: subscription.id,
  //       updated_at: new Date().toISOString()
  //     })
  //     .eq('id', user.id);

  //     logger.info('Subscription created and user updated', { 
  //       user_id: user.id, 
  //       subscription_id: subscription.id 
  //     });
  //   } catch (error) {
  //     logger.error('Error handling subscription created', error);
  //   }
  // }

  // Handle subscription updated - DISABLED
  // async handleSubscriptionUpdated(subscription) {
  //   try {
  //     const { data: user, error } = await this.supabase
  //     .from('users')
  //     .select('*')
  //     .eq('stripe_subscription_id', subscription.id)
  //     .single();

  //     if (error || !user) {
  //     logger.error('User not found for subscription update', { subscription_id: subscription.id });
  //     return;
  //     }

  //     const status = subscription.status;
  //     const plan = this.getPlanFromPriceId(subscription.items.data[0].price.id);

  //     await this.supabase
  //     .from('users')
  //     .update({
  //     subscription_status: status,
  //     subscription_plan: plan,
  //     updated_at: new Date().toISOString()
  //     })
  //     .eq('id', user.id);

  //     logger.info('Subscription updated', { 
  //     user_id: user.id, 
  //     status, 
  //     plan 
  //     });
  //   } catch (error) {
  //     logger.error('Error handling subscription updated', error);
  //   }
  // }

  // Handle subscription deleted - DISABLED
  // async handleSubscriptionDeleted(subscription) {
  //   try {
  //     const { data: user, error } = await this.supabase
  //     .from('users')
  //     .select('*')
  //     .eq('stripe_subscription_id', subscription.id)
  //     .single();

  //     if (error || !user) {
  //     logger.error('User not found for subscription deletion', { subscription_id: subscription.id });
  //     return;
  //     }

  //     await this.supabase
  //     .from('users')
  //     .update({
  //     subscription_status: 'cancelled',
  //     subscription_plan: 'free',
  //     updated_at: new Date().toISOString()
  //     })
  //     .eq('id', user.id);

  //     logger.info('Subscription cancelled', { user_id: user.id });
  //   } catch (error) {
  //     logger.error('Error handling subscription deleted', error);
  //   }
  // }

  // Handle payment succeeded - DISABLED
  // async handlePaymentSucceeded(invoice) {
  //   try {
  //     logger.info('Payment succeeded', { 
  //     invoice_id: invoice.id, 
  //     customer_id: invoice.customer 
  //     });
  //   } catch (error) {
  //     logger.error('Error handling payment succeeded', error);
  //   }
  // }

  // Handle payment failed - DISABLED
  // async handlePaymentFailed(invoice) {
  //   try {
  //     const { data: user, error } = await this.supabase
  //     .from('users')
  //     .select('*')
  //     .eq('stripe_customer_id', invoice.customer)
  //     .single();

  //     if (error || !user) {
  //     logger.error('User not found for payment failure', { customer_id: invoice.customer });
  //     return;
  //     if (error || !user) {
  //     logger.error('User not found for payment failure', { customer_id: invoice.customer });
  //     return;
  //     }

  //     // Update user status to past_due
  //     await this.supabase
  //     .from('users')
  //     .update({
  //     subscription_status: 'past_due',
  //     updated_at: new Date().toISOString()
  //     })
  //     .eq('id', user.id);

  //     logger.info('Payment failed, user status updated', { user_id: user.id });
  //   } catch (error) {
  //     logger.error('Error handling payment failed', error);
  //   }
  // }

  // Get plan from Stripe price ID
  getPlanFromPriceId(priceId) {
    const planMap = {
      'price_basic': 'basic',
      'price_pro': 'pro',
      'price_enterprise': 'enterprise'
    };
    return planMap[priceId] || 'free';
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      });

      logger.info('Subscription cancelled', { 
        subscription_id: subscriptionId, 
        cancel_at_period_end: cancelAtPeriodEnd 
      });
      return subscription;
    } catch (error) {
      logger.error('Error cancelling subscription', error);
      throw error;
    }
  }

  // Reactivate subscription
  async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      logger.info('Subscription reactivated', { subscription_id: subscriptionId });
      return subscription;
    } catch (error) {
      logger.error('Error reactivating subscription', error);
      throw error;
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'latest_invoice', 'default_payment_method']
      });
      return subscription;
    } catch (error) {
      logger.error('Error retrieving subscription', error);
      throw error;
    }
  }

  // Create a refund
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = amount;
      }

      const refund = await this.stripe.refunds.create(refundData);

      logger.info('Refund created', { 
        refund_id: refund.id, 
        payment_intent_id: paymentIntentId 
      });
      return refund;
    } catch (error) {
      logger.error('Error creating refund', error);
      throw error;
    }
  }
}

export default new StripeService(); 