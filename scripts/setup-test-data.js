#!/usr/bin/env node

/**
 * Test Data Setup Script
 * Creates comprehensive test data for the entire WasteWise system
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 Setting up comprehensive test data for WasteWise system...\n');

class TestDataSetup {
  constructor() {
    this.testData = {
      restaurants: [],
      menuItems: [],
      inventory: [],
      wasteEvents: [],
      sales: [],
      aiRecommendations: [],
      users: [],
      analytics: []
    };
  }

  generateRestaurants() {
    console.log('🏪 Generating restaurant data...');
    
    const restaurantTypes = ['Fine Dining', 'Casual Dining', 'Fast Food', 'Cafe', 'Food Truck'];
    const cities = ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Malacca'];
    
    for (let i = 1; i <= 5; i++) {
      this.testData.restaurants.push({
        id: `restaurant-${i}`,
        name: `Test Restaurant ${i}`,
        type: restaurantTypes[i % restaurantTypes.length],
        location: {
          address: `${i}${i}${i} Test Street`,
          city: cities[i % cities.length],
          state: 'Malaysia',
          postalCode: `${i}${i}${i}${i}${i}`
        },
        settings: {
          theme: 'default',
          timezone: 'Asia/Kuala_Lumpur',
          currency: 'MYR',
          language: 'en'
        },
        contact: {
          phone: `+60-${i}${i}-${i}${i}${i}-${i}${i}${i}${i}`,
          email: `restaurant${i}@test.com`,
          website: `https://restaurant${i}.test.com`
        },
        created_at: new Date().toISOString()
      });
    }
    
    console.log(`✅ Generated ${this.testData.restaurants.length} restaurants`);
  }

  generateMenuItems() {
    console.log('🍽️ Generating menu items...');
    
    const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides'];
    const items = [
      { name: 'Chicken Satay', category: 'Appetizers', cost: 8.50, price: 15.00, waste_factor: 0.05 },
      { name: 'Beef Rendang', category: 'Main Course', cost: 12.00, price: 25.00, waste_factor: 0.08 },
      { name: 'Nasi Lemak', category: 'Main Course', cost: 6.00, price: 12.00, waste_factor: 0.03 },
      { name: 'Laksa', category: 'Main Course', cost: 9.00, price: 18.00, waste_factor: 0.06 },
      { name: 'Cendol', category: 'Desserts', cost: 3.00, price: 8.00, waste_factor: 0.02 },
      { name: 'Teh Tarik', category: 'Beverages', cost: 1.50, price: 4.00, waste_factor: 0.01 },
      { name: 'Roti Canai', category: 'Sides', cost: 2.00, price: 5.00, waste_factor: 0.04 },
      { name: 'Curry Chicken', category: 'Main Course', cost: 10.00, price: 20.00, waste_factor: 0.07 },
      { name: 'Mee Goreng', category: 'Main Course', cost: 7.00, price: 14.00, waste_factor: 0.05 },
      { name: 'Ice Kacang', category: 'Desserts', cost: 4.00, price: 9.00, waste_factor: 0.03 }
    ];
    
    this.testData.restaurants.forEach(restaurant => {
      items.forEach((item, index) => {
        this.testData.menuItems.push({
          id: `menu-${restaurant.id}-${index}`,
          restaurant_id: restaurant.id,
          name: item.name,
          category: item.category,
          cost: item.cost,
          price: item.price,
          waste_factor: item.waste_factor,
          description: `Delicious ${item.name} prepared fresh daily`,
          allergens: ['gluten', 'dairy'].slice(0, Math.floor(Math.random() * 2) + 1),
          nutritional_info: {
            calories: Math.floor(Math.random() * 500) + 200,
            protein: Math.floor(Math.random() * 30) + 5,
            carbs: Math.floor(Math.random() * 50) + 10,
            fat: Math.floor(Math.random() * 20) + 5
          },
          created_at: new Date().toISOString()
        });
      });
    });
    
    console.log(`✅ Generated ${this.testData.menuItems.length} menu items`);
  }

  generateInventory() {
    console.log('📦 Generating inventory data...');
    
    const ingredients = [
      { name: 'Chicken Breast', unit: 'kg', cost_per_unit: 12.00 },
      { name: 'Beef Mince', unit: 'kg', cost_per_unit: 18.00 },
      { name: 'Rice', unit: 'kg', cost_per_unit: 4.50 },
      { name: 'Coconut Milk', unit: 'liter', cost_per_unit: 6.00 },
      { name: 'Curry Powder', unit: 'kg', cost_per_unit: 25.00 },
      { name: 'Onions', unit: 'kg', cost_per_unit: 3.00 },
      { name: 'Tomatoes', unit: 'kg', cost_per_unit: 4.00 },
      { name: 'Cooking Oil', unit: 'liter', cost_per_unit: 8.00 },
      { name: 'Sugar', unit: 'kg', cost_per_unit: 3.50 },
      { name: 'Salt', unit: 'kg', cost_per_unit: 2.00 }
    ];
    
    this.testData.restaurants.forEach(restaurant => {
      ingredients.forEach((ingredient, index) => {
        const quantity = Math.floor(Math.random() * 50) + 10;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + Math.floor(Math.random() * 30) + 7);
        
        this.testData.inventory.push({
          id: `inventory-${restaurant.id}-${index}`,
          restaurant_id: restaurant.id,
          item_name: ingredient.name,
          quantity: quantity,
          unit: ingredient.unit,
          cost_per_unit: ingredient.cost_per_unit,
          total_cost: quantity * ingredient.cost_per_unit,
          expiry_date: expiryDate.toISOString().split('T')[0],
          supplier: `Supplier ${Math.floor(Math.random() * 5) + 1}`,
          reorder_level: Math.floor(quantity * 0.2),
          created_at: new Date().toISOString()
        });
      });
    });
    
    console.log(`✅ Generated ${this.testData.inventory.length} inventory items`);
  }

  generateWasteEvents() {
    console.log('🗑️ Generating waste events...');
    
    const wasteReasons = [
      'Expired', 'Overcooked', 'Customer Return', 'Preparation Error',
      'Quality Issue', 'Overstocked', 'Equipment Failure', 'Staff Error'
    ];
    
    this.testData.restaurants.forEach(restaurant => {
      const restaurantMenuItems = this.testData.menuItems.filter(item => item.restaurant_id === restaurant.id);
      
      // Generate 10-20 waste events per restaurant
      const numEvents = Math.floor(Math.random() * 11) + 10;
      
      for (let i = 0; i < numEvents; i++) {
        const menuItem = restaurantMenuItems[Math.floor(Math.random() * restaurantMenuItems.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        const reason = wasteReasons[Math.floor(Math.random() * wasteReasons.length)];
        const cost = quantity * menuItem.cost;
        
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 30));
        
        this.testData.wasteEvents.push({
          id: `waste-${restaurant.id}-${i}`,
          restaurant_id: restaurant.id,
          item_id: menuItem.id,
          item_name: menuItem.name,
          quantity: quantity,
          unit: 'servings',
          reason: reason,
          cost: cost,
          recorded_by: `staff-${Math.floor(Math.random() * 5) + 1}`,
          notes: `Waste event for ${menuItem.name} - ${reason}`,
          created_at: eventDate.toISOString()
        });
      }
    });
    
    console.log(`✅ Generated ${this.testData.wasteEvents.length} waste events`);
  }

  generateSales() {
    console.log('💰 Generating sales data...');
    
    this.testData.restaurants.forEach(restaurant => {
      const restaurantMenuItems = this.testData.menuItems.filter(item => item.restaurant_id === restaurant.id);
      
      // Generate 50-100 sales records per restaurant
      const numSales = Math.floor(Math.random() * 51) + 50;
      
      for (let i = 0; i < numSales; i++) {
        const menuItem = restaurantMenuItems[Math.floor(Math.random() * restaurantMenuItems.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const revenue = quantity * menuItem.price;
        
        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30));
        
        this.testData.sales.push({
          id: `sale-${restaurant.id}-${i}`,
          restaurant_id: restaurant.id,
          item_id: menuItem.id,
          item_name: menuItem.name,
          quantity: quantity,
          revenue: revenue,
          cost: quantity * menuItem.cost,
          profit: revenue - (quantity * menuItem.cost),
          payment_method: ['cash', 'card', 'online'][Math.floor(Math.random() * 3)],
          customer_type: ['walk-in', 'reservation', 'takeaway'][Math.floor(Math.random() * 3)],
          timestamp: saleDate.toISOString()
        });
      }
    });
    
    console.log(`✅ Generated ${this.testData.sales.length} sales records`);
  }

  generateAIRecommendations() {
    console.log('🤖 Generating AI recommendations...');
    
    const recommendationTypes = [
      'waste_reduction', 'menu_optimization', 'inventory_management',
      'pricing_strategy', 'staff_training', 'supplier_optimization'
    ];
    
    this.testData.restaurants.forEach(restaurant => {
      recommendationTypes.forEach((type, index) => {
        const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
        
        this.testData.aiRecommendations.push({
          id: `ai-rec-${restaurant.id}-${index}`,
          restaurant_id: restaurant.id,
          recommendation_type: type,
          title: `${type.replace('_', ' ').toUpperCase()} Recommendation`,
          content: {
            summary: `AI-generated recommendation for ${type.replace('_', ' ')}`,
            details: `This is a detailed recommendation for improving ${type.replace('_', ' ')} at ${restaurant.name}`,
            actions: [
              'Implement waste tracking system',
              'Optimize menu pricing',
              'Train staff on waste reduction',
              'Review supplier contracts'
            ],
            expected_impact: {
              cost_savings: Math.floor(Math.random() * 5000) + 1000,
              waste_reduction: Math.floor(Math.random() * 30) + 10,
              efficiency_gain: Math.floor(Math.random() * 25) + 5
            }
          },
          confidence: confidence,
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
          created_at: new Date().toISOString()
        });
      });
    });
    
    console.log(`✅ Generated ${this.testData.aiRecommendations.length} AI recommendations`);
  }

  generateUsers() {
    console.log('👥 Generating user data...');
    
    const userRoles = ['owner', 'manager', 'staff', 'admin'];
    
    this.testData.restaurants.forEach(restaurant => {
      // Generate 3-5 users per restaurant
      const numUsers = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numUsers; i++) {
        const role = userRoles[i % userRoles.length];
        
        this.testData.users.push({
          id: `user-${restaurant.id}-${i}`,
          restaurant_id: restaurant.id,
          username: `user${i}@${restaurant.name.toLowerCase().replace(' ', '')}.com`,
          email: `user${i}@${restaurant.name.toLowerCase().replace(' ', '')}.com`,
          role: role,
          name: `User ${i} ${restaurant.name}`,
          phone: `+60-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          permissions: this.getPermissionsForRole(role),
          is_active: true,
          last_login: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
    });
    
    console.log(`✅ Generated ${this.testData.users.length} users`);
  }

  getPermissionsForRole(role) {
    const permissions = {
      owner: ['read', 'write', 'delete', 'admin', 'analytics', 'reports'],
      manager: ['read', 'write', 'analytics', 'reports'],
      staff: ['read', 'write'],
      admin: ['read', 'write', 'delete', 'admin']
    };
    return permissions[role] || ['read'];
  }

  generateAnalytics() {
    console.log('📊 Generating analytics data...');
    
    this.testData.restaurants.forEach(restaurant => {
      const restaurantSales = this.testData.sales.filter(sale => sale.restaurant_id === restaurant.id);
      const restaurantWaste = this.testData.wasteEvents.filter(waste => waste.restaurant_id === restaurant.id);
      
      // Calculate analytics
      const totalRevenue = restaurantSales.reduce((sum, sale) => sum + sale.revenue, 0);
      const totalCost = restaurantSales.reduce((sum, sale) => sum + sale.cost, 0);
      const totalProfit = totalRevenue - totalCost;
      const totalWasteCost = restaurantWaste.reduce((sum, waste) => sum + waste.cost, 0);
      
      this.testData.analytics.push({
        id: `analytics-${restaurant.id}`,
        restaurant_id: restaurant.id,
        period: 'last_30_days',
        metrics: {
          total_revenue: totalRevenue,
          total_cost: totalCost,
          total_profit: totalProfit,
          total_waste_cost: totalWasteCost,
          profit_margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
          waste_percentage: totalRevenue > 0 ? (totalWasteCost / totalRevenue) * 100 : 0,
          average_order_value: restaurantSales.length > 0 ? totalRevenue / restaurantSales.length : 0,
          total_orders: restaurantSales.length,
          total_waste_events: restaurantWaste.length
        },
        top_selling_items: this.getTopSellingItems(restaurant.id),
        waste_analysis: this.getWasteAnalysis(restaurant.id),
        recommendations: this.getAnalyticsRecommendations(restaurant.id),
        created_at: new Date().toISOString()
      });
    });
    
    console.log(`✅ Generated ${this.testData.analytics.length} analytics records`);
  }

  getTopSellingItems(restaurantId) {
    const restaurantSales = this.testData.sales.filter(sale => sale.restaurant_id === restaurantId);
    const itemSales = {};
    
    restaurantSales.forEach(sale => {
      if (!itemSales[sale.item_name]) {
        itemSales[sale.item_name] = { quantity: 0, revenue: 0 };
      }
      itemSales[sale.item_name].quantity += sale.quantity;
      itemSales[sale.item_name].revenue += sale.revenue;
    });
    
    return Object.entries(itemSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  getWasteAnalysis(restaurantId) {
    const restaurantWaste = this.testData.wasteEvents.filter(waste => waste.restaurant_id === restaurantId);
    const wasteByReason = {};
    
    restaurantWaste.forEach(waste => {
      if (!wasteByReason[waste.reason]) {
        wasteByReason[waste.reason] = { count: 0, cost: 0 };
      }
      wasteByReason[waste.reason].count++;
      wasteByReason[waste.reason].cost += waste.cost;
    });
    
    return Object.entries(wasteByReason)
      .map(([reason, data]) => ({ reason, ...data }))
      .sort((a, b) => b.cost - a.cost);
  }

  getAnalyticsRecommendations(restaurantId) {
    const restaurantAnalytics = this.testData.analytics.find(a => a.restaurant_id === restaurantId);
    const recommendations = [];
    
    if (restaurantAnalytics && restaurantAnalytics.metrics.waste_percentage > 10) {
      recommendations.push({
        type: 'waste_reduction',
        priority: 'high',
        description: 'Waste percentage is high. Implement waste tracking and staff training.',
        expected_savings: restaurantAnalytics.metrics.total_waste_cost * 0.3
      });
    }
    
    if (restaurantAnalytics && restaurantAnalytics.metrics.profit_margin < 20) {
      recommendations.push({
        type: 'pricing_optimization',
        priority: 'medium',
        description: 'Profit margin is low. Review pricing strategy and cost structure.',
        expected_savings: restaurantAnalytics.metrics.total_revenue * 0.05
      });
    }
    
    return recommendations;
  }

  saveTestData() {
    console.log('💾 Saving test data to files...');
    
    // Create test-data directory
    const testDataDir = './test-data';
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir);
    }
    
    // Save each data type to separate files
    Object.entries(this.testData).forEach(([key, data]) => {
      const filename = path.join(testDataDir, `${key}.json`);
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      console.log(`✅ Saved ${data.length} ${key} to ${filename}`);
    });
    
    // Create combined test data file
    const combinedData = {
      summary: {
        restaurants: this.testData.restaurants.length,
        menu_items: this.testData.menuItems.length,
        inventory_items: this.testData.inventory.length,
        waste_events: this.testData.wasteEvents.length,
        sales_records: this.testData.sales.length,
        ai_recommendations: this.testData.aiRecommendations.length,
        users: this.testData.users.length,
        analytics_records: this.testData.analytics.length
      },
      data: this.testData
    };
    
    fs.writeFileSync(path.join(testDataDir, 'combined-test-data.json'), JSON.stringify(combinedData, null, 2));
    console.log('✅ Saved combined test data to test-data/combined-test-data.json');
  }

  generateDatabaseScripts() {
    console.log('🗄️ Generating database scripts...');
    
    const scriptsDir = './database';
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir);
    }
    
    // Generate SQL insert statements
    let sqlScript = '-- Test Data Insert Script\n\n';
    
    // Insert restaurants
    sqlScript += '-- Insert Restaurants\n';
    this.testData.restaurants.forEach(restaurant => {
      sqlScript += `INSERT INTO restaurants (id, name, location, settings, created_at) VALUES ('${restaurant.id}', '${restaurant.name}', '${JSON.stringify(restaurant.location)}', '${JSON.stringify(restaurant.settings)}', '${restaurant.created_at}');\n`;
    });
    
    // Insert menu items
    sqlScript += '\n-- Insert Menu Items\n';
    this.testData.menuItems.forEach(item => {
      sqlScript += `INSERT INTO menu_items (id, restaurant_id, name, category, cost, price, waste_factor, created_at) VALUES ('${item.id}', '${item.restaurant_id}', '${item.name}', '${item.category}', ${item.cost}, ${item.price}, ${item.waste_factor}, '${item.created_at}');\n`;
    });
    
    // Insert inventory
    sqlScript += '\n-- Insert Inventory\n';
    this.testData.inventory.forEach(item => {
      sqlScript += `INSERT INTO inventory (id, restaurant_id, item_name, quantity, unit, cost_per_unit, total_cost, expiry_date, supplier, reorder_level, created_at) VALUES ('${item.id}', '${item.restaurant_id}', '${item.item_name}', ${item.quantity}, '${item.unit}', ${item.cost_per_unit}, ${item.total_cost}, '${item.expiry_date}', '${item.supplier}', ${item.reorder_level}, '${item.created_at}');\n`;
    });
    
    // Insert waste events
    sqlScript += '\n-- Insert Waste Events\n';
    this.testData.wasteEvents.forEach(event => {
      sqlScript += `INSERT INTO waste_events (id, restaurant_id, item_id, item_name, quantity, unit, reason, cost, recorded_by, notes, created_at) VALUES ('${event.id}', '${event.restaurant_id}', '${event.item_id}', '${event.item_name}', ${event.quantity}, '${event.unit}', '${event.reason}', ${event.cost}, '${event.recorded_by}', '${event.notes}', '${event.created_at}');\n`;
    });
    
    // Insert sales
    sqlScript += '\n-- Insert Sales\n';
    this.testData.sales.forEach(sale => {
      sqlScript += `INSERT INTO sales (id, restaurant_id, item_id, item_name, quantity, revenue, cost, profit, payment_method, customer_type, timestamp) VALUES ('${sale.id}', '${sale.restaurant_id}', '${sale.item_id}', '${sale.item_name}', ${sale.quantity}, ${sale.revenue}, ${sale.cost}, ${sale.profit}, '${sale.payment_method}', '${sale.customer_type}', '${sale.timestamp}');\n`;
    });
    
    // Insert AI recommendations
    sqlScript += '\n-- Insert AI Recommendations\n';
    this.testData.aiRecommendations.forEach(rec => {
      sqlScript += `INSERT INTO ai_recommendations (id, restaurant_id, recommendation_type, title, content, confidence, priority, status, created_at) VALUES ('${rec.id}', '${rec.restaurant_id}', '${rec.recommendation_type}', '${rec.title}', '${JSON.stringify(rec.content)}', ${rec.confidence}, '${rec.priority}', '${rec.status}', '${rec.created_at}');\n`;
    });
    
    fs.writeFileSync(path.join(scriptsDir, 'test-data.sql'), sqlScript);
    console.log('✅ Generated database script: database/test-data.sql');
  }

  run() {
    console.log('🚀 Starting comprehensive test data generation...\n');
    
    try {
      this.generateRestaurants();
      this.generateMenuItems();
      this.generateInventory();
      this.generateWasteEvents();
      this.generateSales();
      this.generateAIRecommendations();
      this.generateUsers();
      this.generateAnalytics();
      
      this.saveTestData();
      this.generateDatabaseScripts();
      
      console.log('\n🎉 Test data generation completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`   - Restaurants: ${this.testData.restaurants.length}`);
      console.log(`   - Menu Items: ${this.testData.menuItems.length}`);
      console.log(`   - Inventory Items: ${this.testData.inventory.length}`);
      console.log(`   - Waste Events: ${this.testData.wasteEvents.length}`);
      console.log(`   - Sales Records: ${this.testData.sales.length}`);
      console.log(`   - AI Recommendations: ${this.testData.aiRecommendations.length}`);
      console.log(`   - Users: ${this.testData.users.length}`);
      console.log(`   - Analytics Records: ${this.testData.analytics.length}`);
      
      console.log('\n📁 Files created:');
      console.log('   - test-data/ (directory with all test data)');
      console.log('   - database/test-data.sql (database insert script)');
      
      console.log('\n🚀 Ready to run the system with test data!');
      
    } catch (error) {
      console.error('❌ Error generating test data:', error);
      process.exit(1);
    }
  }
}

// Run the test data setup
const testDataSetup = new TestDataSetup();
testDataSetup.run(); 