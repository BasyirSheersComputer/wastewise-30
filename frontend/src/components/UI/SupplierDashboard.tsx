import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Star,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SupplierDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  // Supplier Metrics
  const metrics = [
    {
      id: 1,
      name: 'Active Suppliers',
      value: '18',
      change: '+2',
      trend: 'up',
      icon: Briefcase,
      color: 'primary'
    },
    {
      id: 2,
      name: 'On-Time Delivery',
      value: '94.5%',
      change: '+3.2%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'success'
    },
    {
      id: 3,
      name: 'Monthly Spend',
      value: 'RM 28,500',
      change: '-5.3%',
      trend: 'down',
      icon: DollarSign,
      color: 'success'
    },
    {
      id: 4,
      name: 'Pending Orders',
      value: '12',
      change: '+3',
      trend: 'up',
      icon: Package,
      color: 'primary'
    }
  ];

  // Suppliers List
  const suppliers = [
    {
      id: 1,
      name: 'Premium Coffee Co.',
      category: 'Coffee Beans',
      contact: 'Ahmad Sulaiman',
      phone: '+60 12-345-6789',
      email: 'ahmad@premiumcoffee.my',
      location: 'Kuala Lumpur',
      monthlySpend: 8500,
      onTimeRate: 98.5,
      qualityRating: 4.8,
      lastOrder: '2 days ago',
      status: 'active',
      orderCount: 24
    },
    {
      id: 2,
      name: 'Fresh Dairy Ltd.',
      category: 'Milk & Dairy',
      contact: 'Siti Rahman',
      phone: '+60 13-456-7890',
      email: 'siti@freshdairy.my',
      location: 'Selangor',
      monthlySpend: 6200,
      onTimeRate: 92.0,
      qualityRating: 4.5,
      lastOrder: '1 day ago',
      status: 'active',
      orderCount: 18
    },
    {
      id: 3,
      name: 'Bakery Delights',
      category: 'Pastries',
      contact: 'Kumar Patel',
      phone: '+60 14-567-8901',
      email: 'kumar@bakerydelights.my',
      location: 'Petaling Jaya',
      monthlySpend: 4800,
      onTimeRate: 88.5,
      qualityRating: 4.2,
      lastOrder: '5 days ago',
      status: 'warning',
      orderCount: 12
    },
    {
      id: 4,
      name: 'Flavor House',
      category: 'Syrups & Flavors',
      contact: 'Chen Li',
      phone: '+60 15-678-9012',
      email: 'chen@flavorhouse.my',
      location: 'Johor Bahru',
      monthlySpend: 3200,
      onTimeRate: 95.5,
      qualityRating: 4.7,
      lastOrder: '3 days ago',
      status: 'active',
      orderCount: 8
    },
    {
      id: 5,
      name: 'PackPro Supply',
      category: 'Packaging',
      contact: 'Raj Sharma',
      phone: '+60 16-789-0123',
      email: 'raj@packpro.my',
      location: 'Penang',
      monthlySpend: 5800,
      onTimeRate: 96.5,
      qualityRating: 4.6,
      lastOrder: '1 week ago',
      status: 'active',
      orderCount: 15
    }
  ];

  // Spending by Category
  const spendingData = [
    { category: 'Coffee', amount: 8500, color: '#00A7A7' },
    { category: 'Dairy', amount: 6200, color: '#FF6B35' },
    { category: 'Packaging', amount: 5800, color: '#2D9F4B' },
    { category: 'Pastries', amount: 4800, color: '#F59E0B' },
    { category: 'Syrups', amount: 3200, color: '#737373' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-50 text-success-700 border-success-200';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'inactive': return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default: return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Supplier Management</h1>
          <p className="text-neutral-600 mt-1">Track suppliers, orders, and optimize procurement</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
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
                  metric.color === 'success' ? 'bg-success-50' : 'bg-primary-50'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    metric.color === 'success' ? 'text-success-500' : 'text-primary-500'
                  }`} />
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  metric.trend === 'down' && metric.color === 'success'
                    ? 'bg-success-50 text-success-700'
                    : 'bg-success-50 text-success-700'
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

      {/* Spending Chart & Top Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending by Category */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Monthly Spending by Category</h2>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis dataKey="category" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Top Performers</h2>
          
          <div className="space-y-3">
            {suppliers.slice(0, 3).map((supplier, index) => (
              <div key={supplier.id} className="p-3 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-warning text-white' :
                    index === 1 ? 'bg-neutral-300 text-white' :
                    'bg-warning/30 text-warning'
                  }`}>
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-medium text-neutral-900">{supplier.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-neutral-500">On-time</p>
                    <p className="font-medium text-neutral-900">{supplier.onTimeRate}%</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-warning text-warning" />
                      <p className="font-medium text-neutral-900">{supplier.qualityRating}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">All Suppliers</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm w-64"
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="p-4 rounded-lg border border-neutral-200 hover:border-primary-500 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-medium text-neutral-900">{supplier.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(supplier.status)}`}>
                      {supplier.status === 'active' ? 'Active' : 'Warning'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {supplier.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {supplier.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last order: {supplier.lastOrder}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  <span className="text-sm font-medium text-neutral-900">{supplier.qualityRating}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Contact</p>
                  <p className="text-sm font-medium text-neutral-900">{supplier.contact}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Phone</p>
                  <a href={`tel:${supplier.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                    {supplier.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Monthly Spend</p>
                  <p className="text-sm font-medium text-neutral-900">RM {supplier.monthlySpend.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">On-Time Rate</p>
                  <p className={`text-sm font-medium ${
                    supplier.onTimeRate >= 95 ? 'text-success-600' : 
                    supplier.onTimeRate >= 90 ? 'text-warning' : 'text-error'
                  }`}>
                    {supplier.onTimeRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Orders</p>
                  <p className="text-sm font-medium text-neutral-900">{supplier.orderCount}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100">
                <button className="flex-1 py-2 px-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Contact
                </button>
                <button className="flex-1 py-2 px-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </button>
                <button className="flex-1 py-2 px-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4 inline mr-1" />
                  New Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

