/**
 * Standalone Integration Test (No Database Required)
 * Tests all mock integrations without requiring Supabase connection
 */

import IntegrationManager from './services/integrationManager.js';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

console.log('🧪 Integration Systems Test (Standalone)');
console.log('═══════════════════════════════════════\n');

const results = {
  storehub: { passed: 0, failed: 0, tests: [] },
  erp: { passed: 0, failed: 0, tests: [] },
  klaviyo: { passed: 0, failed: 0, tests: [] },
  lark: { passed: 0, failed: 0, tests: [] }
};

const integrationManager = new IntegrationManager({ useMock: true });

/**
 * Test StoreHub
 */
async function testStoreHub() {
  console.log('📊 Testing StoreHub (POS)...');
  
  try {
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'storehub',
      { storeId: 'zus_pavilion_kl', apiKey: 'test_key' }
    );
    results.storehub.tests.push({ name: 'Initialize', status: 'passed' });
    results.storehub.passed++;
    console.log('  ✅ Initialized');

    const sales = await integrationManager.syncData(
      TEST_USER_ID,
      'storehub',
      'sales',
      {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    );
    results.storehub.tests.push({ name: 'Sync Sales', status: 'passed', records: sales.count });
    results.storehub.passed++;
    console.log(`  ✅ Synced sales (${sales.count} transactions)`);

    const inventory = await integrationManager.syncData(
      TEST_USER_ID,
      'storehub',
      'inventory'
    );
    results.storehub.tests.push({ name: 'Sync Inventory', status: 'passed', records: inventory.count });
    results.storehub.passed++;
    console.log(`  ✅ Synced inventory (${inventory.count} items)`);
  } catch (error) {
    results.storehub.tests.push({ name: 'Test', status: 'failed', error: error.message });
    results.storehub.failed++;
    console.error('  ❌ Failed:', error.message);
  }
  
  console.log('');
}

/**
 * Test ERP
 */
async function testERP() {
  console.log('📦 Testing ERP...');
  
  try {
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'erp',
      { systemType: 'netsuite', companyId: 'zus_coffee' }
    );
    results.erp.tests.push({ name: 'Initialize', status: 'passed' });
    results.erp.passed++;
    console.log('  ✅ Initialized');

    const pos = await integrationManager.syncData(
      TEST_USER_ID,
      'erp',
      'purchase_orders',
      {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    );
    results.erp.tests.push({ name: 'Sync Purchase Orders', status: 'passed', records: pos.count });
    results.erp.passed++;
    console.log(`  ✅ Synced purchase orders (${pos.count} orders)`);

    const suppliers = await integrationManager.syncData(
      TEST_USER_ID,
      'erp',
      'suppliers'
    );
    results.erp.tests.push({ name: 'Sync Suppliers', status: 'passed', records: suppliers.count });
    results.erp.passed++;
    console.log(`  ✅ Synced suppliers (${suppliers.count} suppliers)`);
  } catch (error) {
    results.erp.tests.push({ name: 'Test', status: 'failed', error: error.message });
    results.erp.failed++;
    console.error('  ❌ Failed:', error.message);
  }
  
  console.log('');
}

/**
 * Test Klaviyo
 */
async function testKlaviyo() {
  console.log('👥 Testing Klaviyo (CRM)...');
  
  try {
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'klaviyo',
      { accountId: 'zus_klaviyo', apiKey: 'test_key' }
    );
    results.klaviyo.tests.push({ name: 'Initialize', status: 'passed' });
    results.klaviyo.passed++;
    console.log('  ✅ Initialized');

    const customers = await integrationManager.syncData(
      TEST_USER_ID,
      'klaviyo',
      'customers',
      { limit: 100 }
    );
    results.klaviyo.tests.push({ name: 'Sync Customers', status: 'passed', records: customers.count });
    results.klaviyo.passed++;
    console.log(`  ✅ Synced customers (${customers.count} customers)`);

    const segments = await integrationManager.syncData(
      TEST_USER_ID,
      'klaviyo',
      'segments'
    );
    results.klaviyo.tests.push({ name: 'Sync Segments', status: 'passed', records: segments.count });
    results.klaviyo.passed++;
    console.log(`  ✅ Synced segments (${segments.count} segments)`);
  } catch (error) {
    results.klaviyo.tests.push({ name: 'Test', status: 'failed', error: error.message });
    results.klaviyo.failed++;
    console.error('  ❌ Failed:', error.message);
  }
  
  console.log('');
}

/**
 * Test Lark
 */
async function testLark() {
  console.log('👔 Testing Lark (WFM)...');
  
  try {
    const init = await integrationManager.initializeIntegration(
      TEST_USER_ID,
      'lark',
      { appId: 'zus_lark', tenantId: 'zus_tenant' }
    );
    results.lark.tests.push({ name: 'Initialize', status: 'passed' });
    results.lark.passed++;
    console.log('  ✅ Initialized');

    const staff = await integrationManager.syncData(
      TEST_USER_ID,
      'lark',
      'staff',
      { outletId: 'outlet_001' }
    );
    results.lark.tests.push({ name: 'Sync Staff', status: 'passed', records: staff.count });
    results.lark.passed++;
    console.log(`  ✅ Synced staff (${staff.count} staff members)`);

    const schedules = await integrationManager.syncData(
      TEST_USER_ID,
      'lark',
      'schedules',
      {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    );
    results.lark.tests.push({ name: 'Sync Schedules', status: 'passed', records: schedules.count });
    results.lark.passed++;
    console.log(`  ✅ Synced schedules (${schedules.count} shifts)`);
  } catch (error) {
    results.lark.tests.push({ name: 'Test', status: 'failed', error: error.message });
    results.lark.failed++;
    console.error('  ❌ Failed:', error.message);
  }
  
  console.log('');
}

/**
 * Print Summary
 */
function printSummary() {
  console.log('\n📊 Test Summary');
  console.log('═══════════════════════════════════════');
  
  Object.keys(results).forEach(integration => {
    const result = results[integration];
    const total = result.passed + result.failed;
    const passRate = total > 0 ? ((result.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`\n${integration.toUpperCase()}:`);
    console.log(`  Passed: ${result.passed}/${total} (${passRate}%)`);
    result.tests.forEach(test => {
      const icon = test.status === 'passed' ? '✅' : '❌';
      const records = test.records ? ` (${test.records} records)` : '';
      console.log(`    ${icon} ${test.name}${records}${test.error ? ` - ${test.error}` : ''}`);
    });
  });

  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;

  console.log('\n═══════════════════════════════════════');
  console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
  console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════\n');

  if (totalFailed === 0) {
    console.log('🎉 All integration systems operational!');
    return true;
  } else {
    console.log('⚠️  Some tests failed. Review output above.');
    return false;
  }
}

/**
 * Main
 */
async function main() {
  await testStoreHub();
  await testERP();
  await testKlaviyo();
  await testLark();
  
  const allPassed = printSummary();
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

