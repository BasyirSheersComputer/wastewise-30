import React, { useState } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus, Filter, Search, Coffee, Clock, DollarSign, Users, BarChart3, Calendar, Target, Zap, ShoppingCart, FileText, Settings, Calculator } from 'lucide-react';
import AddInventoryModal from "./AddInventoryModal";
import LLMRecommendations from './LLMRecommendations';

const InventoryManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // Coffee chain focused inventory items
  const inventoryItems = [
    {
      id: 1,
      name: 'Arabica Coffee Beans',
      category: 'Coffee',
      currentStock: 45.5,
      minStock: 20,
      maxStock: 100,
      unit: 'kg',
      cost: 18.50,
      supplier: 'Coffee Masters',
      lastRestock: '2024-01-15',
      status: 'good',
      trend: 'stable',
      reorderPoint: 25,
      leadTime: 3,
      autoReorder: true,
      recipeUsage: ['Espresso', 'Latte', 'Cappuccino', 'Americano'],
      wasteRate: 8.5,
      cogsPerCup: 0.45
    },
    {
      id: 2,
      name: 'Fresh Milk',
      category: 'Dairy',
      currentStock: 28.0,
      minStock: 15,
      maxStock: 50,
      unit: 'L',
      cost: 3.20,
      supplier: 'Dairy Fresh',
      lastRestock: '2024-01-16',
      status: 'low',
      trend: 'down',
      reorderPoint: 20,
      leadTime: 1,
      autoReorder: true,
      recipeUsage: ['Latte', 'Cappuccino', 'Mocha'],
      wasteRate: 12.3,
      cogsPerCup: 0.32
    },
    {
      id: 3,
      name: 'Vanilla Syrup',
      category: 'Syrups',
      currentStock: 8.5,
      minStock: 5,
      maxStock: 20,
      unit: 'L',
      cost: 12.00,
      supplier: 'Flavor Masters',
      lastRestock: '2024-01-14',
      status: 'good',
      trend: 'stable',
      reorderPoint: 8,
      leadTime: 2,
      autoReorder: false,
      recipeUsage: ['Vanilla Latte', 'Vanilla Cappuccino'],
      wasteRate: 5.2,
      cogsPerCup: 0.15
    },
    {
      id: 4,
      name: 'Paper Cups',
      category: 'Packaging',
      currentStock: 1200,
      minStock: 500,
      maxStock: 2000,
      unit: 'pieces',
      cost: 0.08,
      supplier: 'Cup Supply Co.',
      lastRestock: '2024-01-13',
      status: 'good',
      trend: 'stable',
      reorderPoint: 800,
      leadTime: 2,
      autoReorder: true,
      recipeUsage: ['All Drinks'],
      wasteRate: 2.1,
      cogsPerCup: 0.08
    },
    {
      id: 5,
      name: 'Chocolate Powder',
      category: 'Ingredients',
      currentStock: 15.2,
      minStock: 8,
      maxStock: 30,
      unit: 'kg',
      cost: 8.50,
      supplier: 'Cocoa Supply',
      lastRestock: '2024-01-16',
      status: 'overstocked',
      trend: 'up',
      reorderPoint: 12,
      leadTime: 2,
      autoReorder: false,
      recipeUsage: ['Mocha', 'Hot Chocolate'],
      wasteRate: 6.8,
      cogsPerCup: 0.25
    }
  ];

  // Coffee recipe management data
  const recipes = [
    {
      id: 1,
      name: 'Espresso',
      category: 'Coffee',
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg' },
        { name: 'Paper Cups', quantity: 1, unit: 'piece' }
      ],
      cost: 0.53,
      sellingPrice: 3.50,
      margin: 84.9,
      popularity: 95,
      expectedYield: 1,
      actualYield: 0.95,
      wasteRate: 5.0
    },
    {
      id: 2,
      name: 'Latte',
      category: 'Coffee',
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg' },
        { name: 'Fresh Milk', quantity: 0.24, unit: 'L' },
        { name: 'Paper Cups', quantity: 1, unit: 'piece' }
      ],
      cost: 1.09,
      sellingPrice: 5.50,
      margin: 80.2,
      popularity: 98,
      expectedYield: 1,
      actualYield: 0.88,
      wasteRate: 12.0
    },
    {
      id: 3,
      name: 'Cappuccino',
      category: 'Coffee',
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg' },
        { name: 'Fresh Milk', quantity: 0.18, unit: 'L' },
        { name: 'Paper Cups', quantity: 1, unit: 'piece' }
      ],
      cost: 0.97,
      sellingPrice: 5.00,
      margin: 80.6,
      popularity: 92,
      expectedYield: 1,
      actualYield: 0.91,
      wasteRate: 9.0
    },
    {
      id: 4,
      name: 'Mocha',
      category: 'Coffee',
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg' },
        { name: 'Fresh Milk', quantity: 0.20, unit: 'L' },
        { name: 'Chocolate Powder', quantity: 0.015, unit: 'kg' },
        { name: 'Paper Cups', quantity: 1, unit: 'piece' }
      ],
      cost: 1.34,
      sellingPrice: 6.50,
      margin: 79.4,
      popularity: 88,
      expectedYield: 1,
      actualYield: 0.85,
      wasteRate: 15.0
    }
  ];

  // Waste tracking data
  const wasteEvents = [
    {
      id: 'WE-001',
      item: 'Arabica Coffee Beans',
      quantity: '2.5kg',
      reason: 'Over-extraction',
      cost: '$46.25',
      timestamp: '2024-01-16 14:30',
      staff: 'Barista John',
      shift: 'Morning'
    },
    {
      id: 'WE-002',
      item: 'Fresh Milk',
      quantity: '3L',
      reason: 'Spillage',
      cost: '$9.60',
      timestamp: '2024-01-16 12:15',
      staff: 'Barista Sarah',
      shift: 'Morning'
    },
    {
      id: 'WE-003',
      item: 'Vanilla Syrup',
      quantity: '0.5L',
      reason: 'Expired',
      cost: '$6.00',
      timestamp: '2024-01-16 09:45',
      staff: 'Manager Mike',
      shift: 'Opening'
    },
    {
      id: 'WE-004',
      item: 'Arabica Coffee Beans',
      quantity: '1.2kg',
      reason: 'Training waste',
      cost: '$22.20',
      timestamp: '2024-01-15 16:20',
      staff: 'Trainee Alex',
      shift: 'Afternoon'
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
        <h1 className="text-xl font-semibold text-text-primary">Coffee Chain Inventory Management</h1>
        <div className="flex items-center space-x-2">
          <button
            className="glass-button flex items-center space-x-sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
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
          <p className="text-xs text-text-secondary mt-1">Coffee chain inventory</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Low Stock</p>
              <p className="text-xl font-semibold text-error">8</p>
            </div>
            <AlertTriangle className="text-error" size={20} />
          </div>
          <p className="text-xs text-text-secondary mt-1">Needs reorder</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Avg COGS per Cup</p>
              <p className="text-xl font-semibold text-text-primary">$1.12</p>
            </div>
            <Calculator className="text-primary" size={20} />
          </div>
          <p className="text-xs text-text-secondary mt-1">Cost of goods sold</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Waste Rate</p>
              <p className="text-xl font-semibold text-error">7.2%</p>
            </div>
            <TrendingDown className="text-error" size={20} />
          </div>
          <p className="text-xs text-text-secondary mt-1">Raw material waste</p>
        </div>
      </div>

      {/* Tabs for different inventory views */}
      <div className="glass-card">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-lg">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-md px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`py-md px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recipes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => setActiveTab('waste')}
              className={`py-md px-1 border-b-2 font-medium text-sm ${
                activeTab === 'waste'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Waste Tracking
            </button>
          </nav>
        </div>

        <div className="p-lg">
          {activeTab === 'inventory' && (
            <>
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-md mb-lg">
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

              {/* Enhanced Inventory Table */}
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
                          COGS/Cup
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Waste Rate
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Auto Reorder
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
                                <div className="text-xs text-text-secondary">{item.supplier}</div>
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
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            ${item.cogsPerCup}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            {item.wasteRate}%
                          </td>
                          <td className="px-lg py-md whitespace-nowrap">
                            <span className={`glass-badge ${item.autoReorder ? 'glass-badge-success' : 'glass-badge-warning'}`}>
                              {item.autoReorder ? 'Enabled' : 'Manual'}
                            </span>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            <div className="flex space-x-sm">
                              <button className="text-primary hover:text-primary-hover transition-default">Edit</button>
                              <button className="text-success hover:opacity-80 transition-default">Reorder</button>
                              <button className="text-accent hover:opacity-80 transition-default">Recipe</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'recipes' && (
            <div className="space-y-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Coffee Recipe Management</h3>
                <button
                  className="glass-button flex items-center space-x-sm"
                  onClick={() => setShowRecipeModal(true)}
                >
                  <FileText size={16} />
                  <span>Add Recipe</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="glass-card p-lg">
                    <div className="flex items-start justify-between mb-md">
                      <div>
                        <h4 className="text-md font-semibold text-text-primary">{recipe.name}</h4>
                        <p className="text-sm text-text-secondary">{recipe.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-text-primary">${recipe.sellingPrice}</p>
                        <p className="text-xs text-text-secondary">{recipe.margin}% margin</p>
                      </div>
                    </div>

                    <div className="mb-md">
                      <p className="text-sm font-medium text-text-primary mb-xs">Ingredients:</p>
                      <div className="space-y-xs">
                        {recipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-text-secondary">{ingredient.name}</span>
                            <span className="text-text-primary">{ingredient.quantity} {ingredient.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-md">
                      <div className="flex justify-between text-sm mb-xs">
                        <span className="text-text-secondary">Expected Yield:</span>
                        <span className="text-text-primary">{recipe.expectedYield}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-xs">
                        <span className="text-text-secondary">Actual Yield:</span>
                        <span className="text-text-primary">{recipe.actualYield}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Waste Rate:</span>
                        <span className="text-error">{recipe.wasteRate}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-sm">
                        <BarChart3 size={14} className="text-accent" />
                        <span className="text-sm text-text-secondary">{recipe.popularity}% popularity</span>
                      </div>
                      <div className="flex space-x-sm">
                        <button className="text-primary hover:text-primary-hover transition-default">Edit</button>
                        <button className="text-success hover:opacity-80 transition-default">View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'waste' && (
            <div className="space-y-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Waste Tracking</h3>
                <button className="glass-button flex items-center space-x-sm">
                  <AlertTriangle size={16} />
                  <span>Log Waste</span>
                </button>
              </div>

              <div className="glass-table">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="glass-table-header">
                      <tr>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Staff
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Shift
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {wasteEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-white/40 transition-default">
                          <td className="px-lg py-md whitespace-nowrap">
                            <div className="text-sm font-medium text-text-primary">{event.item}</div>
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            {event.quantity}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            {event.reason}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-error">
                            {event.cost}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            {event.staff}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            {event.shift}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-secondary">
                            {event.timestamp}
                          </td>
                          <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                            <div className="flex space-x-sm">
                              <button className="text-primary hover:text-primary-hover transition-default">Edit</button>
                              <button className="text-accent hover:opacity-80 transition-default">Analyze</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <LLMRecommendations section="inventory" />
    </div>
  );
};

export default InventoryManager;