import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Sparkles, TrendingDown, Users, BarChart3 } from 'lucide-react';

export default function CheckoutSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard after 10 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const nextSteps = [
    {
      id: 1,
      icon: Users,
      title: 'Complete Onboarding',
      description: 'Set up your outlets and team members',
      time: '5 minutes',
      action: 'Start Setup'
    },
    {
      id: 2,
      icon: TrendingDown,
      title: 'Log Your First Waste',
      description: 'Start tracking to see immediate insights',
      time: '2 minutes',
      action: 'Log Waste'
    },
    {
      id: 3,
      icon: BarChart3,
      title: 'View Your Dashboard',
      description: 'Explore your analytics and metrics',
      time: '3 minutes',
      action: 'Go to Dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-lg font-bold text-neutral-900">Servora AI</span>
          </div>
        </div>
      </div>

      {/* Success Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Welcome to Servora AI!
          </h1>
          
          <p className="text-xl text-neutral-600 mb-2">
            Your payment was successful
          </p>
          
          <p className="text-neutral-600">
            You're now on the <span className="font-medium text-primary-600">Growth System</span> plan
          </p>
        </div>

        {/* What Happens Next */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold text-neutral-900">What Happens Next</h2>
          </div>

          <div className="space-y-4">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start gap-4 p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{step.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">{step.time}</span>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        {step.action} →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-cta"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </button>
          
          <button
            onClick={() => navigate('/dashboard/settings')}
            className="btn-secondary"
          >
            Complete Profile Setup
          </button>
        </div>

        {/* Confirmation Email Notice */}
        <div className="text-center text-sm text-neutral-600">
          <p>A confirmation email has been sent to your inbox.</p>
          <p className="mt-2">
            Need help? Email us at <a href="mailto:a.basyir@sheerssoft.com" className="text-primary-600 hover:text-primary-700 font-medium">a.basyir@sheerssoft.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

