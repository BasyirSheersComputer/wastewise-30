import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Download,
  Target,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Zap,
  Clock
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function ForecastDashboard() {
  const [forecastPeriod, setForecastPeriod] = useState('7days');
  const [selectedProduct, setSelectedProduct] = useState('all');

  // Forecast Accuracy Metrics
  const metrics = [
    {
      id: 1,
      name: 'Forecast Accuracy',
      value: '92.8%',
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'success',
      description: 'Last 30 days'
    },
    {
      id: 2,
      name: 'Predicted Demand',
      value: '2,845',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'primary',
      description: 'Next 7 days'
    },
    {
      id: 3,
      name: 'Stock Coverage',
      value: '8.5 days',
      change: '-0.5 days',
      trend: 'down',
      icon: Clock,
      color: 'warning',
      description: 'Current inventory'
    },
    {
      id: 4,
      name: 'Potential Savings',
      value: 'RM 3,200',
      change: '+RM 450',
      trend: 'up',
      icon: BarChart3,
      color: 'success',
      description: 'Waste prevention'
    }
  ];

  // Demand Forecast Data (7 days)
  const forecastData = [
    { date: 'Mon', actual: 420, forecast: 425, confidence: [395, 455], historical: 410 },
    { date: 'Tue', actual: 385, forecast: 390, confidence: [365, 415], historical: 395 },
    { date: 'Wed', actual: null, forecast: 445, confidence: [420, 470], historical: 440 },
    { date: 'Thu', actual: null, forecast: 410, confidence: [385, 435], historical: 405 },
    { date: 'Fri', actual: null, forecast: 520, confidence: [490, 550], historical: 510 },
    { date: 'Sat', actual: null, forecast: 580, confidence: [545, 615], historical: 565 },
    { date: 'Sun', actual: null, forecast: 490, confidence: [460, 520], historical: 480 }
  ];

  // Product Forecasts
  const productForecasts = [
    {
      id: 1,
      name: 'Latte',
      category: 'Coffee',
      currentDemand: 450,
      forecastDemand: 485,
      change: '+7.8%',
      trend: 'up',
      accuracy: 94.2,
      stockDays: 6.5,
      status: 'good',
      recommendation: 'Increase production by 8%'
    },
    {
      id: 2,
      name: 'Cappuccino',
      category: 'Coffee',
      currentDemand: 320,
      forecastDemand: 295,
      change: '-7.8%',
      trend: 'down',
      accuracy: 91.5,
      stockDays: 9.2,
      status: 'good',
      recommendation: 'Reduce stock by 10%'
    },
    {
      id: 3,
      name: 'Croissant',
      category: 'Pastries',
      currentDemand: 180,
      forecastDemand: 220,
      change: '+22.2%',
      trend: 'up',
      accuracy: 88.3,
      stockDays: 4.2,
      status: 'warning',
      recommendation: 'Order additional stock urgently'
    },
    {
      id: 4,
      name: 'Espresso',
      category: 'Coffee',
      currentDemand: 280,
      forecastDemand: 285,
      change: '+1.8%',
      trend: 'up',
      accuracy: 96.1,
      stockDays: 8.1,
      status: 'good',
      recommendation: 'Maintain current levels'
    },
    {
      id: 5,
      name: 'Muffin',
      category: 'Pastries',
      currentDemand: 150,
      forecastDemand: 135,
      change: '-10.0%',
      trend: 'down',
      accuracy: 89.7,
      stockDays: 11.5,
      status: 'overstocked',
      recommendation: 'Reduce orders for next week'
    }
  ];

  // Forecast Insights
  const insights = [
    {
      id: 1,
      type: 'opportunity',
      title: 'Weekend Demand Surge Expected',
      message: 'Forecast shows 25% increase in demand for Sat-Sun. Prepare additional stock.',
      impact: 'High',
      action: 'Adjust Orders'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Croissant Stock Shortage Risk',
      message: 'Current stock covers only 4.2 days vs forecasted 22% demand increase.',
      impact: 'High',
      action: 'Order Now'
    },
    {
      id: 3,
      type: 'success',
      title: 'Cappuccino Overstock Prevented',
      message: 'Forecast-based adjustment saved RM 450 in potential waste this week.',
      impact: 'Medium',
      action: 'View Details'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success-50 text-success-700';
      case 'warning': return 'bg-warning/10 text-warning';
      case 'overstocked': return 'bg-primary-50 text-primary-700';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Demand Forecasting</h1>
          <p className="text-neutral-600 mt-1">AI-powered predictions to optimize inventory and reduce waste</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="7days">Next 7 Days</option>
            <option value="14days">Next 14 Days</option>
            <option value="30days">Next 30 Days</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Export Forecast</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <div key={metric.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  metric.color === 'success' ? 'bg-success-50' :
                  metric.color === 'warning' ? 'bg-warning/10' :
                  'bg-primary-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    metric.color === 'success' ? 'text-success-500' :
                    metric.color === 'warning' ? 'text-warning' :
                    'text-primary-500'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  metric.trend === 'up' && metric.color === 'success'
                    ? 'bg-success-50 text-success-700'
                    : metric.trend === 'down' && metric.color === 'warning'
                    ? 'bg-success-50 text-success-700'
                    : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3 rotate-180" />
                  )}
                  <span>{metric.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-1">{metric.name}</h3>
                <p className="text-3xl font-bold text-neutral-900 mb-1">{metric.value}</p>
                <p className="text-xs text-neutral-500">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">7-Day Demand Forecast</h2>
            <p className="text-sm text-neutral-600 mt-1">AI prediction with 92.8% accuracy</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-neutral-400"></div>
              <span className="text-neutral-600">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-neutral-600">Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-cta-500"></div>
              <span className="text-neutral-600">Historical</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A7A7" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#00A7A7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis dataKey="date" stroke="#737373" fontSize={12} />
            <YAxis stroke="#737373" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="#00A7A7" 
              strokeWidth={2}
              fill="url(#forecastGradient)" 
              name="Forecast"
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#737373" 
              strokeWidth={2}
              dot={{ fill: '#737373', r: 4 }}
              name="Actual"
            />
            <Line 
              type="monotone" 
              dataKey="historical" 
              stroke="#FF6B35" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Historical Avg"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Product Forecasts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Forecasts Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Product Forecasts</h2>
          
          <div className="space-y-3">
            {productForecasts.map((product) => (
              <div key={product.id} className="p-4 rounded-lg border border-neutral-200 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
                      <span className="text-xs text-neutral-500">• {product.category}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">{product.recommendation}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    product.trend === 'up' ? 'bg-success-50 text-success-700' : 'bg-primary-50 text-primary-700'
                  }`}>
                    {product.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3 rotate-180" />
                    )}
                    <span>{product.change}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-neutral-500">Current</p>
                    <p className="font-medium text-neutral-900">{product.currentDemand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Forecast</p>
                    <p className="font-medium text-primary-600">{product.forecastDemand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Accuracy</p>
                    <p className="font-medium text-neutral-900">{product.accuracy}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Stock</p>
                    <p className={`font-medium ${
                      product.stockDays < 5 ? 'text-error' : 
                      product.stockDays > 10 ? 'text-warning' : 
                      'text-success-600'
                    }`}>
                      {product.stockDays} days
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Insights */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Forecast Insights</h2>
          
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-4 rounded-lg border-2 ${
                insight.type === 'opportunity' ? 'border-success-200 bg-success-50' :
                insight.type === 'warning' ? 'border-warning/20 bg-warning/5' :
                'border-primary-200 bg-primary-50'
              }`}>
                <div className="flex items-start gap-3 mb-3">
                  {insight.type === 'opportunity' ? (
                    <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                  ) : insight.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 mb-1">{insight.title}</h3>
                    <p className="text-xs text-neutral-600 mb-2">{insight.message}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        insight.impact === 'High' ? 'text-error' : 'text-warning'
                      }`}>
                        {insight.impact} Impact
                      </span>
                      <button className={`text-xs font-medium ${
                        insight.type === 'opportunity' ? 'text-success-700' :
                        insight.type === 'warning' ? 'text-warning' :
                        'text-primary-700'
                      }`}>
                        {insight.action} →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

