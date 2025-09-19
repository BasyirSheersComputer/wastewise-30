import React, { useState, useEffect } from 'react';
import { TrendingUp, Cloud, Calendar, BarChart3, AlertTriangle, CheckCircle, RefreshCw, Download, Settings, TrendingDown, Zap } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const DemandForecasting: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const forecastData = [
    { item: 'Espresso', current: 95, forecast: 102, confidence: 88, trend: 'up', category: 'Coffee' },
    { item: 'Latte', current: 88, forecast: 94, confidence: 85, trend: 'up', category: 'Coffee' },
    { item: 'Cappuccino', current: 82, forecast: 78, confidence: 79, trend: 'down', category: 'Coffee' },
    { item: 'Mocha', current: 75, forecast: 81, confidence: 83, trend: 'up', category: 'Coffee' },
    { item: 'American Coffee', current: 78, forecast: 85, confidence: 87, trend: 'up', category: 'Coffee' },
    { item: 'Flat White', current: 72, forecast: 68, confidence: 76, trend: 'down', category: 'Coffee' },
    { item: 'Croissant', current: 85, forecast: 92, confidence: 91, trend: 'up', category: 'Food' },
    { item: 'Chocolate Chip Cookie', current: 92, forecast: 89, confidence: 84, trend: 'down', category: 'Food' }
  ];

  const weatherImpact = {
    temperature: 28,
    condition: 'Sunny',
    humidity: 65,
    impact: 'Positive - Expect 18% increase in iced coffee and cold beverages',
    recommendations: [
      'Increase iced coffee inventory by 25%',
      'Stock up on cold brew and iced tea',
      'Prepare for increased demand in cold desserts'
    ]
  };

  const events = [
    { date: '2024-01-20', event: 'Coffee Festival KL', impact: '+35% coffee sales', type: 'positive' },
    { date: '2024-01-22', event: 'University Exam Week', impact: '+45% coffee/pastries', type: 'positive' },
    { date: '2024-01-25', event: 'Weekend Market Day', impact: '+30% breakfast items', type: 'positive' },
    { date: '2024-01-28', event: 'Public Holiday', impact: '+20% weekend traffic', type: 'positive' }
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fetch real forecast data from statistical models API
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetch(`/api/statistical-models/forecast?timePeriod=${selectedPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Update forecast data with real API data
            console.log('Forecast data updated:', data.data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    // Simulate PDF export
    console.log('Exporting forecast data...');
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demand Forecasting</h1>
          <p className="text-gray-600 mt-1">AI-powered demand predictions and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="day">Next Day</option>
            <option value="week">Next Week</option>
            <option value="month">Next Month</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </>
            )}
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Forecasted Orders</p>
              <p className="text-2xl font-bold text-gray-900">234</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12% from last week
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">Last 30 days average</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Forecast</p>
              <p className="text-2xl font-bold text-gray-900">$3,456</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">Based on current trends</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">Items need restocking</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Item Forecast</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed demand predictions for each menu item</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.item}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.current}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.forecast}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                        {item.confidence}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTrendIcon(item.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weather Impact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-600" />
              Weather Impact
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{weatherImpact.temperature}°C</div>
                <div className="text-sm text-gray-600">Temperature</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{weatherImpact.humidity}%</div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-yellow-800 mb-2">Impact Analysis</div>
              <div className="text-sm text-yellow-700">{weatherImpact.impact}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 mb-2">Recommendations</div>
              <ul className="space-y-1">
                {weatherImpact.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Events Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Upcoming Events
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900">{event.date}</div>
                  <div className="text-sm text-gray-700">{event.event}</div>
                </div>
                <div className={`text-sm font-medium ${
                  event.type === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {event.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <LLMRecommendations section="demand-forecasting" />
    </div>
  );
};

export default DemandForecasting;