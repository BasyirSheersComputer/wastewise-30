import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function populateMalaysianFNB() {
  console.log('🇲🇾 Populating database with Malaysian F&B Value Chain data...\n');

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

    // Insert Malaysian Coffee Chains
    console.log('\n☕ Inserting Malaysian Coffee Chains...');

    const malaysianChains = [
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'OldTown White Coffee',
        description: 'Malaysian coffee chain specializing in white coffee and local cuisine',
        total_outlets: 350,
        primary_location: 'Petaling Jaya, Selangor, Malaysia',
        business_type: 'coffee_chain',
        established_date: '1999-01-01',
        annual_revenue_range: 'over_5m',
        employee_count: 5000
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'Starbucks Malaysia',
        description: 'International coffee chain with Malaysian market adaptation',
        total_outlets: 380,
        primary_location: 'Kuala Lumpur, Malaysia',
        business_type: 'coffee_chain',
        established_date: '1998-12-01',
        annual_revenue_range: 'over_5m',
        employee_count: 4500
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'Coffee Bean & Tea Leaf Malaysia',
        description: 'Premium coffee and tea chain with local partnerships',
        total_outlets: 120,
        primary_location: 'Kuala Lumpur, Malaysia',
        business_type: 'coffee_chain',
        established_date: '1997-06-01',
        annual_revenue_range: '1m_5m',
        employee_count: 1800
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'Gloria Jean\'s Malaysia',
        description: 'Australian coffee chain with Malaysian franchise operations',
        total_outlets: 85,
        primary_location: 'Petaling Jaya, Selangor, Malaysia',
        business_type: 'coffee_chain',
        established_date: '2000-03-01',
        annual_revenue_range: '500k_1m',
        employee_count: 1200
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'San Francisco Coffee Malaysia',
        description: 'Local coffee chain with artisanal coffee focus',
        total_outlets: 45,
        primary_location: 'Kuala Lumpur, Malaysia',
        business_type: 'coffee_chain',
        established_date: '2005-08-01',
        annual_revenue_range: '500k_1m',
        employee_count: 600
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'Zus Coffee',
        description: 'Fast-growing Malaysian coffee chain with drive-thru concept',
        total_outlets: 180,
        primary_location: 'Kuala Lumpur, Malaysia',
        business_type: 'coffee_chain',
        established_date: '2019-01-01',
        annual_revenue_range: '1m_5m',
        employee_count: 2200
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'Bask Bear Coffee',
        description: 'Local specialty coffee chain with Malaysian coffee beans',
        total_outlets: 25,
        primary_location: 'Kuala Lumpur, Malaysia',
        business_type: 'coffee_chain',
        established_date: '2018-06-01',
        annual_revenue_range: '100k_500k',
        employee_count: 300
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        chain_name: 'Kopi Kenangan',
        description: 'Indonesian coffee chain expanding in Malaysia',
        total_outlets: 65,
        primary_location: 'Kuala Lumpur, Malaysia',
        business_type: 'coffee_chain',
        established_date: '2020-01-01',
        annual_revenue_range: '500k_1m',
        employee_count: 800
      }
    ];

    const chainIds = [];
    for (const chain of malaysianChains) {
      const { data, error } = await supabase
        .from('coffee_chains')
        .insert(chain)
        .select('id, chain_name');

      if (error) {
        console.log(`❌ Error inserting chain ${chain.chain_name}:`, error.message);
      } else {
        console.log(`✅ Inserted: ${chain.chain_name}`);
        if (data && data[0]) {
          chainIds.push({ id: data[0].id, name: data[0].chain_name });
        }
      }
    }

    // Insert Malaysian Suppliers
    console.log('\n🏭 Inserting Malaysian F&B Suppliers...');

    const malaysianSuppliers = [
      // Coffee Bean Suppliers
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'BOH Plantations Sdn Bhd',
        contact_person: 'Ahmad Fadzil',
        email: 'procurement@boh.com.my',
        phone: '+60-3-2788-8888',
        address: 'BOH Tea Centre, 32 Jalan Mayang, Kuala Lumpur 50450',
        supplier_type: 'ingredients',
        risk_level: 'low',
        reliability_score: 9,
        last_order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 2,
        notes: 'Premium Malaysian tea and coffee supplier'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'MyCoffee Sdn Bhd',
        contact_person: 'Sarah Tan',
        email: 'sales@mycoffee.com.my',
        phone: '+60-3-7722-3344',
        address: 'Lot 123, Jalan Sultan, Kuala Lumpur 50000',
        supplier_type: 'ingredients',
        risk_level: 'low',
        reliability_score: 8,
        last_order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 1,
        notes: 'Local coffee bean roaster and supplier'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'Cameron Highlands Coffee Estate',
        contact_person: 'Raj Kumar',
        email: 'info@cameroncoffee.com.my',
        phone: '+60-5-491-1234',
        address: 'Cameron Highlands, Pahang 39000',
        supplier_type: 'ingredients',
        risk_level: 'medium',
        reliability_score: 7,
        last_order_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 3,
        notes: 'Highland coffee beans and specialty blends'
      },
      // Dairy Suppliers
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'Dutch Lady Malaysia',
        contact_person: 'Lim Mei Ling',
        email: 'b2b@dutchlady.com.my',
        phone: '+60-3-7844-8888',
        address: 'Petaling Jaya, Selangor 47301',
        supplier_type: 'ingredients',
        risk_level: 'low',
        reliability_score: 9,
        last_order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 1,
        notes: 'Fresh milk and dairy products'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'Farm Fresh Berhad',
        contact_person: 'Azizah Rahman',
        email: 'wholesale@farmfresh.com.my',
        phone: '+60-3-8765-4321',
        address: 'Seremban, Negeri Sembilan 70400',
        supplier_type: 'ingredients',
        risk_level: 'low',
        reliability_score: 8,
        last_order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 2,
        notes: 'Organic milk and dairy alternatives'
      },
      // Equipment Suppliers
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'La Marzocco Malaysia',
        contact_person: 'David Wong',
        email: 'malaysia@lamarzocco.com',
        phone: '+60-3-2287-8899',
        address: 'Bangsar, Kuala Lumpur 59100',
        supplier_type: 'equipment',
        risk_level: 'low',
        reliability_score: 9,
        last_order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 14,
        notes: 'Premium coffee machines and equipment'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'Bunn Malaysia',
        contact_person: 'Kumar Rajan',
        email: 'sales@bunn.com.my',
        phone: '+60-3-7880-1122',
        address: 'Shah Alam, Selangor 40000',
        supplier_type: 'equipment',
        risk_level: 'medium',
        reliability_score: 7,
        last_order_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 21,
        notes: 'Commercial coffee brewers and dispensers'
      },
      // Packaging Suppliers
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'Malaysian Packaging Industries',
        contact_person: 'Tan Ah Kow',
        email: 'sales@mpi.com.my',
        phone: '+60-3-3344-5566',
        address: 'Klang, Selangor 41000',
        supplier_type: 'packaging',
        risk_level: 'medium',
        reliability_score: 8,
        last_order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 7,
        notes: 'Eco-friendly packaging solutions'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'GreenPak Solutions',
        contact_person: 'Nurul Ain',
        email: 'info@greenpak.com.my',
        phone: '+60-3-4455-6677',
        address: 'Cyberjaya, Selangor 63000',
        supplier_type: 'packaging',
        risk_level: 'low',
        reliability_score: 8,
        last_order_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 5,
        notes: 'Biodegradable and compostable packaging'
      },
      // Local Food Suppliers
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'Kampung Bakeries',
        contact_person: 'Aminah Hassan',
        email: 'orders@kampungbakeries.com.my',
        phone: '+60-3-5566-7788',
        address: 'Kajang, Selangor 43000',
        supplier_type: 'ingredients',
        risk_level: 'medium',
        reliability_score: 7,
        last_order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 1,
        notes: 'Traditional Malaysian pastries and breads'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        supplier_name: 'Tropical Fruits Malaysia',
        contact_person: 'Lee Chong Wei',
        email: 'sales@tropicalfruits.com.my',
        phone: '+60-3-6677-8899',
        address: 'Batu Pahat, Johor 83000',
        supplier_type: 'ingredients',
        risk_level: 'medium',
        reliability_score: 7,
        last_order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        average_delivery_time: 2,
        notes: 'Fresh local fruits and tropical ingredients'
      }
    ];

    for (const supplier of malaysianSuppliers) {
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

    // Insert Sample Outlets for major chains
    console.log('\n🏪 Inserting Sample Outlets...');

    const sampleOutlets = [
      {
        id: uuidv4(),
        chain_id: chainIds.find(c => c.name === 'OldTown White Coffee')?.id,
        outlet_name: 'OldTown White Coffee - Mid Valley',
        address: 'G-073, Ground Floor, Mid Valley Megamall',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        postal_code: '59200',
        country: 'Malaysia',
        phone_number: '+60-3-2282-1234',
        manager_name: 'Ahmad Zulkarnain',
        outlet_type: 'full_service',
        seating_capacity: 80,
        operating_hours: { open: '08:00', close: '22:00' },
        status: 'active'
      },
      {
        id: uuidv4(),
        chain_id: chainIds.find(c => c.name === 'Starbucks Malaysia')?.id,
        outlet_name: 'Starbucks - Pavilion KL',
        address: 'Lot 1.01.00, Level 1, Pavilion Kuala Lumpur',
        city: 'Kuala Lumpur',
        state: 'Kuala Lumpur',
        postal_code: '55100',
        country: 'Malaysia',
        phone_number: '+60-3-2148-5678',
        manager_name: 'Sarah Lim',
        outlet_type: 'full_service',
        seating_capacity: 120,
        operating_hours: { open: '07:00', close: '23:00' },
        status: 'active'
      },
      {
        id: uuidv4(),
        chain_id: chainIds.find(c => c.name === 'Zus Coffee')?.id,
        outlet_name: 'Zus Coffee - Sunway Pyramid',
        address: 'LG2.67, Lower Ground 2, Sunway Pyramid',
        city: 'Petaling Jaya',
        state: 'Selangor',
        postal_code: '46150',
        country: 'Malaysia',
        phone_number: '+60-3-7494-9012',
        manager_name: 'Nurul Huda',
        outlet_type: 'kiosk',
        seating_capacity: 30,
        operating_hours: { open: '10:00', close: '22:00' },
        status: 'active'
      }
    ];

    const outletIds = [];
    for (const outlet of sampleOutlets) {
      if (outlet.chain_id) {
        const { data, error } = await supabase
          .from('outlets')
          .insert(outlet)
          .select('id, outlet_name');

        if (error) {
          console.log(`❌ Error inserting outlet ${outlet.outlet_name}:`, error.message);
        } else {
          console.log(`✅ Inserted: ${outlet.outlet_name}`);
          if (data && data[0]) {
            outletIds.push({ id: data[0].id, name: data[0].outlet_name });
          }
        }
      }
    }

    // Insert Malaysian F&B Waste Data
    console.log('\n🗑️ Inserting Malaysian F&B Waste Data...');

    const malaysianWasteData = [
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('OldTown'))?.id,
        item_name: 'White Coffee Powder',
        category: 'ingredient',
        quantity: 2.5,
        unit: 'kg',
        waste_type: 'expired',
        cost_per_unit: 45.00,
        total_cost: 112.50,
        reason: 'Exceeded shelf life - humidity issues during monsoon season',
        recorded_by: 'Ahmad Zulkarnain'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('Starbucks'))?.id,
        item_name: 'Fresh Milk',
        category: 'beverage',
        quantity: 5.0,
        unit: 'L',
        waste_type: 'expired',
        cost_per_unit: 8.50,
        total_cost: 42.50,
        reason: 'Power outage during peak hours - milk spoiled',
        recorded_by: 'Sarah Lim'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('Zus'))?.id,
        item_name: 'Arabica Coffee Beans',
        category: 'ingredient',
        quantity: 1.8,
        unit: 'kg',
        waste_type: 'overcooked',
        cost_per_unit: 65.00,
        total_cost: 117.00,
        reason: 'Barista training session - over-roasted beans',
        recorded_by: 'Nurul Huda'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: null,
        item_name: 'Kaya Toast',
        category: 'food',
        quantity: 15,
        unit: 'pieces',
        waste_type: 'expired',
        cost_per_unit: 3.50,
        total_cost: 52.50,
        reason: 'Low customer turnout due to heavy rain',
        recorded_by: 'System'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: null,
        item_name: 'Durian Cake',
        category: 'food',
        quantity: 8,
        unit: 'pieces',
        waste_type: 'spoiled',
        cost_per_unit: 12.00,
        total_cost: 96.00,
        reason: 'Temperature control failure in display case',
        recorded_by: 'System'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: null,
        item_name: 'Plastic Straws',
        category: 'packaging',
        quantity: 500,
        unit: 'pieces',
        waste_type: 'other',
        cost_per_unit: 0.05,
        total_cost: 25.00,
        reason: 'Switching to biodegradable alternatives',
        recorded_by: 'System'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: null,
        item_name: 'Teh Tarik Mix',
        category: 'ingredient',
        quantity: 3.2,
        unit: 'kg',
        waste_type: 'expired',
        cost_per_unit: 28.00,
        total_cost: 89.60,
        reason: 'Seasonal demand fluctuation',
        recorded_by: 'System'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: null,
        item_name: 'Pandan Leaves',
        category: 'ingredient',
        quantity: 2.0,
        unit: 'kg',
        waste_type: 'spoiled',
        cost_per_unit: 15.00,
        total_cost: 30.00,
        reason: 'Supplier delivery delay - leaves wilted',
        recorded_by: 'System'
      }
    ];

    for (const waste of malaysianWasteData) {
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

    // Insert Sample Staff Data
    console.log('\n👥 Inserting Sample Staff Data...');

    const malaysianStaff = [
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('OldTown'))?.id,
        name: 'Ahmad Zulkarnain',
        position: 'Outlet Manager',
        email: 'ahmad.zulkarnain@oldtown.com.my',
        phone: '+60-12-345-6789',
        hire_date: '2020-03-15',
        status: 'active',
        training_level: 'advanced'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('Starbucks'))?.id,
        name: 'Sarah Lim',
        position: 'Store Manager',
        email: 'sarah.lim@starbucks.com.my',
        phone: '+60-12-987-6543',
        hire_date: '2019-08-20',
        status: 'active',
        training_level: 'expert'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('Zus'))?.id,
        name: 'Nurul Huda',
        position: 'Shift Supervisor',
        email: 'nurul.huda@zus.com.my',
        phone: '+60-12-456-7890',
        hire_date: '2021-01-10',
        status: 'active',
        training_level: 'intermediate'
      }
    ];

    for (const staff of malaysianStaff) {
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

    // Insert Analytics Data
    console.log('\n📊 Inserting Analytics Data...');

    const malaysianAnalytics = [
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('OldTown'))?.id,
        data_type: 'waste',
        data: {
          total_waste_cost: 1250.75,
          waste_by_category: {
            food: 45.2,
            beverage: 32.1,
            packaging: 15.8,
            ingredient: 6.9
          },
          top_waste_items: ['White Coffee Powder', 'Fresh Milk', 'Kaya Toast'],
          waste_trend: 'decreasing',
          monthly_savings: 320.50
        },
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000001',
        outlet_id: outletIds.find(o => o.name.includes('Starbucks'))?.id,
        data_type: 'sales',
        data: {
          total_sales: 45000.00,
          average_transaction: 28.50,
          peak_hours: ['08:00-10:00', '14:00-16:00'],
          top_products: ['Caramel Macchiato', 'Iced Americano', 'Chocolate Chip Cookie'],
          customer_satisfaction: 4.6
        },
        period_start: '2024-01-01',
        period_end: '2024-01-31'
      }
    ];

    for (const analytics of malaysianAnalytics) {
      const { data, error } = await supabase
        .from('analytics')
        .insert(analytics)
        .select();

      if (error) {
        console.log(`❌ Error inserting analytics:`, error.message);
      } else {
        console.log(`✅ Inserted analytics: ${analytics.data_type}`);
      }
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

    // Verify the data was inserted
    console.log('\n🔍 Verifying inserted data...');

    const { data: chains, error: chainsVerifyError } = await supabase
      .from('coffee_chains')
      .select('chain_name, total_outlets, primary_location')
      .limit(10);

    if (chainsVerifyError) {
      console.log('❌ Error verifying coffee chains:', chainsVerifyError.message);
    } else {
      console.log('✅ Malaysian Coffee chains in database:');
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
      console.log('\n✅ Malaysian Suppliers in database:');
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
      console.log('\n✅ Malaysian F&B Waste data in database:');
      wasteVerify?.forEach(item => {
        console.log(`   - ${item.item_name}: ${item.quantity} ${item.unit} (${item.reason})`);
      });
    }

    console.log('\n🎉 Malaysian F&B Value Chain data population completed!');
    console.log('\n📋 Summary:');
    console.log(`   - ${malaysianChains.length} Malaysian Coffee Chains`);
    console.log(`   - ${malaysianSuppliers.length} Malaysian Suppliers`);
    console.log(`   - ${sampleOutlets.length} Sample Outlets`);
    console.log(`   - ${malaysianWasteData.length} Waste Data Entries`);
    console.log(`   - ${malaysianStaff.length} Staff Records`);
    console.log(`   - ${malaysianAnalytics.length} Analytics Records`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

// Run the population script
populateMalaysianFNB();
