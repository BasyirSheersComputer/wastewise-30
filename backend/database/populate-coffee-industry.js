import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Major Coffee Chain Industry Data
const coffeeIndustryData = {
  // Major Global Coffee Chains
  coffee_chains: [
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      chain_name: 'Starbucks Corporation',
      description: 'Global coffeehouse chain and roastery reserves',
      total_outlets: 35000,
      primary_location: 'Seattle, Washington, USA',
      business_type: 'coffee_chain',
      established_date: '1971-03-30',
      annual_revenue_range: 'over_5m',
      employee_count: 402000
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      chain_name: 'Dunkin\' Donuts',
      description: 'American multinational coffee and donut company',
      total_outlets: 12000,
      primary_location: 'Canton, Massachusetts, USA',
      business_type: 'coffee_chain',
      established_date: '1950-06-10',
      annual_revenue_range: 'over_5m',
      employee_count: 125000
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      chain_name: 'Tim Hortons',
      description: 'Canadian multinational fast food restaurant chain',
      total_outlets: 5000,
      primary_location: 'Oakville, Ontario, Canada',
      business_type: 'coffee_chain',
      established_date: '1964-05-17',
      annual_revenue_range: 'over_5m',
      employee_count: 100000
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      chain_name: 'Costa Coffee',
      description: 'British multinational coffeehouse company',
      total_outlets: 4000,
      primary_location: 'Dunstable, England, UK',
      business_type: 'coffee_chain',
      established_date: '1971-01-01',
      annual_revenue_range: 'over_5m',
      employee_count: 18000
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      chain_name: 'McCafé',
      description: 'Coffee-house-style food and beverage chain',
      total_outlets: 15000,
      primary_location: 'Melbourne, Victoria, Australia',
      business_type: 'coffee_chain',
      established_date: '1993-01-01',
      annual_revenue_range: 'over_5m',
      employee_count: 200000
    }
  ],

  // Major Coffee Bean Suppliers & Roasters
  suppliers: [
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Nestlé Nespresso',
      contact_person: 'Jean-Marc Duvoisin',
      email: 'contact@nespresso.com',
      phone: '+41-21-785-8888',
      address: 'Avenue Nestlé 55, Vevey, Switzerland',
      supplier_type: 'ingredients',
      risk_level: 'low',
      reliability_score: 9,
      last_order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 3,
      notes: 'Premium coffee capsules and beans supplier'
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'JDE Peet\'s',
      contact_person: 'Fabien Simon',
      email: 'info@jdepeets.com',
      phone: '+31-20-558-0000',
      address: 'Oosterdoksstraat 80, Amsterdam, Netherlands',
      supplier_type: 'ingredients',
      risk_level: 'low',
      reliability_score: 9,
      last_order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 2,
      notes: 'Global coffee and tea company'
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Lavazza Group',
      contact_person: 'Antonio Baravalle',
      email: 'info@lavazza.com',
      phone: '+39-011-197-8111',
      address: 'Via Bologna 32, Turin, Italy',
      supplier_type: 'ingredients',
      risk_level: 'low',
      reliability_score: 8,
      last_order_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 4,
      notes: 'Italian coffee manufacturer'
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Illycaffè',
      contact_person: 'Massimiliano Pogliani',
      email: 'info@illy.com',
      phone: '+39-040-389-0111',
      address: 'Via Flavia 110, Trieste, Italy',
      supplier_type: 'ingredients',
      risk_level: 'low',
      reliability_score: 9,
      last_order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 5,
      notes: 'Premium Italian coffee roaster'
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Tata Consumer Products',
      contact_person: 'Sunil D\'Souza',
      email: 'info@tataconsumer.com',
      phone: '+91-22-6778-9999',
      address: 'Bombay House, Mumbai, India',
      supplier_type: 'ingredients',
      risk_level: 'medium',
      reliability_score: 7,
      last_order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 7,
      notes: 'Tata Coffee and Tetley Tea supplier'
    }
  ],

  // Dairy & Milk Suppliers
  dairy_suppliers: [
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Danone',
      contact_person: 'Antoine de Saint-Affrique',
      email: 'contact@danone.com',
      phone: '+33-1-44-35-2000',
      address: '17 Boulevard Haussmann, Paris, France',
      supplier_type: 'ingredients',
      risk_level: 'low',
      reliability_score: 9,
      last_order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 1,
      notes: 'Global dairy products supplier'
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Fonterra Co-operative Group',
      contact_person: 'Miles Hurrell',
      email: 'info@fonterra.com',
      phone: '+64-9-374-7000',
      address: 'Fonterra House, Auckland, New Zealand',
      supplier_type: 'ingredients',
      risk_level: 'low',
      reliability_score: 8,
      last_order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 3,
      notes: 'New Zealand dairy cooperative'
    }
  ],

  // Equipment & Machinery Suppliers
  equipment_suppliers: [
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'De\'Longhi Group',
      contact_person: 'Fabio De\'Longhi',
      email: 'info@delonghi.com',
      phone: '+39-0422-413-111',
      address: 'Via L. Seitz 47, Treviso, Italy',
      supplier_type: 'equipment',
      risk_level: 'low',
      reliability_score: 9,
      last_order_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 14,
      notes: 'Premium coffee machine manufacturer'
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Breville Group',
      contact_person: 'Jim Clayton',
      email: 'info@breville.com',
      phone: '+61-2-9384-0344',
      address: '170-180 Bourke Road, Alexandria, Australia',
      supplier_type: 'equipment',
      risk_level: 'medium',
      reliability_score: 8,
      last_order_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 21,
      notes: 'Australian kitchen appliance manufacturer'
    }
  ],

  // Packaging Suppliers
  packaging_suppliers: [
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Huhtamaki',
      contact_person: 'Charles Héaulmé',
      email: 'info@huhtamaki.com',
      phone: '+358-10-686-7800',
      address: 'Revontulenkuja 6, Espoo, Finland',
      supplier_type: 'packaging',
      risk_level: 'low',
      reliability_score: 8,
      last_order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 7,
      notes: 'Global packaging solutions provider'
    },
    {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      supplier_name: 'Berry Global',
      contact_person: 'Tom Salmon',
      email: 'info@berryglobal.com',
      phone: '+1-812-424-2904',
      address: '101 Oakley Street, Evansville, Indiana, USA',
      supplier_type: 'packaging',
      risk_level: 'medium',
      reliability_score: 7,
      last_order_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      average_delivery_time: 10,
      notes: 'Plastic packaging manufacturer'
    }
  ],

  // Sample Outlets for Major Chains
  outlets: [
    {
      id: uuidv4(),
      chain_id: null, // Will be set after coffee_chains are created
      outlet_name: 'Starbucks Reserve Roastery',
      address: '1124 Pike Street, Seattle, WA 98101',
      city: 'Seattle',
      state: 'Washington',
      postal_code: '98101',
      country: 'USA',
      phone_number: '+1-206-624-0173',
      manager_name: 'Sarah Chen',
      outlet_type: 'full_service',
      seating_capacity: 200,
      operating_hours: {
        monday: { open: '06:00', close: '23:00' },
        tuesday: { open: '06:00', close: '23:00' },
        wednesday: { open: '06:00', close: '23:00' },
        thursday: { open: '06:00', close: '23:00' },
        friday: { open: '06:00', close: '00:00' },
        saturday: { open: '06:30', close: '00:00' },
        sunday: { open: '06:30', close: '23:00' }
      },
      status: 'active'
    },
    {
      id: uuidv4(),
      chain_id: null,
      outlet_name: 'Dunkin\' Times Square',
      address: '1500 Broadway, New York, NY 10036',
      city: 'New York',
      state: 'New York',
      postal_code: '10036',
      country: 'USA',
      phone_number: '+1-212-869-0000',
      manager_name: 'Mike Rodriguez',
      outlet_type: 'full_service',
      seating_capacity: 80,
      operating_hours: {
        monday: { open: '05:00', close: '02:00' },
        tuesday: { open: '05:00', close: '02:00' },
        wednesday: { open: '05:00', close: '02:00' },
        thursday: { open: '05:00', close: '02:00' },
        friday: { open: '05:00', close: '03:00' },
        saturday: { open: '05:00', close: '03:00' },
        sunday: { open: '05:00', close: '02:00' }
      },
      status: 'active'
    }
  ],

  // Sample Inventory with Real Coffee Industry Items
  inventory: [
    {
      id: uuidv4(),
      name: 'Arabica Coffee Beans - Single Origin',
      category: 'Coffee',
      current_stock: 500.0,
      min_stock: 100,
      max_stock: 1000,
      unit: 'kg',
      cost: 25.00,
      supplier_id: null,
      last_restock: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    },
    {
      id: uuidv4(),
      name: 'Robusta Coffee Beans - Premium Grade',
      category: 'Coffee',
      current_stock: 300.0,
      min_stock: 75,
      max_stock: 600,
      unit: 'kg',
      cost: 18.50,
      supplier_id: null,
      last_restock: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    },
    {
      id: uuidv4(),
      name: 'Organic Whole Milk',
      category: 'Dairy',
      current_stock: 200.0,
      min_stock: 50,
      max_stock: 400,
      unit: 'L',
      cost: 4.20,
      supplier_id: null,
      last_restock: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    },
    {
      id: uuidv4(),
      name: 'Oat Milk - Barista Edition',
      category: 'Dairy',
      current_stock: 150.0,
      min_stock: 30,
      max_stock: 300,
      unit: 'L',
      cost: 5.80,
      supplier_id: null,
      last_restock: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    },
    {
      id: uuidv4(),
      name: 'Vanilla Syrup - Premium',
      category: 'Syrups',
      current_stock: 50.0,
      min_stock: 10,
      max_stock: 100,
      unit: 'L',
      cost: 15.00,
      supplier_id: null,
      last_restock: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    },
    {
      id: uuidv4(),
      name: 'Compostable Coffee Cups - 12oz',
      category: 'Packaging',
      current_stock: 5000,
      min_stock: 1000,
      max_stock: 10000,
      unit: 'pieces',
      cost: 0.12,
      supplier_id: null,
      last_restock: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    }
  ],

  // Sample Waste Data for Coffee Industry
  waste_logs: [
    {
      id: uuidv4(),
      item_id: null,
      quantity: 5.5,
      unit: 'kg',
      cost: 137.50,
      reason: 'Over-extraction during peak hours',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      staff_id: null,
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    },
    {
      id: uuidv4(),
      item_id: null,
      quantity: 8.0,
      unit: 'L',
      cost: 33.60,
      reason: 'Milk expiration - slow turnover',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      staff_id: null,
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    },
    {
      id: uuidv4(),
      item_id: null,
      quantity: 2.0,
      unit: 'L',
      cost: 30.00,
      reason: 'Syrup contamination',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      staff_id: null,
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: null
    }
  ]
};

async function populateCoffeeIndustry() {
  console.log('🌱 Populating database with Coffee Industry data...\n');

  try {
    // Insert coffee chains
    console.log('📊 Inserting coffee chains...');
    for (const chain of coffeeIndustryData.coffee_chains) {
      const { data, error } = await supabase
        .from('coffee_chains')
        .insert(chain)
        .select();
      
      if (error) {
        console.log(`❌ Error inserting chain ${chain.chain_name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${chain.chain_name}`);
      }
    }

    // Insert suppliers
    console.log('\n🏭 Inserting suppliers...');
    const allSuppliers = [
      ...coffeeIndustryData.suppliers,
      ...coffeeIndustryData.dairy_suppliers,
      ...coffeeIndustryData.equipment_suppliers,
      ...coffeeIndustryData.packaging_suppliers
    ];

    for (const supplier of allSuppliers) {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select();
      
      if (error) {
        console.log(`❌ Error inserting supplier ${supplier.supplier_name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${supplier.supplier_name}`);
      }
    }

    // Insert outlets
    console.log('\n🏪 Inserting outlets...');
    for (const outlet of coffeeIndustryData.outlets) {
      const { data, error } = await supabase
        .from('outlets')
        .insert(outlet)
        .select();
      
      if (error) {
        console.log(`❌ Error inserting outlet ${outlet.outlet_name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${outlet.outlet_name}`);
      }
    }

    // Insert inventory
    console.log('\n📦 Inserting inventory...');
    for (const item of coffeeIndustryData.inventory) {
      const { data, error } = await supabase
        .from('waste_data')
        .insert({
          user_id: item.user_id,
          outlet_id: item.outlet_id,
          item_name: item.name,
          category: item.category,
          quantity: item.current_stock,
          unit: item.unit,
          cost_per_unit: item.cost,
          total_cost: item.current_stock * item.cost,
          reason: 'Initial stock',
          recorded_by: 'System'
        })
        .select();
      
      if (error) {
        console.log(`❌ Error inserting inventory ${item.name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${item.name}`);
      }
    }

    // Insert waste logs
    console.log('\n🗑️ Inserting waste logs...');
    for (const waste of coffeeIndustryData.waste_logs) {
      const { data, error } = await supabase
        .from('waste_data')
        .insert({
          user_id: waste.user_id,
          outlet_id: waste.outlet_id,
          item_name: 'Coffee Beans', // Default item
          category: 'food',
          quantity: waste.quantity,
          unit: waste.unit,
          cost_per_unit: waste.cost / waste.quantity,
          total_cost: waste.cost,
          reason: waste.reason,
          recorded_by: 'System'
        })
        .select();
      
      if (error) {
        console.log(`❌ Error inserting waste log:`, error.message);
      } else {
        console.log(`✅ Inserted waste log: ${waste.reason}`);
      }
    }

    console.log('\n🎉 Coffee Industry data population completed!');
    console.log('\n📋 Summary:');
    console.log(`- Coffee Chains: ${coffeeIndustryData.coffee_chains.length}`);
    console.log(`- Suppliers: ${allSuppliers.length}`);
    console.log(`- Outlets: ${coffeeIndustryData.outlets.length}`);
    console.log(`- Inventory Items: ${coffeeIndustryData.inventory.length}`);
    console.log(`- Waste Logs: ${coffeeIndustryData.waste_logs.length}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

// Run the population script
populateCoffeeIndustry();
