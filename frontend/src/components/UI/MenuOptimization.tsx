import React, { useState } from 'react';
import { Utensils, TrendingUp, TrendingDown, DollarSign, Clock, Star, AlertTriangle, Target, BarChart3, Settings, Eye, Edit, Plus, Filter, X } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const MenuOptimization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    prepTime: '',
    ingredients: '',
    description: ''
  });

  const menuItems = [
    {
      id: 1,
      name: 'Margherita Pizza',
      category: 'Pizza',
      price: 14.99,
      cost: 4.20,
      margin: 71.9,
      popularity: 85,
      rating: 4.8,
      orders: 234,
      trend: 'up',
      prepTime: 12,
      ingredients: ['Tomato sauce', 'Mozzarella', 'Basil'],
      status: 'optimize',
      revenue: 3501.66,
      profit: 2524.20
    },
    {
      id: 2,
      name: 'Caesar Salad',
      category: 'Salad',
      price: 12.99,
      cost: 3.50,
      margin: 73.1,
      popularity: 65,
      rating: 4.3,
      orders: 156,
      trend: 'down',
      prepTime: 8,
      ingredients: ['Romaine lettuce', 'Parmesan', 'Croutons'],
      status: 'review',
      revenue: 2026.44,
      profit: 1479.30
    },
    {
      id: 3,
      name: 'Chicken Parmesan',
      category: 'Main Course',
      price: 18.99,
      cost: 7.80,
      margin: 58.9,
      popularity: 78,
      rating: 4.6,
      orders: 189,
      trend: 'up',
      prepTime: 18,
      ingredients: ['Chicken breast', 'Marinara', 'Mozzarella'],
      status: 'good',
      revenue: 3589.11,
      profit: 2111.01
    },
    {
      id: 4,
      name: 'Pasta Carbonara',
      category: 'Pasta',
      price: 16.99,
      cost: 5.20,
      margin: 69.4,
      popularity: 72,
      rating: 4.5,
      orders: 167,
      trend: 'stable',
      prepTime: 15,
      ingredients: ['Spaghetti', 'Bacon', 'Eggs', 'Parmesan'],
      status: 'good',
      revenue: 2837.33,
      profit: 1969.13
    },
    {
      id: 5,
      name: 'Beef Burger',
      category: 'Burger',
      price: 15.99,
      cost: 6.50,
      margin: 59.3,
      popularity: 82,
      rating: 4.4,
      orders: 198,
      trend: 'down',
      prepTime: 14,
      ingredients: ['Beef patty', 'Bun', 'Lettuce', 'Tomato'],
      status: 'review',
      revenue: 3166.02,
      profit: 1878.30
    },
    {
      id: 6,
      name: 'Fish & Chips',
      category: 'Seafood',
      price: 17.99,
      cost: 8.20,
      margin: 54.4,
      popularity: 68,
      rating: 4.2,
      orders: 145,
      trend: 'up',
      prepTime: 16,
      ingredients: ['Cod fillet', 'Potatoes', 'Batter'],
      status: 'optimize',
      revenue: 2608.55,
      profit: 1418.65
    }
  ];

  const recommendations = [
    {
      type: 'price',
      item: 'Margherita Pizza',
      suggestion: 'Increase price by $1.50',
      impact: '+$351 monthly revenue',
      priority: 'high',
      reason: 'High demand, low price sensitivity'
    },
    {
      type: 'portion',
      item: 'Caesar Salad',
      suggestion: 'Reduce portion size by 15%',
      impact: '+8.2% margin improvement',
      priority: 'medium',
      reason: 'Customer feedback indicates large portions'
    },
    {
      type: 'ingredient',
      item: 'Fish & Chips',
      suggestion: 'Switch to premium cod supplier',
      impact: '+12% quality rating',
      priority: 'high',
      reason: 'Quality complaints increasing'
    },
    {
      type: 'promotion',
      item: 'Beef Burger',
      suggestion: 'Feature in lunch special',
      impact: '+25% order volume',
      priority: 'medium',
      reason: 'Declining popularity needs boost'
    }
  ];

  const categories = ['all', 'Pizza', 'Salad', 'Main Course', 'Pasta', 'Burger', 'Seafood'];
  const statuses = ['all', 'good', 'review', 'optimize'];

  const totalRevenue = menuItems.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = menuItems.reduce((sum, item) => sum + item.profit, 0);
  const avgMargin = menuItems.reduce((sum, item) => sum + item.margin, 0) / menuItems.length;
  const totalOrders = menuItems.reduce((sum, item) => sum + item.orders, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'optimize':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesCategory;
  });

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewMenuItem({
      name: '',
      category: '',
      price: '',
      cost: '',
      prepTime: '',
      ingredients: '',
      description: ''
    });
  };

  const handleSubmitMenuItem = () => {
    // Here you would typically save to your backend
    console.log('Adding new menu item:', newMenuItem);
    handleCloseModal();
  };

  const handleInputChange = (field: string, value: string) => {
    setNewMenuItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Optimization</h1>
          <p className="text-gray-600 mt-1">AI-powered menu analysis and optimization recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <button 
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">${totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">Net profit</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Margin</p>
              <p className="text-2xl font-bold text-gray-900">{avgMargin.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-2">Across all items</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Utensils className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">This month</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Menu Performance</h3>
            <p className="text-sm text-gray-600 mt-1">Detailed analysis of each menu item</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${item.price}</div>
                      <div className="text-xs text-gray-500">Cost: ${item.cost}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.margin}%</div>
                      <div className="text-xs text-gray-500">${item.profit.toFixed(0)} profit</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{item.orders}</span>
                        {getTrendIcon(item.trend)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900 ml-1">{item.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-600 mt-1">Optimization suggestions</p>
          </div>
          <div className="p-6 space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority}
                    </span>
                    <span className="text-xs text-gray-500 uppercase">{rec.type}</span>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-900">{rec.item}</div>
                  <div className="text-sm text-gray-600">{rec.suggestion}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-600 font-medium">{rec.impact}</div>
                  <button className="text-blue-600 hover:text-blue-900 text-sm">
                    Apply
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {rec.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <LLMRecommendations section="menu-optimization" />

      {/* Add Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Menu Item</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newMenuItem.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newMenuItem.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Salad">Salad</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Burger">Burger</option>
                    <option value="Seafood">Seafood</option>
                    <option value="Appetizer">Appetizer</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Beverage">Beverage</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMenuItem.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMenuItem.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={newMenuItem.prepTime}
                    onChange={(e) => handleInputChange('prepTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="15"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newMenuItem.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the menu item"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients
                  </label>
                  <textarea
                    value={newMenuItem.ingredients}
                    onChange={(e) => handleInputChange('ingredients', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="List main ingredients (comma separated)"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitMenuItem}
                disabled={!newMenuItem.name || !newMenuItem.category || !newMenuItem.price || !newMenuItem.cost}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Menu Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuOptimization;