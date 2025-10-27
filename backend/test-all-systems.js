/**
 * Comprehensive System Test
 * Tests all integrations, database connections, and system health
 */

import dotenv from 'dotenv';
dotenv.config();

import IntegrationManager from './services/integrationManager.js';
import logger from './utils/logger.js';
import fetch from 'node-fetch';

// Try to import supabase, but handle gracefully if env vars are missing
let supabase = null;

async function initSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase not configured - database tests will be skipped');
    console.warn('   Set SUPABASE_URL and SUPABASE_ANON_KEY in .env file\n');
    return null;
  }
  
  try {
    const supabaseModule = await import('./services/supabaseClient.js');
    return supabaseModule.supabase;
  } catch (error) {
    console.warn('⚠️  Failed to initialize Supabase:', error.message);
    return null;
  }
}

const TEST_USER_ID = process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

console.log('🧪 Comprehensive System Test');
console.log('═══════════════════════════════════════\n');

const results = {
  database: { passed: 0, failed: 0, tests: [] },
  integrations: { passed: 0, failed: 0, tests: [] },
  api: { passed: 0, failed: 0, tests: [] },
  overall: 'pending'
};

/**
 * Test Database Connection
 */
async function testDatabase() {
  console.log('📊 Testing Database Connection...\n');
  
  if (!supabase) {
    console.log('⏭️  Skipping database tests (Supabase not configured)\n');
    results.database.tests.push({ name: 'Connection', status: 'skipped', error: 'Supabase not configured' });
    return;
  }
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') throw error;
    results.database.tests.push({ name: 'Connection', status: 'passed' });
    results.database.passed++;
    console.log('✅ Database connection successful');
  } catch (error) {
    results.database.tests.push({ name: 'Connection', status: 'failed', error: error.message });
    results.database.failed++;
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  try {
    // Test 2: Check integration tables exist
    const tables = ['integrations', 'integration_sync_logs', 'integration_test_results', 'inventory_data'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error && !error.message.includes('does not exist')) {
        results.database.tests.push({ name: `Table: ${table}`, status: 'passed' });
        results.database.passed++;
      } else {
        results.database.tests.push({ name: `Table: ${table}`, status: 'failed', error: 'Table does not exist' });
        results.database.failed++;
        console.warn(`⚠️  Table ${table} may not exist - run migrations first`);
      }
    }
  } catch (error) {
    console.error('❌ Table check failed:', error.message);
  }

  console.log(`✅ Database tests: ${results.database.passed} passed, ${results.database.failed} failed\n`);
}

/**
 * Test API Server
 */
async function testAPI() {
  console.log('🌐 Testing API Server...\n');
  
  try {
    // Test 1: Health check
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      results.api.tests.push({ name: 'Health Check', status: 'passed' });
      results.api.passed++;
      console.log('✅ API server is running');
      console.log(`   Supabase: ${health.supabaseUrl === 'Configured' ? '✅' : '❌'}`);
      console.log(`   Gemini: ${health.geminiApiKey === 'Configured' ? '✅' : '❌'}`);
    } else {
      throw new Error(`Health check returned ${healthResponse.status}`);
    }
  } catch (error) {
    results.api.tests.push({ name: 'Health Check', status: 'failed', error: error.message });
    results.api.failed++;
    console.error('❌ API server health check failed:', error.message);
    console.warn('⚠️  Make sure backend server is running: npm start');
    return;
  }

  try {
    // Test 2: Integration test endpoints exist
    const endpoints = [
      '/api/integration-test/storehub/status',
      '/api/integration-test/erp/status',
      '/api/integration-test/klaviyo/status',
      '/api/integration-test/lark/status'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: { 'Authorization': 'Bearer test-token' }
        });
        // We expect 401/403 for auth, but endpoint should exist (not 404)
        if (response.status !== 404) {
          results.api.tests.push({ name: `Endpoint: ${endpoint}`, status: 'passed' });
          results.api.passed++;
        } else {
          throw new Error('Endpoint not found');
        }
      } catch (error) {
        results.api.tests.push({ name: `Endpoint: ${endpoint}`, status: 'failed', error: error.message });
        results.api.failed++;
      }
    }
  } catch (error) {
    console.error('❌ API endpoint check failed:', error.message);
  }

  console.log(`✅ API tests: ${results.api.passed} passed, ${results.api.failed} failed\n`);
}

/**
 * Test Integrations
 */
async function testIntegrations() {
  console.log('🔌 Testing Mock Integrations...\n');
  
  const integrationManager = new IntegrationManager({ useMock: true });
  
  const integrations = [
    { type: 'storehub', name: 'StoreHub (POS)', dataTypes: ['sales', 'inventory'] },
    { type: 'erp', name: 'ERP', dataTypes: ['purchase_orders', 'suppliers'] },
    { type: 'klaviyo', name: 'Klaviyo (CRM)', dataTypes: ['customers', 'segments'] },
    { type: 'lark', name: 'Lark (WFM)', dataTypes: ['staff', 'schedules'] }
  ];

  for (const integration of integrations) {
    console.log(`Testing ${integration.name}...`);
    
    try {
      // Initialize
      const init = await integrationManager.initializeIntegration(
        TEST_USER_ID,
        integration.type,
        { storeId: 'test_store', apiKey: 'test_key' }
      );
      results.integrations.tests.push({ name: `${integration.name} - Initialize`, status: 'passed' });
      results.integrations.passed++;
      console.log(`  ✅ Initialized`);

      // Test data sync for each data type
      for (const dataType of integration.dataTypes) {
        try {
          const syncResult = await integrationManager.syncData(
            TEST_USER_ID,
            integration.type,
            dataType,
            {
              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              endDate: new Date().toISOString()
            }
          );
          
          const recordCount = syncResult.count || syncResult.data?.length || 0;
          results.integrations.tests.push({ 
            name: `${integration.name} - Sync ${dataType}`, 
            status: 'passed',
            records: recordCount
          });
          results.integrations.passed++;
          console.log(`  ✅ Synced ${dataType} (${recordCount} records)`);
        } catch (error) {
          results.integrations.tests.push({ 
            name: `${integration.name} - Sync ${dataType}`, 
            status: 'failed', 
            error: error.message 
          });
          results.integrations.failed++;
          console.error(`  ❌ Failed to sync ${dataType}:`, error.message);
        }
      }
    } catch (error) {
      results.integrations.tests.push({ 
        name: `${integration.name} - Initialize`, 
        status: 'failed', 
        error: error.message 
      });
      results.integrations.failed++;
      console.error(`  ❌ Failed to initialize:`, error.message);
    }
    
    console.log('');
  }

  console.log(`✅ Integration tests: ${results.integrations.passed} passed, ${results.integrations.failed} failed\n`);
}

/**
 * Print Summary
 */
function printSummary() {
  console.log('\n📊 Test Summary');
  console.log('═══════════════════════════════════════');
  
  // Database
  const dbTotal = results.database.passed + results.database.failed;
  const dbRate = dbTotal > 0 ? ((results.database.passed / dbTotal) * 100).toFixed(1) : 0;
  console.log(`\n📊 Database:`);
  console.log(`  Passed: ${results.database.passed}/${dbTotal} (${dbRate}%)`);
  results.database.tests.forEach(test => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    console.log(`    ${icon} ${test.name}${test.error ? ` - ${test.error}` : ''}`);
  });

  // API
  const apiTotal = results.api.passed + results.api.failed;
  const apiRate = apiTotal > 0 ? ((results.api.passed / apiTotal) * 100).toFixed(1) : 0;
  console.log(`\n🌐 API Server:`);
  console.log(`  Passed: ${results.api.passed}/${apiTotal} (${apiRate}%)`);
  results.api.tests.forEach(test => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    console.log(`    ${icon} ${test.name}${test.error ? ` - ${test.error}` : ''}`);
  });

  // Integrations
  const intTotal = results.integrations.passed + results.integrations.failed;
  const intRate = intTotal > 0 ? ((results.integrations.passed / intTotal) * 100).toFixed(1) : 0;
  console.log(`\n🔌 Integrations:`);
  console.log(`  Passed: ${results.integrations.passed}/${intTotal} (${intRate}%)`);
  results.integrations.tests.forEach(test => {
    const icon = test.status === 'passed' ? '✅' : '❌';
    const records = test.records ? ` (${test.records} records)` : '';
    console.log(`    ${icon} ${test.name}${records}${test.error ? ` - ${test.error}` : ''}`);
  });

  // Overall
  const totalPassed = results.database.passed + results.api.passed + results.integrations.passed;
  const totalFailed = results.database.failed + results.api.failed + results.integrations.failed;
  const totalTests = totalPassed + totalFailed;
  const overallRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

  console.log('\n═══════════════════════════════════════');
  console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
  console.log(`Success Rate: ${overallRate}%`);
  console.log('═══════════════════════════════════════\n');

  if (totalFailed === 0) {
    console.log('🎉 All systems operational!');
    results.overall = 'passed';
  } else {
    console.log('⚠️  Some tests failed. Review output above.');
    results.overall = 'partial';
  }

  return totalFailed === 0;
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  try {
    // Initialize Supabase
    supabase = await initSupabase();
    
    await testDatabase();
    await testAPI();
    await testIntegrations();
    
    const allPassed = printSummary();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();

