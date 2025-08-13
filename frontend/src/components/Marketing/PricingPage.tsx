import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, ArrowRight, Coffee, TrendingUp, Users, Shield } from 'lucide-react';

export default function PricingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Stripe pricing table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.head.appendChild(script);

    // Add custom CSS for desktop layout
    const style = document.createElement('style');
    style.textContent = `
      @media (min-width: 1024px) {
        stripe-pricing-table {
          display: block !important;
        }
        stripe-pricing-table::part(table) {
          display: flex !important;
          flex-direction: row !important;
          justify-content: center !important;
          gap: 1rem !important;
        }
        stripe-pricing-table::part(row) {
          display: flex !important;
          flex-direction: row !important;
          width: 100% !important;
        }
        stripe-pricing-table::part(cell) {
          flex: 1 !important;
          max-width: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup script and style when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const features = [
    {
      title: 'Waste Tracking & Analytics',
      description: 'Real-time waste monitoring with detailed analytics and cost tracking',
      icon: TrendingUp
    },
    {
      title: 'AI-Powered Insights',
      description: 'Machine learning recommendations for waste reduction and optimization',
      icon: Coffee
    },
    {
      title: 'Multi-Location Support',
      description: 'Manage multiple locations from a single dashboard',
      icon: Users
    },
    {
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control',
      icon: Shield
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Operations Manager',
      company: 'Brew & Bean Chain',
      content: 'WasteWise helped us reduce food waste by 35% in just 3 months. The AI insights are game-changing!',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Owner',
      company: 'Café Central',
      content: 'The multi-location dashboard gives us complete visibility across all our stores. Highly recommended!',
      rating: 5
    },
    {
      name: 'Jennifer Park',
      role: 'General Manager',
      company: 'Urban Coffee Co.',
      content: 'Easy to use, powerful analytics, and excellent support. This platform pays for itself.',
      rating: 5
    }
  ];

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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
                     <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
             Choose the perfect plan for your business. All plans include a 30-day free trial with full access to all features.
           </p>
          
                     {/* Stripe Pricing Table */}
           <div className="mb-16">
             <div className="max-w-6xl mx-auto">
               <stripe-pricing-table 
                 pricing-table-id="prctbl_1RvZaY1awWwGP4dIvzJKE0Mw"
                 publishable-key="pk_live_51Rqms71awWwGP4dIrms0QUcKCCvsUU3m6KaWcjrHi6FkeoJD41tW8EM7m7fvvxyMds0M7HAgHz8Rn5q9az7s7SVp00EKbZehYr"
                 customer-email=""
                 client-reference-id="">
               </stripe-pricing-table>
             </div>
           </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to optimize your operations and reduce waste.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
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
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Coffee Chains Worldwide
            </h2>
            <p className="text-lg text-gray-600">
              See what our customers have to say about WasteWise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of coffee chains already using WasteWise to reduce waste and increase profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
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
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.
              </p>
            </div>

                         <div className="border-b border-gray-200 pb-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-2">
                 What's included in the free trial?
               </h3>
               <p className="text-gray-600">
                 The 30-day free trial includes access to all features and unlimited locations. No credit card required to start.
               </p>
             </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer custom pricing for enterprise?
              </h3>
              <p className="text-gray-600">
                Yes, we offer custom pricing for enterprise customers with specific requirements. Contact our sales team for details.
              </p>
            </div>

            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600">
                Absolutely. We use bank-level encryption and security measures to protect your data. We're SOC 2 compliant and GDPR ready.
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
              <div className="text-2xl font-bold text-blue-400 mb-4">WasteWise</div>
              <p className="text-gray-400">
                Empowering coffee chains with intelligent operational insights.
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
            <p>&copy; 2024 WasteWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
