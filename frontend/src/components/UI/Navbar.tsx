import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  variant?: 'landing' | 'pricing' | 'dark' | 'sidebar';
  showAuthButtons?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export default function Navbar({ 
  variant = 'landing', 
  showAuthButtons = true, 
  onMenuClick,
  className = '' 
}: NavbarProps) {
  const navigate = useNavigate();

  const getVariantStyles = () => {
    switch (variant) {
      case 'landing':
        return {
          container: 'flex justify-between items-center p-6',
          logo: 'flex items-center space-x-3',
          logoText: 'text-2xl font-bold text-purple-800',
          buttons: 'space-x-4',
          button: 'text-purple-600 hover:text-purple-800 font-medium',
          primaryButton: 'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium'
        };
      case 'pricing':
        return {
          container: 'bg-white shadow-sm border-b',
          innerContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          flexContainer: 'flex justify-between items-center h-16',
          logo: 'flex items-center',
          logoText: 'text-2xl font-bold text-purple-600',
          buttons: 'flex items-center space-x-4',
          button: 'text-gray-600 hover:text-purple-600 transition-colors',
          primaryButton: 'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
        };
      case 'dark':
        return {
          container: 'flex justify-between items-center p-6 text-white',
          logo: 'flex items-center space-x-3',
          logoText: 'text-2xl font-bold text-white',
          buttons: 'space-x-4',
          button: 'text-white hover:text-blue-200 transition-colors',
          primaryButton: 'bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg hover:bg-yellow-300 font-medium'
        };
      case 'sidebar':
        return {
          container: 'flex items-center justify-between h-16 px-lg border-b border-border',
          logo: 'flex items-center space-x-3',
          logoText: 'text-lg font-semibold text-text-primary',
          buttons: 'flex items-center space-x-2',
          button: 'text-text-secondary hover:text-text-primary',
          primaryButton: 'glass-button'
        };
      default:
        return {
          container: 'flex justify-between items-center p-6',
          logo: 'flex items-center space-x-3',
          logoText: 'text-2xl font-bold text-purple-800',
          buttons: 'space-x-4',
          button: 'text-purple-600 hover:text-purple-800 font-medium',
          primaryButton: 'bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium'
        };
    }
  };

  const styles = getVariantStyles();

  const renderLogo = () => (
    <div className={styles.logo}>
      <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
        <span className="text-white font-bold">S</span>
      </div>
      <span className={styles.logoText}>Servora AI</span>
    </div>
  );

  const renderAuthButtons = () => {
    if (!showAuthButtons) return null;

    if (variant === 'sidebar') {
      return (
        <div className={styles.buttons}>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.buttons}>
        {variant === 'pricing' && (
          <button
            onClick={() => navigate('/')}
            className={styles.button}
          >
            Home
          </button>
        )}
        {variant === 'dark' && (
          <button
            onClick={() => navigate('/')}
            className={styles.button}
          >
            Back to Home
          </button>
        )}
        {variant === 'landing' && (
          <button
            onClick={() => navigate('/pricing')}
            className={styles.button}
          >
            Pricing
          </button>
        )}
        <button
          onClick={() => navigate('/login')}
          className={styles.button}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/signup')}
          className={styles.primaryButton}
        >
          {variant === 'landing' ? 'Get Started' : 'Start Free Trial'}
        </button>
      </div>
    );
  };

  if (variant === 'pricing') {
    return (
      <nav className={`${styles.container} ${className}`}>
        <div className={styles.innerContainer}>
          <div className={styles.flexContainer}>
            {renderLogo()}
            {renderAuthButtons()}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`${styles.container} ${className}`}>
      {renderLogo()}
      {renderAuthButtons()}
    </nav>
  );
}
