import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Download, 
  Mail, 
  Users, 
  TrendingUp,
  Coffee,
  Shield,
  Clock
} from 'lucide-react';

interface PlanDetails {
  id: string;
  name: string;
  price: number;
  features: string[];
}

const plans: Record<string, PlanDetails> = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    price: 49,
    features: [
      'Waste tracking & analytics',
      'Basic AI recommendations',
      'Email support',
      'Up to 5 locations'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Professional Plan',
    price: 99,
    features: [
      'Everything in Basic',
      'Advanced AI insights',
      'Priority support',
      'Unlimited locations',
      'Custom integrations'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 199,
    features: [
      'Everything in Pro',
      'Dedicated success manager',
      'Custom AI training',
      'White-label options',
      'API access'
    ]
  }
};

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  const planId = searchParams.get('plan') || 'pro';
  const plan = plans[planId];

  useEffect(() => {
    // Simulate fetching subscription data
    const fetchSubscriptionData = async () => {
      try {
        // In a real app, you'd fetch the actual subscription data
        // from your backend using the payment intent ID
        const paymentIntentId = searchParams.get('payment_intent');
        
        if (paymentIntentId) {
          const response = await fetch(`/api/billing/subscription/${paymentIntentId}`);
          if (response.ok) {
            const data = await response.json();
            setSubscriptionData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [searchParams]);

  const nextSteps = [
    {
      title: 'Complete Your Profile',
      description: 'Set up your business details and locations',
      icon: Users,
      action: 'Setup Profile',
      link: '/onboarding'
    },
    {
      title: 'Add Your First Location',
      description: 'Configure your coffee shop or chain locations',
      icon: Coffee,
      action: 'Add Location',
      link: '/dashboard'
    },
    {
      title: 'Start Tracking Waste',
      description: 'Begin monitoring and reducing food waste',
      icon: TrendingUp,
      action: 'Start Tracking',
      link: '/waste'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-blue-600">Sheerssoft</div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Payment Successful</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to WasteWise!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Your {plan.name} subscription has been activated successfully.
          </p>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              ${plan.price}/month
            </div>
                         <p className="text-gray-600 text-sm">
               Your 30-day free trial has started. First billing date: {new Date(Date.now() + (import.meta.env.VITE_TRIAL_PERIOD_DAYS || 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}
             </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Let's Get You Started
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                    <step.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{step.description}</p>
                <button
                  onClick={() => navigate(step.link)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Go to Dashboard</div>
                  <div className="text-sm text-gray-600">View your analytics and insights</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => window.open('mailto:support@wastewise.com', '_blank')}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">Contact Support</div>
                  <div className="text-sm text-gray-600">Get help with setup</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Your {plan.name} Features:</h4>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Account Benefits:</h4>
              <ul className="space-y-2">
                                 <li className="flex items-center text-sm text-gray-600">
                   <Clock className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                   30-day free trial (no charges during trial)
                 </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Cancel anytime with no penalties
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Priority customer support
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <Download className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  Access to all training materials
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center mx-auto"
          >
            Start Using WasteWise
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          <p className="text-gray-600 mt-4">
            You'll receive a welcome email with setup instructions shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
