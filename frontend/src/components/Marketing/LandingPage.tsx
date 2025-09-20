import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, TrendingUp, Users, Shield, Coffee, Award, Crown, ArrowRight, Globe, Zap } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI-Powered Waste Reduction',
      description: 'Reduce waste by 35-45% with advanced machine learning insights',
      icon: TrendingUp,
      benefit: 'Save RM 50K-200K monthly'
    },
    {
      title: 'Multi-Location Management',
      description: 'Manage all your locations from a single enterprise dashboard',
      icon: Users,
      benefit: 'Scale efficiently'
    },
    {
      title: 'Real-Time Analytics',
      description: 'Get instant insights into your operations with live data',
      icon: Coffee,
      benefit: 'Make data-driven decisions'
    },
    {
      title: 'Enterprise Security',
      description: 'Built with enterprise-grade security and compliance',
      icon: Shield,
      benefit: 'Trusted by top brands'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Operations Director',
      company: 'Starbucks Malaysia',
      content: 'WasteWise helped us reduce food waste by 35% across all 50 locations. The AI insights are game-changing!',
      rating: 5,
      savings: 'RM 250K/month saved'
    },
    {
      name: 'Michael Rodriguez',
      role: 'CEO',
      company: 'Secret Recipe Group',
      content: 'The multi-location dashboard gives us complete visibility across all our stores. Exactly what we needed.',
      rating: 5,
      savings: 'RM 180K/month saved'
    },
    {
      name: 'Jennifer Park',
      role: 'General Manager',
      company: 'Urban Coffee Co.',
      content: 'Easy to use, powerful analytics, and excellent local support. This platform pays for itself.',
      rating: 5,
      savings: 'RM 320K/month saved'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header - Microsoft 365 Copilot Style */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Logo and Brand */}
            <div className="flex items-center space-x-4">
              {/* WasteWise Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <div className="text-xl font-semibold text-gray-900">WasteWise</div>
              </div>
              
              {/* Separator */}
              <div className="w-px h-6 bg-gray-300"></div>
              
              {/* Product Name */}
              <div className="text-xl font-semibold text-gray-900">WasteWise AI Platform</div>
            </div>
            
            {/* Center-Left Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                Products
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                Resources
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                Templates
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                Analytics
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                Support
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Center-Right and Right Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/landing')}
                className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors font-medium"
              >
                Buy WasteWise
              </button>
              
              <div className="hidden md:flex items-center space-x-4">
                <button className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                  All WasteWise
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Sign in
                </button>
                <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Microsoft 365 Copilot Style */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-purple-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Central Logo/Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 via-green-400 via-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
              
              {/* M365 Style Badge */}
              <div className="inline-flex items-center justify-center">
                <div className="bg-black text-white px-3 py-1 rounded text-sm font-medium">
                  W30
                </div>
              </div>
            </div>

            {/* Main Headline with Color Transitions */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                Welcome to the
              </span>
              <br />
              <span className="text-purple-600">
                WasteWise AI Platform
              </span>
              <br />
              <span className="text-blue-600">
                app
              </span>
            </h1>

            {/* Descriptive Paragraph */}
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              The WasteWise AI Platform lets you optimize, analyze, and collaborate all in one place with your favorite F&B operations now including AI-powered insights.*
            </p>
            
            {/* CTA Buttons - Microsoft 365 Style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-lg font-medium shadow-lg"
              >
                Sign in
              </button>
              <button
                onClick={() => navigate('/landing')}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium border-2 border-purple-600 shadow-lg"
              >
                Get WasteWise
              </button>
            </div>

            {/* Secondary Call-to-Action Link */}
            <div className="text-center">
              <button
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 transition-colors text-base font-medium"
              >
                Sign up for the free version of WasteWise &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose WasteWise?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade AI platform designed for Malaysia's top F&B businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-3">
                  {feature.description}
                </p>
                <div className="text-sm font-medium text-purple-600">
                  {feature.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Preview Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Flexible pricing options for businesses of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">RM 500</span>
                <span className="text-gray-500 ml-2">/month per location</span>
              </div>
              <p className="text-gray-600 mb-6">Perfect for small cafes and restaurants</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Core waste tracking</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Email support</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Start Free Trial
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-purple-600">RM 5,000</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For growing coffee chains (5-10 locations)</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>All Starter features</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Multi-location management</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/landing')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Get WasteWise
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">RM 10,000</span>
                <span className="text-gray-500 ml-2">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For large chains (10+ locations)</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>All Professional features</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Unlimited locations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
              <button
                onClick={() => navigate('/landing')}
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 inline-block">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/checkout?billing=monthly')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Paid monthly
                </button>
                <button
                  onClick={() => navigate('/checkout?billing=yearly')}
                  className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium border-2 border-purple-600"
                >
                  Paid yearly
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Save 15%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Malaysia's Top F&B Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about WasteWise
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

      {/* CTA Section */}
      <div className="py-20 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of F&B businesses already saving millions with WasteWise AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/landing')}
              className="bg-white text-purple-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold flex items-center justify-center"
            >
              Get WasteWise
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-purple-600 transition-colors text-lg font-semibold"
            >
              Start Free Trial
            </button>
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
                AI-powered operational intelligence platform for Malaysia's F&B industry.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/landing')} className="hover:text-white transition-colors">Get WasteWise</button></li>
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
            <p>&copy; 2024 WasteWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}