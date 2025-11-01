import React, { useState } from 'react';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';

interface LeadCaptureFormProps {
  source?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onSuccess?: () => void;
}

export default function LeadCaptureForm({ 
  source = 'lead_form',
  title = 'Get Your Free Waste Audit',
  subtitle = 'See exactly where you\'re losing RM 15,000-25,000 monthly',
  ctaText = 'Get Your Free Audit',
  onSuccess
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source,
          timestamp: new Date().toISOString(),
          timezone: 'Asia/Kuala_Lumpur'
        })
      });

      if (response.ok) {
        setFormSubmitted(true);
        
        // Send email notification
        await fetch('/api/leads/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'a.basyir@sheerssoft.com',
            subject: `New Lead: ${source} - ${formData.company}`,
            body: `
New lead from ${source}:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Company: ${formData.company}
Source: ${source}
Timestamp: ${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}

Next Steps:
1. Call within 24 hours
2. Conduct free waste audit
3. Present customized ROI projection
4. Close or nurture
            `.trim()
          })
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormError('Unable to submit form. Please try again or email us directly at a.basyir@sheerssoft.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formSubmitted) {
    return (
      <div className="card-elevated">
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
      </div>
    );
  }

  return (
    <div className="card-elevated">
      <h3 className="text-title mb-2">{title}</h3>
      <p className="text-neutral-600 mb-6">{subtitle}</p>
      
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        {formError && (
          <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn-cta w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : ctaText}
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
          <div className="flex items-center justify-center gap-2">
            <Check className="w-3 h-3 text-success-500" />
            <span>We'll call you within 24 hours</span>
          </div>
        </div>
      </form>
    </div>
  );
}

