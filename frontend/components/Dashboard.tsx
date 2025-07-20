import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Package, Utensils, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import LLMRecommendations from './LLMRecommendations';

const Dashboard: React.FC = () => {
  const kpiData = [
    {
      title: 'Total Revenue',
      value: '$45,230',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'Food Waste',
      value: '8.2%',
      change: '-2.1%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-error'
    },
    {
      title: 'Inventory Turnover',
      value: '6.8x',
      change: '+0.3x',
      trend: 'up',
      icon: Package,
      color: 'text-primary'
    },
    {
      title: 'Menu Items',
      value: '127',
      change: '+8',
      trend: 'up',
      icon: Utensils,
      color: 'text-accent'
    }
  ];

  const wasteTrendData = [
    { month: 'Sep', waste: 9.1 },
    { month: 'Oct', waste: 8.7 },
    { month: 'Nov', waste: 8.4 },
    { month: 'Dec', waste: 8.9 },
    { month: 'Jan', waste: 8.2 },
  ];

  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Low stock alert: Tomatoes (2 days remaining)',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Unusual waste pattern detected for Chicken Breast',
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      type: 'info',
      message: 'Supplier delivery scheduled for tomorrow',
      timestamp: '6 hours ago'
    }
  ];

  const recentOrders = [
    { id: 'ORD-001', supplier: 'Fresh Produce Co.', amount: '$1,240', status: 'delivered' },
    { id: 'ORD-002', supplier: 'Meat Masters', amount: '$2,180', status: 'pending' },
    { id: 'ORD-003', supplier: 'Dairy Fresh', amount: '$845', status: 'in-transit' }
  ];

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Operations Dashboard</h1>
        <div className="text-sm text-text-secondary">
          Last updated: {new Date().toLocaleTimeString()}
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
                <span className="text-sm text-text-secondary ml-xs">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Waste Trend Chart */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md">Food Waste Trend (last 5 months)</h3>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={wasteTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey="waste" fill="#f87171" name="Food Waste %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Alerts */}
        <div className="glass-card p-lg">
          <h3 className="text-md font-semibold text-text-primary mb-md">Recent Alerts</h3>
          <div className="space-y-md">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-md">
                <div className={`p-xs rounded-full ${
                  alert.type === 'critical' ? 'bg-error/10' :
                  alert.type === 'warning' ? 'bg-warning/10' : 'bg-info/10'
                }`}>
                  <AlertTriangle size={10} className={
                    alert.type === 'critical' ? 'text-error' :
                    alert.type === 'warning' ? 'text-warning' : 'text-info'
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

        {/* Recent Orders */}
        <div className="glass-card p-lg">
          <h3 className="text-md font-semibold text-text-primary mb-md">Recent Orders</h3>
          <div className="space-y-md">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">{order.id}</p>
                  <p className="text-xs text-text-secondary">{order.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">{order.amount}</p>
                  <span className={`glass-badge ${
                    order.status === 'delivered' ? 'glass-badge-success' :
                    order.status === 'pending' ? 'glass-badge-warning' :
                    'glass-badge-info'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="glass-card p-lg">
          <h3 className="text-md font-semibold text-text-primary mb-md">System Status</h3>
          <div className="space-y-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">POS Integration</span>
              <CheckCircle size={16} className="text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">IoT Sensors</span>
              <CheckCircle size={16} className="text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Supplier API</span>
              <CheckCircle size={16} className="text-success" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Weather Data</span>
              <AlertTriangle size={16} className="text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow Status */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md">Data Flow Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-lg flex items-center justify-center mb-sm">
              <CheckCircle size={24} className="text-success" />
            </div>
            <p className="text-sm font-medium text-text-primary">Data Ingestion</p>
            <p className="text-xs text-text-secondary">Active</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-sm">
              <TrendingUp size={24} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-text-primary">Forecasting</p>
            <p className="text-xs text-text-secondary">Processing</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-accent/10 rounded-lg flex items-center justify-center mb-sm">
              <Package size={24} className="text-accent" />
            </div>
            <p className="text-sm font-medium text-text-primary">Inventory Sync</p>
            <p className="text-xs text-text-secondary">Real-time</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-warning/10 rounded-lg flex items-center justify-center mb-sm">
              <Users size={24} className="text-warning" />
            </div>
            <p className="text-sm font-medium text-text-primary">Staff Analytics</p>
            <p className="text-xs text-text-secondary">Updated</p>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <LLMRecommendations section="dashboard" />
    </div>
  );
};

export default Dashboard;