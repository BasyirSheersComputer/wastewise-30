import React, { useState } from 'react';
import { Truck, Star, Clock, DollarSign, AlertCircle, CheckCircle, Plus, Phone, Mail } from 'lucide-react';

const SupplierManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('suppliers');

  const suppliers = [
    {
      id: 1,
      name: 'Fresh Produce Co.',
      category: 'Produce',
      rating: 4.8,
      status: 'active',
      contact: '+1 (555) 123-4567',
      email: 'orders@freshproduce.com',
      address: '123 Market St, City, State 12345',
      lastDelivery: '2024-01-16',
      totalOrders: 145,
      onTimeDelivery: 95,
      qualityScore: 4.9,
      paymentTerms: 'Net 30'
    },
    {
      id: 2,
      name: 'Meat Masters',
      category: 'Meat & Poultry',
      rating: 4.6,
      status: 'active',
      contact: '+1 (555) 234-5678',
      email: 'sales@meatmasters.com',
      address: '456 Industrial Blvd, City, State 12345',
      lastDelivery: '2024-01-15',
      totalOrders: 89,
      onTimeDelivery: 92,
      qualityScore: 4.7,
      paymentTerms: 'Net 15'
    },
    {
      id: 3,
      name: 'Dairy Fresh',
      category: 'Dairy',
      rating: 4.3,
      status: 'warning',
      contact: '+1 (555) 345-6789',
      email: 'orders@dairyfresh.com',
      address: '789 Dairy Lane, City, State 12345',
      lastDelivery: '2024-01-14',
      totalOrders: 67,
      onTimeDelivery: 88,
      qualityScore: 4.4,
      paymentTerms: 'Net 30'
    }
  ];

  const orders = [
    {
      id: 'ORD-001',
      supplier: 'Fresh Produce Co.',
      items: ['Tomatoes (50kg)', 'Lettuce (25kg)', 'Onions (30kg)'],
      total: 1240.50,
      status: 'delivered',
      orderDate: '2024-01-14',
      deliveryDate: '2024-01-16',
      tracking: 'DEL-789456'
    },
    {
      id: 'ORD-002',
      supplier: 'Meat Masters',
      items: ['Chicken Breast (40kg)', 'Ground Beef (25kg)'],
      total: 2180.00,
      status: 'pending',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-17',
      tracking: 'PEN-123789'
    },
    {
      id: 'ORD-003',
      supplier: 'Dairy Fresh',
      items: ['Milk (50L)', 'Cheese (15kg)', 'Yogurt (30 units)'],
      total: 845.30,
      status: 'in-transit',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-17',
      tracking: 'TRA-456123'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'glass-badge-success';
      case 'warning':
        return 'glass-badge-warning';
      case 'inactive':
        return 'glass-badge-error';
      default:
        return 'glass-badge-info';
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'glass-badge-success';
      case 'pending':
        return 'glass-badge-warning';
      case 'in-transit':
        return 'glass-badge-info';
      default:
        return 'glass-badge-info';
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Supplier Management</h1>
        <button className="glass-button flex items-center space-x-sm">
          <Plus size={16} />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Active Suppliers</p>
              <p className="text-xl font-semibold text-text-primary">12</p>
            </div>
            <Truck className="text-primary" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Avg Rating</p>
              <p className="text-xl font-semibold text-text-primary">4.6</p>
            </div>
            <Star className="text-warning" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">On-Time Delivery</p>
              <p className="text-xl font-semibold text-text-primary">92%</p>
            </div>
            <Clock className="text-success" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Spend</p>
              <p className="text-xl font-semibold text-text-primary">$45,230</p>
            </div>
            <DollarSign className="text-accent" size={20} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-lg">
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'suppliers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Suppliers
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Orders
            </button>
          </nav>
        </div>

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="p-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="border border-border rounded-md p-lg">
                  <div className="flex items-start justify-between mb-md">
                    <div>
                      <h3 className="text-md font-semibold text-text-primary">{supplier.name}</h3>
                      <p className="text-sm text-text-secondary">{supplier.category}</p>
                    </div>
                    <span className={`${getStatusBadge(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-md mb-md">
                    <div className="flex items-center">
                      <Star className="text-warning mr-sm" size={14} />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="text-primary mr-sm" size={14} />
                      <span className="text-sm">{supplier.onTimeDelivery}% on-time</span>
                    </div>
                  </div>

                  <div className="space-y-sm mb-md">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Phone className="mr-sm" size={12} />
                      {supplier.contact}
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                      <Mail className="mr-sm" size={12} />
                      {supplier.email}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <span>Orders: {supplier.totalOrders}</span>
                    <span>Quality: {supplier.qualityScore}/5</span>
                  </div>

                  <div className="mt-md flex space-x-sm">
                    <button className="flex-1 glass-button text-sm">
                      Place Order
                    </button>
                    <button className="flex-1 glass-button-secondary text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-table-header">
                <tr>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/40 transition-default">
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{order.id}</div>
                      <div className="text-sm text-text-secondary">{order.tracking}</div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {order.supplier}
                    </td>
                    <td className="px-lg py-md">
                      <div className="text-sm text-text-primary">
                        {order.items.map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <span className={`${getOrderStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {order.deliveryDate}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      <div className="flex space-x-sm">
                        <button className="text-primary hover:text-primary-hover transition-default">Track</button>
                        <button className="text-success hover:opacity-80 transition-default">Receipt</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierManager;