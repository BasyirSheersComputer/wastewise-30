import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   Supabase URL: ${process.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('❌ Database connection test failed: Missing environment variables');
    return;
  }
  
  try {
    // Test 1: Basic connection test
    console.log('🧪 Test 1: Basic Connection');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1);
    
    if (connectionError) {
      console.log(`   ❌ Connection failed: ${connectionError.message}`);
    } else {
      console.log('   ✅ Connection successful');
    }
    
    // Test 2: RPC function test
    console.log('\n🧪 Test 2: RPC Functions');
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('version');
    
    if (rpcError) {
      console.log(`   ⚠️  RPC functions not available: ${rpcError.message}`);
    } else {
      console.log('   ✅ RPC functions available');
    }
    
    // Test 3: Authentication test
    console.log('\n🧪 Test 3: Authentication Service');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log(`   ❌ Auth service error: ${authError.message}`);
    } else {
      console.log('   ✅ Authentication service working');
    }
    
    // Test 4: Schema information test
    console.log('\n🧪 Test 4: Schema Access');
    let schemaInfo = null;
    try {
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      if (schemaError) {
        console.log(`   ⚠️  Schema access limited: ${schemaError.message}`);
      } else {
        console.log(`   ✅ Schema accessible (${schemaData?.length || 0} tables found)`);
        schemaInfo = schemaData;
      }
    } catch (schemaErr) {
      console.log(`   ⚠️  Schema query not available: ${schemaErr.message}`);
    }
    
    // Summary
    console.log('\n📊 Summary:');
    const tests = [
      { name: 'Basic Connection', passed: !connectionError },
      { name: 'RPC Functions', passed: !rpcError },
      { name: 'Auth Service', passed: !authError },
      { name: 'Schema Access', passed: schemaInfo !== null }
    ];
    
    const passedTests = tests.filter(test => test.passed).length;
    const totalTests = tests.length;
    
    tests.forEach(test => {
      console.log(`   ${test.passed ? '✅' : '❌'} ${test.name}`);
    });
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 Database connection is fully operational!');
    } else if (passedTests > 0) {
      console.log('⚠️  Database connection is partially working');
    } else {
      console.log('❌ Database connection failed');
    }
    
    // Show available tables if schema access worked
    if (schemaInfo && schemaInfo.length > 0) {
      console.log('\n📋 Available Tables:');
      schemaInfo.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.log(`❌ Database test failed with error: ${error.message}`);
  }
}

// Run the test
testDatabaseConnection(); 