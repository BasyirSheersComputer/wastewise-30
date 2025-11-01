import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const tables = [
  'users', 'user_settings', 'coffee_chains', 'outlets', 
  'analytics', 'waste_data', 'waste_logs', 'suppliers',
  'supplier_orders', 'recommendations', 'ai_cache',
  'subscription_plans', 'user_subscriptions', 'billing_history',
  'staff', 'training_records', 'inventory_data',
  'menu_recipe_data', 'sales_pos_data'
];

console.log('\n🔍 Checking all required tables...\n');

for (const table of tables) {
  try {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table.padEnd(25)} - ${error.message}`);
    } else {
      console.log(`✅ ${table.padEnd(25)} - EXISTS (${count || 0} records)`);
    }
  } catch (err) {
    console.log(`❌ ${table.padEnd(25)} - ${err.message}`);
  }
}

console.log('\n✅ Check complete!\n');

