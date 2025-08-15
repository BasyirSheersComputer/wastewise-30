import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Upload, 
  Download, 
  ArrowRight, 
  CheckCircle, 
  Play,
  SkipForward,
  FileText,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const WelcomeToTrial: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const dataConnectionOptions = [
    {
      id: 'api-integration',
      title: 'Connect Data Sources',
      description: 'Connect your existing POS, inventory, and accounting systems',
      icon: Database,
      features: [
        'Real-time data synchronization',
        'Automatic data updates',
        'Secure API connections',
        'Multiple system support'
      ],
      action: 'Connect Systems',
      color: 'bg-blue-500'
    },
    {
      id: 'csv-upload',
      title: 'Upload Data Manually',
      description: 'Upload your data using CSV files with our templates',
      icon: Upload,
      features: [
        'Download ready-to-use templates',
        'Bulk data import',
        'Data validation',
        'Immediate processing'
      ],
      action: 'Upload Data',
      color: 'bg-green-500'
    },
    {
      id: 'demo-data',
      title: 'Start with Demo Data',
      description: 'Explore the system with sample data to see how it works',
      icon: Play,
      features: [
        'Pre-populated sample data',
        'Realistic scenarios',
        'Instant insights',
        'No setup required'
      ],
      action: 'Start Demo',
      color: 'bg-purple-500'
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = async () => {
    if (!selectedOption) {
      toast.error('Please select an option to continue');
      return;
    }

    setIsProcessing(true);

    try {
      switch (selectedOption) {
        case 'api-integration':
          // Redirect to API integration setup
          navigate('/dashboard');
          toast.success('Redirecting to dashboard. You can connect data sources later.');
          break;
        
        case 'csv-upload':
          // Redirect to CSV upload page
          navigate('/csv-upload');
          break;
        
        case 'demo-data':
          // Load demo data and redirect to dashboard
          await loadDemoData();
          navigate('/dashboard');
          break;
        
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error processing selection:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadDemoData = async () => {
    try {
      // This would typically call an API to load demo data
      // For now, we'll just show a success message
      toast.success('Demo data loaded successfully!');
    } catch (error) {
      console.error('Error loading demo data:', error);
      toast.error('Failed to load demo data');
    }
  };

  const skipToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Welcome to Your 30-Day Trial!
          </h1>
          <p className="text-lg text-text-secondary mb-4">
            Let's get you started with WasteWise. Choose how you'd like to begin:
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Full access to all features for 30 days
            </span>
          </div>
        </div>

        {/* Data Connection Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dataConnectionOptions.map((option) => (
            <div
              key={option.id}
              className={`glass-card p-6 cursor-pointer transition-all duration-200 ${
                selectedOption === option.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:shadow-lg hover:scale-105'
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${option.color} bg-opacity-10`}>
                  <option.icon className={`w-6 h-6 ${option.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">
                  {option.title}
                </h3>
              </div>
              
              <p className="text-text-secondary mb-4">
                {option.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  {option.action}
                </span>
                {selectedOption === option.id && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Choose Your Data Source</h4>
                <p className="text-sm text-text-secondary">
                  Select how you want to import your data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Upload or Connect</h4>
                <p className="text-sm text-text-secondary">
                  Import your data or connect your systems
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium text-text-primary">Get Insights</h4>
                <p className="text-sm text-text-secondary">
                  View AI-powered recommendations and analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleContinue}
            disabled={!selectedOption || isProcessing}
            className="glass-button flex items-center gap-2 px-8 py-3 text-lg"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
            {isProcessing ? 'Processing...' : 'Continue'}
          </button>
          
          <button
            onClick={skipToDashboard}
            className="glass-button-secondary flex items-center gap-2 px-8 py-3 text-lg"
          >
            <SkipForward className="w-5 h-5" />
            Skip for Now
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary mb-2">
            Need help getting started?
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <button className="text-primary hover:text-primary/80 transition-colors">
              View Documentation
            </button>
            <span className="text-text-secondary">•</span>
            <button className="text-primary hover:text-primary/80 transition-colors">
              Contact Support
            </button>
            <span className="text-text-secondary">•</span>
            <button className="text-primary hover:text-primary/80 transition-colors">
              Watch Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeToTrial;
