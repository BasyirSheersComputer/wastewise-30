import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calendar,
  BarChart3,
  Target,
  Package
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

export default function DashboardHome() {
  const [timeRange, setTimeRange] = useState('week');

  // Key Metrics
  const metrics = [
    {
      id: 1,
      name: 'Waste Reduced',
      value: '32.4%',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingDown,
      color: 'success',
      description: 'vs last period',
      target: 'Target: 30-40%'
    },
    {
      id: 2,
      name: 'Monthly Savings',
      value: 'RM 18,450',
      change: '+RM 2,100',
      trend: 'up',
      icon: DollarSign,
      color: 'success',
      description: 'vs last month',
      target: 'Target: RM 15-25k'
    },
    {
      id: 3,
      name: 'Inventory Value',
      value: 'RM 45,200',
      change: '-5.3%',
      trend: 'down',
      icon: Package,
      color: 'primary',
      description: 'optimization',
      target: 'Optimal level'
    },
    {
      id: 4,
      name: 'Staff Efficiency',
      value: '94.2%',
      change: '+3.1%',
      trend: 'up',
      icon: Users,
      color: 'primary',
      description: 'waste logging',
      target: 'Target: >90%'
    }
  ];

  // Waste Trend Data
  const wasteTrendData = [
    { date: 'Mon', waste: 15.2, savings: 3200, target: 12 },
    { date: 'Tue', waste: 14.8, savings: 3400, target: 12 },
    { date: 'Wed', waste: 13.5, savings: 3800, target: 12 },
    { date: 'Thu', waste: 12.9, savings: 4100, target: 12 },
    { date: 'Fri', waste: 11.8, savings: 4500, target: 12 },
    { date: 'Sat', waste: 12.2, savings: 4300, target: 12 },
    { date: 'Sun', waste: 11.5, savings: 4600, target: 12 }
  ];

  // Category Performance
  const categoryData = [
    { category: 'Coffee Beans', waste: 8.2, target: 10, status: 'good' },
    { category: 'Milk Products', waste: 12.5, target: 10, status: 'warning' },
    { category: 'Pastries', waste: 6.8, target: 8, status: 'good' },
    { category: 'Syrups', waste: 4.2, target: 5, status: 'good' },
    { category: 'Packaging', waste: 3.1, target: 5, status: 'good' }
  ];

  // Recent Alerts
  const alerts = [
    {
      id: 1,
      type: 'success',
      title: 'Waste reduction target achieved',
      message: 'Successfully reduced waste by 32.4% this week',
      time: '2 hours ago',
      action: 'View Details'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Milk waste increasing',
      message: 'Milk waste up 12.5%, consider adjusting orders',
      time: '5 hours ago',
      action: 'Adjust Forecast'
    },
    {
      id: 3,
      type: 'info',
      title: 'Staff training completed',
      message: '8 staff members completed waste logging training',
      time: '1 day ago',
      action: 'View Report'
    }
  ];

  // Quick Actions
  const quickActions = [
    {
      id: 1,
      name: 'Log Waste',
      description: 'Record waste data',
      icon: TrendingDown,
      path: '/dashboard/waste'
    },
    {
      id: 2,
      name: 'Update Inventory',
      description: 'Manage stock levels',
      icon: Package,
      path: '/dashboard/inventory'
    },
    {
      id: 3,
      name: 'View Forecast',
      description: 'Demand predictions',
      icon: Target,
      path: '/dashboard/forecast'
    },
    {
      id: 4,
      name: 'Generate Report',
      description: 'Export analytics',
      icon: BarChart3,
      path: '/dashboard/reports'
    }
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back!</h1>
          <p className="text-neutral-600 mt-1">Here's what's happening with your waste management today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
            <Calendar className="w-4 h-4" />
            <span>Custom Range</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up' && metric.color === 'success';
          
          return (
            <div key={metric.id} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  metric.color === 'success' ? 'bg-success-50' : 'bg-primary-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    metric.color === 'success' ? 'text-success-500' : 'text-primary-500'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isPositive 
                    ? 'bg-success-50 text-success-700' 
                    : metric.trend === 'down' && metric.color === 'success'
                    ? 'bg-success-50 text-success-700'
                    : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{metric.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-neutral-600 mb-1">{metric.name}</h3>
                <p className="text-3xl font-bold text-neutral-900 mb-1">{metric.value}</p>
                <p className="text-xs text-neutral-500">{metric.description}</p>
                <p className="text-xs text-primary-600 font-medium mt-2">{metric.target}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waste Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Waste Reduction Trend</h2>
              <p className="text-sm text-neutral-600 mt-1">Daily waste percentage & savings</p>
            </div>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={wasteTrendData}>
              <defs>
                <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A7A7" stopOpacity={0.1}/>
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
                dataKey="waste" 
                stroke="#00A7A7" 
                strokeWidth={2}
                fill="url(#wasteGradient)" 
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#FF6B35" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm text-neutral-600">Actual Waste</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-cta-500"></div>
              <span className="text-sm text-neutral-600">Target (12%)</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-neutral-900">{action.name}</div>
                    <div className="text-xs text-neutral-500">{action.description}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Performance & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Category Performance</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {categoryData.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      item.status === 'good' ? 'text-success-600' : 'text-warning-600'
                    }`}>
                      {item.waste}%
                    </span>
                    {item.status === 'good' ? (
                      <CheckCircle2 className="w-4 h-4 text-success-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning-500" />
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.status === 'good' ? 'bg-success-500' : 'bg-warning-500'
                      }`}
                      style={{ width: `${(item.waste / item.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="absolute top-0 right-0 h-2 flex items-center">
                    <div className="w-0.5 h-4 bg-neutral-400"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>Current: {item.waste}%</span>
                  <span>Target: {item.target}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Recent Alerts</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              See All
            </button>
          </div>
          
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border ${
                  alert.type === 'success' 
                    ? 'bg-success-50 border-success-200' 
                    : alert.type === 'warning'
                    ? 'bg-warning-50 border-warning-200'
                    : 'bg-primary-50 border-primary-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    alert.type === 'success' 
                      ? 'bg-success-500' 
                      : alert.type === 'warning'
                      ? 'bg-warning-500'
                      : 'bg-primary-500'
                  }`}>
                    {alert.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-neutral-900 mb-1">{alert.title}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{alert.time}</span>
                      <button className={`text-xs font-medium ${
                        alert.type === 'success' 
                          ? 'text-success-700' 
                          : alert.type === 'warning'
                          ? 'text-warning-700'
                          : 'text-primary-700'
                      }`}>
                        {alert.action} →
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

