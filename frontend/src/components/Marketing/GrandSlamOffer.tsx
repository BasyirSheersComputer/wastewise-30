import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Star, Clock, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

export default function GrandSlamOffer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate email capture
    setTimeout(() => {
      setLoading(false);
      navigate('/signup');
    }, 1000);
  };

  const features = [
    'AI-Powered Waste Reduction Analytics',
    'Real-time Multi-location Monitoring',
    'Automated Cost Optimization',
    'Compliance & Reporting Tools',
    'Unlimited Data Storage',
    'Priority Customer Support',
    'Custom Integration Setup',
    'Dedicated Success Manager'
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Operations Director',
      company: 'FreshBites Chain',
      quote: 'WasteWise helped us reduce food waste by 35% in just 3 months. The ROI was immediate!',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'General Manager',
      company: 'Urban Eats',
      quote: 'The AI recommendations are game-changing. We saved $12,000 in the first quarter.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 text-white">
        <div className="text-2xl font-bold">Sheerssoft</div>
        <button
          onClick={() => navigate('/')}
          className="text-white hover:text-blue-200 transition-colors"
        >
          Back to Home
        </button>
      </nav>

      {/* Hero Section */}
      <div className="text-center px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold mb-6">
            <Star className="w-4 h-4 mr-2" />
            LIMITED TIME OFFER
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Grand Slam
            <span className="block text-yellow-400">Special Offer</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Transform your F&B business with our most comprehensive package ever. 
            <span className="text-yellow-400 font-semibold"> Save 60%</span> on your first year!
          </p>

          {/* Price Display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl text-white line-through opacity-60">$2,400</span>
              <span className="text-6xl font-bold text-yellow-400 ml-4">$960</span>
              <span className="text-white text-lg ml-2">/year</span>
            </div>
            <p className="text-blue-200 text-lg">
              That's just <span className="text-yellow-400 font-semibold">$80/month</span> instead of $200/month
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-yellow-400 text-yellow-900 px-8 py-4 rounded-xl text-xl font-bold hover:bg-yellow-300 transition-colors flex items-center justify-center"
            >
              Start Your 30-Day Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-white hover:text-blue-900 transition-colors"
            >
              View All Plans
            </button>
          </div>

          {/* Countdown Timer */}
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg inline-flex items-center mb-8">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-semibold">Offer ends in 3 days!</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need to Succeed
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Trusted by Industry Leaders
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-100 text-lg mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-blue-200 text-sm">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="px-6 py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Our Grand Slam Offer?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Instant ROI</h3>
              <p className="text-blue-200">See results within 30 days or get your money back</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Risk-Free Trial</h3>
              <p className="text-blue-200">30-day free trial with full access to all features</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-yellow-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Proven Results</h3>
              <p className="text-blue-200">Average 30% waste reduction across all clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <div className="px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get Exclusive Early Access
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Join our VIP list and be the first to know about special offers and new features
          </p>
          
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-yellow-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Get Early Access'}
            </button>
          </form>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 py-16 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-yellow-900 mb-4">
            Don't Miss This Opportunity!
          </h2>
          <p className="text-yellow-800 text-xl mb-8">
            Join hundreds of restaurants already saving money with WasteWise
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-blue-900 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-800 transition-colors"
          >
            Start Your Free Trial Now
          </button>
        </div>
      </div>
    </div>
  );
}