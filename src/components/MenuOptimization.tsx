import React, { useState } from 'react';
import { Utensils, TrendingUp, TrendingDown, DollarSign, Clock, Star, AlertTriangle } from 'lucide-react';
import LLMRecommendations from './LLMRecommendations';

const MenuOptimization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance');

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
      status: 'optimize'
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
      status: 'review'
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
      status: 'good'
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
      status: 'good'
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
      status: 'review'
    }
  ];

  const recommendations = [
    {
      type: 'price',
      item: 'Margherita Pizza',
      suggestion: 'Increase price by $1.50',
      impact: '+$351 monthly revenue',
      priority: 'high'
    },
    {
      type: 'portion',
      item: 'Caesar Salad',
      suggestion: 'Reduce portion size by 15%',
      impact: '+8.2% margin improvement',
      priority: 'medium'
    },
    {
      type: 'ingredient',
      item: 'Chicken Parmesan',
      suggestion: 'Source cheaper mozzarella',
      impact: '+$89 monthly savings',
      priority: 'low'
    },
    {
      type: 'remove',
      item: 'Seafood Pasta',
      suggestion: 'Consider removing from menu',
      impact: 'Low sales, high waste',
      priority: 'high'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return 'glass-badge-success';
      case 'optimize':
        return 'glass-badge-info';
      case 'review':
        return 'glass-badge-warning';
      default:
        return 'glass-badge-info';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'glass-badge-error';
      case 'medium':
        return 'glass-badge-warning';
      case 'low':
        return 'glass-badge-success';
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
        <h1 className="text-xl font-semibold text-text-primary">Menu & Portion Optimization</h1>
        <button className="glass-button">
          Generate Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Menu Items</p>
              <p className="text-xl font-semibold text-text-primary">47</p>
            </div>
            <Utensils className="text-primary" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Avg Margin</p>
              <p className="text-xl font-semibold text-text-primary">66.5%</p>
            </div>
            <DollarSign className="text-success" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Top Performer</p>
              <p className="text-xl font-semibold text-text-primary">Pizza</p>
            </div>
            <Star className="text-warning" size={20} />
          </div>
        </div>
        <div className="glass-card p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Avg Prep Time</p>
              <p className="text-xl font-semibold text-text-primary">13 min</p>
            </div>
            <Clock className="text-accent" size={20} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-lg">
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'performance'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-md px-xs border-b-2 font-medium text-sm transition-default ${
                activeTab === 'recommendations'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Recommendations
            </button>
          </nav>
        </div>

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="glass-table-header">
                <tr>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Popularity
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-lg py-md text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40 transition-default">
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{item.name}</div>
                      <div className="text-sm text-text-secondary">{item.category}</div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="text-sm text-text-primary">${item.price}</div>
                      <div className="text-sm text-text-secondary">Cost: ${item.cost}</div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{item.margin.toFixed(1)}%</div>
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div
                          className="bg-success h-2 rounded-full transition-default"
                          style={{ width: `${item.margin}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">{item.popularity}%</div>
                      <div className="w-16 bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-default"
                          style={{ width: `${item.popularity}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="text-warning mr-xs" size={14} />
                        <span className="text-sm text-text-primary">{item.rating}</span>
                      </div>
                    </td>
                    <td className="px-lg py-md whitespace-nowrap text-sm text-text-primary">
                      {item.orders}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      {getTrendIcon(item.trend)}
                    </td>
                    <td className="px-lg py-md whitespace-nowrap">
                      <span className={`${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="p-lg">
            <LLMRecommendations section="menu" />
            <div className="mt-lg bg-primary/10 p-md rounded-md">
              <div className="flex items-center mb-sm">
                <AlertTriangle className="text-primary mr-sm" size={14} />
                <p className="text-sm font-medium text-primary">Optimization Insights</p>
              </div>
              <ul className="text-sm text-primary/80 space-y-xs">
                <li>• Items with {'>'}80% popularity and {'>'}70% margin are performing well</li>
                <li>• Consider bundling low-performing items with popular ones</li>
                <li>• Monitor seasonal trends for ingredient cost optimization</li>
                <li>• Review prep times for items with long wait times</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuOptimization;