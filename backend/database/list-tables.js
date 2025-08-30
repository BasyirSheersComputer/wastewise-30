import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function listTables() {
  console.log('🔍 Listing tables in database...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${process.env.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log('❌ Database connection failed: Missing environment variables');
    return;
  }
  
  try {
    // Method 1: Try to query information_schema.tables
    console.log('🧪 Method 1: Querying information_schema.tables');
    const { data: schemaTables, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (schemaError) {
      console.log(`   ❌ Schema query failed: ${schemaError.message}`);
    } else {
      console.log(`   ✅ Found ${schemaTables?.length || 0} tables via schema query`);
      if (schemaTables && schemaTables.length > 0) {
        console.log('\n📋 Tables found:');
        schemaTables.forEach(table => {
          console.log(`   - ${table.table_name} (${table.table_type})`);
        });
      }
    }
    
    // Method 2: Try to query pg_tables
    console.log('\n🧪 Method 2: Querying pg_tables');
    const { data: pgTables, error: pgError } = await supabase
      .from('pg_tables')
      .select('tablename, tableowner')
      .eq('schemaname', 'public')
      .order('tablename');
    
    if (pgError) {
      console.log(`   ❌ pg_tables query failed: ${pgError.message}`);
    } else {
      console.log(`   ✅ Found ${pgTables?.length || 0} tables via pg_tables`);
      if (pgTables && pgTables.length > 0) {
        console.log('\n📋 Tables found:');
        pgTables.forEach(table => {
          console.log(`   - ${table.tablename} (owner: ${table.tableowner})`);
        });
      }
    }
    
    // Method 3: Try to query specific tables that might exist
    console.log('\n🧪 Method 3: Testing specific table existence');
    const testTables = [
      'users',
      'user_settings', 
      'auth.users',
      'profiles',
      'coffee_chains',
      'analytics',
      'recommendations',
      'billing',
      'subscriptions'
    ];
    
    const tableResults = [];
    
    for (const tableName of testTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          tableResults.push({ name: tableName, exists: false, error: error.message });
        } else {
          tableResults.push({ name: tableName, exists: true, count: data?.length || 0 });
        }
      } catch (err) {
        tableResults.push({ name: tableName, exists: false, error: err.message });
      }
    }
    
    console.log('   📋 Specific table test results:');
    tableResults.forEach(result => {
      if (result.exists) {
        console.log(`   ✅ ${result.name} (${result.count} records)`);
      } else {
        console.log(`   ❌ ${result.name} - ${result.error}`);
      }
    });
    
    // Summary
    console.log('\n📊 Summary:');
    const existingTables = tableResults.filter(t => t.exists).map(t => t.name);
    const schemaTableCount = schemaTables?.length || 0;
    const pgTableCount = pgTables?.length || 0;
    
    console.log(`   Schema query tables: ${schemaTableCount}`);
    console.log(`   pg_tables query tables: ${pgTableCount}`);
    console.log(`   Specific tables found: ${existingTables.length}`);
    
    if (existingTables.length > 0) {
      console.log('\n🎯 Existing tables:');
      existingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    } else {
      console.log('\n⚠️  No tables found - database appears to be empty');
    }
    
  } catch (error) {
    console.log(`❌ Database query failed with error: ${error.message}`);
  }
}

// Run the table listing
listTables(); 