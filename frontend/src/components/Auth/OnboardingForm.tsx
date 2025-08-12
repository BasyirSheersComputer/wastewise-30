import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { CheckCircle, ArrowRight, Clock, Calendar, Users, Building } from 'lucide-react';

interface OnboardingData {
  businessType: string;
  locations: number;
  annualRevenue: string;
  primaryGoals: string[];
  dataSources: string[];
  teamSize: string;
  timezone: string;
}

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'catering', label: 'Catering' },
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'other', label: 'Other' }
];

const primaryGoals = [
  { value: 'reduce_waste', label: 'Reduce food waste' },
  { value: 'cut_costs', label: 'Cut operational costs' },
  { value: 'improve_efficiency', label: 'Improve efficiency' },
  { value: 'better_analytics', label: 'Better analytics & reporting' },
  { value: 'compliance', label: 'Regulatory compliance' },
  { value: 'sustainability', label: 'Sustainability goals' }
];

const dataSources = [
  { value: 'pos_system', label: 'POS System' },
  { value: 'inventory_management', label: 'Inventory Management' },
  { value: 'accounting_software', label: 'Accounting Software' },
  { value: 'manual_tracking', label: 'Manual Tracking' },
  { value: 'supplier_data', label: 'Supplier Data' },
  { value: 'none', label: 'No existing system' }
];

const teamSizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '200+', label: '200+ employees' }
];

export default function OnboardingForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [trialDays, setTrialDays] = useState(30);
  const [formData, setFormData] = useState<OnboardingData>({
    businessType: '',
    locations: 1,
    annualRevenue: '',
    primaryGoals: [],
    dataSources: [],
    teamSize: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    };
    getUser();
  }, [navigate]);

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter(g => g !== goal)
        : [...prev.primaryGoals, goal]
    }));
  };

  const handleDataSourceToggle = (source: string) => {
    setFormData(prev => ({
      ...prev,
      dataSources: prev.dataSources.includes(source)
        ? prev.dataSources.filter(s => s !== source)
        : [...prev.dataSources, source]
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Create or update user profile in database
      const { error: profileError } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        company_name: user.user_metadata?.company_name || '',
        company_size: user.user_metadata?.company_size || '',
        primary_pain: user.user_metadata?.primary_pain || '',
        phone_number: user.user_metadata?.phone_number || '',
        business_type: formData.businessType,
        locations: formData.locations,
        annual_revenue: formData.annualRevenue,
        primary_goals: formData.primaryGoals,
        data_sources: formData.dataSources,
        team_size: formData.teamSize,
        timezone: formData.timezone,
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial',
        subscription_plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id' // Handle case where profile already exists
      });

      if (profileError) {
        console.error('Profile update error:', profileError);
        // Log the error but continue to dashboard
      } else {
        console.log('Profile updated successfully');
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      // Still navigate to dashboard even if there's an error
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Business Information';
      case 2: return 'Goals & Data Sources';
      case 3: return 'Team & Setup';
      default: return 'Onboarding';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Tell us about your business to personalize your experience';
      case 2: return 'What are your primary goals and current data sources?';
      case 3: return 'Final setup details for your team';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to WasteWise!</h1>
          <p className="text-gray-600">Let's set up your account for the best experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step >= stepNumber + 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">{getStepTitle()}</h2>
            <p className="text-gray-600 mt-1">{getStepDescription()}</p>
          </div>
        </div>

        {/* Trial Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Your 30-day free trial starts now!
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Step 1: Business Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your business type</option>
                  {businessTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Locations
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.locations}
                  onChange={(e) => handleInputChange('locations', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue (Optional)
                </label>
                <select
                  value={formData.annualRevenue}
                  onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select revenue range</option>
                  <option value="under_100k">Under $100K</option>
                  <option value="100k_500k">$100K - $500K</option>
                  <option value="500k_1m">$500K - $1M</option>
                  <option value="1m_5m">$1M - $5M</option>
                  <option value="5m_10m">$5M - $10M</option>
                  <option value="over_10m">Over $10M</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Goals & Data Sources */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Goals (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {primaryGoals.map(goal => (
                    <label key={goal.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.primaryGoals.includes(goal.value)}
                        onChange={() => handleGoalToggle(goal.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">{goal.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Data Sources (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataSources.map(source => (
                    <label key={source.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dataSources.includes(source.value)}
                        onChange={() => handleDataSourceToggle(source.value)}
                        className="mr-3"
                      />
                      <span className="text-sm">{source.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team & Setup */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Size
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select team size</option>
                  {teamSizes.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Setup Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Business:</strong> {businessTypes.find(t => t.value === formData.businessType)?.label || 'Not specified'}</p>
                  <p><strong>Locations:</strong> {formData.locations}</p>
                  <p><strong>Goals:</strong> {formData.primaryGoals.length} selected</p>
                  <p><strong>Data Sources:</strong> {formData.dataSources.length} selected</p>
                  <p><strong>Team Size:</strong> {teamSizes.find(s => s.value === formData.teamSize)?.label || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Setting up...'
              ) : step === 3 ? (
                <>
                  Complete Setup
                  <CheckCircle className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}