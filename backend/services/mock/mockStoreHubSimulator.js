/**
 * Mock StoreHub POS Simulator
 * Simulates StoreHub POS system responses for testing
 * Based on Zus Coffee data patterns
 */

import logger from '../../utils/logger.js';

export class MockStoreHubSimulator {
  constructor(config = {}) {
    this.outlets = config.outlets || [];
    this.products = config.products || this._getDefaultProducts();
    this.salesData = config.salesData || [];
    this.inventoryData = config.inventoryData || [];
  }

  /**
   * Initialize mock integration
   */
  async initializeIntegration(credentials) {
    // Simulate API validation delay
    await this._delay(100);
    
    return {
      success: true,
      storeId: credentials.storeId || 'store_mock_001',
      storeName: 'Zus Coffee - Pavilion KL',
      integration: {
        status: 'active',
        syncSales: true,
        syncInventory: true,
        syncFrequency: 'realtime'
      }
    };
  }

  /**
   * Fetch sales data (simulated)
   */
  async fetchSalesData(storeId, options = {}) {
    await this._delay(200);
    
    const { startDate, endDate, outletId } = options;
    const days = this._getDaysBetween(startDate, endDate);
    
    // Generate realistic sales data for coffee shop
    const sales = [];
    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    
    days.forEach(date => {
      hours.forEach(hour => {
        // Coffee shops have peak hours: 7-9am, 12-2pm, 5-7pm
        const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 14) || (hour >= 17 && hour <= 19);
        const transactionCount = isPeakHour 
          ? Math.floor(Math.random() * 15) + 10  // 10-25 transactions during peak
          : Math.floor(Math.random() * 8) + 3;   // 3-11 transactions off-peak
        
        for (let i = 0; i < transactionCount; i++) {
          const transactionTime = new Date(date);
          transactionTime.setHours(hour, Math.floor(Math.random() * 60), 0);
          
          const items = this._generateTransactionItems(isPeakHour);
          const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
          
          sales.push({
            transaction_id: `TXN_${date.getTime()}_${hour}_${i}`,
            store_id: storeId,
            outlet_id: outletId || 'outlet_001',
            transaction_date: date.toISOString().split('T')[0],
            transaction_time: transactionTime.toISOString(),
            items: items,
            total_amount: totalAmount,
            payment_method: this._randomPaymentMethod(),
            customer_id: Math.random() > 0.6 ? `CUST_${Math.floor(Math.random() * 1000)}` : null,
            created_at: transactionTime.toISOString()
          });
        }
      });
    });
    
    return {
      success: true,
      data: sales,
      count: sales.length,
      dateRange: { startDate, endDate }
    };
  }

  /**
   * Fetch inventory data (simulated)
   */
  async fetchInventoryData(storeId, options = {}) {
    await this._delay(150);
    
    return {
      success: true,
      data: this.products.map(product => ({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        category: product.category,
        current_stock: Math.floor(Math.random() * 100) + 10,
        unit: product.unit,
        reorder_point: product.reorderPoint || 20,
        reorder_quantity: product.reorderQuantity || 50,
        cost_per_unit: product.costPerUnit,
        last_updated: new Date().toISOString()
      })),
      count: this.products.length
    };
  }

  /**
   * Webhook simulation - receives real-time POS events
   */
  async simulateWebhook(eventType, payload) {
    await this._delay(50);
    
    return {
      success: true,
      event: {
        type: eventType,
        timestamp: new Date().toISOString(),
        payload: payload
      }
    };
  }

  /**
   * Generate realistic transaction items for coffee shop
   */
  _generateTransactionItems(isPeakHour) {
    const items = [];
    const itemCount = isPeakHour 
      ? Math.floor(Math.random() * 3) + 1  // 1-4 items during peak
      : Math.floor(Math.random() * 2) + 1;  // 1-3 items off-peak
    
    const beverages = [
      { name: 'Americano', price: 8.50, category: 'Coffee' },
      { name: 'Latte', price: 10.50, category: 'Coffee' },
      { name: 'Cappuccino', price: 10.50, category: 'Coffee' },
      { name: 'Espresso', price: 7.00, category: 'Coffee' },
      { name: 'Mocha', price: 12.00, category: 'Coffee' },
      { name: 'Matcha Latte', price: 11.50, category: 'Tea' },
      { name: 'Green Tea', price: 6.50, category: 'Tea' },
      { name: 'Oreo Cheesecake', price: 16.50, category: 'Pastry' },
      { name: 'Croissant', price: 8.00, category: 'Pastry' },
      { name: 'Chocolate Chip Cookie', price: 5.50, category: 'Pastry' }
    ];
    
    for (let i = 0; i < itemCount; i++) {
      const beverage = beverages[Math.floor(Math.random() * beverages.length)];
      const quantity = Math.random() > 0.8 ? 2 : 1; // 20% chance of quantity 2
      
      items.push({
        product_id: `PROD_${beverage.name.replace(/\s/g, '_')}`,
        product_name: beverage.name,
        category: beverage.category,
        quantity: quantity,
        unit_price: beverage.price,
        total: beverage.price * quantity
      });
    }
    
    return items;
  }

  /**
   * Default coffee shop products
   */
  _getDefaultProducts() {
    return [
      { id: 'prod_001', name: 'Arabica Coffee Beans', sku: 'BEANS-ARAB-001', category: 'Ingredients', unit: 'kg', costPerUnit: 45.00, reorderPoint: 10, reorderQuantity: 25 },
      { id: 'prod_002', name: 'Robusta Coffee Beans', sku: 'BEANS-ROB-001', category: 'Ingredients', unit: 'kg', costPerUnit: 35.00, reorderPoint: 10, reorderQuantity: 25 },
      { id: 'prod_003', name: 'Fresh Milk', sku: 'DAIRY-MILK-001', category: 'Dairy', unit: 'L', costPerUnit: 6.50, reorderPoint: 20, reorderQuantity: 50 },
      { id: 'prod_004', name: 'Sugar', sku: 'ING-SUGAR-001', category: 'Ingredients', unit: 'kg', costPerUnit: 4.50, reorderPoint: 5, reorderQuantity: 10 },
      { id: 'prod_005', name: 'Croissant', sku: 'PASTRY-CROISS-001', category: 'Pastry', unit: 'pieces', costPerUnit: 3.50, reorderPoint: 20, reorderQuantity: 50 },
      { id: 'prod_006', name: 'Paper Cups (Large)', sku: 'PACK-CUP-L-001', category: 'Packaging', unit: 'pieces', costPerUnit: 0.35, reorderPoint: 500, reorderQuantity: 1000 },
      { id: 'prod_007', name: 'Paper Cups (Regular)', sku: 'PACK-CUP-R-001', category: 'Packaging', unit: 'pieces', costPerUnit: 0.25, reorderPoint: 500, reorderQuantity: 1000 },
      { id: 'prod_008', name: 'Matcha Powder', sku: 'ING-MATCHA-001', category: 'Ingredients', unit: 'kg', costPerUnit: 85.00, reorderPoint: 2, reorderQuantity: 5 }
    ];
  }

  /**
   * Random payment method
   */
  _randomPaymentMethod() {
    const methods = ['cash', 'card', 'touchngo', 'grabpay', 'boost'];
    return methods[Math.floor(Math.random() * methods.length)];
  }

  /**
   * Calculate days between dates
   */
  _getDaysBetween(startDate, endDate) {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  }

  /**
   * Simulate API delay
   */
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MockStoreHubSimulator;

