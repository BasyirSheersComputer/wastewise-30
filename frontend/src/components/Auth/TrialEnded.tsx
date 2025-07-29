import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Clock, CheckCircle, Star, ArrowRight, Zap, Shield, TrendingUp, AlertCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  features: string[];
  popular?: boolean;
  savings?: number;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    originalPrice: 99,
    features: [
      'Waste tracking & analytics',
      'Basic AI recommendations',
      'Email support',
      'Up to 5 locations',
      'Standard reporting'
    ],
    savings: 50
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 99,
    originalPrice: 199,
    features: [
      'Everything in Basic',
      'Advanced AI insights',
      'Priority support',
      'Unlimited locations',
      'Custom integrations',
      'Advanced analytics',
      'Multi-user access'
    ],
    popular: true,
    savings: 50
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    originalPrice: 399,
    features: [
      'Everything in Pro',
      'Dedicated success manager',
      'Custom AI training',
      'White-label options',
      'API access',
      'Advanced compliance',
      '24/7 phone support'
    ],
    savings: 50
  }
];

export default function TrialEnded() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [user, setUser] = useState<any>(null);
  const [trialDays, setTrialDays] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get trial status
        const { data: userData } = await supabase
          .from('users')
          .select('trial_end')
          .eq('id', user.id)
          .single();
        
        if (userData?.trial_end) {
          const trialEnd = new Date(userData.trial_end);
          const now = new Date();
          const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setTrialDays(Math.max(0, daysLeft));
        }
      }
    };
    getUser();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      // In a real app, this would integrate with Stripe
      console.log('Upgrading to plan:', planId);
      
      // Update user subscription in database
      const { error } = await supabase
        .from('users')
        .update({
          subscription_plan: planId,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendTrial = async () => {
    setLoading(true);
    try {
      // Extend trial by 7 days
      const newTrialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      const { error } = await supabase
        .from('users')
        .update({
          trial_end: newTrialEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      navigate('/dashboard');
    } catch (error) {
      console.error('Trial extension error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            Trial Ended
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Trial Has Ended
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Continue your journey to waste reduction and cost savings with our premium plans
          </p>
        </div>

        {/* Trial Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <Clock className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Trial Summary
            </h2>
            <p className="text-gray-600 mb-4">
              You've experienced the power of AI-driven waste management. Here's what you accomplished:
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">30%</div>
                <div className="text-sm text-gray-600">Average waste reduction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">$2,400</div>
                <div className="text-sm text-gray-600">Potential annual savings</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-gray-600">Accuracy in predictions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Choose Your Plan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
                  plan.popular ? 'border-blue-500 relative' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-lg text-gray-400 line-through">${plan.originalPrice}</span>
                    <span className="text-green-600 font-semibold ml-2">Save {plan.savings}%</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Special Offers */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Special Launch Offer</h2>
            <p className="text-xl mb-6 opacity-90">
              Get 50% off your first year when you upgrade today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={loading}
                className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50"
              >
                Claim 50% Off
              </button>
              <button
                onClick={handleExtendTrial}
                disabled={loading}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors disabled:opacity-50"
              >
                Extend Trial (7 days)
              </button>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600">See waste reduction within 30 days or get your money back</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk-Free</h3>
            <p className="text-gray-600">30-day money-back guarantee on all plans</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven ROI</h3>
            <p className="text-gray-600">Average 300% return on investment in first year</p>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Our team is here to help you choose the right plan for your business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Contact Sales
            </button>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}