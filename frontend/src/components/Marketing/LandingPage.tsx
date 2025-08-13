import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  console.log('LandingPage component is rendering'); // Debug log
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-blue-800">WasteWise</div>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/pricing')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Pricing
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          F&B Chain Intelligence Redefined
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl">
          Reduce waste, maximize profit, and make smarter decisions with our LLM-powered dashboard for multi-chain food businesses.
        </p>
        <div className="space-x-4">
          <button
            className="bg-blue-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 text-lg font-semibold"
            onClick={() => navigate('/offer')}
          >
            See Our Grand Slam Offer
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-50 text-lg font-semibold border-2 border-blue-600"
          >
            Start Free Trial
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Why Choose WasteWise?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Analytics</h3>
              <p className="text-gray-600">Advanced machine learning algorithms provide actionable insights for waste reduction.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cost Savings</h3>
              <p className="text-gray-600">Reduce food waste by up to 30% and increase your profit margins significantly.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-gray-600">Track inventory, waste, and performance metrics in real-time across all locations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to Transform Your F&B Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of restaurants already saving money with WasteWise
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl shadow-lg hover:bg-gray-50 text-lg font-semibold"
          >
            Start Your 30-Day Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}