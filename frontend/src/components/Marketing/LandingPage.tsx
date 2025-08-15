import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, TrendingUp, Users, Shield, Coffee, Award, Crown } from 'lucide-react';

export default function LandingPage() {
  console.log('LandingPage component is rendering'); // Debug log
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI-Powered Analytics',
      description: 'Advanced machine learning algorithms provide actionable insights for waste reduction.',
      icon: TrendingUp,
      benefits: ['Reduce waste by 25-45%', 'Real-time insights', 'Predictive analytics']
    },
    {
      title: 'Enterprise Cost Savings',
      description: 'Reduce food waste by up to 45% and increase your profit margins significantly.',
      icon: Award,
      benefits: ['Save RM 100K-2M/month', 'ROI in 1-2 months', 'Automated optimization']
    },
    {
      title: 'Multi-Location Management',
      description: 'Track inventory, waste, and performance metrics in real-time across all locations.',
      icon: Users,
      benefits: ['Centralized dashboard', 'Location comparison', 'Standardized processes']
    }
  ];

  const pricingHighlights = [
    {
      plan: 'Professional',
      price: 'RM 1,999',
      target: 'Top 10% revenue makers (RM 2M-10M annually)',
      savings: 'RM 100K-300K/month'
    },
    {
      plan: 'Enterprise',
      price: 'RM 4,999',
      target: 'Top 1% revenue makers (RM 50M+ annually)',
      savings: 'RM 500K-1M/month'
    },
    {
      plan: 'Elite',
      price: 'RM 9,999',
      target: 'Ultra-premium segment (RM 100M+ annually)',
      savings: 'RM 1M-2M/month'
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-white">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-purple-800">WasteWise</div>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/pricing')}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
          <Crown className="w-4 h-4" />
          Premium Market Focus - Top 10% Revenue Makers
        </div>
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Enterprise AI Platform for Malaysia's Top F&B Leaders
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl">
          Premium AI-powered waste reduction platform designed exclusively for Malaysia's top F&B revenue generators. 
          Target only the top 10% of revenue makers with proven ROI and enterprise-grade features.
        </p>
        <div className="space-x-4 mb-8">
          <button
            className="bg-purple-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-purple-700 text-lg font-semibold"
            onClick={() => navigate('/signup')}
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-50 text-lg font-semibold border-2 border-purple-600"
          >
            View Pricing
          </button>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>30-day enterprise trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Dedicated account manager</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Custom integrations</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose WasteWise Enterprise for Top Revenue Makers?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center justify-center text-sm text-gray-600">
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Highlights */}
      <div className="px-6 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Premium Market Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade pricing designed exclusively for Malaysia's top F&B revenue generators
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingHighlights.map((plan, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.plan}</h3>
                <div className="text-3xl font-bold text-purple-600 mb-2">{plan.price}</div>
                <div className="text-sm text-gray-600 mb-4">/month</div>
                <p className="text-sm text-gray-600 mb-4">{plan.target}</p>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Save up to</p>
                  <p className="text-lg font-bold text-green-600">{plan.savings}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/pricing')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
            >
              View Detailed Pricing
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Trusted by Malaysia's Top F&B Leaders
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
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

      {/* CTA Section */}
      <div className="px-6 py-16 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Transform Your Enterprise F&B Operations?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join Malaysia's top F&B leaders already saving millions with WasteWise Enterprise
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-100 text-lg font-semibold"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl shadow-lg hover:bg-white hover:text-purple-600 text-lg font-semibold"
            >
              View Pricing Plans
            </button>
          </div>
          <div className="mt-8 text-purple-100 text-sm">
            <p>✓ 30-day enterprise trial • ✓ Dedicated account manager • ✓ Custom integrations</p>
            <p>✓ 24/7 support • ✓ Enterprise compliance • ✓ Strategic consulting</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
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
                <li><button className="hover:text-white transition-colors">Features</button></li>
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