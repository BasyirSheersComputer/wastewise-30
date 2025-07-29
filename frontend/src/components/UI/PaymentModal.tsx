import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckCircle, AlertCircle, CreditCard, Building, Wallet, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
  };
  onSuccess: (subscription: any) => void;
}

interface PaymentFormProps {
  plan: any;
  onSuccess: (subscription: any) => void;
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedBank, setSelectedBank] = useState('');
  const [error, setError] = useState('');

  const malaysianBanks = [
    { id: 'maybank2e', name: 'Maybank' },
    { id: 'cimb', name: 'CIMB Bank' },
    { id: 'public_bank', name: 'Public Bank' },
    { id: 'rhb', name: 'RHB Bank' },
    { id: 'hong_leong_bank', name: 'Hong Leong Bank' },
    { id: 'ambank', name: 'AmBank' },
    { id: 'ocbc', name: 'OCBC Bank' },
    { id: 'uob', name: 'UOB Bank' },
    { id: 'hsbc', name: 'HSBC Bank' },
    { id: 'standard_chartered', name: 'Standard Chartered' }
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let paymentMethodId = null;

      if (paymentMethod === 'card') {
        const { error: cardError, paymentMethod: cardPaymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement)!,
        });

        if (cardError) {
          setError(cardError.message || 'Payment method creation failed');
          setLoading(false);
          return;
        }

        paymentMethodId = cardPaymentMethod.id;
      } else if (paymentMethod === 'fpx') {
        if (!selectedBank) {
          setError('Please select a bank');
          setLoading(false);
          return;
        }

        const { error: fpxError, paymentMethod: fpxPaymentMethod } = await stripe.createPaymentMethod({
          type: 'fpx',
          fpx: {
            bank: selectedBank as any,
          },
        });

        if (fpxError) {
          setError(fpxError.message || 'FPX payment method creation failed');
          setLoading(false);
          return;
        }

        paymentMethodId = fpxPaymentMethod.id;
      }

      // Create subscription
      const response = await fetch('/api/billing/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan.id,
          paymentMethodId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Subscription creation failed');
      }

      toast.success('Subscription created successfully!');
      onSuccess(result.subscription);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Payment failed');
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-3 border rounded-lg flex items-center justify-center ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Credit/Debit Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('fpx')}
            className={`p-3 border rounded-lg flex items-center justify-center ${
              paymentMethod === 'fpx'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Building className="w-5 h-5 mr-2" />
            FPX (Online Banking)
          </button>
        </div>
      </div>

      {/* Card Payment */}
      {paymentMethod === 'card' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* FPX Payment */}
      {paymentMethod === 'fpx' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Bank
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose your bank</option>
            {malaysianBanks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Plan Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{plan.name} Plan</span>
          <span className="font-semibold text-gray-900">
            {plan.currency} {plan.price}/month
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <p>• 30-day free trial included</p>
          <p>• Cancel anytime</p>
          <p>• No setup fees</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || (paymentMethod === 'fpx' && !selectedBank)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          <>
            Start {plan.name} Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
          Secure payment powered by Stripe
        </div>
      </div>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <PaymentForm plan={plan} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 