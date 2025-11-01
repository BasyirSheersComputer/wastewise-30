/**
 * Integration Test Script
 * Tests all mock integrations (POS, ERP, CRM, WFM)
 * Simulates Zus Coffee data patterns
 */

import IntegrationManager from './services/integrationManager.js';
import { supabase } from './services/supabaseClient.js';
import logger from './utils/logger.js';

const TEST_USER_ID = process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000';

async function testAllIntegrations() {
  console.log('🧪 Starting Integration Tests...\n');
  
  const integrationManager = new IntegrationManager({ useMock: true });
  const results = {
    storehub: { passed: 0, failed: 0, tests: [] },
    erp: { passed: 0, failed: 0, tests: [] },
    klaviyo: { passed: 0, failed: 0, tests: [] },
    lark: { passed: 0, failed: 0, tests: [] }
  };

  // Test StoreHub (POS)
  console.log('📊 Testing StoreHub (POS) Integration...');
  try {
    // Initialize
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'storehub',
      { storeId: 'zus_pavilion_kl', apiKey: 'test_key' }
    );
    results.storehub.tests.push({ name: 'Initialize', status: 'passed' });
    results.storehub.passed++;

    // Sync sales
    const sales = await integrationManager.syncData(
      TEST_USER_ID,
      'storehub',
      'sales',
      {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        storeId: 'zus_pavilion_kl'
      }
    );
    const storeSales = await integrationManager.storeSyncedData(
      TEST_USER_ID,
      'storehub',
      'sales',
      sales
    );
    results.storehub.tests.push({ 
      name: 'Sync Sales', 
      status: 'passed',
      records: storeSales.stored 
    });
    results.storehub.passed++;

    // Sync inventory
    const inventory = await integrationManager.syncData(
      TEST_USER_ID,
      'storehub',
      'inventory',
      { storeId: 'zus_pavilion_kl' }
    );
    const storeInv = await integrationManager.storeSyncedData(
      TEST_USER_ID,
      'storehub',
      'inventory',
      inventory
    );
    results.storehub.tests.push({ 
      name: 'Sync Inventory', 
      status: 'passed',
      records: storeInv.stored 
    });
    results.storehub.passed++;

    console.log('✅ StoreHub tests passed\n');
  } catch (error) {
    console.error('❌ StoreHub test failed:', error.message);
    results.storehub.failed++;
  }

  // Test ERP
  console.log('📦 Testing ERP Integration...');
  try {
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'erp',
      { systemType: 'netsuite', companyId: 'zus_coffee' }
    );
    results.erp.tests.push({ name: 'Initialize', status: 'passed' });
    results.erp.passed++;

    // Sync purchase orders
    const pos = await integrationManager.syncData(
      TEST_USER_ID,
      'erp',
      'purchase_orders',
      {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    );
    results.erp.tests.push({ 
      name: 'Sync Purchase Orders', 
      status: 'passed',
      records: pos.count 
    });
    results.erp.passed++;

    // Sync suppliers
    const suppliers = await integrationManager.syncData(
      TEST_USER_ID,
      'erp',
      'suppliers'
    );
    results.erp.tests.push({ 
      name: 'Sync Suppliers', 
      status: 'passed',
      records: suppliers.count 
    });
    results.erp.passed++;

    console.log('✅ ERP tests passed\n');
  } catch (error) {
    console.error('❌ ERP test failed:', error.message);
    results.erp.failed++;
  }

  // Test Klaviyo (CRM)
  console.log('👥 Testing Klaviyo (CRM) Integration...');
  try {
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'klaviyo',
      { accountId: 'zus_klaviyo', apiKey: 'test_key' }
    );
    results.klaviyo.tests.push({ name: 'Initialize', status: 'passed' });
    results.klaviyo.passed++;

    // Sync customers
    const customers = await integrationManager.syncData(
      TEST_USER_ID,
      'klaviyo',
      'customers',
      { limit: 100 }
    );
    const storeCustomers = await integrationManager.storeSyncedData(
      TEST_USER_ID,
      'klaviyo',
      'customers',
      customers
    );
    results.klaviyo.tests.push({ 
      name: 'Sync Customers', 
      status: 'passed',
      records: storeCustomers.stored 
    });
    results.klaviyo.passed++;

    // Sync segments
    const segments = await integrationManager.syncData(
      TEST_USER_ID,
      'klaviyo',
      'segments'
    );
    results.klaviyo.tests.push({ 
      name: 'Sync Segments', 
      status: 'passed',
      records: segments.count 
    });
    results.klaviyo.passed++;

    console.log('✅ Klaviyo tests passed\n');
  } catch (error) {
    console.error('❌ Klaviyo test failed:', error.message);
    results.klaviyo.failed++;
  }

  // Test Lark (WFM)
  console.log('👔 Testing Lark (WFM) Integration...');
  try {
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'lark',
      { appId: 'zus_lark', tenantId: 'zus_tenant' }
    );
    results.lark.tests.push({ name: 'Initialize', status: 'passed' });
    results.lark.passed++;

    // Sync staff
    const staff = await integrationManager.syncData(
      TEST_USER_ID,
      'lark',
      'staff',
      { outletId: 'outlet_001' }
    );
    const storeStaff = await integrationManager.storeSyncedData(
      TEST_USER_ID,
      'lark',
      'staff',
      staff
    );
    results.lark.tests.push({ 
      name: 'Sync Staff', 
      status: 'passed',
      records: storeStaff.stored 
    });
    results.lark.passed++;

    // Sync schedules
    const schedules = await integrationManager.syncData(
      TEST_USER_ID,
      'lark',
      'schedules',
      {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        outletId: 'outlet_001'
      }
    );
    results.lark.tests.push({ 
      name: 'Sync Schedules', 
      status: 'passed',
      records: schedules.count 
    });
    results.lark.passed++;

    // Sync attendance
    const attendance = await integrationManager.syncData(
      TEST_USER_ID,
      'lark',
      'attendance',
      {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        outletId: 'outlet_001'
      }
    );
    results.lark.tests.push({ 
      name: 'Sync Attendance', 
      status: 'passed',
      records: attendance.count 
    });
    results.lark.passed++;

    console.log('✅ Lark tests passed\n');
  } catch (error) {
    console.error('❌ Lark test failed:', error.message);
    results.lark.failed++;
  }

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('═══════════════════════════════════════');
  
  Object.keys(results).forEach(integration => {
    const result = results[integration];
    const total = result.passed + result.failed;
    const passRate = total > 0 ? ((result.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\n${integration.toUpperCase()}:`);
    console.log(`  Passed: ${result.passed}/${total} (${passRate}%)`);
    console.log(`  Failed: ${result.failed}`);
    result.tests.forEach(test => {
      const icon = test.status === 'passed' ? '✅' : '❌';
      const records = test.records ? ` (${test.records} records)` : '';
      console.log(`    ${icon} ${test.name}${records}`);
    });
  });

  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;

  console.log('\n═══════════════════════════════════════');
  console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════\n');

  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run tests
testAllIntegrations().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

