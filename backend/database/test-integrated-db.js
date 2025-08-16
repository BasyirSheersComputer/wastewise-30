import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testIntegratedDatabase() {
  console.log('🔍 Testing integrated database setup...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   Supabase URL: ${process.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('❌ Database test failed: Missing environment variables');
    return;
  }
  
  try {
    // Test existing tables
    console.log('🧪 Testing Existing Tables:');
    const existingTables = [
      'forecast_models_results',
      'inventory_data',
      'menu_recipe_data',
      'profiles',
      'raw_data_lake',
      'reports_dashboards',
      'sales_pos_data',
      'supplier_data',
      'supplier_orders',
      'user_staff_data',
      'waste_logs'
    ];
    
    const existingTableResults = [];
    
    for (const tableName of existingTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          existingTableResults.push({ name: tableName, exists: false, error: error.message });
        } else {
          existingTableResults.push({ name: tableName, exists: true, count: data?.length || 0 });
        }
      } catch (err) {
        existingTableResults.push({ name: tableName, exists: false, error: err.message });
      }
    }
    
    const existingFound = existingTableResults.filter(t => t.exists);
    const existingMissing = existingTableResults.filter(t => !t.exists);
    
    console.log(`   ✅ Existing tables found: ${existingFound.length}`);
    console.log(`   ❌ Existing tables missing: ${existingMissing.length}`);
    
    if (existingFound.length > 0) {
      console.log('\n   📋 Existing tables found:');
      existingFound.forEach(table => {
        console.log(`      - ${table.name} (${table.count} records)`);
      });
    }
    
    if (existingMissing.length > 0) {
      console.log('\n   ⚠️  Missing existing tables:');
      existingMissing.forEach(table => {
        console.log(`      - ${table.name}: ${table.error}`);
      });
    }
    
    // Test new tables
    console.log('\n🧪 Testing New Tables:');
    const newTables = [
      'users',
      'user_settings',
      'coffee_chains',
      'outlets',
      'analytics',
      'waste_data',
      'recommendations',
      'ai_cache',
      'subscription_plans',
      'user_subscriptions',
      'billing_history',
      'staff',
      'training_records'
    ];
    
    const newTableResults = [];
    
    for (const tableName of newTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          newTableResults.push({ name: tableName, exists: false, error: error.message });
        } else {
          newTableResults.push({ name: tableName, exists: true, count: data?.length || 0 });
        }
      } catch (err) {
        newTableResults.push({ name: tableName, exists: false, error: err.message });
      }
    }
    
    const newFound = newTableResults.filter(t => t.exists);
    const newMissing = newTableResults.filter(t => !t.exists);
    
    console.log(`   ✅ New tables found: ${newFound.length}`);
    console.log(`   ❌ New tables missing: ${newMissing.length}`);
    
    if (newFound.length > 0) {
      console.log('\n   📋 New tables found:');
      newFound.forEach(table => {
        console.log(`      - ${table.name} (${table.count} records)`);
      });
    }
    
    if (newMissing.length > 0) {
      console.log('\n   ⚠️  Missing new tables:');
      newMissing.forEach(table => {
        console.log(`      - ${table.name}: ${table.error}`);
      });
    }
    
    // Test enhanced columns on existing tables
    console.log('\n🧪 Testing Enhanced Columns:');
    const enhancedColumns = [
      { table: 'profiles', columns: ['user_id', 'company_name', 'subscription_status', 'subscription_plan', 'trial_start', 'trial_end'] },
      { table: 'inventory_data', columns: ['user_id', 'outlet_id', 'status'] },
      { table: 'menu_recipe_data', columns: ['user_id', 'outlet_id', 'status'] },
      { table: 'supplier_data', columns: ['user_id', 'status'] },
      { table: 'supplier_orders', columns: ['user_id', 'outlet_id'] },
      { table: 'user_staff_data', columns: ['user_id', 'outlet_id'] },
      { table: 'waste_logs', columns: ['user_id', 'outlet_id'] },
      { table: 'sales_pos_data', columns: ['user_id', 'outlet_id'] },
      { table: 'raw_data_lake', columns: ['user_id'] },
      { table: 'reports_dashboards', columns: ['user_id'] },
      { table: 'forecast_models_results', columns: ['user_id'] }
    ];
    
    const enhancedResults = [];
    
    for (const { table, columns } of enhancedColumns) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select(columns.join(', '))
          .limit(1);
        
        if (error) {
          enhancedResults.push({ table, enhanced: false, error: error.message });
        } else {
          enhancedResults.push({ table, enhanced: true, columns });
        }
      } catch (err) {
        enhancedResults.push({ table, enhanced: false, error: err.message });
      }
    }
    
    const enhancedFound = enhancedResults.filter(r => r.enhanced);
    const enhancedMissing = enhancedResults.filter(r => !r.enhanced);
    
    console.log(`   ✅ Enhanced tables: ${enhancedFound.length}`);
    console.log(`   ❌ Not enhanced: ${enhancedMissing.length}`);
    
    if (enhancedFound.length > 0) {
      console.log('\n   📋 Enhanced tables:');
      enhancedFound.forEach(result => {
        console.log(`      - ${result.table} (${result.columns.join(', ')})`);
      });
    }
    
    if (enhancedMissing.length > 0) {
      console.log('\n   ⚠️  Tables needing enhancement:');
      enhancedMissing.forEach(result => {
        console.log(`      - ${result.table}: ${result.error}`);
      });
    }
    
    // Test RLS policies
    console.log('\n🧪 Testing Row Level Security:');
    const rlsTables = [
      'users', 'user_settings', 'coffee_chains', 'outlets', 'analytics', 'waste_data',
      'recommendations', 'ai_cache', 'subscription_plans', 'user_subscriptions',
      'billing_history', 'staff', 'training_records', 'profiles', 'inventory_data',
      'menu_recipe_data', 'supplier_data', 'supplier_orders', 'user_staff_data',
      'waste_logs', 'sales_pos_data', 'raw_data_lake', 'reports_dashboards',
      'forecast_models_results'
    ];
    
    const rlsResults = [];
    
    for (const tableName of rlsTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        // If we get a permission error, RLS is working
        if (error && error.message.includes('permission') || error.message.includes('policy')) {
          rlsResults.push({ table: tableName, rls: true });
        } else if (error) {
          rlsResults.push({ table: tableName, rls: false, error: error.message });
        } else {
          rlsResults.push({ table: tableName, rls: true });
        }
      } catch (err) {
        rlsResults.push({ table: tableName, rls: false, error: err.message });
      }
    }
    
    const rlsEnabled = rlsResults.filter(r => r.rls);
    const rlsDisabled = rlsResults.filter(r => !r.rls);
    
    console.log(`   ✅ RLS enabled: ${rlsEnabled.length}`);
    console.log(`   ❌ RLS disabled: ${rlsDisabled.length}`);
    
    if (rlsDisabled.length > 0) {
      console.log('\n   ⚠️  Tables without RLS:');
      rlsDisabled.forEach(result => {
        console.log(`      - ${result.table}: ${result.error}`);
      });
    }
    
    // Summary
    console.log('\n📊 Integration Summary:');
    const totalExisting = existingTables.length;
    const totalNew = newTables.length;
    const totalEnhanced = enhancedColumns.length;
    const totalRls = rlsTables.length;
    
    console.log(`   📋 Existing tables: ${existingFound.length}/${totalExisting} found`);
    console.log(`   🆕 New tables: ${newFound.length}/${totalNew} found`);
    console.log(`   🔧 Enhanced tables: ${enhancedFound.length}/${totalEnhanced} enhanced`);
    console.log(`   🔒 RLS enabled: ${rlsEnabled.length}/${totalRls} tables`);
    
    const totalTables = totalExisting + totalNew;
    const foundTables = existingFound.length + newFound.length;
    
    console.log(`\n🎯 Overall: ${foundTables}/${totalTables} tables ready`);
    
    if (foundTables === totalTables && enhancedFound.length === totalEnhanced && rlsEnabled.length === totalRls) {
      console.log('🎉 Database integration is fully operational!');
    } else if (foundTables > 0) {
      console.log('⚠️  Database integration is partially working');
    } else {
      console.log('❌ Database integration failed');
    }
    
  } catch (error) {
    console.log(`❌ Database test failed with error: ${error.message}`);
  }
}

// Run the test
testIntegratedDatabase(); 