import React, { useState } from 'react';
import { Trash2, TrendingDown, AlertTriangle, DollarSign, Calendar, Plus } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const WasteTracking: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

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
      staff: 'John Doe'
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
      staff: 'Jane Smith'
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
      staff: 'Mike Johnson'
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
      staff: 'Sarah Wilson'
    }
  ];

  const wasteByCategory = [
    { category: 'Produce', amount: 45.2, percentage: 35, trend: 'down' },
    { category: 'Meat', amount: 28.5, percentage: 22, trend: 'up' },
    { category: 'Dairy', amount: 18.7, percentage: 14, trend: 'stable' },
    { category: 'Bakery', amount: 24.3, percentage: 19, trend: 'down' },
    { category: 'Other', amount: 12.8, percentage: 10, trend: 'stable' }
  ];

  const wasteReasons = [
    { reason: 'Spoilage', count: 15, percentage: 35 },
    { reason: 'Expired', count: 12, percentage: 28 },
    { reason: 'End of day', count: 8, percentage: 19 },
    { reason: 'Overproduction', count: 5, percentage: 12 },
    { reason: 'Customer returns', count: 3, percentage: 7 }
  ];

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Waste Tracking & Analysis</h1>
        <div className="flex space-x-md">
          <select
            className="glass-input"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="glass-button flex items-center space-x-sm">
            <Plus size={16} />
            <span>Log Waste</span>
          </button>
        </div>
      </div>

      {/* Waste Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Waste</p>
              <p className="text-xl font-semibold text-text-primary">129.5 kg</p>
            </div>
            <Trash2 className="text-error" size={20} />
          </div>
          <p className="text-sm text-success mt-sm">-12% from last week</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Waste Cost</p>
              <p className="text-xl font-semibold text-text-primary">$385.20</p>
            </div>
            <DollarSign className="text-error" size={20} />
          </div>
          <p className="text-sm text-success mt-sm">-15% from last week</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Waste Percentage</p>
              <p className="text-xl font-semibold text-text-primary">8.2%</p>
            </div>
            <TrendingDown className="text-success" size={20} />
          </div>
          <p className="text-sm text-success mt-sm">Target: {'<'}6%</p>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Waste Entries</p>
              <p className="text-xl font-semibold text-text-primary">43</p>
            </div>
            <Calendar className="text-primary" size={20} />
          </div>
          <p className="text-sm text-primary mt-sm">This week</p>
        </div>
      </div>

      {/* Waste by Category */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md">Waste by Category</h3>
        <div className="space-y-md">
          {wasteByCategory.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-md">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-sm font-medium text-text-primary">{category.category}</span>
              </div>
              <div className="flex items-center space-x-md">
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">{category.amount} kg</p>
                  <p className="text-xs text-text-secondary">{category.percentage}%</p>
                </div>
                <div className="w-24 bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-default"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
                {category.trend === 'down' ? (
                  <TrendingDown size={14} className="text-success" />
                ) : category.trend === 'up' ? (
                  <TrendingDown size={14} className="text-error transform rotate-180" />
                ) : (
                  <div className="w-3.5 h-3.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waste Reasons */}
      <div className="glass-card p-lg">
        <h3 className="text-md font-semibold text-text-primary mb-md">Waste Reasons Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="space-y-md">
            {wasteReasons.map((reason, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{reason.reason}</span>
                <div className="flex items-center space-x-sm">
                  <span className="text-sm font-medium text-text-primary">{reason.count}</span>
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div
                      className="bg-error h-2 rounded-full transition-default"
                      style={{ width: `${reason.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary">{reason.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-warning/10 p-md rounded-md">
            <div className="flex items-center mb-sm">
              <AlertTriangle className="text-warning mr-sm" size={14} />
              <p className="text-sm font-medium text-warning">Recommendations</p>
            </div>
            <ul className="text-sm text-warning/80 space-y-xs">
              <li>• Improve storage conditions to reduce spoilage</li>
              <li>• Implement FIFO rotation system</li>
              <li>• Review portion sizes to reduce overproduction</li>
              <li>• Train staff on proper handling procedures</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Waste Log */}
      <div className="glass-table">
        <div className="px-lg py-md border-b border-border">
          <h3 className="text-md font-semibold text-text-primary">Recent Waste Log</h3>
        </div>
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
                  Quantity
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Date
                </th>
                <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Staff
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {wasteData.map((item) => (
                <tr key={item.id} className="hover:bg-white/40 transition-default">
                  <td className="px-lg py-md whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{item.item}</div>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.category}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    ${item.cost}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    <span className={`glass-badge ${
                      item.reason === 'Spoilage' ? 'glass-badge-error' :
                      item.reason === 'Expired' ? 'glass-badge-warning' :
                      'glass-badge-info'
                    }`}>
                      {item.reason}
                    </span>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.date}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                    {item.staff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <LLMRecommendations section="waste" />
    </div>
  );
};

export default WasteTracking;