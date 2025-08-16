import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Use service role key to bypass RLS policies
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Generate a test user ID for demonstration
const TEST_USER_ID = uuidv4();

console.log('🚀 Starting admin database population...');
console.log(`📝 Using test user ID: ${TEST_USER_ID}`);
console.log('💡 This user ID will be used for all sample data');
console.log('🔐 Using service role key to bypass RLS policies');

// Sample data for database population
const sampleData = {
  // Sample coffee chains
  coffee_chains: [
    {
      id: uuidv4(),
      user_id: TEST_USER_ID,
      chain_name: 'Demo Coffee Chain',
      description: 'A demonstration coffee chain for testing',
      total_outlets: 3,
      primary_location: 'Kuala Lumpur',
      business_type: 'coffee_chain',
      established_date: '2020-01-01',
      annual_revenue_range: '500k_1m',
      employee_count: 25
    }
  ],

  // Sample outlets
  outlets: [
    {
      id: uuidv4(),
      chain_id: null, // Will be set after coffee_chains are created
      outlet_name: 'Demo Outlet 1',
      address: '123 Jalan Demo, Kuala Lumpur',
      city: 'Kuala Lumpur',
      state: 'WP Kuala Lumpur',
      postal_code: '50000',
      country: 'Malaysia',
      phone_number: '+60123456789',
      manager_name: 'John Smith',
      outlet_type: 'full_service',
      seating_capacity: 50,
      operating_hours: {
        monday: { open: '07:00', close: '22:00' },
        tuesday: { open: '07:00', close: '22:00' },
        wednesday: { open: '07:00', close: '22:00' },
        thursday: { open: '07:00', close: '22:00' },
        friday: { open: '07:00', close: '23:00' },
        saturday: { open: '08:00', close: '23:00' },
        sunday: { open: '08:00', close: '22:00' }
      },
      status: 'active'
    },
    {
      id: uuidv4(),
      chain_id: null, // Will be set after coffee_chains are created
      outlet_name: 'Demo Outlet 2',
      address: '456 Demo Street, Petaling Jaya',
      city: 'Petaling Jaya',
      state: 'Selangor',
      postal_code: '46100',
      country: 'Malaysia',
      phone_number: '+60123456790',
      manager_name: 'Sarah Johnson',
      outlet_type: 'kiosk',
      seating_capacity: 20,
      operating_hours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '09:00', close: '20:00' }
      },
      status: 'active'
    }
  ],

  // Sample supplier data
  supplier_data: [
    {
      id: uuidv4(),
      name: 'Coffee Masters',
      category: 'Coffee Beans',
      rating: 4.5,
      status: 'active',
      contact: 'Ahmad Rahman',
      email: 'ahmad@coffeemasters.com',
      address: '789 Coffee Street, Kuala Lumpur',
      last_delivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 45,
      on_time_delivery: 0.95,
      quality_score: 4.8,
      payment_terms: 'Net 30',
      user_id: TEST_USER_ID
    },
    {
      id: uuidv4(),
      name: 'Dairy Fresh',
      category: 'Dairy',
      rating: 4.2,
      status: 'active',
      contact: 'Maria Tan',
      email: 'maria@dairyfresh.com',
      address: '456 Dairy Road, Selangor',
      last_delivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 32,
      on_time_delivery: 0.88,
      quality_score: 4.5,
      payment_terms: 'Net 15',
      user_id: TEST_USER_ID
    },
    {
      id: uuidv4(),
      name: 'Flavor Masters',
      category: 'Syrups & Flavors',
      rating: 4.7,
      status: 'active',
      contact: 'David Lee',
      email: 'david@flavormasters.com',
      address: '123 Flavor Avenue, Penang',
      last_delivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      total_orders: 28,
      on_time_delivery: 0.92,
      quality_score: 4.9,
      payment_terms: 'Net 30',
      user_id: TEST_USER_ID
    }
  ],

  // Sample inventory data
  inventory_data: [
    {
      id: uuidv4(),
      name: 'Arabica Coffee Beans',
      category: 'Coffee',
      current_stock: 45.5,
      min_stock: 20,
      max_stock: 100,
      unit: 'kg',
      cost: 18.50,
      supplier_id: null, // Will be set after suppliers are created
      last_restock: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Fresh Milk',
      category: 'Dairy',
      current_stock: 28.0,
      min_stock: 15,
      max_stock: 50,
      unit: 'L',
      cost: 3.20,
      supplier_id: null, // Will be set after suppliers are created
      last_restock: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Vanilla Syrup',
      category: 'Syrups',
      current_stock: 8.5,
      min_stock: 5,
      max_stock: 20,
      unit: 'L',
      cost: 12.00,
      supplier_id: null, // Will be set after suppliers are created
      last_restock: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Paper Cups',
      category: 'Packaging',
      current_stock: 1200,
      min_stock: 500,
      max_stock: 2000,
      unit: 'pieces',
      cost: 0.08,
      supplier_id: null, // Will be set after suppliers are created
      last_restock: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Chocolate Powder',
      category: 'Ingredients',
      current_stock: 15.2,
      min_stock: 8,
      max_stock: 30,
      unit: 'kg',
      cost: 8.50,
      supplier_id: null, // Will be set after suppliers are created
      last_restock: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    }
  ],

  // Sample menu/recipe data
  menu_recipe_data: [
    {
      id: uuidv4(),
      name: 'Espresso',
      category: 'Coffee',
      price: 3.50,
      cost: 0.53,
      margin: 0.85,
      popularity: 95,
      rating: 4.8,
      orders: 150,
      trend: 'stable',
      prep_time: 2,
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
        { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
      ],
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Latte',
      category: 'Coffee',
      price: 5.50,
      cost: 1.09,
      margin: 0.80,
      popularity: 88,
      rating: 4.6,
      orders: 120,
      trend: 'increasing',
      prep_time: 4,
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
        { name: 'Fresh Milk', quantity: 0.24, unit: 'L', cost: 0.77 },
        { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
      ],
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Cappuccino',
      category: 'Coffee',
      price: 5.00,
      cost: 0.97,
      margin: 0.81,
      popularity: 82,
      rating: 4.7,
      orders: 95,
      trend: 'stable',
      prep_time: 4,
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
        { name: 'Fresh Milk', quantity: 0.18, unit: 'L', cost: 0.58 },
        { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
      ],
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Mocha',
      category: 'Coffee',
      price: 6.50,
      cost: 1.34,
      margin: 0.79,
      popularity: 75,
      rating: 4.5,
      orders: 80,
      trend: 'decreasing',
      prep_time: 5,
      ingredients: [
        { name: 'Arabica Coffee Beans', quantity: 0.018, unit: 'kg', cost: 0.33 },
        { name: 'Fresh Milk', quantity: 0.20, unit: 'L', cost: 0.64 },
        { name: 'Chocolate Powder', quantity: 0.015, unit: 'kg', cost: 0.13 },
        { name: 'Paper Cups', quantity: 1, unit: 'piece', cost: 0.08 }
      ],
      status: 'active',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    }
  ],

  // Sample staff data
  user_staff_data: [
    {
      id: uuidv4(),
      name: 'John Smith',
      role: 'Barista',
      email: 'john.smith@demo.com',
      phone: '+60123456791',
      status: 'active',
      joined_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Sarah Johnson',
      role: 'Manager',
      email: 'sarah.johnson@demo.com',
      phone: '+60123456792',
      status: 'active',
      joined_at: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      name: 'Mike Wilson',
      role: 'Barista',
      email: 'mike.wilson@demo.com',
      phone: '+60123456793',
      status: 'active',
      joined_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    }
  ],

  // Sample supplier orders
  supplier_orders: [
    {
      id: uuidv4(),
      supplier_id: null, // Will be set after suppliers are created
      items: [
        { inventory_id: null, quantity: 25, unit: 'kg', price: 18.50 }, // Will be set after inventory is created
        { inventory_id: null, quantity: 50, unit: 'L', price: 3.20 } // Will be set after inventory is created
      ],
      total: 562.50,
      status: 'delivered',
      order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tracking: 'TRK123456789',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      supplier_id: null, // Will be set after suppliers are created
      items: [
        { inventory_id: null, quantity: 10, unit: 'L', price: 12.00 }, // Will be set after inventory is created
        { inventory_id: null, quantity: 500, unit: 'pieces', price: 0.08 } // Will be set after inventory is created
      ],
      total: 140.00,
      status: 'pending',
      order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      delivery_date: null,
      tracking: 'TRK987654321',
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    }
  ],

  // Sample waste logs
  waste_logs: [
    {
      id: uuidv4(),
      item_id: null, // Will be set after inventory is created
      quantity: 2.5,
      unit: 'kg',
      cost: 46.25,
      reason: 'Over-extraction',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      staff_id: null, // Will be set after staff is created
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      item_id: null, // Will be set after inventory is created
      quantity: 3.0,
      unit: 'L',
      cost: 9.60,
      reason: 'Spillage',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      staff_id: null, // Will be set after staff is created
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      item_id: null, // Will be set after inventory is created
      quantity: 0.5,
      unit: 'L',
      cost: 6.00,
      reason: 'Expired',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      staff_id: null, // Will be set after staff is created
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    }
  ],

  // Sample sales POS data
  sales_pos_data: [
    {
      id: uuidv4(),
      sale_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Espresso', quantity: 2, price: 3.50, total: 7.00 },
        { name: 'Latte', quantity: 1, price: 5.50, total: 5.50 }
      ],
      total_amount: 12.50,
      pos_reference: 'POS001',
      raw_data_id: null, // Will be set after raw_data_lake is created
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    },
    {
      id: uuidv4(),
      sale_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      items: [
        { name: 'Cappuccino', quantity: 3, price: 5.00, total: 15.00 },
        { name: 'Mocha', quantity: 1, price: 6.50, total: 6.50 }
      ],
      total_amount: 21.50,
      pos_reference: 'POS002',
      raw_data_id: null, // Will be set after raw_data_lake is created
      user_id: TEST_USER_ID,
      outlet_id: null // Will be set after outlets are created
    }
  ],

  // Sample raw data lake
  raw_data_lake: [
    {
      id: uuidv4(),
      source: 'pos_system',
      payload: {
        transaction_id: 'TXN001',
        timestamp: new Date().toISOString(),
        items: ['Espresso', 'Latte'],
        total: 12.50
      },
      received_at: new Date().toISOString(),
      user_id: TEST_USER_ID
    },
    {
      id: uuidv4(),
      source: 'inventory_system',
      payload: {
        update_id: 'INV001',
        timestamp: new Date().toISOString(),
        changes: [
          { item: 'Arabica Coffee Beans', change: -2.5, reason: 'waste' }
        ]
      },
      received_at: new Date().toISOString(),
      user_id: TEST_USER_ID
    }
  ],

  // Sample analytics data
  analytics: [
    {
      id: uuidv4(),
      user_id: TEST_USER_ID,
      outlet_id: null, // Will be set after outlets are created
      data_type: 'waste',
      data: {
        total_waste: 6.0,
        waste_by_category: {
          'Coffee': 2.5,
          'Dairy': 3.0,
          'Syrups': 0.5
        },
        waste_by_reason: {
          'Over-extraction': 2.5,
          'Spillage': 3.0,
          'Expired': 0.5
        }
      },
      period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString()
    },
    {
      id: uuidv4(),
      user_id: TEST_USER_ID,
      outlet_id: null, // Will be set after outlets are created
      data_type: 'sales',
      data: {
        total_sales: 34.00,
        sales_by_item: {
          'Espresso': 7.00,
          'Latte': 5.50,
          'Cappuccino': 15.00,
          'Mocha': 6.50
        },
        average_order_value: 17.00
      },
      period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString()
    }
  ],

  // Sample recommendations
  recommendations: [
    {
      id: uuidv4(),
      user_id: TEST_USER_ID,
      section: 'waste',
      provider: 'gemini',
      recommendation_text: 'Focus on reducing latte waste by improving milk portioning training. Current waste rate is 12% which is above industry average.',
      priority: 'high',
      category: 'staff_training',
      estimated_savings: 45.00,
      implementation_difficulty: 'easy',
      status: 'pending',
      analytics_data: {
        current_waste_rate: 12.0,
        target_waste_rate: 8.0,
        potential_savings: 45.00
      }
    },
    {
      id: uuidv4(),
      user_id: TEST_USER_ID,
      section: 'inventory',
      provider: 'gemini',
      recommendation_text: 'Optimize coffee bean orders to reduce overstock. Current stock levels suggest over-ordering by 20%.',
      priority: 'medium',
      category: 'inventory_optimization',
      estimated_savings: 120.00,
      implementation_difficulty: 'medium',
      status: 'pending',
      analytics_data: {
        current_stock_level: 45.5,
        optimal_stock_level: 36.4,
        overstock_percentage: 20
      }
    }
  ],

  // Sample subscription plans
  subscription_plans: [
    {
      id: uuidv4(),
      plan_name: 'free',
      display_name: 'Free',
      description: 'Basic features for small businesses',
      price_monthly: 0,
      price_yearly: 0,
      features: {
        waste_tracking: true,
        basic_analytics: true,
        ai_recommendations: true,
        email_support: true
      },
      limits: {
        outlets: 1,
        users: 1,
        ai_calls_per_month: 100
      },
      is_active: true
    },
    {
      id: uuidv4(),
      plan_name: 'basic',
      display_name: 'Basic',
      description: 'Essential features for growing businesses',
      price_monthly: 99,
      price_yearly: 990,
      features: {
        waste_tracking: true,
        advanced_analytics: true,
        ai_recommendations: true,
        email_support: true,
        priority_support: true
      },
      limits: {
        outlets: 5,
        users: 3,
        ai_calls_per_month: 1000
      },
      is_active: true
    },
    {
      id: uuidv4(),
      plan_name: 'pro',
      display_name: 'Professional',
      description: 'Advanced features for established businesses',
      price_monthly: 199,
      price_yearly: 1990,
      features: {
        waste_tracking: true,
        advanced_analytics: true,
        ai_recommendations: true,
        priority_support: true,
        custom_reports: true,
        api_access: true
      },
      limits: {
        outlets: 20,
        users: 10,
        ai_calls_per_month: 5000
      },
      is_active: true
    },
    {
      id: uuidv4(),
      plan_name: 'enterprise',
      display_name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price_monthly: 499,
      price_yearly: 4990,
      features: {
        waste_tracking: true,
        advanced_analytics: true,
        ai_recommendations: true,
        dedicated_support: true,
        custom_reports: true,
        api_access: true,
        white_label: true
      },
      limits: {
        outlets: -1,
        users: -1,
        ai_calls_per_month: -1
      },
      is_active: true
    }
  ]
};

async function populateDatabase() {
  try {
    console.log('🚀 Starting database population...');

    // Step 1: Create coffee chains
    console.log('🏢 Creating coffee chains...');
    const coffeeChainIds = [];
    for (const chain of sampleData.coffee_chains) {
      const { data, error } = await supabase.from('coffee_chains').insert(chain).select();
      if (error) {
        console.error('Error creating coffee chain:', error);
      } else {
        coffeeChainIds.push(data[0].id);
        console.log('✅ Coffee chain created:', chain.chain_name);
      }
    }

    // Step 2: Create outlets
    console.log('🏪 Creating outlets...');
    const outletIds = [];
    for (let i = 0; i < sampleData.outlets.length; i++) {
      const outlet = {
        ...sampleData.outlets[i],
        chain_id: coffeeChainIds[0] // Link to first coffee chain
      };
      const { data, error } = await supabase.from('outlets').insert(outlet).select();
      if (error) {
        console.error('Error creating outlet:', error);
      } else {
        outletIds.push(data[0].id);
        console.log('✅ Outlet created:', outlet.outlet_name);
      }
    }

    // Step 3: Create supplier data
    console.log('🏭 Creating suppliers...');
    const supplierIds = [];
    for (const supplier of sampleData.supplier_data) {
      const { data, error } = await supabase.from('supplier_data').insert(supplier).select();
      if (error) {
        console.error('Error creating supplier:', error);
      } else {
        supplierIds.push(data[0].id);
        console.log('✅ Supplier created:', supplier.name);
      }
    }

    // Step 4: Create inventory data
    console.log('📦 Creating inventory...');
    const inventoryIds = [];
    for (let i = 0; i < sampleData.inventory_data.length; i++) {
      const inventory = {
        ...sampleData.inventory_data[i],
        supplier_id: supplierIds[i % supplierIds.length], // Distribute suppliers
        outlet_id: outletIds[i % outletIds.length] // Distribute outlets
      };
      const { data, error } = await supabase.from('inventory_data').insert(inventory).select();
      if (error) {
        console.error('Error creating inventory:', error);
      } else {
        inventoryIds.push(data[0].id);
        console.log('✅ Inventory created:', inventory.name);
      }
    }

    // Step 5: Create menu/recipe data
    console.log('🍽️ Creating menu items...');
    for (let i = 0; i < sampleData.menu_recipe_data.length; i++) {
      const menu = {
        ...sampleData.menu_recipe_data[i],
        outlet_id: outletIds[i % outletIds.length] // Distribute outlets
      };
      const { error } = await supabase.from('menu_recipe_data').insert(menu);
      if (error) {
        console.error('Error creating menu item:', error);
      } else {
        console.log('✅ Menu item created:', menu.name);
      }
    }

    // Step 6: Create staff data
    console.log('👥 Creating staff...');
    const staffIds = [];
    for (let i = 0; i < sampleData.user_staff_data.length; i++) {
      const staff = {
        ...sampleData.user_staff_data[i],
        outlet_id: outletIds[i % outletIds.length] // Distribute outlets
      };
      const { data, error } = await supabase.from('user_staff_data').insert(staff).select();
      if (error) {
        console.error('Error creating staff:', error);
      } else {
        staffIds.push(data[0].id);
        console.log('✅ Staff created:', staff.name);
      }
    }

    // Step 7: Create supplier orders
    console.log('📋 Creating supplier orders...');
    for (let i = 0; i < sampleData.supplier_orders.length; i++) {
      const order = {
        ...sampleData.supplier_orders[i],
        supplier_id: supplierIds[i % supplierIds.length],
        outlet_id: outletIds[i % outletIds.length],
        items: sampleData.supplier_orders[i].items.map(item => ({
          ...item,
          inventory_id: inventoryIds[i % inventoryIds.length] // Link to inventory
        }))
      };
      const { error } = await supabase.from('supplier_orders').insert(order);
      if (error) {
        console.error('Error creating supplier order:', error);
      } else {
        console.log('✅ Supplier order created');
      }
    }

    // Step 8: Create waste logs
    console.log('🗑️ Creating waste logs...');
    for (let i = 0; i < sampleData.waste_logs.length; i++) {
      const waste = {
        ...sampleData.waste_logs[i],
        item_id: inventoryIds[i % inventoryIds.length],
        staff_id: staffIds[i % staffIds.length],
        outlet_id: outletIds[i % outletIds.length]
      };
      const { error } = await supabase.from('waste_logs').insert(waste);
      if (error) {
        console.error('Error creating waste log:', error);
      } else {
        console.log('✅ Waste log created');
      }
    }

    // Step 9: Create raw data lake
    console.log('📊 Creating raw data lake...');
    const rawDataIds = [];
    for (const rawData of sampleData.raw_data_lake) {
      const { data, error } = await supabase.from('raw_data_lake').insert(rawData).select();
      if (error) {
        console.error('Error creating raw data:', error);
      } else {
        rawDataIds.push(data[0].id);
        console.log('✅ Raw data created');
      }
    }

    // Step 10: Create sales POS data
    console.log('💳 Creating sales data...');
    for (let i = 0; i < sampleData.sales_pos_data.length; i++) {
      const sale = {
        ...sampleData.sales_pos_data[i],
        raw_data_id: rawDataIds[i % rawDataIds.length],
        outlet_id: outletIds[i % outletIds.length]
      };
      const { error } = await supabase.from('sales_pos_data').insert(sale);
      if (error) {
        console.error('Error creating sales data:', error);
      } else {
        console.log('✅ Sales data created');
      }
    }

    // Step 11: Create analytics data
    console.log('📈 Creating analytics data...');
    for (let i = 0; i < sampleData.analytics.length; i++) {
      const analytics = {
        ...sampleData.analytics[i],
        outlet_id: outletIds[i % outletIds.length]
      };
      const { error } = await supabase.from('analytics').insert(analytics);
      if (error) {
        console.error('Error creating analytics:', error);
      } else {
        console.log('✅ Analytics data created');
      }
    }

    // Step 12: Create recommendations
    console.log('💡 Creating recommendations...');
    for (const recommendation of sampleData.recommendations) {
      const { error } = await supabase.from('recommendations').insert(recommendation);
      if (error) {
        console.error('Error creating recommendation:', error);
      } else {
        console.log('✅ Recommendation created');
      }
    }

    // Step 13: Create subscription plans
    console.log('💳 Creating subscription plans...');
    for (const plan of sampleData.subscription_plans) {
      const { error } = await supabase.from('subscription_plans').upsert(plan);
      if (error) {
        console.error('Error creating subscription plan:', error);
      } else {
        console.log('✅ Subscription plan created:', plan.display_name);
      }
    }

    console.log('🎉 Database population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Test User ID: ${TEST_USER_ID}`);
    console.log(`   - Coffee Chains: ${sampleData.coffee_chains.length}`);
    console.log(`   - Outlets: ${sampleData.outlets.length}`);
    console.log(`   - Suppliers: ${sampleData.supplier_data.length}`);
    console.log(`   - Inventory Items: ${sampleData.inventory_data.length}`);
    console.log(`   - Menu Items: ${sampleData.menu_recipe_data.length}`);
    console.log(`   - Staff: ${sampleData.user_staff_data.length}`);
    console.log(`   - Supplier Orders: ${sampleData.supplier_orders.length}`);
    console.log(`   - Waste Logs: ${sampleData.waste_logs.length}`);
    console.log(`   - Sales Data: ${sampleData.sales_pos_data.length}`);
    console.log(`   - Analytics: ${sampleData.analytics.length}`);
    console.log(`   - Recommendations: ${sampleData.recommendations.length}`);
    console.log(`   - Subscription Plans: ${sampleData.subscription_plans.length}`);
    console.log('');
    console.log('💡 Note: This data was created with a test user ID.');
    console.log('💡 For production use, replace the user_id with real user IDs from your auth system.');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

// Run the population script
populateDatabase();
