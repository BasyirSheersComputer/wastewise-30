import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, TrendingUp, Shield, Zap, Crown, ArrowRight, X, DollarSign, Clock, Users, Award } from 'lucide-react';

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const packages = [
    {
      id: 'quick-win',
      name: 'Quick Win Solution',
      price: 2997,
      setup: 0,
      setupNote: 'Waived',
      commitment: '90-day minimum, cancel anytime after',
      popular: false,
      icon: Zap,
      color: 'primary',
      included: [
        'One solution of your choice (AI Forecasting, Waste Logging, OR Compliance)',
        'Complete setup and integration',
        'Staff training (up to 10 employees)',
        'Daily waste tracking and reporting',
        'Monthly optimization review',
        'Email and phone support'
      ],
      outcomes: {
        wasteReduction: '20-30%',
        timeSaved: '10-15 hours/week',
        monthlySavings: 'RM 15,000-25,000',
        roi: '500-800%'
      },
      guarantees: [
        '30-Day Money-Back Guarantee - See measurable improvement or full refund',
        'Zero Long-Term Lock-in - Cancel after 90 days, no penalties',
        'Free Implementation - We set it up for you (RM 8,000 value)'
      ],
      idealFor: 'Single-location or small chains (2-5 outlets) wanting to solve one specific problem fast',
      valueEquation: {
        cost: 'RM 2,997/month',
        savings: 'RM 15,000-25,000/month',
        roi: '5-8x return'
      }
    },
    {
      id: 'growth-system',
      name: 'Growth System',
      price: 5997,
      setup: 4997,
      setupNote: 'One-time',
      commitment: '6-month minimum for guaranteed results',
      popular: true,
      icon: TrendingUp,
      color: 'cta',
      included: [
        'Full Servora AI platform access',
        'AI demand forecasting',
        'Automated waste logging',
        'Real-time inventory tracking',
        'Supplier integration and auto-ordering',
        'Compliance automation with alerts',
        'Unlimited staff training',
        'Dedicated success manager',
        'Weekly optimization calls',
        'Priority support (4-hour response)'
      ],
      outcomes: {
        wasteReduction: '35-45%',
        timeSaved: '20-30 hours/week',
        monthlySavings: 'RM 35,000-50,000',
        profitMargin: '10-15%',
        roi: '600-1000%'
      },
      guarantees: [
        '60-Day Savings Guarantee - Save minimum RM 30,000 monthly or pay nothing',
        '6-Month Performance Lock - If system doesn\'t perform, we work for free until it does',
        '99.9% Uptime Guarantee - Or monthly fee waived'
      ],
      idealFor: 'Multi-location chains (6-20 outlets) serious about maximizing profitability and operational excellence',
      valueEquation: {
        cost: 'RM 5,997/month + RM 4,997 setup',
        savings: 'RM 35,000-50,000/month',
        roi: '6-10x return',
        payback: 'Setup recovered in first month'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise Transformation',
      price: null,
      setup: null,
      setupNote: 'Custom',
      commitment: '12-month partnership',
      popular: false,
      icon: Crown,
      color: 'primary',
      included: [
        'Everything in Growth System',
        'Custom integrations with existing POS/ERP',
        'Advanced analytics and predictive modeling',
        'Multi-location centralized dashboard',
        'Custom reporting and KPI tracking',
        'Quarterly strategic planning sessions',
        'On-site training and implementation',
        'Dedicated technical account manager',
        '24/7 priority support',
        'Annual system optimization reviews'
      ],
      outcomes: {
        wasteReduction: '40-50%',
        operationalEfficiency: '50-70% improvement',
        monthlySavings: 'RM 100,000-300,000+',
        profitMargin: '12-18%',
        scalability: 'Unlimited outlets'
      },
      guarantees: [
        '90-Day Transformation Guarantee - Complete digital transformation or extended support at no cost',
        'Profit Increase Guarantee - Minimum 8% profit margin increase in 6 months',
        'Results or We Work For Free - Continue at no cost until goals achieved'
      ],
      idealFor: 'Large chains (20+ outlets) and franchise operations ready to dominate their market',
      valueEquation: {
        cost: 'Custom pricing',
        savings: 'RM 100,000-300,000+/month',
        roi: '10-20x return at scale'
      }
    }
  ];

  const bonuses = [
    {
      name: 'Waste Audit Report',
      value: 'RM 5,000',
      description: 'Comprehensive audit of current waste patterns with customized reduction roadmap'
    },
    {
      name: 'Staff Training Program',
      value: 'RM 8,000',
      description: 'Complete training for entire team on waste reduction best practices'
    },
    {
      name: 'Monthly Optimization Reviews',
      value: 'RM 3,000/month',
      description: 'Dedicated success manager identifies new optimization opportunities'
    },
    {
      name: 'Compliance Checklist Templates',
      value: 'RM 2,500',
      description: 'Pre-built templates for Malaysian regulations, avoid RM 50,000-250,000 in fines'
    }
  ];

  const totalBonusValue = bonuses.reduce((sum, bonus) => {
    const value = parseInt(bonus.value.replace(/[^0-9]/g, ''));
    return sum + value;
  }, 0);

  const faqs = [
    {
      question: 'How quickly will I see results?',
      answer: 'Results typically appear within 30 days. Full optimization in 60-90 days. With our Quick Win Solution, you\'ll see measurable improvements in waste tracking within the first week.'
    },
    {
      question: 'What if it doesn\'t work for my business?',
      answer: 'That\'s why we have the 30-day money-back guarantee. You don\'t have to be sure - just willing to test it. If you don\'t see measurable results in 30 days, full refund. Zero risk on your side.'
    },
    {
      question: 'Is this suitable for single-location restaurants?',
      answer: 'Absolutely! Our Quick Win Solution is designed specifically for 1-5 outlets. Small operations actually see faster results because changes happen quickly. Start small, scale when you\'re ready.'
    },
    {
      question: 'How does the 60-Day Savings Guarantee work?',
      answer: 'We guarantee minimum RM 30,000 monthly savings within 60 days with our Growth System. If you don\'t hit this, you pay nothing until you do. We only win when you win.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes! You can upgrade anytime. Downgrading is available after your initial commitment period. We want you on the plan that makes the most sense for your business.'
    },
    {
      question: 'What happens after the minimum commitment period?',
      answer: 'You can cancel anytime with 30 days notice. No penalties, no hassle. Most clients stay because the system works and continues delivering value.'
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                onClick={() => navigate('/')}
                className="text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Home
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
      <section className="section-hero bg-neutral-50">
        <div className="container text-center">
          <h1 className="text-display font-bold text-neutral-900 mb-6">
            Transparent Pricing, Guaranteed Results
          </h1>
          <p className="text-body-lg text-neutral-600 max-w-3xl mx-auto mb-8">
            RM 5,997/month. Saves RM 35,000-50,000/month. 6x ROI. 60-day guarantee.
          </p>
          
          <div className="inline-flex items-center gap-6 text-sm text-neutral-600 mb-12">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success-500" />
              <span>30-day money-back</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success-500" />
              <span>No long-term lock-in</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="section">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              const isPopular = pkg.popular;
              
              return (
                <div 
                  key={pkg.id}
                  className={`card-elevated relative ${isPopular ? 'border-2 border-cta-500' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-cta-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 bg-${pkg.color}-500 rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-subtitle">{pkg.name}</h3>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6 pb-6 border-b border-neutral-200">
                    {pkg.price ? (
                      <>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-bold text-neutral-900">
                            RM {pkg.price.toLocaleString()}
                          </span>
                          <span className="text-neutral-600">/month</span>
                        </div>
                        <div className="text-sm text-neutral-600">
                          Setup: <span className="font-medium">
                            {pkg.setup === 0 ? 'RM 0 (Waived)' : `RM ${pkg.setup?.toLocaleString()} (${pkg.setupNote})`}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-neutral-900 mb-2">
                        Custom Pricing
                      </div>
                    )}
                    <div className="text-sm text-neutral-600 mt-2">
                      {pkg.commitment}
                    </div>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="mb-6">
                    <h4 className="font-bold text-neutral-900 mb-3">Expected Outcomes</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(pkg.outcomes).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-neutral-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-bold text-success-500">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="mb-6">
                    <h4 className="font-bold text-neutral-900 mb-3">What's Included</h4>
                    <div className="space-y-2">
                      {pkg.included.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Guarantees */}
                  <div className="mb-6">
                    <h4 className="font-bold text-neutral-900 mb-3">Guarantees</h4>
                    <div className="space-y-2">
                      {pkg.guarantees.map((guarantee, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Shield className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-700">{guarantee}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ideal For */}
                  <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                    <div className="text-xs font-bold text-neutral-600 mb-1">IDEAL FOR</div>
                    <div className="text-sm text-neutral-700">{pkg.idealFor}</div>
                  </div>

                  {/* CTA Button */}
                  <button 
                    onClick={() => pkg.price ? navigate('/signup') : window.location.href = 'mailto:a.basyir@sheerssoft.com?subject=Enterprise%20Inquiry'}
                    className={isPopular ? 'btn-cta w-full' : 'btn-primary w-full'}
                  >
                    {pkg.price ? 'Start Now' : 'Contact Sales'}
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </button>

                  {/* Value Equation */}
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <div className="text-xs font-bold text-neutral-600 mb-2">VALUE EQUATION</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Cost:</span>
                        <span className="font-medium">{pkg.valueEquation.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Savings:</span>
                        <span className="font-bold text-success-500">{pkg.valueEquation.savings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">ROI:</span>
                        <span className="font-bold text-primary-500">{pkg.valueEquation.roi}</span>
                      </div>
                      {pkg.valueEquation.payback && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Payback:</span>
                          <span className="font-medium">{pkg.valueEquation.payback}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section className="section bg-primary-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-headline mb-4">Included FREE with Any Package</h2>
            <p className="text-body-lg text-neutral-600">
              Total bonus value: <span className="font-bold text-primary-500">RM {totalBonusValue.toLocaleString()}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bonuses.map((bonus, idx) => (
              <div key={idx} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-neutral-900">{bonus.name}</h4>
                  <div className="bg-success-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {bonus.value}
                  </div>
                </div>
                <p className="text-sm text-neutral-600">{bonus.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-faq">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-headline text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="card cursor-pointer" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-neutral-900">{faq.question}</h4>
                    <div className={`transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                      <ArrowRight className="w-5 h-5 text-neutral-400 rotate-90" />
                    </div>
                  </div>
                  {openFaq === idx && (
                    <p className="text-neutral-600 mt-4 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section bg-neutral-900">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-headline text-white mb-6">
              Stop Losing Money. Start Saving Today.
            </h2>
            <p className="text-body-lg text-neutral-300 mb-8">
              Every month you delay = RM 15,000-25,000 lost to preventable waste. That's RM 180,000-300,000 per year.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/signup')}
                className="btn-cta"
              >
                Start Saving Now
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Learn More
              </button>
            </div>

            <div className="mt-8 text-sm text-neutral-400">
              Questions? Email us at <a href="mailto:a.basyir@sheerssoft.com" className="text-primary-400 hover:text-primary-300">a.basyir@sheerssoft.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="container">
          <div className="text-center text-sm text-neutral-600">
            <p className="mb-2">© 2025 Servora AI by Sheerssoft. All rights reserved.</p>
            <p className="text-xs text-neutral-500">
              Professional F&B waste management SaaS platform serving Malaysian restaurants
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
