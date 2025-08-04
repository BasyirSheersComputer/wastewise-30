// Coffee Chain Service - Focused on operational intelligence for coffee chains
export class CoffeeChainService {
  constructor() {
    this.recipes = [
      {
        id: 1,
        name: 'Espresso',
        ingredients: [
          { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
          { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
        ],
        expectedYield: 1,
        actualYield: 0.95,
        wasteRate: 5.0,
        sellingPrice: 3.50,
        cost: 0.53
      },
      {
        id: 2,
        name: 'Latte',
        ingredients: [
          { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
          { name: 'Fresh Milk', quantity: 0.24, unit: 'L', cost: 0.77 },
          { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
        ],
        expectedYield: 1,
        actualYield: 0.88,
        wasteRate: 12.0,
        sellingPrice: 5.50,
        cost: 1.09
      },
      {
        id: 3,
        name: 'Cappuccino',
        ingredients: [
          { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
          { name: 'Fresh Milk', quantity: 0.18, unit: 'L', cost: 0.58 },
          { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
        ],
        expectedYield: 1,
        actualYield: 0.91,
        wasteRate: 9.0,
        sellingPrice: 5.00,
        cost: 0.97
      },
      {
        id: 4,
        name: 'Mocha',
        ingredients: [
          { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
          { name: 'Fresh Milk', quantity: 0.20, unit: 'L', cost: 0.64 },
          { name: 'Chocolate Powder', quantity: 0.015, unit: 'kg', cost: 0.13 },
          { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
        ],
        expectedYield: 1,
        actualYield: 0.85,
        wasteRate: 15.0,
        sellingPrice: 6.50,
        cost: 1.34
      }
    ];

    this.inventory = [
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
        wasteRate: 6.8,
        cogsPerCup: 0.25
      }
    ];

    this.wasteEvents = [
      {
        id: 'WE-001',
        item: 'Arabica Coffee Beans',
        quantity: '2.5kg',
        reason: 'Over-extraction',
        cost: 46.25,
        timestamp: '2024-01-16 14:30',
        staff: 'Barista John',
        shift: 'Morning'
      },
      {
        id: 'WE-002',
        item: 'Fresh Milk',
        quantity: '3L',
        reason: 'Spillage',
        cost: 9.60,
        timestamp: '2024-01-16 12:15',
        staff: 'Barista Sarah',
        shift: 'Morning'
      },
      {
        id: 'WE-003',
        item: 'Vanilla Syrup',
        quantity: '0.5L',
        reason: 'Expired',
        cost: 6.00,
        timestamp: '2024-01-16 09:45',
        staff: 'Manager Mike',
        shift: 'Opening'
      },
      {
        id: 'WE-004',
        item: 'Arabica Coffee Beans',
        quantity: '1.2kg',
        reason: 'Training waste',
        cost: 22.20,
        timestamp: '2024-01-15 16:20',
        staff: 'Trainee Alex',
        shift: 'Afternoon'
      }
    ];
  }

  async getOperationalDashboard() {
    try {
      // Calculate key metrics
      const totalWasteCost = this.wasteEvents.reduce((sum, event) => sum + event.cost, 0);
      const avgWasteRate = this.inventory.reduce((sum, item) => sum + item.wasteRate, 0) / this.inventory.length;
      const avgCogsPerCup = this.inventory.reduce((sum, item) => sum + item.cogsPerCup, 0) / this.inventory.length;
      
      // Calculate recipe yield accuracy
      const totalExpectedYield = this.recipes.reduce((sum, recipe) => sum + recipe.expectedYield, 0);
      const totalActualYield = this.recipes.reduce((sum, recipe) => sum + recipe.actualYield, 0);
      const yieldAccuracy = (totalActualYield / totalExpectedYield) * 100;

      return {
        success: true,
        data: {
          kpis: {
            yieldAccuracy: yieldAccuracy.toFixed(1),
            wasteRate: avgWasteRate.toFixed(1),
            cogsPerCup: avgCogsPerCup.toFixed(2),
            totalWasteCost: totalWasteCost.toFixed(2)
          },
          recipes: this.recipes,
          wasteEvents: this.wasteEvents.slice(0, 5), // Recent events
          inventory: this.inventory
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRecipeAnalysis() {
    try {
      const recipeAnalysis = this.recipes.map(recipe => ({
        ...recipe,
        margin: ((recipe.sellingPrice - recipe.cost) / recipe.sellingPrice * 100).toFixed(1),
        wasteCost: (recipe.cost * (recipe.wasteRate / 100)).toFixed(2),
        potentialSavings: (recipe.cost * (recipe.wasteRate / 100)).toFixed(2)
      }));

      return {
        success: true,
        data: recipeAnalysis
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getWasteAnalysis(timeRange = 'week') {
    try {
      // Filter waste events by time range (simplified)
      const recentWasteEvents = this.wasteEvents.slice(0, 10);
      
      const wasteByCategory = {};
      const wasteByStaff = {};
      const wasteByReason = {};

      recentWasteEvents.forEach(event => {
        // By category
        const category = this.getCategoryForItem(event.item);
        wasteByCategory[category] = (wasteByCategory[category] || 0) + event.cost;
        
        // By staff
        wasteByStaff[event.staff] = (wasteByStaff[event.staff] || 0) + event.cost;
        
        // By reason
        wasteByReason[event.reason] = (wasteByReason[event.reason] || 0) + event.cost;
      });

      return {
        success: true,
        data: {
          totalWasteCost: recentWasteEvents.reduce((sum, event) => sum + event.cost, 0),
          wasteByCategory,
          wasteByStaff,
          wasteByReason,
          recentEvents: recentWasteEvents
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCogsAnalysis() {
    try {
      const cogsByRecipe = this.recipes.map(recipe => ({
        name: recipe.name,
        cost: recipe.cost,
        sellingPrice: recipe.sellingPrice,
        margin: ((recipe.sellingPrice - recipe.cost) / recipe.sellingPrice * 100).toFixed(1),
        wasteImpact: (recipe.cost * (recipe.wasteRate / 100)).toFixed(2)
      }));

      const avgCogs = this.inventory.reduce((sum, item) => sum + item.cogsPerCup, 0) / this.inventory.length;

      return {
        success: true,
        data: {
          cogsByRecipe,
          averageCogs: avgCogs.toFixed(2),
          totalInventoryValue: this.inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0).toFixed(2)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async logWasteEvent(wasteData) {
    try {
      const newEvent = {
        id: `WE-${Date.now()}`,
        ...wasteData,
        timestamp: new Date().toISOString()
      };

      this.wasteEvents.unshift(newEvent);

      return {
        success: true,
        data: newEvent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateRecipe(recipeId, updates) {
    try {
      const recipeIndex = this.recipes.findIndex(r => r.id === recipeId);
      if (recipeIndex === -1) {
        throw new Error('Recipe not found');
      }

      this.recipes[recipeIndex] = { ...this.recipes[recipeIndex], ...updates };

      return {
        success: true,
        data: this.recipes[recipeIndex]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getCategoryForItem(itemName) {
    const item = this.inventory.find(i => i.name === itemName);
    return item ? item.category : 'Other';
  }

  async getForecastRecommendations() {
    try {
      // Analyze waste patterns and provide recommendations
      const recommendations = [
        {
          type: 'waste_reduction',
          priority: 'high',
          title: 'Reduce Latte Waste',
          description: 'Latte has 12% waste rate - focus on milk portioning training',
          impact: 'Potential savings: $45/week',
          action: 'Schedule barista training for milk portioning'
        },
        {
          type: 'inventory_optimization',
          priority: 'medium',
          title: 'Optimize Coffee Bean Orders',
          description: 'Current stock levels suggest over-ordering',
          impact: 'Potential savings: $120/week',
          action: 'Review reorder points and adjust lead times'
        },
        {
          type: 'recipe_optimization',
          priority: 'low',
          title: 'Standardize Mocha Preparation',
          description: 'Mocha has highest waste rate at 15%',
          impact: 'Potential savings: $30/week',
          action: 'Create detailed SOP for mocha preparation'
        }
      ];

      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new CoffeeChainService(); 