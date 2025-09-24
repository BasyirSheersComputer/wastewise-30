import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../logo.png';

interface FooterProps {
  variant?: 'default' | 'dark';
  className?: string;
}

export default function Footer({ variant = 'default', className = '' }: FooterProps) {
  const navigate = useNavigate();

  const getVariantStyles = () => {
    switch (variant) {
      case 'dark':
        return {
          container: 'bg-gray-900 text-white py-12',
          logo: 'flex items-center space-x-3 mb-4',
          logoText: 'text-2xl font-bold text-purple-400',
          description: 'text-gray-400',
          link: 'hover:text-white transition-colors',
          copyright: 'text-gray-400'
        };
      default:
        return {
          container: 'bg-white border-t border-gray-200 py-12',
          logo: 'flex items-center space-x-3 mb-4',
          logoText: 'text-2xl font-bold text-purple-600',
          description: 'text-gray-600',
          link: 'hover:text-purple-600 transition-colors',
          copyright: 'text-gray-500'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <footer className={`${styles.container} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className={styles.logo}>
              <img 
                src={logo} 
                alt="WasteWise Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className={styles.logoText}>WasteWise</span>
            </div>
            <p className={styles.description}>
              Premium AI platform for Malaysia's top F&B revenue generators with guaranteed results.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/')} className={styles.link}>Features</button></li>
              <li><button onClick={() => navigate('/pricing')} className={styles.link}>Pricing</button></li>
              <li><button onClick={() => navigate('/signup')} className={styles.link}>Free Trial</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><button className={styles.link}>Help Center</button></li>
              <li><button className={styles.link}>Contact Us</button></li>
              <li><button className={styles.link}>API Documentation</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><button className={styles.link}>About</button></li>
              <li><button className={styles.link}>Blog</button></li>
              <li><button className={styles.link}>Careers</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className={styles.copyright}>
            &copy; 2024 WasteWise. All rights reserved. Premium platform with guaranteed results for top 10% revenue makers.
          </p>
        </div>
      </div>
    </footer>
  );
}
