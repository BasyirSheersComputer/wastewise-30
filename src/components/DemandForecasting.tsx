import React, { useState } from 'react';
import { TrendingUp, Cloud, Calendar, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const DemandForecasting: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const forecastData = [
    { item: 'Margherita Pizza', current: 45, forecast: 52, confidence: 85, trend: 'up' },
    { item: 'Caesar Salad', current: 28, forecast: 24, confidence: 78, trend: 'down' },
    { item: 'Chicken Parmesan', current: 35, forecast: 38, confidence: 92, trend: 'up' },
    { item: 'Pasta Carbonara', current: 22, forecast: 26, confidence: 73, trend: 'up' },
    { item: 'Beef Burger', current: 58, forecast: 49, confidence: 88, trend: 'down' }
  ];

  const weatherImpact = {
    temperature: 22,
    condition: 'Sunny',
    humidity: 45,
    impact: 'Positive - Expect 15% increase in cold drinks and salads'
  };

  const events = [
    { date: '2024-01-20', event: 'Local Food Festival', impact: '+25% expected' },
    { date: '2024-01-22', event: 'University Exam Week', impact: '+40% coffee/snacks' },
    { date: '2024-01-25', event: 'Weekend Sports Event', impact: '+30% burgers/beer' }
  ];

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Demand Forecasting</h1>
        <div className="flex space-x-md">
          <select
            className="glass-input"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="day">Next Day</option>
            <option value="week">Next Week</option>
            <option value="month">Next Month</option>
          </select>
          <button className="glass-button">
            Refresh Forecast
          </button>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Forecasted Orders</p>
              <p className="text-xl font-semibold text-text-primary">234</p>
            </div>
            <TrendingUp className="text-success" size={20} />
          </div>
          <p className="text-sm text-success mt-sm">+12% from last week</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Forecast Accuracy</p>
              <p className="text-xl font-semibold text-text-primary">87%</p>
            </div>
            <BarChart3 className="text-primary" size={20} />
          </div>
          <p className="text-sm text-primary mt-sm">Last 30 days average</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Revenue Forecast</p>
              <p className="text-xl font-semibold text-text-primary">$3,456</p>
            </div>
            <TrendingUp className="text-accent" size={20} />
          </div>
          <p className="text-sm text-accent mt-sm">Based on current trends</p>
        </div>
      </div>

      {/* Weather Impact */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md flex items-center">
          <Cloud className="mr-sm" size={18} />
          Weather Impact Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="space-y-md">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Temperature:</span>
              <span className="text-sm font-medium text-text-primary">{weatherImpact.temperature}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Condition:</span>
              <span className="text-sm font-medium text-text-primary">{weatherImpact.condition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary">Humidity:</span>
              <span className="text-sm font-medium text-text-primary">{weatherImpact.humidity}%</span>
            </div>
          </div>
          <div className="bg-success/10 p-md rounded-md">
            <p className="text-sm font-medium text-success">Forecast Impact</p>
            <p className="text-sm text-success/80 mt-xs">{weatherImpact.impact}</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md flex items-center">
          <Calendar className="mr-sm" size={18} />
          Upcoming Events Impact
        </h3>
        <div className="space-y-md">
          {events.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-md bg-secondary rounded-md">
              <div>
                <p className="text-sm font-medium text-text-primary">{event.event}</p>
                <p className="text-xs text-text-secondary">{event.date}</p>
              </div>
              <span className="text-sm font-medium text-primary">{event.impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Demand Forecast Table */}
      <div className="glass-table">
        <div className="px-lg py-md border-b border-border">
          <h3 className="text-md font-semibold text-text-primary">Item Demand Forecast</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="glass-table-header">
              <tr>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Item
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Current Orders
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Forecasted Orders
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Action Required
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {forecastData.map((item, index) => (
                <tr key={index} className="hover:bg-white/40 transition-default">
                  <td className="px-lg py-md whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{item.item}</div>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.current}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.forecast}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-secondary rounded-full h-2 mr-sm">
                        <div
                          className="bg-primary h-2 rounded-full transition-default"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-primary">{item.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    {item.trend === 'up' ? (
                      <TrendingUp size={14} className="text-success" />
                    ) : (
                      <TrendingUp size={14} className="text-error transform rotate-180" />
                    )}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    {item.confidence > 80 ? (
                      <CheckCircle size={14} className="text-success" />
                    ) : (
                      <AlertTriangle size={14} className="text-warning" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <LLMRecommendations section="demand" />
    </div>
  );
};

export default DemandForecasting;