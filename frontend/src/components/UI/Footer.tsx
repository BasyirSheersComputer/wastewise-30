import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-neutral-200 py-12 bg-white">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-neutral-900">Servora AI</span>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Professional F&B waste management SaaS platform serving Malaysian restaurants and food chains.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-bold text-neutral-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button 
                  onClick={() => navigate('/pricing')} 
                  className="hover:text-primary-500 transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/landing')} 
                  className="hover:text-primary-500 transition-colors"
                >
                  Free Waste Audit
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="hover:text-primary-500 transition-colors"
                >
                  Start Free Trial
                </button>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-bold text-neutral-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button className="hover:text-primary-500 transition-colors">
                  About Servora AI
                </button>
              </li>
              <li>
                <a 
                  href="mailto:a.basyir@sheerssoft.com" 
                  className="hover:text-primary-500 transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <button className="hover:text-primary-500 transition-colors">
                  Case Studies
                </button>
              </li>
            </ul>
          </div>
          
          {/* Legal & Support */}
          <div>
            <h4 className="font-bold text-neutral-900 mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <button className="hover:text-primary-500 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-primary-500 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button className="hover:text-primary-500 transition-colors">
                  Help Center
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-sm text-neutral-600">
          <p className="mb-1">© 2025 Servora AI by Sheerssoft. All rights reserved.</p>
          <p className="text-xs text-neutral-500">
            Reduce food waste by 30-40% in 60 days. Save RM 15,000-25,000 monthly per outlet.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Contact: <a href="mailto:a.basyir@sheerssoft.com" className="text-primary-500 hover:text-primary-700">a.basyir@sheerssoft.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

