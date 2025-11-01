/**
 * Mock ERP System Simulator
 * Simulates ERP system responses for supplier orders, inventory, and procurement
 * Based on typical ERP patterns used by F&B chains
 */

import logger from '../../utils/logger.js';

export class MockERPSimulator {
  constructor(config = {}) {
    this.suppliers = config.suppliers || this._getDefaultSuppliers();
    this.purchaseOrders = config.purchaseOrders || [];
    this.inventory = config.inventory || [];
  }

  /**
   * Initialize ERP integration
   */
  async initializeIntegration(credentials) {
    await this._delay(100);
    
    return {
      success: true,
      erpSystem: credentials.systemType || 'netsuite',
      companyId: credentials.companyId || 'company_mock_001',
      integration: {
        status: 'active',
        syncPurchaseOrders: true,
        syncInventory: true,
        syncSuppliers: true,
        syncFrequency: 'hourly'
      }
    };
  }

  /**
   * Fetch purchase orders
   */
  async fetchPurchaseOrders(options = {}) {
    await this._delay(200);
    
    const { startDate, endDate, status } = options;
    const statusFilter = status || 'pending';
    
    // Generate realistic PO data
    const orders = [];
    const days = this._getDaysBetween(startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), endDate || new Date());
    
    days.forEach((date, idx) => {
      // Generate 1-3 POs per day
      const poCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < poCount; i++) {
        const supplier = this.suppliers[Math.floor(Math.random() * this.suppliers.length)];
        const items = this._generatePOItems(supplier);
        const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        
        const orderStatus = idx < days.length - 2 ? 'completed' : 
                           idx === days.length - 2 ? 'delivered' : 'pending';
        
        orders.push({
          po_number: `PO-${date.toISOString().split('T')[0]}-${i + 1}`,
          supplier_id: supplier.id,
          supplier_name: supplier.name,
          order_date: date.toISOString().split('T')[0],
          expected_delivery_date: this._addDays(date, Math.floor(Math.random() * 5) + 2).toISOString().split('T')[0],
          status: orderStatus,
          items: items,
          total_amount: totalAmount,
          currency: 'MYR',
          created_at: date.toISOString(),
          updated_at: date.toISOString()
        });
      }
    });
    
    return {
      success: true,
      data: orders.filter(po => !statusFilter || po.status === statusFilter),
      count: orders.length
    };
  }

  /**
   * Fetch supplier data
   */
  async fetchSuppliers() {
    await this._delay(100);
    
    return {
      success: true,
      data: this.suppliers.map(supplier => ({
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        contact_person: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        payment_terms: supplier.paymentTerms,
        lead_time_days: supplier.leadTimeDays,
        rating: supplier.rating,
        status: 'active'
      })),
      count: this.suppliers.length
    };
  }

  /**
   * Fetch inventory levels from ERP
   */
  async fetchInventoryLevels(options = {}) {
    await this._delay(150);
    
    return {
      success: true,
      data: [
        { sku: 'BEANS-ARAB-001', name: 'Arabica Coffee Beans', quantity: 125.5, unit: 'kg', warehouse: 'main' },
        { sku: 'BEANS-ROB-001', name: 'Robusta Coffee Beans', quantity: 89.2, unit: 'kg', warehouse: 'main' },
        { sku: 'DAIRY-MILK-001', name: 'Fresh Milk', quantity: 245.0, unit: 'L', warehouse: 'cold' },
        { sku: 'ING-SUGAR-001', name: 'Sugar', quantity: 45.8, unit: 'kg', warehouse: 'main' },
        { sku: 'PASTRY-CROISS-001', name: 'Croissant', quantity: 0, unit: 'pieces', warehouse: 'frozen' },
        { sku: 'PACK-CUP-L-001', name: 'Paper Cups (Large)', quantity: 1250, unit: 'pieces', warehouse: 'storage' },
        { sku: 'PACK-CUP-R-001', name: 'Paper Cups (Regular)', quantity: 980, unit: 'pieces', warehouse: 'storage' },
        { sku: 'ING-MATCHA-001', name: 'Matcha Powder', quantity: 8.5, unit: 'kg', warehouse: 'main' }
      ],
      sync_timestamp: new Date().toISOString()
    };
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(poData) {
    await this._delay(300);
    
    return {
      success: true,
      po_number: `PO-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      ...poData
    };
  }

  /**
   * Get supplier risk metrics
   */
  async getSupplierRiskMetrics(supplierId) {
    await this._delay(100);
    
    const supplier = this.suppliers.find(s => s.id === supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    return {
      success: true,
      supplier_id: supplierId,
      supplier_name: supplier.name,
      risk_score: Math.floor(Math.random() * 30) + 10, // 10-40 (lower is better)
      metrics: {
        on_time_delivery_rate: Math.floor(Math.random() * 20) + 80, // 80-100%
        quality_score: Math.floor(Math.random() * 15) + 85, // 85-100%
        order_frequency: Math.floor(Math.random() * 20) + 10, // orders per month
        average_lead_time: supplier.leadTimeDays + Math.floor(Math.random() * 3) - 1,
        payment_reliability: Math.floor(Math.random() * 10) + 90 // 90-100%
      },
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Generate PO items
   */
  _generatePOItems(supplier) {
    const items = [];
    const itemCount = Math.floor(Math.random() * 5) + 2; // 2-7 items
    
    const products = supplier.products || [
      { name: 'Arabica Coffee Beans', sku: 'BEANS-ARAB-001', unit_price: 45.00, unit: 'kg' },
      { name: 'Fresh Milk', sku: 'DAIRY-MILK-001', unit_price: 6.50, unit: 'L' },
      { name: 'Sugar', sku: 'ING-SUGAR-001', unit_price: 4.50, unit: 'kg' }
    ];
    
    for (let i = 0; i < itemCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 50) + 10;
      
      items.push({
        sku: product.sku,
        name: product.name,
        quantity: quantity,
        unit: product.unit,
        unit_price: product.unit_price,
        total: quantity * product.unit_price
      });
    }
    
    return items;
  }

  /**
   * Default suppliers
   */
  _getDefaultSuppliers() {
    return [
      {
        id: 'supp_001',
        name: 'Premium Coffee Importers Sdn Bhd',
        contactPerson: 'Ahmad Hassan',
        email: 'ahmad@premiumcoffee.com.my',
        phone: '+60 3-1234 5678',
        address: '123 Jalan Coffee, 50000 Kuala Lumpur',
        paymentTerms: 'Net 30',
        leadTimeDays: 7,
        rating: 4.8,
        products: [
          { name: 'Arabica Coffee Beans', sku: 'BEANS-ARAB-001', unit_price: 45.00, unit: 'kg' },
          { name: 'Robusta Coffee Beans', sku: 'BEANS-ROB-001', unit_price: 35.00, unit: 'kg' }
        ]
      },
      {
        id: 'supp_002',
        name: 'Fresh Dairy Supply Co',
        contactPerson: 'Siti Nurhaliza',
        email: 'siti@freshdairy.com.my',
        phone: '+60 3-2345 6789',
        address: '456 Dairy Road, 48000 Shah Alam',
        paymentTerms: 'Net 15',
        leadTimeDays: 3,
        rating: 4.6,
        products: [
          { name: 'Fresh Milk', sku: 'DAIRY-MILK-001', unit_price: 6.50, unit: 'L' }
        ]
      },
      {
        id: 'supp_003',
        name: 'Bakery Ingredients Wholesale',
        contactPerson: 'Lim Wei Ming',
        email: 'lim@bakeryingredients.com.my',
        phone: '+60 3-3456 7890',
        address: '789 Bakery Street, 59100 Bangsar',
        paymentTerms: 'Net 21',
        leadTimeDays: 5,
        rating: 4.5,
        products: [
          { name: 'Sugar', sku: 'ING-SUGAR-001', unit_price: 4.50, unit: 'kg' },
          { name: 'Matcha Powder', sku: 'ING-MATCHA-001', unit_price: 85.00, unit: 'kg' }
        ]
      }
    ];
  }

  /**
   * Add days to date
   */
  _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
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

export default MockERPSimulator;

