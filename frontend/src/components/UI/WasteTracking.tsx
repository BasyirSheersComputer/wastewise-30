import React, { useState } from 'react';
import { Trash2, TrendingDown, AlertTriangle, DollarSign, Calendar, Plus, FileText, Download, Filter, BarChart3, Eye, Edit, X } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const WasteTracking: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newWasteEntry, setNewWasteEntry] = useState({
    item: '',
    category: '',
    quantity: '',
    unit: 'kg',
    cost: '',
    reason: '',
    staff: '',
    date: new Date().toISOString().split('T')[0]
  });

  const wasteData = [
    {
      id: 1,
      item: 'Lettuce',
      category: 'Produce',
      quantity: 3.2,
      unit: 'kg',
      cost: 8.50,
      reason: 'Spoilage',
      date: '2024-01-16',
      staff: 'John Doe',
      status: 'logged'
    },
    {
      id: 2,
      item: 'Bread Rolls',
      category: 'Bakery',
      quantity: 24,
      unit: 'pieces',
      cost: 12.00,
      reason: 'End of day',
      date: '2024-01-16',
      staff: 'Jane Smith',
      status: 'logged'
    },
    {
      id: 3,
      item: 'Chicken Thighs',
      category: 'Meat',
      quantity: 1.5,
      unit: 'kg',
      cost: 15.75,
      reason: 'Expired',
      date: '2024-01-15',
      staff: 'Mike Johnson',
      status: 'logged'
    },
    {
      id: 4,
      item: 'Tomatoes',
      category: 'Produce',
      quantity: 2.8,
      unit: 'kg',
      cost: 7.20,
      reason: 'Overripe',
      date: '2024-01-15',
      staff: 'Sarah Wilson',
      status: 'logged'
    },
    {
      id: 5,
      item: 'Milk',
      category: 'Dairy',
      quantity: 2.0,
      unit: 'L',
      cost: 4.80,
      reason: 'Expired',
      date: '2024-01-14',
      staff: 'Alex Brown',
      status: 'logged'
    }
  ];

  const wasteByCategory = [
    { category: 'Produce', amount: 45.2, percentage: 35, trend: 'down', cost: 89.50 },
    { category: 'Meat', amount: 28.5, percentage: 22, trend: 'up', cost: 156.75 },
    { category: 'Dairy', amount: 18.7, percentage: 14, trend: 'stable', cost: 67.20 },
    { category: 'Bakery', amount: 24.3, percentage: 19, trend: 'down', cost: 48.60 },
    { category: 'Other', amount: 12.8, percentage: 10, trend: 'stable', cost: 32.40 }
  ];

  const wasteReasons = [
    { reason: 'Spoilage', count: 15, percentage: 35, cost: 125.50 },
    { reason: 'Expired', count: 12, percentage: 28, cost: 98.75 },
    { reason: 'End of day', count: 8, percentage: 19, cost: 45.20 },
    { reason: 'Overproduction', count: 5, percentage: 12, cost: 67.30 },
    { reason: 'Customer returns', count: 3, percentage: 7, cost: 23.45 }
  ];

  const totalWasteCost = wasteData.reduce((sum, item) => sum + item.cost, 0);
  const totalWasteQuantity = wasteData.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogWaste = () => {
    setShowLogModal(true);
  };

  const handleCloseModal = () => {
    setShowLogModal(false);
    setNewWasteEntry({
      item: '',
      category: '',
      quantity: '',
      unit: 'kg',
      cost: '',
      reason: '',
      staff: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmitWaste = () => {
    // Here you would typically save to your backend
    console.log('Logging waste entry:', newWasteEntry);
    handleCloseModal();
  };

  const handleInputChange = (field: string, value: string) => {
    setNewWasteEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = () => {
    console.log('Exporting waste report...');
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'down' ? 
      <TrendingDown className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600 transform rotate-180" />;
  };

  const filteredWasteData = selectedCategory === 'all' 
    ? wasteData 
    : wasteData.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Waste Tracking & Analysis</h1>
          <p className="text-gray-600 mt-1">Monitor and reduce food waste with detailed insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedTimeFilter}
            onChange={(e) => setSelectedTimeFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={handleLogWaste}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log Waste</span>
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Waste Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Waste</p>
              <p className="text-2xl font-bold text-gray-900">{totalWasteQuantity.toFixed(1)} kg</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">This week's total</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Waste Cost</p>
              <p className="text-2xl font-bold text-gray-900">${totalWasteCost.toFixed(2)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-orange-600 mt-2">Financial impact</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Waste Rate</p>
              <p className="text-2xl font-bold text-gray-900">3.2%</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-yellow-600 mt-2">Of total inventory</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alerts</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-600 mt-2">High waste items</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waste Log Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Waste Log</h3>
                <p className="text-sm text-gray-600 mt-1">Detailed waste tracking entries</p>
              </div>
              <select
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Produce">Produce</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Bakery">Bakery</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWasteData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.item}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {item.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waste Analysis */}
        <div className="space-y-6">
          {/* Waste by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Waste by Category</h3>
            </div>
            <div className="p-6 space-y-4">
              {wasteByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.category}</div>
                      <div className="text-xs text-gray-500">${category.cost.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                    {getTrendIcon(category.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Reasons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Waste Reasons</h3>
            </div>
            <div className="p-6 space-y-4">
              {wasteReasons.map((reason, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{reason.reason}</div>
                    <div className="text-xs text-gray-500">${reason.cost.toFixed(2)}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{reason.count} items</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <LLMRecommendations section="waste-tracking" />

      {/* Log Waste Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Log Waste Entry</h2>
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
                    value={newWasteEntry.item}
                    onChange={(e) => handleInputChange('item', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newWasteEntry.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Produce">Produce</option>
                    <option value="Meat">Meat</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Seafood">Seafood</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWasteEntry.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    value={newWasteEntry.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="L">Liters (L)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="pieces">Pieces</option>
                    <option value="units">Units</option>
                    <option value="boxes">Boxes</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newWasteEntry.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <select
                    value={newWasteEntry.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select reason</option>
                    <option value="Spoilage">Spoilage</option>
                    <option value="Expired">Expired</option>
                    <option value="End of day">End of day</option>
                    <option value="Overproduction">Overproduction</option>
                    <option value="Customer returns">Customer returns</option>
                    <option value="Quality issues">Quality issues</option>
                    <option value="Preparation waste">Preparation waste</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Member
                  </label>
                  <input
                    type="text"
                    value={newWasteEntry.staff}
                    onChange={(e) => handleInputChange('staff', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter staff name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newWasteEntry.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                onClick={handleSubmitWaste}
                disabled={!newWasteEntry.item || !newWasteEntry.category || !newWasteEntry.quantity || !newWasteEntry.cost || !newWasteEntry.reason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Log Waste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteTracking;