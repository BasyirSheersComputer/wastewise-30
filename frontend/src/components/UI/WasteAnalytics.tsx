import React, { useState } from 'react';
import { 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  CheckCircle2,
  Package,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function WasteAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Waste by category data
  const wasteByCategory = [
    { name: 'Coffee Beans', value: 28, cost: 4200, color: '#00A7A7' },
    { name: 'Milk Products', value: 22, cost: 3300, color: '#FF6B35' },
    { name: 'Pastries', value: 18, cost: 2700, color: '#2D9F4B' },
    { name: 'Syrups', value: 15, cost: 2250, color: '#F59E0B' },
    { name: 'Packaging', value: 10, cost: 1500, color: '#737373' },
    { name: 'Other', value: 7, cost: 1050, color: '#A3A3A3' }
  ];

  // Daily waste trend
  const dailyWasteData = [
    { date: 'Mon', waste: 15.2, cost: 2280, items: 45 },
    { date: 'Tue', waste: 14.8, cost: 2220, items: 42 },
    { date: 'Wed', waste: 13.5, cost: 2025, items: 38 },
    { date: 'Thu', waste: 12.9, cost: 1935, items: 36 },
    { date: 'Fri', waste: 11.8, cost: 1770, items: 33 },
    { date: 'Sat', waste: 12.2, cost: 1830, items: 34 },
    { date: 'Sun', waste: 11.5, cost: 1725, items: 32 }
  ];

  // Top waste items
  const topWasteItems = [
    { item: 'Croissants', category: 'Pastries', amount: '4.2 kg', cost: 'RM 420', trend: 'up', change: '+12%' },
    { item: 'Whole Milk', category: 'Dairy', amount: '8.5 L', cost: 'RM 340', trend: 'down', change: '-5%' },
    { item: 'Arabica Beans', category: 'Coffee', amount: '2.1 kg', cost: 'RM 315', trend: 'up', change: '+8%' },
    { item: 'Caramel Syrup', category: 'Syrups', amount: '1.8 L', cost: 'RM 270', trend: 'down', change: '-3%' },
    { item: 'Bagels', category: 'Pastries', amount: '3.4 kg', cost: 'RM 238', trend: 'down', change: '-10%' }
  ];

  // Reduction opportunities
  const opportunities = [
    {
      category: 'Coffee Beans',
      current: '8.2%',
      target: '5.0%',
      potential: 'RM 1,200/month',
      priority: 'high',
      action: 'Adjust grinding portions'
    },
    {
      category: 'Milk Products',
      current: '12.5%',
      target: '8.0%',
      potential: 'RM 980/month',
      priority: 'high',
      action: 'Review expiry management'
    },
    {
      category: 'Pastries',
      current: '6.8%',
      target: '5.0%',
      potential: 'RM 450/month',
      priority: 'medium',
      action: 'Optimize daily orders'
    }
  ];

  const totalWasteValue = wasteByCategory.reduce((sum, item) => sum + item.cost, 0);
  const totalWastePercentage = wasteByCategory.reduce((sum, item) => sum + item.value, 0) / wasteByCategory.length;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Waste Analytics</h1>
          <p className="text-neutral-600 mt-1">Track, analyze, and reduce waste across all categories</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-error" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
              <ArrowDown className="w-3 h-3" />
              <span>-8.2%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Total Waste</p>
          <p className="text-3xl font-bold text-neutral-900">{totalWastePercentage.toFixed(1)}%</p>
          <p className="text-xs text-neutral-500 mt-2">vs last period</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-warning" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
              <ArrowDown className="w-3 h-3" />
              <span>-RM 890</span>
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Waste Cost</p>
          <p className="text-3xl font-bold text-neutral-900">RM {totalWasteValue.toLocaleString()}</p>
          <p className="text-xs text-neutral-500 mt-2">this period</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-success-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-500" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700">
              <ArrowUp className="w-3 h-3" />
              <span>+RM 2,630</span>
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Money Saved</p>
          <p className="text-3xl font-bold text-neutral-900">RM 18,450</p>
          <p className="text-xs text-neutral-500 mt-2">this month</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-500" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
              <span>260 items</span>
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600 mb-1">Items Tracked</p>
          <p className="text-3xl font-bold text-neutral-900">2,847</p>
          <p className="text-xs text-neutral-500 mt-2">this period</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Daily Waste Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyWasteData}>
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
              <Line type="monotone" dataKey="waste" stroke="#00A7A7" strokeWidth={2} dot={{ fill: '#00A7A7', r: 4 }} />
              <Line type="monotone" dataKey="cost" stroke="#FF6B35" strokeWidth={2} dot={{ fill: '#FF6B35', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm text-neutral-600">Waste %</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cta-500"></div>
              <span className="text-sm text-neutral-600">Cost (RM)</span>
            </div>
          </div>
        </div>

        {/* Waste by Category Pie */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Waste by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={wasteByCategory}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {wasteByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {wasteByCategory.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-neutral-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Waste Items */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Top Waste Items</h2>
          <div className="space-y-3">
            {topWasteItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-primary-500 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-900">{item.item}</span>
                    <span className="text-xs text-neutral-500">• {item.category}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-neutral-600">{item.amount}</span>
                    <span className="text-xs font-medium text-error">{item.cost}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  item.trend === 'up' 
                    ? 'bg-error/10 text-error' 
                    : 'bg-success-50 text-success-700'
                }`}>
                  {item.trend === 'up' ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  <span>{item.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reduction Opportunities */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Reduction Opportunities</h2>
          <div className="space-y-4">
            {opportunities.map((opp, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                opp.priority === 'high' 
                  ? 'border-error/20 bg-error/5' 
                  : 'border-warning/20 bg-warning/5'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900">{opp.category}</h3>
                    <p className="text-xs text-neutral-600 mt-1">{opp.action}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    opp.priority === 'high' 
                      ? 'bg-error text-white' 
                      : 'bg-warning text-white'
                  }`}>
                    {opp.priority}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-neutral-500">Current</p>
                    <p className="text-sm font-medium text-neutral-900">{opp.current}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Target</p>
                    <p className="text-sm font-medium text-success-600">{opp.target}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Potential</p>
                    <p className="text-sm font-medium text-primary-600">{opp.potential}</p>
                  </div>
                </div>
                
                <button className="w-full py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                  Create Action Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

