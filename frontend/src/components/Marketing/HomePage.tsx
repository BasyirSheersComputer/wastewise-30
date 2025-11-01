import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, TrendingUp, Users, Shield, ArrowRight, Zap, Clock, DollarSign, Target, Award } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AI Forecasting',
      description: '85-95% demand prediction accuracy',
      icon: Zap,
      outcome: 'Reduce overproduction by 30-40%',
      savings: 'RM 10,000-20,000 monthly'
    },
    {
      title: 'Waste Logging',
      description: 'Track 100% of waste automatically',
      icon: TrendingUp,
      outcome: 'Identify waste sources, reduce by 25-40%',
      savings: 'RM 15,000-25,000 monthly'
    },
    {
      title: 'Compliance Automation',
      description: '95-100% regulatory compliance',
      icon: Shield,
      outcome: 'Zero violations, 60-75% time saved',
      savings: '20-30 hours weekly'
    },
    {
      title: 'Multi-Location Management',
      description: 'Centralized dashboard for all outlets',
      icon: Users,
      outcome: 'Scale efficiently with real-time visibility',
      savings: 'Unlimited outlets'
    }
  ];

  const industryStats = [
    {
      stat: 'RM 50.8B',
      label: 'Malaysian F&B Market Size',
      source: 'MATRADE, 2023'
    },
    {
      stat: '15-20%',
      label: 'Average Food Cost Waste',
      source: 'Ministry of Environment'
    },
    {
      stat: '25-40%',
      label: 'Reduction with Automation',
      source: 'World Resources Institute, 2023'
    },
    {
      stat: '85-95%',
      label: 'AI Forecasting Accuracy',
      source: 'McKinsey & Company, 2024'
    }
  ];

  const pricingTiers = [
    {
      name: 'Quick Win',
      price: 2997,
      description: 'Perfect for 2-5 outlets',
      features: [
        'One solution of your choice',
        'Complete setup included',
        'Staff training (10 employees)',
        'Monthly optimization review'
      ],
      savings: 'RM 15-25k/month',
      popular: false
    },
    {
      name: 'Growth System',
      price: 5997,
      description: 'Best for 6-20 outlets',
      features: [
        'Full Servora AI platform',
        'AI demand forecasting',
        'Automated waste logging',
        'Dedicated success manager'
      ],
      savings: 'RM 35-50k/month',
      popular: true
    },
    {
      name: 'Enterprise',
      price: null,
      description: 'For 20+ outlets',
      features: [
        'Everything + custom integrations',
        'Advanced analytics',
        'Multi-location dashboard',
        '24/7 priority support'
      ],
      savings: 'RM 100-300k+/month',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white sticky top-0 z-40">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">Servora AI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/pricing')}
                className="text-neutral-600 hover:text-neutral-900 font-medium"
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-hero bg-gradient-to-br from-primary-50 to-neutral-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-display font-bold text-neutral-900 mb-6">
              Reduce Food Waste by<br />30-40% in 60 Days
            </h1>
            <p className="text-body-lg text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop losing RM 15,000-25,000 monthly to preventable waste. Our proven system helps Malaysian F&B businesses increase profit margins by 10-15% through smart inventory management and waste reduction.
            </p>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-3xl mx-auto">
              <div className="stat-card bg-white rounded-lg shadow-sm p-4">
                <div className="stat-value text-primary-500">30-40%</div>
                <div className="stat-label">waste reduced</div>
              </div>
              <div className="stat-card bg-white rounded-lg shadow-sm p-4">
                <div className="stat-value text-primary-500">60 days</div>
                <div className="stat-label">to results</div>
              </div>
              <div className="stat-card bg-white rounded-lg shadow-sm p-4">
                <div className="stat-value text-primary-500">50+</div>
                <div className="stat-label">active clients</div>
              </div>
              <div className="stat-card bg-white rounded-lg shadow-sm p-4">
                <div className="stat-value text-success-500 text-2xl">RM 15-25k</div>
                <div className="stat-label">monthly savings</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={() => navigate('/landing')}
                className="btn-cta"
              >
                Get Your Free Audit
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              <button 
                onClick={() => navigate('/pricing')}
                className="btn-secondary"
              >
                View Pricing
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-600">
              <div className="trust-badge">
                <Check className="w-4 h-4 text-success-500" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="trust-badge">
                <Check className="w-4 h-4 text-success-500" />
                <span>Setup in 5 days</span>
              </div>
              <div className="trust-badge">
                <Check className="w-4 h-4 text-success-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-headline mb-6">The Real Cost of Food Waste</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="card-elevated">
                <DollarSign className="w-12 h-12 text-error mb-4 mx-auto" />
                <h3 className="text-subtitle mb-2">Lost Revenue</h3>
                <p className="text-neutral-600">
                  Losing <span className="font-bold text-error">RM 15,000-25,000</span> monthly per outlet to food waste you can't track or predict
                </p>
              </div>
              <div className="card-elevated">
                <Clock className="w-12 h-12 text-warning mb-4 mx-auto" />
                <h3 className="text-subtitle mb-2">Wasted Time</h3>
                <p className="text-neutral-600">
                  Wasting <span className="font-bold text-warning">20-30 hours weekly</span> on manual tracking, paperwork, and compliance
                </p>
              </div>
              <div className="card-elevated">
                <Shield className="w-12 h-12 text-error mb-4 mx-auto" />
                <h3 className="text-subtitle mb-2">Compliance Risk</h3>
                <p className="text-neutral-600">
                  Living in fear of <span className="font-bold text-error">RM 50,000-250,000</span> fines from missing compliance requirements
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-body-lg text-neutral-700 font-medium">
                Every month you wait costs you RM 15,000-25,000 in preventable waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4">Proven Solutions, Measurable Results</h2>
            <p className="text-body-lg text-neutral-600 max-w-3xl mx-auto">
              Each solution delivers specific, measurable outcomes backed by industry data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="card hover-lift">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-subtitle mb-2 text-primary-500">{feature.title}</h3>
                  <p className="text-sm text-neutral-600 mb-3">{feature.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700">{feature.outcome}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="font-medium text-success-500">{feature.savings}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry Data */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4">Backed by Industry Data</h2>
            <p className="text-body-lg text-neutral-600 max-w-3xl mx-auto">
              We don't make claims. We show you verified data from reputable sources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industryStats.map((stat, idx) => (
              <div key={idx} className="card-elevated text-center">
                <div className="text-5xl font-bold text-primary-500 mb-2">
                  {stat.stat}
                </div>
                <div className="text-neutral-700 font-medium mb-2">
                  {stat.label}
                </div>
                <div className="text-xs text-neutral-500">
                  {stat.source}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-neutral-600">
              All statistics from verified sources: MATRADE, World Resources Institute, McKinsey & Company
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4">Transparent Pricing, Guaranteed Results</h2>
            <p className="text-body-lg text-neutral-600 max-w-3xl mx-auto">
              Choose the package that fits your business. All include 30-day money-back guarantee.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx} 
                className={`card-elevated ${tier.popular ? 'border-2 border-cta-500 relative' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-cta-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <h3 className="text-subtitle mb-2">{tier.name}</h3>
                <div className="mb-4">
                  {tier.price ? (
                    <>
                      <div className="text-4xl font-bold text-neutral-900">
                        RM {tier.price.toLocaleString()}
                      </div>
                      <div className="text-neutral-600">/month</div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-neutral-900">Custom</div>
                  )}
                </div>
                <p className="text-sm text-neutral-600 mb-6">{tier.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6 p-4 bg-success-50 rounded-lg">
                  <div className="text-xs font-bold text-success-700 mb-1">MONTHLY SAVINGS</div>
                  <div className="text-xl font-bold text-success-500">{tier.savings}</div>
                </div>

                <button 
                  onClick={() => tier.price ? navigate('/signup') : window.location.href = 'mailto:a.basyir@sheerssoft.com'}
                  className={tier.popular ? 'btn-cta w-full' : 'btn-primary w-full'}
                >
                  {tier.price ? 'Start Now' : 'Contact Sales'}
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/pricing')}
              className="btn-secondary"
            >
              See Full Pricing Details
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section bg-neutral-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-headline text-white mb-6">
              Ready to Stop Losing Money?
            </h2>
            <p className="text-body-lg text-neutral-300 mb-8">
              Join 50+ Malaysian F&B businesses reducing waste and increasing profits with Servora AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={() => navigate('/landing')}
                className="btn-cta"
              >
                Get Your Free Audit
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="btn-secondary"
              >
                Start Free Trial
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-400">
              <div className="trust-badge text-neutral-400">
                <Shield className="w-4 h-4" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="trust-badge text-neutral-400">
                <Check className="w-4 h-4" />
                <span>Cancel anytime after 90 days</span>
              </div>
              <div className="trust-badge text-neutral-400">
                <Check className="w-4 h-4" />
                <span>99.9% uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-neutral-900">Servora AI</span>
            </div>
              <p className="text-sm text-neutral-600">
                Professional F&B waste management SaaS platform serving Malaysian restaurants
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><button onClick={() => navigate('/pricing')} className="hover:text-primary-500">Pricing</button></li>
                <li><button onClick={() => navigate('/landing')} className="hover:text-primary-500">Free Audit</button></li>
                <li><button onClick={() => navigate('/signup')} className="hover:text-primary-500">Start Trial</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><button className="hover:text-primary-500">About</button></li>
                <li><a href="mailto:a.basyir@sheerssoft.com" className="hover:text-primary-500">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><button className="hover:text-primary-500">Privacy Policy</button></li>
                <li><button className="hover:text-primary-500">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-8 pt-8 text-center text-sm text-neutral-600">
            <p className="mb-1">© 2025 Servora AI by Sheerssoft. All rights reserved.</p>
            <p className="text-xs text-neutral-500">
              Contact: <a href="mailto:a.basyir@sheerssoft.com" className="text-primary-500 hover:text-primary-700">a.basyir@sheerssoft.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
