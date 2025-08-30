import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Use service role key for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function populateCoffeeIndustrySQL() {
  console.log('🌱 Populating database with Coffee Industry data using SQL...\n');

  try {
    // Coffee Chains Data
    const coffeeChainsSQL = `
      INSERT INTO coffee_chains (id, user_id, chain_name, description, total_outlets, primary_location, business_type, established_date, annual_revenue_range, employee_count) VALUES
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Starbucks Corporation', 'Global coffeehouse chain and roastery reserves', 35000, 'Seattle, Washington, USA', 'coffee_chain', '1971-03-30', 'over_5m', 402000),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Dunkin'' Donuts', 'American multinational coffee and donut company', 12000, 'Canton, Massachusetts, USA', 'coffee_chain', '1950-06-10', 'over_5m', 125000),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Tim Hortons', 'Canadian multinational fast food restaurant chain', 5000, 'Oakville, Ontario, Canada', 'coffee_chain', '1964-05-17', 'over_5m', 100000),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Costa Coffee', 'British multinational coffeehouse company', 4000, 'Dunstable, England, UK', 'coffee_chain', '1971-01-01', 'over_5m', 18000),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'McCafé', 'Coffee-house-style food and beverage chain', 15000, 'Melbourne, Victoria, Australia', 'coffee_chain', '1993-01-01', 'over_5m', 200000)
      ON CONFLICT DO NOTHING;
    `;

    // Suppliers Data
    const suppliersSQL = `
      INSERT INTO suppliers (id, user_id, supplier_name, contact_person, email, phone, address, supplier_type, risk_level, reliability_score, last_order_date, average_delivery_time, notes) VALUES
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Nestlé Nespresso', 'Jean-Marc Duvoisin', 'contact@nespresso.com', '+41-21-785-8888', 'Avenue Nestlé 55, Vevey, Switzerland', 'ingredients', 'low', 9, '${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()}', 3, 'Premium coffee capsules and beans supplier'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'JDE Peet''s', 'Fabien Simon', 'info@jdepeets.com', '+31-20-558-0000', 'Oosterdoksstraat 80, Amsterdam, Netherlands', 'ingredients', 'low', 9, '${new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()}', 2, 'Global coffee and tea company'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Lavazza Group', 'Antonio Baravalle', 'info@lavazza.com', '+39-011-197-8111', 'Via Bologna 32, Turin, Italy', 'ingredients', 'low', 8, '${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()}', 4, 'Italian coffee manufacturer'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Illycaffè', 'Massimiliano Pogliani', 'info@illy.com', '+39-040-389-0111', 'Via Flavia 110, Trieste, Italy', 'ingredients', 'low', 9, '${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()}', 5, 'Premium Italian coffee roaster'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Tata Consumer Products', 'Sunil D''Souza', 'info@tataconsumer.com', '+91-22-6778-9999', 'Bombay House, Mumbai, India', 'ingredients', 'medium', 7, '${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}', 7, 'Tata Coffee and Tetley Tea supplier'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Danone', 'Antoine de Saint-Affrique', 'contact@danone.com', '+33-1-44-35-2000', '17 Boulevard Haussmann, Paris, France', 'ingredients', 'low', 9, '${new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()}', 1, 'Global dairy products supplier'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Fonterra Co-operative Group', 'Miles Hurrell', 'info@fonterra.com', '+64-9-374-7000', 'Fonterra House, Auckland, New Zealand', 'ingredients', 'low', 8, '${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()}', 3, 'New Zealand dairy cooperative'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'De''Longhi Group', 'Fabio De''Longhi', 'info@delonghi.com', '+39-0422-413-111', 'Via L. Seitz 47, Treviso, Italy', 'equipment', 'low', 9, '${new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()}', 14, 'Premium coffee machine manufacturer'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Breville Group', 'Jim Clayton', 'info@breville.com', '+61-2-9384-0344', '170-180 Bourke Road, Alexandria, Australia', 'equipment', 'medium', 8, '${new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()}', 21, 'Australian kitchen appliance manufacturer'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Huhtamaki', 'Charles Héaulmé', 'info@huhtamaki.com', '+358-10-686-7800', 'Revontulenkuja 6, Espoo, Finland', 'packaging', 'low', 8, '${new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()}', 7, 'Global packaging solutions provider'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', 'Berry Global', 'Tom Salmon', 'info@berryglobal.com', '+1-812-424-2904', '101 Oakley Street, Evansville, Indiana, USA', 'packaging', 'medium', 7, '${new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()}', 10, 'Plastic packaging manufacturer')
      ON CONFLICT DO NOTHING;
    `;

    // Waste Data
    const wasteDataSQL = `
      INSERT INTO waste_data (id, user_id, outlet_id, item_name, category, quantity, unit, cost_per_unit, total_cost, reason, recorded_by) VALUES
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', NULL, 'Coffee Beans', 'food', 5.5, 'kg', 25.00, 137.50, 'Over-extraction during peak hours', 'System'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', NULL, 'Fresh Milk', 'beverage', 8.0, 'L', 4.20, 33.60, 'Milk expiration - slow turnover', 'System'),
      ('${uuidv4()}', '00000000-0000-0000-0000-000000000001', NULL, 'Vanilla Syrup', 'ingredient', 2.0, 'L', 15.00, 30.00, 'Syrup contamination', 'System')
      ON CONFLICT DO NOTHING;
    `;

    // Execute SQL commands
    console.log('📊 Inserting coffee chains...');
    const { error: chainsError } = await supabase.rpc('exec_sql', { sql: coffeeChainsSQL });
    if (chainsError) {
      console.log('❌ Error inserting coffee chains:', chainsError.message);
    } else {
      console.log('✅ Coffee chains inserted successfully');
    }

    console.log('\n🏭 Inserting suppliers...');
    const { error: suppliersError } = await supabase.rpc('exec_sql', { sql: suppliersSQL });
    if (suppliersError) {
      console.log('❌ Error inserting suppliers:', suppliersError.message);
    } else {
      console.log('✅ Suppliers inserted successfully');
    }

    console.log('\n🗑️ Inserting waste data...');
    const { error: wasteError } = await supabase.rpc('exec_sql', { sql: wasteDataSQL });
    if (wasteError) {
      console.log('❌ Error inserting waste data:', wasteError.message);
    } else {
      console.log('✅ Waste data inserted successfully');
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

    const { data: suppliers, error: suppliersVerifyError } = await supabase
      .from('suppliers')
      .select('supplier_name, supplier_type, risk_level')
      .limit(10);
    
    if (suppliersVerifyError) {
      console.log('❌ Error verifying suppliers:', suppliersVerifyError.message);
    } else {
      console.log('\n✅ Suppliers in database:');
      suppliers?.forEach(supplier => {
        console.log(`   - ${supplier.supplier_name} (${supplier.supplier_type}, ${supplier.risk_level} risk)`);
      });
    }

    const { data: waste, error: wasteVerifyError } = await supabase
      .from('waste_data')
      .select('item_name, quantity, unit, reason')
      .limit(10);
    
    if (wasteVerifyError) {
      console.log('❌ Error verifying waste data:', wasteVerifyError.message);
    } else {
      console.log('\n✅ Waste data in database:');
      waste?.forEach(item => {
        console.log(`   - ${item.item_name}: ${item.quantity} ${item.unit} (${item.reason})`);
      });
    }

    console.log('\n🎉 Coffee Industry data population completed!');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
}

// Run the population script
populateCoffeeIndustrySQL();
