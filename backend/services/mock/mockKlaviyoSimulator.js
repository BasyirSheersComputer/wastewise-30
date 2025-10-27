/**
 * Mock Klaviyo CRM Simulator
 * Simulates Klaviyo CRM responses for customer data, segments, and marketing campaigns
 * Based on Klaviyo API patterns used for F&B customer engagement
 */

import logger from '../../utils/logger.js';

export class MockKlaviyoSimulator {
  constructor(config = {}) {
    this.customers = config.customers || [];
    this.segments = config.segments || this._getDefaultSegments();
    this.campaigns = config.campaigns || [];
  }

  /**
   * Initialize Klaviyo integration
   */
  async initializeIntegration(credentials) {
    await this._delay(100);
    
    return {
      success: true,
      accountId: credentials.accountId || 'klaviyo_mock_001',
      apiKey: credentials.apiKey ? '***masked***' : null,
      integration: {
        status: 'active',
        syncCustomers: true,
        syncSegments: true,
        syncCampaigns: true,
        syncFrequency: 'realtime'
      }
    };
  }

  /**
   * Fetch customer profiles
   */
  async fetchCustomers(options = {}) {
    await this._delay(200);
    
    const { limit = 100, offset = 0, segment } = options;
    
    // Generate realistic customer data for coffee shop
    const customers = this._generateCustomers(limit + offset);
    
    // Filter by segment if provided
    let filteredCustomers = customers;
    if (segment) {
      filteredCustomers = this._filterBySegment(customers, segment);
    }
    
    return {
      success: true,
      data: filteredCustomers.slice(offset, offset + limit),
      count: filteredCustomers.length,
      pagination: {
        limit,
        offset,
        total: filteredCustomers.length
      }
    };
  }

  /**
   * Fetch customer segments
   */
  async fetchSegments() {
    await this._delay(100);
    
    return {
      success: true,
      data: this.segments,
      count: this.segments.length
    };
  }

  /**
   * Fetch customer spending behavior
   */
  async fetchCustomerSpending(customerId) {
    await this._delay(150);
    
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) {
      // Generate mock data
      const avgOrderValue = Math.floor(Math.random() * 30) + 15; // RM 15-45
      const orderFrequency = Math.floor(Math.random() * 8) + 2; // 2-10 orders/month
      
      return {
        success: true,
        customer_id: customerId,
        total_spent: avgOrderValue * orderFrequency * 12, // Annual
        average_order_value: avgOrderValue,
        order_frequency_per_month: orderFrequency,
        last_order_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lifetime_value: avgOrderValue * orderFrequency * 12,
        preferred_products: ['Latte', 'Cappuccino', 'Croissant'],
        preferred_time: this._getPreferredTime()
      };
    }
    
    return {
      success: true,
      customer_id: customerId,
      ...customer.spending
    };
  }

  /**
   * Fetch customer loyalty metrics
   */
  async fetchLoyaltyMetrics(customerId) {
    await this._delay(100);
    
    return {
      success: true,
      customer_id: customerId,
      loyalty_points: Math.floor(Math.random() * 500) + 50,
      loyalty_tier: this._getLoyaltyTier(),
      visit_count: Math.floor(Math.random() * 50) + 5,
      streak_days: Math.floor(Math.random() * 30),
      last_visit: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      churn_risk: Math.random() < 0.3 ? 'high' : Math.random() < 0.6 ? 'medium' : 'low'
    };
  }

  /**
   * Fetch campaign performance
   */
  async fetchCampaignPerformance(campaignId) {
    await this._delay(150);
    
    return {
      success: true,
      campaign_id: campaignId,
      name: 'Loyalty Rewards Campaign',
      status: 'active',
      metrics: {
        sent: Math.floor(Math.random() * 5000) + 1000,
        delivered: Math.floor(Math.random() * 4900) + 950,
        opened: Math.floor(Math.random() * 1500) + 500,
        clicked: Math.floor(Math.random() * 300) + 100,
        converted: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000
      },
      open_rate: Math.random() * 0.3 + 0.2, // 20-50%
      click_rate: Math.random() * 0.1 + 0.05, // 5-15%
      conversion_rate: Math.random() * 0.05 + 0.02, // 2-7%
      roi: Math.random() * 5 + 2 // 2-7x ROI
    };
  }

  /**
   * Generate realistic customer data
   */
  _generateCustomers(count) {
    const customers = [];
    const firstNames = ['Ahmad', 'Siti', 'Lim', 'Tan', 'Kumar', 'Sarah', 'Wei', 'Amir', 'Nur', 'Chen'];
    const lastNames = ['Hassan', 'Nurhaliza', 'Wei Ming', 'Chong', 'Raj', 'Lee', 'Mohamed', 'Ibrahim', 'Ong', 'Wong'];
    
    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`;
      
      const avgOrderValue = Math.floor(Math.random() * 30) + 15;
      const orderFrequency = Math.floor(Math.random() * 8) + 2;
      
      customers.push({
        id: `customer_${i + 1}`,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: `+60 1${Math.floor(Math.random() * 90000000) + 10000000}`,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        spending: {
          total_spent: avgOrderValue * orderFrequency * 12,
          average_order_value: avgOrderValue,
          order_frequency_per_month: orderFrequency,
          last_order_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          lifetime_value: avgOrderValue * orderFrequency * 12
        },
        preferences: {
          preferred_products: this._getPreferredProducts(),
          preferred_time: this._getPreferredTime(),
          dietary_restrictions: Math.random() > 0.8 ? ['lactose-free'] : []
        },
        segment: this._assignSegment(avgOrderValue, orderFrequency)
      });
    }
    
    return customers;
  }

  /**
   * Get preferred products
   */
  _getPreferredProducts() {
    const products = [
      ['Latte', 'Cappuccino', 'Croissant'],
      ['Americano', 'Espresso', 'Chocolate Chip Cookie'],
      ['Mocha', 'Matcha Latte', 'Oreo Cheesecake'],
      ['Green Tea', 'Latte', 'Croissant']
    ];
    return products[Math.floor(Math.random() * products.length)];
  }

  /**
   * Get preferred time
   */
  _getPreferredTime() {
    const times = ['morning', 'afternoon', 'evening'];
    return times[Math.floor(Math.random() * times.length)];
  }

  /**
   * Assign customer segment
   */
  _assignSegment(avgOrderValue, orderFrequency) {
    if (avgOrderValue > 25 && orderFrequency > 6) return 'VIP';
    if (avgOrderValue > 20 || orderFrequency > 4) return 'Regular';
    if (orderFrequency > 2) return 'Occasional';
    return 'New';
  }

  /**
   * Get loyalty tier
   */
  _getLoyaltyTier() {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    return tiers[Math.floor(Math.random() * tiers.length)];
  }

  /**
   * Filter customers by segment
   */
  _filterBySegment(customers, segmentName) {
    return customers.filter(c => c.segment === segmentName);
  }

  /**
   * Default segments
   */
  _getDefaultSegments() {
    return [
      {
        id: 'seg_001',
        name: 'VIP',
        description: 'High-value frequent customers',
        criteria: { avg_order_value: '>25', frequency: '>6/month' },
        count: 0
      },
      {
        id: 'seg_002',
        name: 'Regular',
        description: 'Regular customers with good engagement',
        criteria: { avg_order_value: '>20', frequency: '>4/month' },
        count: 0
      },
      {
        id: 'seg_003',
        name: 'Occasional',
        description: 'Occasional visitors',
        criteria: { frequency: '2-4/month' },
        count: 0
      },
      {
        id: 'seg_004',
        name: 'New',
        description: 'New customers',
        criteria: { created_at: '<30 days' },
        count: 0
      },
      {
        id: 'seg_005',
        name: 'At Risk',
        description: 'Customers at risk of churning',
        criteria: { last_order: '>30 days ago' },
        count: 0
      }
    ];
  }

  /**
   * Simulate API delay
   */
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MockKlaviyoSimulator;

