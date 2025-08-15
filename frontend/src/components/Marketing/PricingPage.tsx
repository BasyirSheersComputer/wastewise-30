import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, ArrowRight, Coffee, TrendingUp, Users, Shield, Zap, Award, Clock, Globe } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  interval: string;
  popular?: boolean;
  savings?: number;
  targetMarket?: string;
  annualRevenue?: string;
  valueProposition?: string;
  features?: {
    core: string[];
    modules: Record<string, string>;
    limitations: string[];
  };
  stripePriceId?: string;
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/billing/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPlans = () => {
    return plans.filter(plan => 
      billingCycle === 'monthly' ? !plan.id.includes('_annual') : plan.id.includes('_annual')
    );
  };

  const modules = [
    {
      name: 'Operational Intelligence',
      description: 'AI-powered dashboard with real-time insights',
      icon: TrendingUp
    },
    {
      name: 'Recipe & Inventory',
      description: 'Smart inventory management with AI predictions',
      icon: Coffee
    },
    {
      name: 'Demand Forecasting',
      description: 'Predict demand with machine learning',
      icon: Clock
    },
    {
      name: 'Waste Tracking',
      description: 'Comprehensive waste analytics and reduction',
      icon: Shield
    },
    {
      name: 'Suppliers',
      description: 'Supplier management and performance tracking',
      icon: Users
    },
    {
      name: 'Menu Optimization',
      description: 'AI-powered menu analysis and optimization',
      icon: Award
    },
    {
      name: 'Staff Training',
      description: 'Comprehensive training and development platform',
      icon: Users
    },
    {
      name: 'Reports & Compliance',
      description: 'Advanced reporting and compliance management',
      icon: TrendingUp
    },
    {
      name: 'CSV Upload',
      description: 'Easy data import and processing',
      icon: Globe
    },
    {
      name: 'Issue Reporting',
      description: 'Track and resolve operational issues',
      icon: Shield
    }
  ];

  const features = [
    {
      title: 'AI-Powered Waste Reduction',
      description: 'Reduce waste by 25-45% with advanced machine learning insights',
      icon: TrendingUp
    },
    {
      title: 'Multi-Location Management',
      description: 'Manage all your locations from a single enterprise dashboard',
      icon: Users
    },
    {
      title: 'Enterprise Analytics',
      description: 'Get instant insights into your operations with real-time data',
      icon: Coffee
    },
    {
      title: 'Premium Market Focus',
      description: 'Built exclusively for Malaysia\'s top 10% revenue makers',
      icon: Shield
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Operations Director',
      company: 'Starbucks Malaysia',
      content: 'WasteWise helped us reduce food waste by 35% across all 50 locations. The AI insights are game-changing for enterprise operations!',
      rating: 5,
      savings: 'RM 250K/month'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CEO',
      company: 'Secret Recipe Group',
      content: 'The multi-location dashboard gives us complete visibility across all our stores. The enterprise features are exactly what we needed.',
      rating: 5,
      savings: 'RM 180K/month'
    },
    {
      name: 'Jennifer Park',
      role: 'General Manager',
      company: 'Urban Coffee Co.',
      content: 'Easy to use, powerful analytics, and excellent local support. This platform pays for itself with our enterprise operations.',
      rating: 5,
      savings: 'RM 320K/month'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">WasteWise</div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="text-center px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Premium Market Focus - Top 10% Revenue Makers
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Enterprise-Grade AI Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Premium AI-powered waste reduction platform designed exclusively for Malaysia's top F&B revenue generators. 
            Target only the top 10% of revenue makers with proven ROI.
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'annual'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Save 10%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {getFilteredPlans().map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-lg p-8 border-2 ${
                  plan.popular ? 'border-purple-500 relative' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-purple-600">RM {plan.price.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center">
                      <span className="text-lg text-gray-400 line-through">RM {plan.originalPrice.toLocaleString()}</span>
                      <span className="text-green-600 font-semibold ml-2">Save {plan.savings}%</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">{plan.targetMarket}</p>
                  <p className="text-sm text-gray-500">{plan.annualRevenue}</p>
                </div>

                <div className="mb-6">
                  <div className="bg-purple-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-purple-900">{plan.valueProposition}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Core Features</h4>
                  <ul className="space-y-2">
                    {plan.features?.core.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Start Free Trial
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Comparison */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Enterprise Module Comparison
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI-powered modules designed for enterprise-scale operations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Module</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Professional</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Elite</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <module.icon className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">{module.name}</div>
                          <div className="text-sm text-gray-500">{module.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm text-gray-600">Advanced</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm text-green-600 font-medium">Enterprise</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm text-purple-600 font-medium">Custom</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose WasteWise Enterprise?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Premium AI platform designed exclusively for Malaysia's top F&B revenue generators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Malaysia's Top F&B Leaders
            </h2>
            <p className="text-lg text-gray-600">
              See what our premium customers have to say about WasteWise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Monthly Savings</p>
                    <p className="text-lg font-bold text-green-600">{testimonial.savings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Offers */}
      <div className="py-16 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Enterprise Solutions for Premium Markets
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 rounded-lg p-6">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Year Contracts</h3>
              <p className="text-purple-100">15-25% discount for multi-year commitments with custom enterprise agreements</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6">
              <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Volume Discounts</h3>
              <p className="text-purple-100">20-40% discount for multiple locations and enterprise deployments</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What makes WasteWise different for enterprise customers?
              </h3>
              <p className="text-gray-600">
                WasteWise is designed exclusively for Malaysia's top 10% revenue makers with advanced AI capabilities, custom integrations, and dedicated support teams that understand enterprise-scale operations.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What's included in the enterprise trial?
              </h3>
              <p className="text-gray-600">
                The 30-day enterprise trial includes full access to all features, custom integrations, dedicated account manager, and implementation support to demonstrate ROI within the trial period.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer custom enterprise agreements?
              </h3>
              <p className="text-gray-600">
                Yes, we offer custom enterprise agreements with negotiated pricing, multi-year contracts, volume discounts, and strategic partnership opportunities for large deployments.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What kind of support do enterprise customers receive?
              </h3>
              <p className="text-gray-600">
                Enterprise customers receive dedicated account managers, 24/7 support, custom training programs, strategic consulting, and priority feature development based on their specific needs.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can you integrate with our existing enterprise systems?
              </h3>
              <p className="text-gray-600">
                Absolutely. Our enterprise platform offers custom integrations with existing ERP, POS, and inventory systems, along with API development and white-label options for seamless integration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-purple-400 mb-4">WasteWise</div>
              <p className="text-gray-400">
                Premium AI platform for Malaysia's top F&B revenue generators.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-white transition-colors">Free Trial</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">Help Center</button></li>
                <li><button className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors">API Documentation</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">About</button></li>
                <li><button className="hover:text-white transition-colors">Blog</button></li>
                <li><button className="hover:text-white transition-colors">Careers</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WasteWise. All rights reserved. Premium platform for top 10% revenue makers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
