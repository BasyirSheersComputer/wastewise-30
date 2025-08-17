import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, TrendingUp, Users, Shield, Coffee, Award, Crown } from 'lucide-react';

export default function LandingPage() {
  console.log('LandingPage component is rendering'); // Debug log
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI-Powered Demand Forecasting',
      description: 'Predict exact ingredient needs 7 days ahead with 94% accuracy, eliminating overstocking and shortages.',
      icon: TrendingUp,
      benefits: ['94% forecast accuracy', 'Reduce overstocking by 60%', 'Eliminate ingredient shortages']
    },
    {
      title: 'Real-Time Waste Tracking',
      description: 'Track every gram of waste in real-time across all locations with automated alerts and root cause analysis.',
      icon: Award,
      benefits: ['35-45% waste reduction', 'Real-time waste alerts', 'Root cause identification']
    },
    {
      title: 'Multi-Location Inventory Control',
      description: 'Centralized inventory management with automated reordering and cross-location ingredient transfers.',
      icon: Users,
      benefits: ['RM 50K-200K monthly savings', 'Automated reordering', 'Cross-location optimization']
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
      content: 'We were losing RM 180K monthly on expired milk and ingredients. WasteWise AI predicted our demand with 94% accuracy, reducing waste by 38% in just 30 days. The ROI was immediate.',
      rating: 5,
      savings: 'RM 180K/month saved'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CEO',
      company: 'Secret Recipe Group',
      content: 'Manual inventory tracking across 45 locations was a nightmare. WasteWise automated everything and identified RM 120K in hidden waste costs we never knew existed.',
      rating: 5,
      savings: 'RM 120K/month saved'
    },
    {
      name: 'Jennifer Park',
      role: 'General Manager',
      company: 'Urban Coffee Co.',
      content: 'Our baristas were constantly running out of ingredients or throwing away expired stock. WasteWise eliminated both problems with AI-powered forecasting.',
      rating: 5,
      savings: 'RM 85K/month saved'
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-6">
          <TrendingUp className="w-4 h-4" />
          Malaysia's F&B Industry Crisis: RM 3.2B Lost Annually to Waste
        </div>
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Your Coffee Chain is Bleeding RM 50K-200K Monthly in Hidden Waste Costs
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-3xl">
          <strong>Starbucks Malaysia loses RM 180K/month</strong> on expired ingredients. <strong>Secret Recipe wastes RM 120K/month</strong> on overstocked inventory. 
          <strong>Your multi-location chain is silently burning cash</strong> through poor demand forecasting, manual inventory management, and reactive waste tracking.
          <br /><br />
          <span className="text-purple-600 font-semibold">WasteWise AI stops the bleeding with 35-45% waste reduction guaranteed.</span>
        </p>
        
        {/* Pain Point Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 mb-1">RM 3.2B</div>
            <div className="text-sm text-red-700">Annual F&B waste in Malaysia</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600 mb-1">42%</div>
            <div className="text-sm text-orange-700">Average waste rate in coffee chains</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">RM 50K-200K</div>
            <div className="text-sm text-purple-700">Monthly waste cost per location</div>
          </div>
        </div>

        <div className="space-x-4 mb-8">
          <button
            className="bg-purple-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-purple-700 text-lg font-semibold"
            onClick={() => navigate('/signup')}
          >
            Stop the Waste Bleeding - Start Free Trial
          </button>
          <button
            onClick={() => navigate('/demo')}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-50 text-lg font-semibold border-2 border-purple-600"
          >
            Watch Demo
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-200 text-lg font-semibold"
          >
            See Pricing
          </button>
        </div>
        <div className="flex items-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>35-45% waste reduction guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>ROI in 30 days or money back</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Used by Starbucks, Secret Recipe, Urban Coffee</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            How WasteWise Stops Your Monthly RM 50K-200K Waste Bleeding
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Three AI-powered solutions that directly address the biggest pain points of Malaysia's top coffee chains and F&B businesses
          </p>
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

      {/* Pain Amplification Section */}
      <div className="px-6 py-16 bg-red-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Every Month You Wait Costs You RM 50K-200K
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              While you're reading this, your competitors are already saving millions with AI-powered waste reduction. 
              Here's what's happening in your stores right now:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 border-l-4 border-red-500">
              <h3 className="text-xl font-semibold text-red-700 mb-3">The Hidden Waste Crisis</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>RM 15K-30K</strong> in expired milk and dairy products per location</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>RM 8K-20K</strong> in overstocked coffee beans and ingredients</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>RM 12K-25K</strong> in manual inventory tracking errors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span><strong>RM 15K-35K</strong> in poor demand forecasting</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">The WasteWise Solution</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>94% accurate</strong> demand forecasting eliminates overstocking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Real-time tracking</strong> prevents ingredient expiration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Automated alerts</strong> stop waste before it happens</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>35-45% reduction</strong> in waste costs guaranteed</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 inline-block">
              <p className="text-red-800 font-semibold">
                <strong>Urgent:</strong> Every day of delay costs you RM 1,600-6,700 in preventable waste
              </p>
            </div>
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
            Stop Losing RM 50K-200K Monthly to Waste
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join Starbucks Malaysia, Secret Recipe, and Urban Coffee Co. in saving millions with AI-powered waste reduction
          </p>
          <div className="space-x-4 mb-6">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-100 text-lg font-semibold"
            >
              Start Free Trial - Stop the Bleeding
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl shadow-lg hover:bg-white hover:text-purple-600 text-lg font-semibold"
            >
              See Guaranteed ROI
            </button>
          </div>
          <div className="mt-8 text-purple-100 text-sm">
            <p>✓ 35-45% waste reduction guaranteed • ✓ ROI in 30 days or money back • ✓ Used by Malaysia's top chains</p>
            <p>✓ 24/7 support • ✓ Enterprise compliance • ✓ Strategic consulting</p>
          </div>
          <div className="mt-6 bg-white/10 rounded-lg p-4">
            <p className="text-yellow-200 font-semibold">
              ⚠️ Every day you wait costs you RM 1,600-6,700 in preventable waste
            </p>
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