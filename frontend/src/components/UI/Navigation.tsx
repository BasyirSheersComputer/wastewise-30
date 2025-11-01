import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  transparent?: boolean;
  hideActions?: boolean;
}

export default function Navigation({ transparent = false, hideActions = false }: NavigationProps) {
  const navigate = useNavigate();

  return (
    <nav className={`border-b border-neutral-200 ${transparent ? 'bg-transparent' : 'bg-white'} sticky top-0 z-40`}>
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-primary-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-neutral-900">Servora AI</span>
          </button>
          
          {/* Navigation Links */}
          {!hideActions && (
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/pricing')}
                className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="btn-ghost text-sm"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="btn-cta text-sm"
              >
                Start Free Trial
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="btn-ghost text-sm">Menu</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

