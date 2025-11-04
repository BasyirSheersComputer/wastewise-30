import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  ArrowRight,
  Calendar,
  Receipt,
  AlertCircle
} from 'lucide-react';

export default function BillingDashboard() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Current Subscription (System Prompt Aligned)
  const currentPlan = {
    name: 'Growth System',
    price: 5997,
    setupFee: 4997,
    interval: 'month',
    nextBilling: 'Dec 1, 2025',
    status: 'active',
    trialEndsOn: null,
    wasteReduction: '35-45%',
    monthlySavings: 'RM 35,000-50,000',
    timeSaved: '20-30 hours/week',
    profitMarginIncrease: '10-15%',
    roi: '600-1000%',
    guarantee: '60-Day Savings Guarantee',
    guaranteeDetail: 'Save minimum RM 30,000 monthly or pay nothing',
    features: [
      'Full WasteWise platform access',
      'AI demand forecasting',
      'Automated waste logging',
      'Real-time inventory tracking',
      'Supplier integration & auto-ordering',
      'Compliance automation with alerts',
      'Unlimited staff training',
      'Dedicated success manager',
      'Priority support (4-hour response)',
      'Weekly optimization calls'
    ]
  };

  // Billing Metrics
  const metrics = [
    {
      id: 1,
      name: 'Current Plan',
      value: 'Growth System',
      subvalue: 'RM 5,997/month',
      icon: CreditCard,
      color: 'primary'
    },
    {
      id: 2,
      name: 'Next Billing',
      value: 'Dec 1',
      subvalue: 'RM 5,997',
      icon: Calendar,
      color: 'primary'
    },
    {
      id: 3,
      name: 'Money Saved',
      value: 'RM 42,350',
      subvalue: 'Last 90 days',
      icon: TrendingUp,
      color: 'success'
    },
    {
      id: 4,
      name: 'ROI',
      value: '7.1x',
      subvalue: 'Return on investment',
      icon: DollarSign,
      color: 'success'
    }
  ];

  // Available Plans (System Prompt Aligned)
  const plans = [
    {
      id: 'quick-win',
      name: 'Quick Win Solution',
      price: 2997,
      setupFee: 0,
      interval: 'month',
      wasteReduction: '20-30%',
      timeSaved: '10-15 hours/week',
      savings: 'RM 15,000-25,000',
      roi: '500-800%',
      guarantee: '30-Day Money-Back Guarantee',
      guaranteeDetail: 'See measurable improvement or full refund',
      features: [
        'One solution of your choice',
        'AI Forecasting OR Waste Logging OR Compliance',
        'Setup and integration included',
        'Staff training (up to 10 employees)',
        'Daily waste tracking',
        'Monthly optimization review',
        'Email and phone support'
      ],
      limits: 'Up to 5 outlets, 10 users',
      current: false
    },
    {
      id: 'growth',
      name: 'Growth System',
      price: 5997,
      setupFee: 4997,
      interval: 'month',
      wasteReduction: '35-45%',
      timeSaved: '20-30 hours/week',
      savings: 'RM 35,000-50,000',
      roi: '600-1000%',
      profitMarginIncrease: '10-15%',
      guarantee: '60-Day Savings Guarantee',
      guaranteeDetail: 'Save minimum RM 30,000 monthly or pay nothing',
      features: [
        'Full WasteWise platform',
        'AI demand forecasting',
        'Automated waste logging',
        'Real-time inventory tracking',
        'Supplier integration & auto-ordering',
        'Compliance automation',
        'Unlimited staff training',
        'Dedicated success manager',
        'Priority support (4-hour response)'
      ],
      limits: 'Up to 20 outlets, unlimited users',
      current: true,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Transformation',
      price: null,
      setupFee: null,
      interval: 'custom',
      wasteReduction: '40-50%',
      operationalEfficiency: '50-70% improvement',
      savings: 'RM 100,000-300,000+',
      roi: '10-20x at scale',
      profitMarginIncrease: '12-18%',
      guarantee: '90-Day Transformation Guarantee',
      guaranteeDetail: 'Complete transformation or extended support at no cost',
      features: [
        'Everything in Growth System',
        'Custom integrations (POS/ERP)',
        'Advanced analytics & predictive modeling',
        'Multi-location centralized dashboard',
        'Custom reporting & KPI tracking',
        'Quarterly strategic planning',
        'On-site training & implementation',
        'Dedicated technical account manager',
        '24/7 priority support',
        'Annual system optimization reviews'
      ],
      limits: 'Unlimited outlets and users',
      current: false
    }
  ];

  // Malaysian Payment Methods
  const paymentMethods = [
    {
      id: 'fpx',
      name: 'FPX (Online Banking)',
      description: 'Direct bank transfer via FPX',
      icon: '🏦',
      popular: true,
      banks: ['Maybank', 'CIMB', 'Public Bank', 'RHB', 'Hong Leong', 'AmBank']
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Amex',
      icon: '💳',
      popular: true,
      providers: ['Stripe', 'Visa', 'Mastercard']
    },
    {
      id: 'grabpay',
      name: 'GrabPay',
      description: 'Pay with GrabPay eWallet',
      icon: '🟢',
      popular: true
    },
    {
      id: 'tng',
      name: 'Touch \'n Go eWallet',
      description: 'Pay with TNG eWallet',
      icon: '🔵',
      popular: true
    },
    {
      id: 'boost',
      name: 'Boost',
      description: 'Pay with Boost app',
      icon: '🟣',
      popular: false
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      description: 'Pay with ShopeePay',
      icon: '🟠',
      popular: false
    }
  ];

  // Payment History
  const paymentHistory = [
    {
      id: 1,
      date: 'Nov 1, 2025',
      amount: 5997,
      status: 'paid',
      method: 'FPX - Maybank',
      invoice: 'INV-2025-11-001',
      description: 'Growth System - Monthly'
    },
    {
      id: 2,
      date: 'Oct 1, 2025',
      amount: 5997,
      status: 'paid',
      method: 'FPX - Maybank',
      invoice: 'INV-2025-10-001',
      description: 'Growth System - Monthly'
    },
    {
      id: 3,
      date: 'Sep 1, 2025',
      amount: 5997,
      status: 'paid',
      method: 'Credit Card',
      invoice: 'INV-2025-09-001',
      description: 'Growth System - Monthly'
    },
    {
      id: 4,
      date: 'Aug 1, 2025',
      amount: 4997,
      status: 'paid',
      method: 'FPX - CIMB',
      invoice: 'INV-2025-08-002',
      description: 'Setup Fee'
    }
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Billing & Subscription</h1>
          <p className="text-neutral-600 mt-1">Manage your plan, payments, and invoices</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <div key={metric.id} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  metric.color === 'success' ? 'bg-success-50' : 'bg-primary-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    metric.color === 'success' ? 'text-success-500' : 'text-primary-500'
                  }`} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                <p className="text-xs text-neutral-500 mt-1">{metric.subvalue}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Plan & Upgrade Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Current Plan</h2>
            <span className="px-3 py-1 bg-success-50 text-success-700 rounded-full text-sm font-medium">
              Active
            </span>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-primary-50 to-white border-2 border-primary-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">{currentPlan.name}</h3>
                <p className="text-neutral-600">Full platform access with guaranteed outcomes</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-neutral-900">RM {currentPlan.price.toLocaleString()}</div>
                <div className="text-sm text-neutral-600">/month</div>
              </div>
            </div>

            {/* Outcomes Box */}
            <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-sm font-bold text-neutral-900 mb-3">Your Guaranteed Outcomes:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-neutral-600">Waste Reduction</p>
                  <p className="text-lg font-bold text-success-600">{currentPlan.wasteReduction}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Monthly Savings</p>
                  <p className="text-lg font-bold text-success-600">{currentPlan.monthlySavings}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Time Saved</p>
                  <p className="text-lg font-bold text-primary-600">{currentPlan.timeSaved}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Profit Increase</p>
                  <p className="text-lg font-bold text-primary-600">{currentPlan.profitMarginIncrease}</p>
                </div>
              </div>
            </div>

            {/* Guarantee Badge */}
            <div className="mb-4 p-3 bg-white border border-primary-300 rounded-lg text-center">
              <p className="text-sm font-bold text-primary-700">{currentPlan.guarantee}</p>
              <p className="text-xs text-neutral-600 mt-1">{currentPlan.guaranteeDetail}</p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              {currentPlan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-primary-200">
              <div className="text-sm text-neutral-600">
                Next billing: <span className="font-medium text-neutral-900">{currentPlan.nextBilling}</span>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-white transition-colors text-sm font-medium">
                  Change Plan
                </button>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                  Upgrade to Enterprise
                </button>
              </div>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="mt-6 p-6 rounded-lg bg-success-50 border border-success-200">
            <h3 className="font-bold text-neutral-900 mb-4">Your Return on Investment</h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Monthly Investment</p>
                <p className="text-xl font-bold text-neutral-900">RM {currentPlan.price.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">per month</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">Monthly Savings</p>
                <p className="text-xl font-bold text-success-600">{currentPlan.monthlySavings}</p>
                <p className="text-xs text-neutral-500">guaranteed minimum</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">ROI</p>
                <p className="text-xl font-bold text-primary-600">{currentPlan.roi}</p>
                <p className="text-xs text-neutral-500">return multiple</p>
              </div>
            </div>
            <div className="pt-4 border-t border-success-300 text-center">
              <p className="text-sm text-neutral-700">
                <span className="font-bold">Net Monthly Benefit:</span> RM 29,003 - 44,003 
                <span className="text-xs text-neutral-600 ml-2">(Savings minus investment)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Payment Method</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              + Add New
            </button>
          </div>

          <div className="space-y-3">
            {/* Primary Payment Method */}
            <div className="p-4 rounded-lg border-2 border-primary-500 bg-primary-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🏦</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">FPX - Maybank</p>
                  <p className="text-xs text-neutral-500">Default payment method</p>
                </div>
                <span className="px-2 py-1 bg-primary-500 text-white rounded text-xs font-medium">
                  Primary
                </span>
              </div>
              <button className="w-full py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                Update Bank Account
              </button>
            </div>

            {/* Secondary Method */}
            <div className="p-4 rounded-lg border border-neutral-200 hover:border-primary-500 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💳</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">Visa •••• 4242</p>
                  <p className="text-xs text-neutral-500">Expires 12/2026</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add Payment Method */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <h3 className="font-medium text-neutral-900 mb-3 text-sm">Add Payment Method</h3>
            <div className="space-y-2">
              {paymentMethods.filter(pm => pm.popular).map((method) => (
                <button
                  key={method.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                >
                  <span className="text-xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{method.name}</p>
                    <p className="text-xs text-neutral-500">{method.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">Available Plans</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`p-6 rounded-lg border-2 ${
                plan.current 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-neutral-200 hover:border-neutral-300'
              } transition-all`}
            >
              {plan.popular && !plan.current && (
                <div className="mb-3">
                  <span className="px-2 py-1 bg-cta-500 text-white rounded text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{plan.name}</h3>
              
              {/* Price */}
              <div className="mb-4">
                {plan.price ? (
                  <>
                    <div className="text-3xl font-bold text-neutral-900">RM {plan.price.toLocaleString()}</div>
                    <div className="text-sm text-neutral-600">/month</div>
                    {plan.setupFee && plan.setupFee > 0 && (
                      <div className="text-xs text-neutral-500 mt-1">+ RM {plan.setupFee.toLocaleString()} setup fee</div>
                    )}
                  </>
                ) : (
                  <div className="text-2xl font-bold text-neutral-900">Custom Pricing</div>
                )}
              </div>

              {/* Outcomes Box */}
              <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-xs font-medium text-neutral-700 mb-2">Promised Outcomes:</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">Waste Reduction:</span>
                    <span className="text-sm font-bold text-success-600">{plan.wasteReduction}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">Monthly Savings:</span>
                    <span className="text-sm font-bold text-success-600">{plan.savings}</span>
                  </div>
                  {plan.timeSaved && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-600">Time Saved:</span>
                      <span className="text-sm font-bold text-primary-600">{plan.timeSaved}</span>
                    </div>
                  )}
                  {plan.profitMarginIncrease && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-600">Profit Increase:</span>
                      <span className="text-sm font-bold text-primary-600">{plan.profitMarginIncrease}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-success-200">
                    <span className="text-xs text-neutral-600">ROI:</span>
                    <span className="text-sm font-bold text-neutral-900">{plan.roi}</span>
                  </div>
                </div>
              </div>

              {/* Guarantee Badge */}
              <div className="mb-4 p-2 bg-primary-50 border border-primary-200 rounded text-center">
                <p className="text-xs font-bold text-primary-700">{plan.guarantee}</p>
                <p className="text-xs text-primary-600 mt-0.5">{plan.guaranteeDetail}</p>
              </div>

              {/* Features List */}
              <div className="mb-4">
                <p className="text-xs font-medium text-neutral-700 mb-2">What's Included:</p>
                <ul className="space-y-1.5">
                  {plan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs text-neutral-500 pl-5">+ {plan.features.length - 5} more features</li>
                  )}
                </ul>
              </div>

              {/* Limits */}
              <div className="mb-4 text-xs text-neutral-500">
                {plan.limits}
              </div>

              {/* Action Button */}
              {plan.current ? (
                <button disabled className="w-full py-2 bg-neutral-100 text-neutral-500 rounded-lg text-sm font-medium cursor-not-allowed">
                  Current Plan
                </button>
              ) : plan.price ? (
                <button className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                  {plan.price < currentPlan.price ? 'Downgrade' : 'Upgrade'}
                </button>
              ) : (
                <button className="w-full py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium">
                  Contact Sales
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">Payment History</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Export All</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Method</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-900">{payment.date}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-700">{payment.description}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-neutral-900">RM {payment.amount.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-600">{payment.method}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-mono text-neutral-500">{payment.invoice}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-50 text-success-700 rounded text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors text-sm font-medium">
                        <Receipt className="w-4 h-4" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

