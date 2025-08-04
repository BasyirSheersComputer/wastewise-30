import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Package, Utensils, Users, DollarSign, Coffee, Target, Activity, Calculator, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import LLMRecommendations from './LLMRecommendations';
import { supabase } from '../../supabaseClient';

const Dashboard: React.FC = () => {
  console.log('Dashboard component is rendering'); // Debug log
  
  const [trialEnd, setTrialEnd] = useState<Date | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [isLoading, setIsLoading] = useState(false);

  // Coffee chain focused KPI data
  const kpiData = [
    {
      title: 'Recipe Yield Accuracy',
      value: '87.5%',
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'text-success',
      description: 'Actual vs Expected Output'
    },
    {
      title: 'Raw Material Waste',
      value: '12.3%',
      change: '-2.1%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-error',
      description: 'Coffee Beans, Milk, Syrups'
    },
    {
      title: 'COGS per Cup',
      value: '$2.45',
      change: '-0.15',
      trend: 'down',
      icon: Calculator,
      color: 'text-primary',
      description: 'Cost of Goods Sold'
    },
    {
      title: 'Staff Efficiency',
      value: '94.2%',
      change: '+1.8%',
      trend: 'up',
      icon: Users,
      color: 'text-accent',
      description: 'Portioning & Waste Control'
    }
  ];

  // Recipe yield tracking data
  const yieldData = [
    { 
      recipe: 'Latte', 
      expected: 40, 
      actual: 35, 
      waste: 5, 
      cost: 2.30,
      date: 'Mon'
    },
    { 
      recipe: 'Cappuccino', 
      expected: 35, 
      actual: 32, 
      waste: 3, 
      cost: 2.15,
      date: 'Tue'
    },
    { 
      recipe: 'Espresso', 
      expected: 50, 
      actual: 48, 
      waste: 2, 
      cost: 1.85,
      date: 'Wed'
    },
    { 
      recipe: 'Americano', 
      expected: 30, 
      actual: 28, 
      waste: 2, 
      cost: 1.95,
      date: 'Thu'
    },
    { 
      recipe: 'Mocha', 
      expected: 25, 
      actual: 22, 
      waste: 3, 
      cost: 2.75,
      date: 'Fri'
    }
  ];

  // Waste analysis by category
  const wasteData = [
    { name: 'Coffee Beans', value: 45, color: '#8B4513' },
    { name: 'Milk', value: 30, color: '#F5F5DC' },
    { name: 'Syrups', value: 15, color: '#FF6B6B' },
    { name: 'Cups/Lids', value: 10, color: '#4ECDC4' }
  ];

  // COGS tracking over time
  const cogsData = [
    { date: 'Mon', latte: 2.30, cappuccino: 2.15, espresso: 1.85, americano: 1.95 },
    { date: 'Tue', latte: 2.25, cappuccino: 2.10, espresso: 1.80, americano: 1.90 },
    { date: 'Wed', latte: 2.35, cappuccino: 2.20, espresso: 1.90, americano: 2.00 },
    { date: 'Thu', latte: 2.40, cappuccino: 2.25, espresso: 1.95, americano: 2.05 },
    { date: 'Fri', latte: 2.45, cappuccino: 2.30, espresso: 2.00, americano: 2.10 }
  ];

  // Operational alerts
  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Latte yield dropped to 75% - investigate portioning',
      timestamp: '2 hours ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Coffee beans waste increased by 15% this week',
      timestamp: '4 hours ago',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'info',
      message: 'New barista training completed for espresso preparation',
      timestamp: '6 hours ago',
      priority: 'low'
    },
    {
      id: 4,
      type: 'success',
      message: 'Cappuccino yield improved to 91% after SOP update',
      timestamp: '8 hours ago',
      priority: 'low'
    }
  ];

  // Recent waste events
  const wasteEvents = [
    { id: 'WE-001', item: 'Coffee Beans', quantity: '2.5kg', reason: 'Over-extraction', cost: '$45.00', timestamp: '2 hours ago' },
    { id: 'WE-002', item: 'Milk', quantity: '3L', reason: 'Spillage', cost: '$12.00', timestamp: '4 hours ago' },
    { id: 'WE-003', item: 'Vanilla Syrup', quantity: '0.5L', reason: 'Expired', cost: '$8.50', timestamp: '6 hours ago' },
    { id: 'WE-004', item: 'Coffee Beans', quantity: '1.2kg', reason: 'Training waste', cost: '$21.60', timestamp: '8 hours ago' }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function fetchTrial() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('users')
        .select('trial_end')
        .eq('id', session.user.id)
        .single();
      if (data?.trial_end) {
        const end = new Date(data.trial_end);
        setTrialEnd(end);
        updateCountdown(end);
        interval = setInterval(() => updateCountdown(end), 1000 * 60); // update every minute
      }
    }
    function updateCountdown(end: Date) {
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setTrialExpired(true);
        setCountdown('Trial expired');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setCountdown(`${days}d ${hours}h ${minutes}m left`);
    }
    fetchTrial();
    return () => { if (interval) clearInterval(interval); };
  }, []);

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setIsLoading(true);
    // Simulate loading time for data refresh
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="space-y-lg">
      {trialEnd && !trialExpired && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4 text-center font-semibold">
          Your free trial ends in {countdown}
        </div>
      )}
      {trialExpired && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4 text-center font-semibold">
          Your trial has expired. <a href="/billing" className="underline text-red-700">Upgrade now</a> to continue using the platform.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Operational Intelligence Dashboard</h1>
          <p className="text-sm text-text-secondary">
            Bridging the gap between estimated and actual coffee production
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className="glass-input"
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <div className="text-sm text-text-secondary">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="glass-card p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{kpi.title}</p>
                  <p className="text-xl font-semibold text-text-primary mt-xs">{kpi.value}</p>
                  <p className="text-xs text-text-secondary mt-1">{kpi.description}</p>
                </div>
                <div className={`p-md rounded-md bg-secondary ${kpi.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-md flex items-center">
                {kpi.trend === 'up' ? (
                  <TrendingUp size={14} className="text-success mr-xs" />
                ) : (
                  <TrendingDown size={14} className="text-error mr-xs" />
                )}
                <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-success' : 'text-error'}`}>
                  {kpi.change}
                </span>
                <span className="text-sm text-text-secondary ml-xs">vs last {timeRange}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Yield Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="glass-card p-lg">
          <h3 className="text-md font-semibold text-text-primary mb-md">Recipe Yield Tracking</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yieldData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

        <div className="glass-card p-lg">
          <h3 className="text-md font-semibold text-text-primary mb-md">Waste Analysis by Category</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COGS Tracking */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md">Cost of Goods Sold (COGS) Tracking</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cogsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="latte" stroke="#3B82F6" name="Latte" strokeWidth={2} />
              <Line type="monotone" dataKey="cappuccino" stroke="#10B981" name="Cappuccino" strokeWidth={2} />
              <Line type="monotone" dataKey="espresso" stroke="#F59E0B" name="Espresso" strokeWidth={2} />
              <Line type="monotone" dataKey="americano" stroke="#EF4444" name="Americano" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Operational Alerts */}
        <div className="glass-card p-lg">
          <h3 className="text-md font-semibold text-text-primary mb-md">Operational Alerts</h3>
          <div className="space-y-md">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-md">
                <div className={`p-xs rounded-full ${
                  alert.type === 'critical' ? 'bg-error/10' :
                  alert.type === 'warning' ? 'bg-warning/10' : 
                  alert.type === 'success' ? 'bg-success/10' : 'bg-info/10'
                }`}>
                  <AlertTriangle size={10} className={
                    alert.type === 'critical' ? 'text-error' :
                    alert.type === 'warning' ? 'text-warning' : 
                    alert.type === 'success' ? 'text-success' : 'text-info'
                  } />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{alert.message}</p>
                  <p className="text-xs text-text-secondary">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Waste Events */}
        <div className="glass-card p-lg">
          <h3 className="text-md font-semibold text-text-primary mb-md">Recent Waste Events</h3>
          <div className="space-y-md">
            {wasteEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{event.item}</p>
                  <p className="text-xs text-text-secondary">{event.quantity} • {event.reason}</p>
                  <p className="text-xs text-text-secondary">{event.timestamp}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-error">{event.cost}</p>
                  <span className="glass-badge glass-badge-error">Waste</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">POS Integration</span>
            <CheckCircle size={16} className="text-success" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Recipe Database</span>
            <CheckCircle size={16} className="text-success" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Waste Tracking</span>
            <CheckCircle size={16} className="text-success" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">COGS Calculation</span>
            <CheckCircle size={16} className="text-success" />
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <LLMRecommendations section="dashboard" />
    </div>
  );
};

export default Dashboard;