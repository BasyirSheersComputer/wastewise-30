import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowRight,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function InventoryDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Inventory Summary Metrics
  const metrics = [
    {
      id: 1,
      name: 'Total Items',
      value: '248',
      change: '+12',
      trend: 'up',
      icon: Package,
      color: 'primary'
    },
    {
      id: 2,
      name: 'Low Stock',
      value: '18',
      change: '+3',
      trend: 'up',
      icon: AlertCircle,
      color: 'warning'
    },
    {
      id: 3,
      name: 'Out of Stock',
      value: '5',
      change: '-2',
      trend: 'down',
      icon: TrendingDown,
      color: 'error'
    },
    {
      id: 4,
      name: 'Total Value',
      value: 'RM 45,200',
      change: '-5.3%',
      trend: 'down',
      icon: BarChart3,
      color: 'success'
    }
  ];

  // Stock Level Trend
  const stockTrend = [
    { date: 'Mon', stock: 250, value: 46500 },
    { date: 'Tue', stock: 245, value: 46200 },
    { date: 'Wed', stock: 248, value: 45800 },
    { date: 'Thu', stock: 242, value: 45400 },
    { date: 'Fri', stock: 248, value: 45200 }
  ];

  // Inventory Items
  const inventoryItems = [
    {
      id: 1,
      name: 'Arabica Coffee Beans',
      category: 'Coffee',
      sku: 'COF-001',
      quantity: 45.2,
      unit: 'kg',
      reorderPoint: 50,
      status: 'low',
      lastRestocked: '2 days ago',
      supplier: 'Premium Coffee Co.',
      unitCost: 'RM 65',
      totalValue: 'RM 2,938'
    },
    {
      id: 2,
      name: 'Whole Milk',
      category: 'Dairy',
      sku: 'DRY-002',
      quantity: 120,
      unit: 'L',
      reorderPoint: 80,
      status: 'good',
      lastRestocked: '1 day ago',
      supplier: 'Fresh Dairy Ltd.',
      unitCost: 'RM 8',
      totalValue: 'RM 960'
    },
    {
      id: 3,
      name: 'Croissants',
      category: 'Pastries',
      sku: 'PAS-003',
      quantity: 0,
      unit: 'pcs',
      reorderPoint: 50,
      status: 'out',
      lastRestocked: '5 days ago',
      supplier: 'Bakery Delights',
      unitCost: 'RM 3.50',
      totalValue: 'RM 0'
    },
    {
      id: 4,
      name: 'Caramel Syrup',
      category: 'Syrups',
      sku: 'SYR-004',
      quantity: 28,
      unit: 'L',
      reorderPoint: 20,
      status: 'good',
      lastRestocked: '3 days ago',
      supplier: 'Flavor House',
      unitCost: 'RM 45',
      totalValue: 'RM 1,260'
    },
    {
      id: 5,
      name: 'Paper Cups (12oz)',
      category: 'Packaging',
      sku: 'PKG-005',
      quantity: 2400,
      unit: 'pcs',
      reorderPoint: 5000,
      status: 'low',
      lastRestocked: '1 week ago',
      supplier: 'PackPro Supply',
      unitCost: 'RM 0.15',
      totalValue: 'RM 360'
    },
    {
      id: 6,
      name: 'Robusta Coffee Beans',
      category: 'Coffee',
      sku: 'COF-006',
      quantity: 85,
      unit: 'kg',
      reorderPoint: 50,
      status: 'good',
      lastRestocked: 'Today',
      supplier: 'Premium Coffee Co.',
      unitCost: 'RM 48',
      totalValue: 'RM 4,080'
    }
  ];

  // Low Stock Alerts
  const lowStockAlerts = inventoryItems.filter(item => item.status === 'low' || item.status === 'out');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success-50 text-success-700 border-success-200';
      case 'low': return 'bg-warning-50 text-warning-700 border-warning-200';
      case 'out': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'good': return 'In Stock';
      case 'low': return 'Low Stock';
      case 'out': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Inventory Management</h1>
          <p className="text-neutral-600 mt-1">Track and manage your stock levels in real-time</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
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
                  metric.color === 'warning' ? 'bg-warning/10' :
                  metric.color === 'error' ? 'bg-error/10' :
                  metric.color === 'success' ? 'bg-success-50' :
                  'bg-primary-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    metric.color === 'warning' ? 'text-warning' :
                    metric.color === 'error' ? 'text-error' :
                    metric.color === 'success' ? 'text-success-500' :
                    'text-primary-500'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  metric.trend === 'down' && metric.color === 'success'
                    ? 'bg-success-50 text-success-700'
                    : metric.trend === 'down'
                    ? 'bg-success-50 text-success-700'
                    : metric.color === 'error' || metric.color === 'warning'
                    ? 'bg-error/10 text-error'
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
                <p className="text-3xl font-bold text-neutral-900">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Trend & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Stock Level Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stockTrend}>
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
              <Line type="monotone" dataKey="stock" stroke="#00A7A7" strokeWidth={2} dot={{ fill: '#00A7A7', r: 4 }} name="Items" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">Low Stock Alerts</h2>
            <span className="px-2 py-1 bg-error/10 text-error text-xs font-medium rounded-full">
              {lowStockAlerts.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {lowStockAlerts.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-neutral-200 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-neutral-900">{item.name}</h3>
                    <p className="text-xs text-neutral-500">{item.sku}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === 'out' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                  }`}>
                    {item.status === 'out' ? 'Out' : 'Low'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600">{item.quantity} {item.unit}</span>
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    Reorder →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search items by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="coffee">Coffee</option>
            <option value="dairy">Dairy</option>
            <option value="pastries">Pastries</option>
            <option value="syrups">Syrups</option>
            <option value="packaging">Packaging</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Item</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Value</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Supplier</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-neutral-600">Last Restocked</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{item.name}</div>
                      <div className="text-xs text-neutral-500">{item.sku}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-700">{item.category}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-neutral-900">{item.quantity} {item.unit}</div>
                    <div className="text-xs text-neutral-500">Reorder: {item.reorderPoint}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-neutral-900">{item.totalValue}</div>
                    <div className="text-xs text-neutral-500">{item.unitCost}/unit</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-700">{item.supplier}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-sm text-neutral-600">
                      <Clock className="w-3 h-3" />
                      <span>{item.lastRestocked}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

