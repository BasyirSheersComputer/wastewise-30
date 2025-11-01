import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Shield,
  Lock,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Building,
  Check
} from 'lucide-react';

export default function CheckoutFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'growth';
  
  const [step, setStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Plan Details
  const plans = {
    'quick-win': {
      name: 'Quick Win Solution',
      price: 2997,
      setup: 0,
      savings: 'RM 15,000-25,000',
      features: [
        'One solution of your choice',
        'Complete setup and integration',
        'Staff training (up to 10 employees)',
        'Monthly optimization review',
        'Email and phone support'
      ],
      guarantee: '30-Day Money-Back Guarantee'
    },
    'growth': {
      name: 'Growth System',
      price: 5997,
      setup: 4997,
      savings: 'RM 35,000-50,000',
      features: [
        'Full Servora AI platform access',
        'AI demand forecasting',
        'Automated waste logging',
        'Dedicated success manager',
        'Priority support (4-hour response)'
      ],
      guarantee: '60-Day RM 30,000 Savings Guarantee'
    }
  };

  const selectedPlan = plans[planId as keyof typeof plans] || plans.growth;

  // Malaysian Payment Methods
  const paymentMethods = [
    {
      id: 'fpx',
      name: 'FPX Online Banking',
      description: 'Secure direct bank transfer',
      icon: '🏦',
      recommended: true,
      fee: 'No fees',
      banks: [
        { id: 'maybank', name: 'Maybank', logo: '🏦' },
        { id: 'cimb', name: 'CIMB Bank', logo: '🏦' },
        { id: 'publicbank', name: 'Public Bank', logo: '🏦' },
        { id: 'rhb', name: 'RHB Bank', logo: '🏦' },
        { id: 'hongleong', name: 'Hong Leong Bank', logo: '🏦' },
        { id: 'ambank', name: 'AmBank', logo: '🏦' }
      ]
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex',
      icon: '💳',
      recommended: false,
      fee: 'Processing fee may apply'
    },
    {
      id: 'grabpay',
      name: 'GrabPay',
      description: 'Pay with GrabPay eWallet',
      icon: '🟢',
      recommended: false,
      fee: 'No fees'
    },
    {
      id: 'tng',
      name: 'Touch \'n Go eWallet',
      description: 'Pay with TNG eWallet',
      icon: '🔵',
      recommended: false,
      fee: 'No fees'
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to success page
    navigate('/dashboard/billing/success');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Pricing</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-neutral-900">Servora AI</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Shield className="w-4 h-4 text-success-500" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Plan Selection' },
              { num: 2, label: 'Payment Method' },
              { num: 3, label: 'Confirmation' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= s.num 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-sm font-medium ${
                    step >= s.num ? 'text-neutral-900' : 'text-neutral-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > s.num ? 'bg-primary-500' : 'bg-neutral-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Plan Confirmation */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Confirm Your Plan</h2>
                
                <div className="p-6 rounded-lg border-2 border-primary-500 bg-primary-50 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-2">{selectedPlan.name}</h3>
                      <p className="text-neutral-600">Everything you need to reduce waste and save money</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-neutral-900">RM {selectedPlan.price.toLocaleString()}</div>
                      <div className="text-sm text-neutral-600">/month</div>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {selectedPlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-primary-200">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-primary-600" />
                      <span className="font-medium text-primary-700">{selectedPlan.guarantee}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="btn-cta w-full"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Select Payment Method</h2>
                  <button 
                    onClick={() => setStep(1)}
                    className="text-neutral-600 hover:text-neutral-900 text-sm"
                  >
                    Back
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  {paymentMethods.map((method) => (
                    <div key={method.id}>
                      <button
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          selectedPaymentMethod === method.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{method.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-neutral-900">{method.name}</h3>
                              {method.recommended && (
                                <span className="px-2 py-0.5 bg-success-500 text-white rounded text-xs font-medium">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600">{method.description}</p>
                            <p className="text-xs text-success-600 mt-1">{method.fee}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === method.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-neutral-300'
                          }`}>
                            {selectedPaymentMethod === method.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* FPX Bank Selection */}
                      {selectedPaymentMethod === 'fpx' && method.id === 'fpx' && method.banks && (
                        <div className="mt-3 ml-16 grid grid-cols-2 gap-2">
                          {method.banks.map((bank) => (
                            <button
                              key={bank.id}
                              onClick={() => setSelectedBank(bank.id)}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                selectedBank === bank.id
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{bank.logo}</span>
                                <span className="text-sm font-medium text-neutral-900">{bank.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setStep(3)}
                  disabled={!selectedPaymentMethod || (selectedPaymentMethod === 'fpx' && !selectedBank)}
                  className="btn-cta w-full"
                >
                  Continue to Review
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Review & Confirm</h2>
                  <button 
                    onClick={() => setStep(2)}
                    className="text-neutral-600 hover:text-neutral-900 text-sm"
                  >
                    Back
                  </button>
                </div>

                {/* Order Summary */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 rounded-lg bg-neutral-50">
                    <h3 className="font-medium text-neutral-900 mb-2">Plan</h3>
                    <p className="text-sm text-neutral-700">{selectedPlan.name}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-50">
                    <h3 className="font-medium text-neutral-900 mb-2">Payment Method</h3>
                    <p className="text-sm text-neutral-700">
                      {paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name}
                      {selectedBank && ` - ${selectedBank.toUpperCase()}`}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-neutral-50">
                    <h3 className="font-medium text-neutral-900 mb-3">Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Monthly Subscription</span>
                        <span className="font-medium text-neutral-900">RM {selectedPlan.price.toLocaleString()}</span>
                      </div>
                      {selectedPlan.setup > 0 && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">One-time Setup Fee</span>
                          <span className="font-medium text-neutral-900">RM {selectedPlan.setup.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-neutral-200">
                        <span className="font-medium text-neutral-900">Total Today</span>
                        <span className="text-xl font-bold text-neutral-900">
                          RM {(selectedPlan.price + selectedPlan.setup).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guarantee Badge */}
                <div className="p-4 rounded-lg bg-success-50 border border-success-200 mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-success-600" />
                    <div>
                      <p className="font-medium text-success-900">{selectedPlan.guarantee}</p>
                      <p className="text-xs text-success-700 mt-1">Risk-free. Cancel anytime after minimum period.</p>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4 text-primary-600 rounded" defaultChecked />
                    <span className="text-sm text-neutral-700">
                      I agree to the <button className="text-primary-600 hover:text-primary-700 font-medium">Terms of Service</button> and <button className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</button>
                    </span>
                  </label>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="btn-cta w-full"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing Payment...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 inline mr-2" />
                      Complete Secure Payment - RM {(selectedPlan.price + selectedPlan.setup).toLocaleString()}
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-bold text-neutral-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Plan</p>
                  <p className="font-medium text-neutral-900">{selectedPlan.name}</p>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Monthly Subscription</span>
                      <span className="font-medium text-neutral-900">RM {selectedPlan.price.toLocaleString()}</span>
                    </div>
                    {selectedPlan.setup > 0 && (
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Setup Fee (One-time)</span>
                        <span className="font-medium text-neutral-900">RM {selectedPlan.setup.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-neutral-900">Total Today</span>
                      <span className="text-2xl font-bold text-neutral-900">
                        RM {(selectedPlan.price + selectedPlan.setup).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-xs text-neutral-600 mb-2">Expected Monthly Savings</p>
                  <p className="text-xl font-bold text-success-600">{selectedPlan.savings}</p>
                  <p className="text-xs text-neutral-500 mt-1">Based on industry data</p>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3 pt-6 border-t border-neutral-200">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  <span>{selectedPlan.guarantee}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  <span>Cancel anytime after 90 days</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  <span>99.9% uptime guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Lock className="w-4 h-4 text-success-500" />
                  <span>Secure encrypted payment</span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="mt-6 bg-neutral-100 rounded-xl p-6">
              <h3 className="font-bold text-neutral-900 mb-2">Need Help?</h3>
              <p className="text-sm text-neutral-600 mb-4">Our team is here to assist you</p>
              <a 
                href="mailto:a.basyir@sheerssoft.com"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Contact Sales →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

