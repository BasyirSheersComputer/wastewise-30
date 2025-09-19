import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Helper function to read CSV files
function readCSV(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index] ? values[index].trim() : '';
      });
      return obj;
    });
  } catch (error) {
    console.error(`Error reading CSV file ${filePath}:`, error.message);
    return [];
  }
}

// Helper function to parse date strings
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  return new Date(dateStr).toISOString();
}

// Helper function to parse numeric values
function parseNumber(value) {
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

async function populateWithRealisticData() {
  console.log('🌱 Populating database with realistic data from CSV files...\n');

  try {
    // First, let's try to disable RLS temporarily
    console.log('🔧 Attempting to disable RLS policies...');
    const disableRLS = `
      ALTER TABLE coffee_chains DISABLE ROW LEVEL SECURITY;
      ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
      ALTER TABLE waste_data DISABLE ROW LEVEL SECURITY;
      ALTER TABLE outlets DISABLE ROW LEVEL SECURITY;
      ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
      ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: disableRLS });
    if (rlsError) {
      console.log('⚠️ Could not disable RLS (this is normal):', rlsError.message);
    } else {
      console.log('✅ RLS policies disabled temporarily');
    }

    // Read realistic data from CSV files
    console.log('\n📊 Reading realistic data from CSV files...');
    
    const salesData = readCSV('datasets/coffee_shop_revenue.csv');
    const customerData = readCSV('datasets/customer.csv');
    const productData = readCSV('datasets/product.csv');
    const wasteData = readCSV('datasets/waste_data.csv');
    const inventoryData = readCSV('datasets/inventory.csv');
    const outletData = readCSV('datasets/outlet_data.csv');
    const menuItems = readCSV('datasets/menu_items.csv');
    const dailySales = readCSV('datasets/daily_sales.csv');

    console.log(`✅ Loaded ${salesData.length} sales records`);
    console.log(`✅ Loaded ${customerData.length} customer records`);
    console.log(`✅ Loaded ${productData.length} product records`);
    console.log(`✅ Loaded ${wasteData.length} waste records`);
    console.log(`✅ Loaded ${inventoryData.length} inventory records`);
    console.log(`✅ Loaded ${outletData.length} outlet records`);

    // Create coffee chains from outlet data
    console.log('\n🏢 Creating coffee chains from outlet data...');
    const chainIds = [];
    
    // Group outlets by chain
    const chainGroups = {};
    outletData.forEach(outlet => {
      const chainId = outlet.chain_id || 'CHAIN001';
      if (!chainGroups[chainId]) {
        chainGroups[chainId] = [];
      }
      chainGroups[chainId].push(outlet);
    });

    // Create chains
    for (const [chainId, outlets] of Object.entries(chainGroups)) {
      const chain = {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: `Coffee Chain ${chainId}`,
        description: `Realistic coffee chain with ${outlets.length} outlets`,
        total_outlets: outlets.length,
        primary_location: outlets[0].city || 'Kuala Lumpur',
        business_type: 'coffee_chain',
        established_date: '2020-01-01',
        annual_revenue_range: 'over_5m',
        employee_count: outlets.length * 8 // Estimate 8 employees per outlet
      };

      const { data, error } = await supabase
        .from('coffee_chains')
        .insert(chain)
        .select('id, chain_name');

      if (error) {
        console.log(`❌ Error inserting chain ${chain.chain_name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${chain.chain_name}`);
        if (data && data[0]) {
          chainIds.push({ id: data[0].id, name: data[0].chain_name, originalId: chainId });
        }
      }
    }

    // Create outlets
    console.log('\n🏪 Creating outlets from realistic data...');
    const outletIds = [];
    
    for (const outlet of outletData) {
      const chainId = chainIds.find(c => c.originalId === outlet.chain_id)?.id;
      
      const outletRecord = {
        id: uuidv4(),
        chain_id: chainId,
        outlet_name: outlet.outlet_name,
        address: outlet.address,
        city: outlet.city,
        state: outlet.state,
        postal_code: outlet.postal_code,
        country: outlet.country,
        phone_number: outlet.phone,
        manager_name: outlet.manager_name,
        outlet_type: 'full_service',
        seating_capacity: parseNumber(outlet.seating_capacity),
        operating_hours: {
          monday: { open: '07:00', close: '22:00' },
          tuesday: { open: '07:00', close: '22:00' },
          wednesday: { open: '07:00', close: '22:00' },
          thursday: { open: '07:00', close: '22:00' },
          friday: { open: '07:00', close: '23:00' },
          saturday: { open: '08:00', close: '23:00' },
          sunday: { open: '08:00', close: '22:00' }
        },
        status: outlet.status || 'active'
      };

      const { data, error } = await supabase
        .from('outlets')
        .insert(outletRecord)
        .select('id, outlet_name');

      if (error) {
        console.log(`❌ Error inserting outlet ${outlet.outlet_name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${outlet.outlet_name}`);
        if (data && data[0]) {
          outletIds.push({ id: data[0].id, name: data[0].outlet_name, originalId: outlet.outlet_id });
        }
      }
    }

    // Create suppliers from product data
    console.log('\n🏭 Creating suppliers from product data...');
    const supplierIds = [];
    
    // Extract unique suppliers from product data
    const supplierMap = new Map();
    productData.forEach(product => {
      const supplierId = product.supplier_id || 'SUPP001';
      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          id: uuidv4(),
          user_id: '00000000-0000-0000-0000-000000000001',
          supplier_name: `Supplier ${supplierId}`,
          contact_person: `Contact ${supplierId}`,
          email: `contact${supplierId.toLowerCase()}@supplier.com`,
          phone: '+60123456789',
          address: '123 Supplier Street, Kuala Lumpur',
          supplier_type: 'ingredients',
          risk_level: 'low',
          reliability_score: 8,
          last_order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          average_delivery_time: 3,
          notes: 'Realistic supplier data'
        });
      }
    });

    for (const [originalId, supplier] of supplierMap) {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select('id, supplier_name');

      if (error) {
        console.log(`❌ Error inserting supplier ${supplier.supplier_name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${supplier.supplier_name}`);
        if (data && data[0]) {
          supplierIds.push({ id: data[0].id, name: data[0].supplier_name, originalId });
        }
      }
    }

    // Create waste data
    console.log('\n🗑️ Creating waste data from realistic records...');
    
    for (const waste of wasteData) {
      const outletId = outletIds.find(o => o.originalId === waste.outlet_id)?.id;
      
      const wasteRecord = {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletId,
        item_name: waste.item_name,
        category: waste.category,
        quantity: parseNumber(waste.quantity),
        unit: waste.unit,
        waste_type: waste.waste_type,
        cost_per_unit: parseNumber(waste.cost_per_unit),
        total_cost: parseNumber(waste.total_cost),
        reason: waste.reason,
        recorded_by: waste.recorded_by,
        created_at: parseDate(waste.date)
      };

      const { data, error } = await supabase
        .from('waste_data')
        .insert(wasteRecord)
        .select();

      if (error) {
        console.log(`❌ Error inserting waste log:`, error.message);
      } else {
        console.log(`✅ Inserted waste log: ${waste.item_name} - ${waste.reason}`);
      }
    }

    // Create sample staff data
    console.log('\n👥 Creating sample staff data...');
    
    const staffData = [
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds[0]?.id,
        name: 'John Smith',
        position: 'Outlet Manager',
        email: 'john.smith@coffeechain.com',
        phone: '+60123456789',
        hire_date: '2020-03-15',
        status: 'active',
        training_level: 'advanced'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds[1]?.id,
        name: 'Sarah Johnson',
        position: 'Store Manager',
        email: 'sarah.johnson@coffeechain.com',
        phone: '+60123456790',
        hire_date: '2019-08-20',
        status: 'active',
        training_level: 'expert'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds[2]?.id,
        name: 'Mike Wilson',
        position: 'Shift Supervisor',
        email: 'mike.wilson@coffeechain.com',
        phone: '+60123456791',
        hire_date: '2021-01-10',
        status: 'active',
        training_level: 'intermediate'
      }
    ];

    for (const staff of staffData) {
      const { data, error } = await supabase
        .from('staff')
        .insert(staff)
        .select();

      if (error) {
        console.log(`❌ Error inserting staff ${staff.name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${staff.name} - ${staff.position}`);
      }
    }

    // Create analytics data from sales data
    console.log('\n📊 Creating analytics data from realistic sales...');
    
    // Calculate analytics from sales data
    const totalRevenue = salesData.reduce((sum, sale) => sum + parseNumber(sale.total_amount), 0);
    const avgOrderValue = totalRevenue / salesData.length;
    const uniqueCustomers = new Set(salesData.map(sale => sale.customer_id)).size;
    
    const analyticsData = {
      id: uuidv4(),
      user_id: '00000000-0000-0000-0000-000000000001',
      outlet_id: outletIds[0]?.id,
      data_type: 'sales',
      data: {
        total_revenue: totalRevenue,
        total_transactions: salesData.length,
        average_order_value: avgOrderValue,
        unique_customers: uniqueCustomers,
        top_products: getTopProducts(salesData),
        revenue_by_category: getRevenueByCategory(salesData)
      },
      period_start: '2024-01-01',
      period_end: '2024-01-31'
    };

    const { data: analyticsResult, error: analyticsError } = await supabase
      .from('analytics')
      .insert(analyticsData)
      .select();

    if (analyticsError) {
      console.log(`❌ Error inserting analytics:`, analyticsError.message);
    } else {
      console.log(`✅ Inserted analytics: Sales data for ${salesData.length} transactions`);
    }

    // Re-enable RLS
    console.log('\n🔧 Re-enabling RLS policies...');
    const enableRLS = `
      ALTER TABLE coffee_chains ENABLE ROW LEVEL SECURITY;
      ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE waste_data ENABLE ROW LEVEL SECURITY;
      ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
      ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
    `;

    const { error: enableRLSError } = await supabase.rpc('exec_sql', { sql: enableRLS });
    if (enableRLSError) {
      console.log('⚠️ Could not re-enable RLS:', enableRLSError.message);
    } else {
      console.log('✅ RLS policies re-enabled');
    }

    console.log('\n🎉 Realistic data population completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Coffee Chains: ${chainIds.length}`);
    console.log(`   - Outlets: ${outletIds.length}`);
    console.log(`   - Suppliers: ${supplierIds.length}`);
    console.log(`   - Waste Records: ${wasteData.length}`);
    console.log(`   - Staff Records: ${staffData.length}`);
    console.log(`   - Analytics Records: 1`);
    console.log(`   - Sales Records: ${salesData.length}`);
    console.log(`   - Customer Records: ${customerData.length}`);
    console.log(`   - Product Records: ${productData.length}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

// Helper function to get top products
function getTopProducts(salesData) {
  const productCounts = {};
  salesData.forEach(sale => {
    const product = sale.product_name;
    productCounts[product] = (productCounts[product] || 0) + parseNumber(sale.quantity);
  });
  
  return Object.entries(productCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([product, count]) => ({ product, count }));
}

// Helper function to get revenue by category
function getRevenueByCategory(salesData) {
  const categoryRevenue = {};
  salesData.forEach(sale => {
    const category = sale.category;
    categoryRevenue[category] = (categoryRevenue[category] || 0) + parseNumber(sale.total_amount);
  });
  
  return categoryRevenue;
}

// Run the population script
populateWithRealisticData();
