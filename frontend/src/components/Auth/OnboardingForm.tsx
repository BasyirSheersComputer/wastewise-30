import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { apiService } from '../../services/api';
import { 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Users, 
  Building, 
  Coffee,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Award,
  BarChart3,
  Package,
  Trash2,
  Truck,
  Menu,
  FileText,
  Settings,
  Play
} from 'lucide-react';

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
    // Get current user and handle email confirmation flow
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Check if this is a newly confirmed user (email confirmation)
        if (user.email_confirmed_at) {
          // Check for pending signup data
          const pendingSignup = localStorage.getItem('pendingSignup');
          if (pendingSignup) {
            try {
              const { user: pendingUser, formData: pendingFormData } = JSON.parse(pendingSignup);
              
              // If this is the same user, create their profile
              if (pendingUser.id === user.id) {
                console.log('Processing email confirmation for user:', user.email);
                
                try {
                  const profileResult = await apiService.createUserProfile(user);
                  console.log('Profile created after email confirmation:', profileResult);
                  
                  // Clear pending signup data
                  localStorage.removeItem('pendingSignup');
                } catch (profileError) {
                  console.error('Profile creation error after email confirmation:', profileError);
                }
              }
            } catch (error) {
              console.error('Error processing pending signup:', error);
              localStorage.removeItem('pendingSignup');
            }
          }
        }
      } else {
        // Check if there's a pending signup (user clicked email link but not signed in)
        const pendingSignup = localStorage.getItem('pendingSignup');
        if (pendingSignup) {
          try {
            const { user: pendingUser } = JSON.parse(pendingSignup);
            console.log('Found pending signup, redirecting to login');
            
            // Show message to user
            alert('Please sign in with your email and password to complete your account setup.');
            navigate('/login');
            return;
          } catch (error) {
            console.error('Error processing pending signup:', error);
            localStorage.removeItem('pendingSignup');
          }
        }
        
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

      // Create or update user profile in database via backend API
      try {
        console.log('Updating user profile via backend API...', { userId: user.id, email: user.email });
        
        const profileData = {
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
        };

        // Use the debug endpoint to create/update profile
        const profileResult = await apiService.createDebugProfile(user.id, profileData);
        
        console.log('Profile updated successfully via backend:', profileResult);
      } catch (profileError) {
        console.error('Profile update error via backend:', profileError);
        // Log the error but continue to dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
              <Coffee className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to WasteWise AI!</h1>
          <p className="text-xl text-gray-600 mb-4">Let's set up your account for maximum waste reduction</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            Your 30-day free trial starts now!
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step >= stepNumber ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step >= stepNumber ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-20 h-1 mx-4 transition-all duration-300 ${step >= stepNumber + 1 ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
            <p className="text-lg text-gray-600">{getStepDescription()}</p>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Forecasting</h3>
            </div>
            <p className="text-sm text-gray-600">94% accurate demand prediction</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Waste Reduction</h3>
            </div>
            <p className="text-sm text-gray-600">35-45% guaranteed reduction</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Quick Setup</h3>
            </div>
            <p className="text-sm text-gray-600">Get started in minutes</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
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
              className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
            >
              {loading ? (
                'Setting up...'
              ) : step === 3 ? (
                <>
                  Complete Setup & Start Trial
                  <CheckCircle className="ml-2 w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Option */}
          {step === 1 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/demo')}
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch a quick demo first
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}