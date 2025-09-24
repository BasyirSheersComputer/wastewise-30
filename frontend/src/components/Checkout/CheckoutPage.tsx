import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js';
import { 
  CheckCircle, 
  XCircle, 
  Lock, 
  Shield, 
  CreditCard, 
  ArrowLeft,
  Star,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';

// Initialize Stripe using env var; avoid throwing if not set in dev
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise: Promise<Stripe | null> | null = publishableKey ? loadStripe(publishableKey) : null;

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  interval: string;
  pricingUnit?: string;
  features: string[];
  popular?: boolean;
}

const plans: Record<string, PlanDetails> = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 49,
    interval: 'month',
    features: [
      'Waste tracking & analytics',
      'Basic AI recommendations',
      'Email support',
      'Up to 5 locations',
      'Standard reporting'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Professional Plan',
    price: 5000,
    interval: 'month',
    pricingUnit: 'per 10 outlets',
    features: [
      'Everything in Basic',
      'Advanced AI insights',
      'Priority support',
      'Unlimited locations',
      'Custom integrations',
      'Advanced analytics',
      'Multi-user access'
    ],
    popular: true
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 10000,
    interval: 'month',
    pricingUnit: 'per 10 outlets',
    features: [
      'Everything in Pro',
      'Dedicated success manager',
      'Custom AI training',
      'White-label options',
      'API access',
      'Advanced compliance',
      '24/7 phone support'
    ]
  }
};

// Checkout Form Component
function CheckoutForm({ planId, clientSecret }: { planId: string; clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const plan = plans[planId];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'An error occurred');
        setIsLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?plan=${planId}`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name: name,
              email: email,
            },
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your subscription has been activated.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
        <AddressElement
          options={{
            mode: 'billing',
            allowedCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'SG', 'MY'],
          }}
        />
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <PaymentElement />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay RM {plan.price.toLocaleString()}/{plan.interval}
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center mb-2">
          <Shield className="w-4 h-4 mr-1" />
          <span>Your payment is secure and encrypted</span>
        </div>
        <p>Powered by Stripe • SSL Secured</p>
      </div>
    </form>
  );
}

// Main Checkout Page Component
export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const planId = searchParams.get('plan') || 'pro';
  const plan = plans[planId];

  // Get billing cycle from URL params
  useEffect(() => {
    const billing = searchParams.get('billing');
    if (billing === 'yearly' || billing === 'monthly') {
      setBillingCycle(billing);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!publishableKey) {
      setConfigError('Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env');
      setLoading(false);
      return;
    }
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/billing/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: planId,
            amount: plan.price * 100, // Convert to cents
            currency: 'usd',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to initialize checkout. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [planId, plan.price]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your checkout...</p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-6">{configError}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load checkout'}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/pricing')}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Pricing
              </button>
              <div className="text-2xl font-bold text-blue-600">Sheerssoft</div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Purchase</h1>
              
              {stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm planId={planId} clientSecret={clientSecret} />
                </Elements>
              )}
              {!stripePromise && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">Stripe key not configured.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Billing Cycle Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Billing Cycle</label>
                <div className="bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`w-1/2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`w-1/2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly
                    <span className="ml-1 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full">
                      Save 15%
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Plan Details */}
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  {plan.popular && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  RM {billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.85).toLocaleString() : plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">
                    /{billingCycle === 'yearly' ? 'year' : plan.interval}
                  </span>
                  {billingCycle === 'yearly' && (
                    <div className="text-sm text-green-600 font-medium">
                      Save RM {Math.round(plan.price * 12 * 0.15).toLocaleString()} annually
                    </div>
                  )}
                </div>
                {plan.pricingUnit && (
                  <div className="text-sm text-gray-600 text-center mb-2">
                    {plan.pricingUnit}
                  </div>
                )}
                <ul className="space-y-2 text-sm text-gray-600">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-blue-600 text-xs">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    RM {billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.85).toLocaleString() : plan.price.toLocaleString()}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Yearly Discount (15%)</span>
                    <span className="font-medium text-green-600">
                      -RM {Math.round(plan.price * 12 * 0.15).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    RM {billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.85).toLocaleString() : plan.price.toLocaleString()}
                  </span>
                </div>
              </div>

                             {/* Trust Indicators */}
               <div className="space-y-4">
                 <div className="flex items-center text-sm text-gray-600">
                   <Clock className="w-4 h-4 mr-2" />
                   <span>30-day free trial included</span>
                 </div>
                 <div className="flex items-center text-sm text-gray-600">
                   <Shield className="w-4 h-4 mr-2" />
                   <span>Cancel anytime</span>
                 </div>
                 <div className="flex items-center text-sm text-gray-600">
                   <Users className="w-4 h-4 mr-2" />
                   <span>Join 500+ coffee chains</span>
                 </div>
               </div>

              {/* Customer Reviews */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">4.9/5</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  "Servora AI helped us reduce food waste by 35% in just 3 months!"
                </p>
                <p className="text-xs text-gray-500">- Sarah Chen, Operations Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
