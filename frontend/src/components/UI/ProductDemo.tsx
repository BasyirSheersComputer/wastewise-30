import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Package, 
  Trash2, 
  Users, 
  DollarSign,
  Coffee,
  Target,
  Activity,
  Calculator,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Zap,
  Award,
  Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  component: React.ReactNode;
  highlights: string[];
  action?: () => void;
}

const ProductDemo: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [demoProgress, setDemoProgress] = useState(0);

  // Demo data for realistic scenarios
  const demoKPIs = [
    {
      title: 'Recipe Yield Accuracy',
      value: '94.2%',
      change: '+8.7%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      description: 'Actual vs Expected Output'
    },
    {
      title: 'Raw Material Waste',
      value: '8.3%',
      change: '-12.1%',
      trend: 'down',
      icon: Trash2,
      color: 'text-red-600',
      description: 'Coffee Beans, Milk, Syrups'
    },
    {
      title: 'COGS per Cup',
      value: '$1.85',
      change: '-0.35',
      trend: 'down',
      icon: Calculator,
      color: 'text-blue-600',
      description: 'Cost of Goods Sold'
    },
    {
      title: 'Staff Efficiency',
      value: '96.8%',
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      description: 'Portioning & Waste Control'
    }
  ];

  const demoYieldData = [
    { recipe: 'Latte', expected: 40, actual: 38, waste: 2, cost: 1.85, date: 'Mon' },
    { recipe: 'Cappuccino', expected: 35, actual: 34, waste: 1, cost: 1.65, date: 'Tue' },
    { recipe: 'Espresso', expected: 50, actual: 49, waste: 1, cost: 1.45, date: 'Wed' },
    { recipe: 'Americano', expected: 30, actual: 29, waste: 1, cost: 1.55, date: 'Thu' },
    { recipe: 'Mocha', expected: 25, actual: 24, waste: 1, cost: 2.15, date: 'Fri' }
  ];

  const demoWasteData = [
    { name: 'Coffee Beans', value: 35, color: '#8B4513' },
    { name: 'Milk', value: 25, color: '#F5F5DC' },
    { name: 'Syrups', value: 20, color: '#FF6B6B' },
    { name: 'Cups/Lids', value: 20, color: '#4ECDC4' }
  ];

  const demoAlerts = [
    {
      id: 1,
      type: 'success',
      message: 'Latte yield improved to 95% after AI optimization',
      timestamp: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      message: 'New demand forecast predicts 15% increase in weekend sales',
      timestamp: '4 hours ago',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'success',
      message: 'Coffee beans waste reduced by 23% this week',
      timestamp: '6 hours ago',
      priority: 'low'
    }
  ];

  const demoSteps: DemoStep[] = [
    {
      id: 'overview',
      title: 'Welcome to Servora AI',
      description: 'See how Malaysia\'s top coffee chains save RM 50K-200K monthly with AI-powered waste reduction',
      duration: 5000,
      component: (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
              <Coffee className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Servora AI Platform</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your coffee chain operations with AI-powered demand forecasting, 
            real-time waste tracking, and automated inventory management.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-sm text-gray-600">Forecast Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">-45%</div>
              <div className="text-sm text-gray-600">Waste Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">RM 150K</div>
              <div className="text-sm text-gray-600">Monthly Savings</div>
            </div>
          </div>
        </div>
      ),
      highlights: [
        'AI-powered demand forecasting with 94% accuracy',
        'Real-time waste tracking across all locations',
        'Automated inventory management and reordering',
        '35-45% waste reduction guaranteed'
      ]
    },
    {
      id: 'dashboard',
      title: 'Operational Intelligence Dashboard',
      description: 'Real-time insights into your coffee chain performance with AI-powered analytics',
      duration: 6000,
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {demoKPIs.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                      <p className="text-xl font-semibold text-gray-900">{kpi.value}</p>
                      <p className="text-xs text-gray-500">{kpi.description}</p>
                    </div>
                    <div className={`p-2 rounded-md ${kpi.color.replace('text-', 'bg-')} bg-opacity-10`}>
                      <Icon size={20} className={kpi.color} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    {kpi.trend === 'up' ? (
                      <TrendingUp size={14} className="text-green-500 mr-1" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      highlights: [
        'Real-time KPI monitoring across all locations',
        'AI-powered trend analysis and predictions',
        'Automated alerts for performance issues',
        'Comprehensive operational insights'
      ]
    },
    {
      id: 'forecasting',
      title: 'AI Demand Forecasting',
      description: 'Predict exact ingredient needs 7 days ahead with 94% accuracy',
      duration: 7000,
      component: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recipe Yield Tracking</h3>
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={demoYieldData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recipe" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expected" fill="#3B82F6" name="Expected" />
                  <Bar dataKey="actual" fill="#10B981" name="Actual" />
                  <Bar dataKey="waste" fill="#EF4444" name="Waste" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">AI Predictions</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 15% increase in weekend latte demand</li>
                <li>• 8% decrease in weekday cappuccino orders</li>
                <li>• Optimal milk ordering schedule</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Automated Actions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Auto-adjust inventory levels</li>
                <li>• Schedule staff based on demand</li>
                <li>• Optimize ingredient ordering</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      highlights: [
        '94% accurate demand forecasting',
        'Automated inventory adjustments',
        'Staff scheduling optimization',
        'Ingredient ordering automation'
      ]
    },
    {
      id: 'waste-tracking',
      title: 'Real-Time Waste Tracking',
      description: 'Track every gram of waste with automated alerts and root cause analysis',
      duration: 6000,
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Analysis</h3>
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={demoWasteData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {demoWasteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Alerts</h3>
              <div className="space-y-3">
                {demoAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${
                      alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <CheckCircle size={12} className={
                        alert.type === 'success' ? 'text-green-600' : 'text-blue-600'
                      } />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
      highlights: [
        'Real-time waste monitoring',
        'Automated alerts and notifications',
        'Root cause analysis',
        '35-45% waste reduction'
      ]
    },
    {
      id: 'roi',
      title: 'Guaranteed ROI Results',
      description: 'See how top coffee chains achieve RM 50K-200K monthly savings',
      duration: 5000,
      component: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Monthly Savings Achieved</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">RM 180K</div>
                <div className="text-sm text-gray-600">Starbucks Malaysia</div>
                <div className="text-xs text-green-600">38% waste reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">RM 120K</div>
                <div className="text-sm text-gray-600">Secret Recipe Group</div>
                <div className="text-xs text-blue-600">42% waste reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">RM 85K</div>
                <div className="text-sm text-gray-600">Urban Coffee Co.</div>
                <div className="text-xs text-purple-600">35% waste reduction</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-2">Before Servora AI</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• RM 50K-200K monthly waste</li>
                <li>• Manual inventory tracking</li>
                <li>• Reactive waste management</li>
                <li>• Poor demand forecasting</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-2">After Servora AI</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 35-45% waste reduction</li>
                <li>• Automated inventory control</li>
                <li>• Proactive waste prevention</li>
                <li>• 94% accurate forecasting</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      highlights: [
        'RM 50K-200K monthly savings',
        '35-45% waste reduction guaranteed',
        'ROI in 30 days or money back',
        'Proven results with top chains'
      ]
    },
    {
      id: 'cta',
      title: 'Ready to Transform Your Coffee Chain?',
      description: 'Start your 30-day free trial and see the results for yourself',
      duration: 4000,
      component: (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-full">
              <Zap className="w-16 h-16 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Start Your Free Trial Today</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join Starbucks Malaysia, Secret Recipe, and Urban Coffee Co. in saving millions 
            with AI-powered waste reduction. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 font-semibold text-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg hover:bg-purple-50 font-semibold text-lg"
            >
              View Pricing
            </button>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">30-day free trial • No credit card required</span>
            </div>
          </div>
        </div>
      ),
      highlights: [
        '30-day free trial',
        'No credit card required',
        'Full access to all features',
        'Expert onboarding support'
      ]
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setDemoProgress(prev => {
          const newProgress = prev + (100 / (demoSteps[currentStep].duration / 100));
          if (newProgress >= 100) {
            if (currentStep < demoSteps.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return newProgress;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, demoSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setDemoProgress(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setDemoProgress(0);
    }
  };

  const handleSkipToEnd = () => {
    setCurrentStep(demoSteps.length - 1);
    setDemoProgress(100);
    setIsPlaying(false);
  };

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Coffee className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Servora AI Demo</h1>
              <p className="text-sm text-gray-600">Interactive product demonstration</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-100 h-1">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-100"
            style={{ width: `${demoProgress}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
            {/* Main Demo Area */}
            <div className="lg:col-span-2 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
                  <p className="text-gray-600">{currentStepData.description}</p>
                </div>
                {currentStepData.component}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 bg-gray-50 p-6 border-l border-gray-200 overflow-y-auto">
              {/* Controls */}
              <div className="mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="p-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentStep === demoSteps.length - 1}
                    className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleSkipToEnd}
                  className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Skip to end
                </button>
              </div>

              {/* Step Navigation */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Demo Steps</h3>
                <div className="space-y-2">
                  {demoSteps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(index);
                        setDemoProgress(0);
                        setIsPlaying(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentStep
                          ? 'bg-purple-100 border border-purple-200 text-purple-800'
                          : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{step.title}</span>
                        {index === currentStep && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Highlights */}
              {showHighlights && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Key Highlights</h3>
                  <div className="space-y-2">
                    {currentStepData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full border border-purple-600 text-purple-600 py-3 px-4 rounded-lg hover:bg-purple-50 font-medium"
                >
                  View Pricing
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-100 font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDemo;
