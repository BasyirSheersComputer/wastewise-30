import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, TrendingUp, Clock, DollarSign, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      const response = await apiService.submitLead({
        ...formData,
        source: 'landing_page_hero',
        interest: 'general'
      });

      if (response.success) {
        setFormSubmitted(true);
        console.log('Lead submitted successfully:', response);
      } else {
        setFormError(response.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError('Unable to submit form. Please try again.');
    }
  };

  const valueProps = [
    { value: '30-40%', label: 'waste reduced' },
    { value: '60 days', label: 'to results' },
    { value: '50+', label: 'active clients' },
    { value: 'RM 15-25k', label: 'monthly savings per outlet' }
  ];

  const solutions = [
    {
      title: 'AI Forecasting',
      outcome: '85-95% demand prediction accuracy',
      result: 'Reduce overproduction by 30-40%',
      savings: 'RM 10,000-20,000 monthly',
      timeline: '30 days'
    },
    {
      title: 'Waste Logging Automation',
      outcome: 'Track 100% of waste automatically',
      result: 'Identify waste sources, reduce by 25-40%',
      savings: 'RM 15,000-25,000 monthly',
      timeline: '60 days'
    },
    {
      title: 'Compliance Automation',
      outcome: '95-100% regulatory compliance',
      result: 'Zero violations, 60-75% time saved',
      savings: '20-30 hours weekly',
      timeline: 'Immediate'
    }
  ];

  const industryData = [
    {
      stat: '25-40%',
      description: 'Restaurants using automated waste tracking achieve reduction',
      source: 'World Resources Institute, 2023',
      link: 'https://www.wri.org'
    },
    {
      stat: '85-95%',
      description: 'AI forecasting accuracy in food service operations',
      source: 'McKinsey & Company, 2024',
      link: 'https://www.mckinsey.com'
    },
    {
      stat: 'RM 50.8B',
      description: 'Malaysian F&B market size with 15-20% average waste',
      source: 'MATRADE, 2023',
      link: 'https://www.matrade.gov.my'
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
      <section className="section-hero bg-neutral-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Headline & Value Props */}
            <div>
              <h1 className="text-headline md:text-display font-bold text-neutral-900 mb-6">
                Reduce Food Waste by 30-40% in 60 Days
              </h1>
              
              <p className="text-body-lg text-neutral-600 mb-8 leading-relaxed">
                Stop losing RM 15,000-25,000 monthly to preventable waste. Our proven system helps F&B businesses increase profit margins by 10-15% through smart inventory management and waste reduction.
              </p>

              {/* Value Props Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {valueProps.map((prop, idx) => (
                  <div key={idx} className="stat-card border-l-4 border-primary-500 bg-white rounded pl-4">
                    <div className="stat-value text-2xl">{prop.value}</div>
                    <div className="stat-label">{prop.label}</div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
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

            {/* Right: Lead Form */}
            <div className="card-elevated">
              {!formSubmitted ? (
                <>
                  <h3 className="text-title mb-2">Get Your Free Waste Audit</h3>
                  <p className="text-neutral-600 mb-6">
                    See exactly where you're losing RM 15,000-25,000 monthly
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="input-field w-full"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Tan"
                      />
                    </div>
                    
                    <div>
                      <label className="label">Email Address</label>
                      <input
                        type="email"
                        required
                        className="input-field w-full"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@restaurant.com"
                      />
                    </div>
                    
                    <div>
                      <label className="label">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="input-field w-full"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+60 12-345-6789"
                      />
                    </div>
                    
                    <div>
                      <label className="label">Restaurant/Company Name</label>
                      <input
                        type="text"
                        required
                        className="input-field w-full"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        placeholder="My Restaurant Chain"
                      />
                    </div>

                    {formError && (
                      <div className="flex items-center gap-2 text-error text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {formError}
                      </div>
                    )}
                    
                    <button type="submit" className="btn-cta w-full">
                      Get Your Free Audit
                      <ArrowRight className="w-5 h-5 ml-2 inline" />
                    </button>
                    
                    <div className="text-xs text-neutral-500 text-center space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-3 h-3 text-success-500" />
                        <span>No credit card required</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-3 h-3 text-success-500" />
                        <span>30-day money-back guarantee</span>
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-title mb-2">We'll Call You Soon</h3>
                  <p className="text-neutral-600 mb-4">
                    Your information has been received. Our team will contact you within 24 hours to discuss how we can help reduce your waste by 30-40% and increase profits.
                  </p>
                  <p className="text-sm text-neutral-500">
                    Check your email at <span className="font-medium text-primary-500">{formData.email}</span> for confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Message */}
      <section className="bg-cta-500 py-4">
        <div className="container">
          <p className="text-center text-white font-medium">
            Every month you wait costs you RM 15,000-25,000 in preventable waste.
          </p>
        </div>
      </section>

      {/* Solutions - Outcome Focused */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4">Proven Solutions, Measurable Results</h2>
            <p className="text-body-lg text-neutral-600 max-w-3xl mx-auto">
              Each solution delivers specific, measurable outcomes. No fluff, just real savings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, idx) => (
              <div key={idx} className="card hover-lift">
                <h3 className="text-subtitle mb-3 text-primary-500">{solution.title}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-success-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-neutral-900">Outcome</div>
                      <div className="text-sm text-neutral-600">{solution.outcome}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-success-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-neutral-900">Result</div>
                      <div className="text-sm text-neutral-600">{solution.result}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-5 h-5 text-success-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-neutral-900">Savings</div>
                      <div className="text-sm text-neutral-600">{solution.savings}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-success-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-neutral-900">Timeline</div>
                      <div className="text-sm text-neutral-600">{solution.timeline}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/pricing')}
              className="btn-cta"
            >
              See Pricing & Packages
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
          </div>
        </div>
      </section>

      {/* Industry Data - Proof Over Claims */}
      <section className="section bg-neutral-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-headline mb-4">Backed by Industry Data</h2>
            <p className="text-body-lg text-neutral-600 max-w-3xl mx-auto">
              We don't make claims. We show you verified data from reputable sources.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {industryData.map((data, idx) => (
              <div key={idx} className="card-elevated text-center">
                <div className="text-5xl font-bold text-primary-500 mb-4">
                  {data.stat}
                </div>
                <p className="text-neutral-700 mb-4">
                  {data.description}
                </p>
                <a 
                  href={data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-500 hover:text-primary-700 font-medium"
                >
                  Source: {data.source} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="card-elevated bg-gradient-to-br from-primary-50 to-white border-2 border-primary-500">
              <div className="text-center mb-8">
                <h2 className="text-headline mb-4">The Cost of Doing Nothing</h2>
                <p className="text-body-lg text-neutral-600">
                  Simple math shows why waiting is expensive
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-neutral-600 mb-2">Monthly Waste Loss</div>
                  <div className="text-3xl font-bold text-error">RM 20,000-50,000</div>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-neutral-600 mb-2">Investment in Solution</div>
                  <div className="text-3xl font-bold text-neutral-900">RM 3,000-6,000</div>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-neutral-600 mb-2">Return on Investment</div>
                  <div className="text-3xl font-bold text-success-500">5-10x</div>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => {
                    const formSection = document.querySelector('.card-elevated');
                    formSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-cta"
                >
                  Calculate My Savings
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </button>
              </div>
            </div>
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  const formSection = document.querySelector('.card-elevated');
                  formSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-cta"
              >
                Get Your Free Audit
              </button>
              <button 
                onClick={() => navigate('/pricing')}
                className="btn-secondary"
              >
                View Pricing
              </button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-neutral-400">
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
      <footer className="border-t border-neutral-200 py-8">
        <div className="container">
          <div className="text-center text-sm text-neutral-600">
            <p className="mb-2">© 2025 Servora AI by Sheerssoft. All rights reserved.</p>
            <p className="text-xs text-neutral-500">
              Contact: <a href="mailto:a.basyir@sheerssoft.com" className="text-primary-500 hover:text-primary-700">a.basyir@sheerssoft.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
