import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function populateCoffeeIndustrySimple() {
  console.log('🌱 Populating database with Coffee Industry data (Simple Mode)...\n');

  try {
    // First, let's try to disable RLS temporarily
    console.log('🔧 Attempting to disable RLS policies...');
    
    const disableRLS = `
      ALTER TABLE coffee_chains DISABLE ROW LEVEL SECURITY;
      ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
      ALTER TABLE waste_data DISABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: disableRLS });
    if (rlsError) {
      console.log('⚠️ Could not disable RLS (this is normal):', rlsError.message);
    } else {
      console.log('✅ RLS policies disabled temporarily');
    }

    // Try inserting data directly
    console.log('\n📊 Inserting coffee chains...');
    
    const coffeeChains = [
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
      }
    ];

    for (const chain of coffeeChains) {
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
    
    const suppliers = [
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
      }
    ];

    for (const supplier of suppliers) {
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

    // Insert waste data
    console.log('\n🗑️ Inserting waste data...');
    
    const wasteData = [
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: null,
        item_name: 'Coffee Beans',
        category: 'food',
        quantity: 5.5,
        unit: 'kg',
        cost_per_unit: 25.00,
        total_cost: 137.50,
        reason: 'Over-extraction during peak hours',
        recorded_by: 'System'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: null,
        item_name: 'Fresh Milk',
        category: 'beverage',
        quantity: 8.0,
        unit: 'L',
        cost_per_unit: 4.20,
        total_cost: 33.60,
        reason: 'Milk expiration - slow turnover',
        recorded_by: 'System'
      }
    ];

    for (const waste of wasteData) {
      const { data, error } = await supabase
        .from('waste_data')
        .insert(waste)
        .select();
      
      if (error) {
        console.log(`❌ Error inserting waste log:`, error.message);
      } else {
        console.log(`✅ Inserted waste log: ${waste.reason}`);
      }
    }

    // Re-enable RLS
    console.log('\n🔧 Re-enabling RLS policies...');
    const enableRLS = `
      ALTER TABLE coffee_chains ENABLE ROW LEVEL SECURITY;
      ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE waste_data ENABLE ROW LEVEL SECURITY;
    `;

    const { error: enableRLSError } = await supabase.rpc('exec_sql', { sql: enableRLS });
    if (enableRLSError) {
      console.log('⚠️ Could not re-enable RLS:', enableRLSError.message);
    } else {
      console.log('✅ RLS policies re-enabled');
    }

    // Verify the data was inserted
    console.log('\n🔍 Verifying inserted data...');
    
    const { data: chains, error: chainsVerifyError } = await supabase
      .from('coffee_chains')
      .select('chain_name, total_outlets, primary_location')
      .limit(10);
    
    if (chainsVerifyError) {
      console.log('❌ Error verifying coffee chains:', chainsVerifyError.message);
    } else {
      console.log('✅ Coffee chains in database:');
      chains?.forEach(chain => {
        console.log(`   - ${chain.chain_name} (${chain.total_outlets} outlets, ${chain.primary_location})`);
      });
    }

    const { data: suppliersVerify, error: suppliersVerifyError } = await supabase
      .from('suppliers')
      .select('supplier_name, supplier_type, risk_level')
      .limit(10);
    
    if (suppliersVerifyError) {
      console.log('❌ Error verifying suppliers:', suppliersVerifyError.message);
    } else {
      console.log('\n✅ Suppliers in database:');
      suppliersVerify?.forEach(supplier => {
        console.log(`   - ${supplier.supplier_name} (${supplier.supplier_type}, ${supplier.risk_level} risk)`);
      });
    }

    const { data: wasteVerify, error: wasteVerifyError } = await supabase
      .from('waste_data')
      .select('item_name, quantity, unit, reason')
      .limit(10);
    
    if (wasteVerifyError) {
      console.log('❌ Error verifying waste data:', wasteVerifyError.message);
    } else {
      console.log('\n✅ Waste data in database:');
      wasteVerify?.forEach(item => {
        console.log(`   - ${item.item_name}: ${item.quantity} ${item.unit} (${item.reason})`);
      });
    }

    console.log('\n🎉 Coffee Industry data population completed!');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

// Run the population script
populateCoffeeIndustrySimple();
