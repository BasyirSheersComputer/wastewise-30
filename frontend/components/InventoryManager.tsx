import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Filter, Search } from 'lucide-react';
import AddInventoryModal from "./AddInventoryModal";
import LLMRecommendations from './LLMRecommendations';

const InventoryManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const inventoryItems = [
    {
      id: 1,
      name: 'Tomatoes',
      category: 'Produce',
      currentStock: 45,
      minStock: 50,
      maxStock: 200,
      unit: 'kg',
      cost: 2.50,
      supplier: 'Fresh Produce Co.',
      lastRestock: '2024-01-15',
      status: 'low',
      trend: 'down'
    },
    {
      id: 2,
      name: 'Chicken Breast',
      category: 'Meat',
      currentStock: 125,
      minStock: 80,
      maxStock: 300,
      unit: 'kg',
      cost: 8.90,
      supplier: 'Meat Masters',
      lastRestock: '2024-01-14',
      status: 'good',
      trend: 'stable'
    },
    {
      id: 3,
      name: 'Mozzarella Cheese',
      category: 'Dairy',
      currentStock: 15,
      minStock: 20,
      maxStock: 80,
      unit: 'kg',
      cost: 12.50,
      supplier: 'Dairy Fresh',
      lastRestock: '2024-01-13',
      status: 'low',
      trend: 'down'
    },
    {
      id: 4,
      name: 'Olive Oil',
      category: 'Pantry',
      currentStock: 35,
      minStock: 25,
      maxStock: 100,
      unit: 'L',
      cost: 15.00,
      supplier: 'Gourmet Supplies',
      lastRestock: '2024-01-12',
      status: 'good',
      trend: 'stable'
    },
    {
      id: 5,
      name: 'Salmon Fillet',
      category: 'Seafood',
      currentStock: 280,
      minStock: 50,
      maxStock: 200,
      unit: 'kg',
      cost: 22.00,
      supplier: 'Ocean Fresh',
      lastRestock: '2024-01-16',
      status: 'overstocked',
      trend: 'up'
    }
  ];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'low':
        return 'glass-badge-error';
      case 'good':
        return 'glass-badge-success';
      case 'overstocked':
        return 'glass-badge-warning';
      default:
        return 'glass-badge-info';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-success" />;
      case 'down':
        return <TrendingDown size={14} className="text-error" />;
      default:
        return <div className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Inventory Management</h1>
        <button
          className="glass-button flex items-center space-x-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          <span>Add Item</span>
        </button>
      </div>
      <AddInventoryModal open={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Items</p>
              <p className="text-xl font-semibold text-text-primary">127</p>
            </div>
            <Package className="text-primary" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Low Stock</p>
              <p className="text-xl font-semibold text-error">8</p>
            </div>
            <AlertTriangle className="text-error" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Value</p>
              <p className="text-xl font-semibold text-text-primary">$12,450</p>
            </div>
            <TrendingUp className="text-success" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Turnover Rate</p>
              <p className="text-xl font-semibold text-text-primary">6.8x</p>
            </div>
            <Package className="text-accent" size={20} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="glass-card p-lg">
        <div className="flex flex-col sm:flex-row gap-md">
          <div className="flex-1 relative">
            <Search className="absolute left-md top-1/2 transform -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              className="glass-input w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-sm">
            <Filter size={16} className="text-text-secondary" />
            <select
              className="glass-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="low">Low Stock</option>
              <option value="good">Good Stock</option>
              <option value="overstocked">Overstocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="glass-table-header">
              <tr>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Item
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Last Restock
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/40 transition-default">
                  <td className="px-lg py-md whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-text-primary">{item.name}</div>
                        <div className="text-sm text-text-secondary">${item.cost}/{item.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.category}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.currentStock} {item.unit}
                    <div className="text-xs text-text-secondary">
                      Min: {item.minStock} | Max: {item.maxStock}
                    </div>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    <span className={`${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    {getTrendIcon(item.trend)}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.supplier}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.lastRestock}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    <div className="flex space-x-sm">
                      <button className="text-primary hover:text-primary-hover transition-default">Edit</button>
                      <button className="text-success hover:opacity-80 transition-default">Reorder</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <LLMRecommendations section="inventory" />
    </div>
  );
};

export default InventoryManager;