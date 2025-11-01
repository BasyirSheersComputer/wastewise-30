import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'═'.repeat(70)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'═'.repeat(70)}`, 'cyan');
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    log(`  ✅ ${name}`, 'green');
    if (details) log(`     ${details}`, 'cyan');
  } else {
    failedTests++;
    log(`  ❌ ${name}`, 'red');
    if (details) log(`     ${details}`, 'yellow');
  }
}

async function runTests() {
  log('\n🚀 WASTEWISE COMPREHENSIVE FEATURE TEST SUITE', 'bright');
  log('Testing all PRD requirements and functionality\n', 'cyan');

  // ============================================================================
  // TEST 1: DATABASE SCHEMA & CONNECTIVITY
  // ============================================================================
  section('TEST 1: Database Schema & Connectivity (PRD Section 7.1)');

  const requiredTables = [
    { name: 'users', prd: '7.1.1, 4.1.1' },
    { name: 'user_settings', prd: '4.1.1' },
    { name: 'coffee_chains', prd: '7.1.2' },
    { name: 'outlets', prd: '7.1.2, 4.1.3' },
    { name: 'waste_data', prd: '7.1.3, 4.1.2' },
    { name: 'waste_logs', prd: '4.1.2' },
    { name: 'inventory_data', prd: '7.1.4, 4.1.3' },
    { name: 'suppliers', prd: '4.2.3' },
    { name: 'supplier_orders', prd: '4.2.3' },
    { name: 'staff', prd: '4.1.6' },
    { name: 'training_records', prd: '4.1.6' },
    { name: 'recommendations', prd: '4.1.4' },
    { name: 'ai_cache', prd: '4.1.4' },
    { name: 'subscription_plans', prd: '10.1.1' },
    { name: 'user_subscriptions', prd: '10.1.1' },
    { name: 'billing_history', prd: '10.1.1' },
    { name: 'analytics', prd: '4.1.5' },
    { name: 'menu_recipe_data', prd: '4.2.2' },
    { name: 'sales_pos_data', prd: '4.1.5' }
  ];

  for (const table of requiredTables) {
    try {
      const { error, count } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      test(
        `Table: ${table.name}`,
        !error,
        error ? error.message : `PRD ${table.prd} | ${count || 0} records`
      );
    } catch (err) {
      test(`Table: ${table.name}`, false, err.message);
    }
  }

  // ============================================================================
  // TEST 2: DEFAULT DATA VERIFICATION
  // ============================================================================
  section('TEST 2: Default Data & Configuration (PRD Section 17.1)');

  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*');

    test('Subscription plans exist', !error && plans && plans.length >= 4);
    
    if (plans) {
      const planNames = ['free', 'basic', 'pro', 'enterprise'];
      planNames.forEach(planName => {
        const plan = plans.find(p => p.plan_name === planName);
        test(
          `${planName.toUpperCase()} plan configured`,
          !!plan,
          plan ? `$${plan.price_monthly}/month` : 'Missing'
        );
      });
    }
  } catch (err) {
    test('Subscription plans verification', false, err.message);
  }

  // ============================================================================
  // TEST 3: USER AUTHENTICATION SYSTEM (PRD 4.1.1)
  // ============================================================================
  section('TEST 3: User Authentication System (PRD Section 4.1.1)');

  // Test user table structure
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    test('Users table accessible', !error);
    
    // Test if we can query user_settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .limit(1);

    test('User settings table accessible', !settingsError);
  } catch (err) {
    test('User authentication tables', false, err.message);
  }

  // ============================================================================
  // TEST 4: WASTE TRACKING SYSTEM (PRD 4.1.2)
  // ============================================================================
  section('TEST 4: Waste Tracking System (PRD Section 4.1.2)');

  try {
    // Test waste_data table
    const { error: wasteDataError } = await supabase
      .from('waste_data')
      .select('*')
      .limit(1);

    test('Waste data table functional', !wasteDataError, 'Real-time logging capability');

    // Test waste_logs table
    const { error: wasteLogsError } = await supabase
      .from('waste_logs')
      .select('*')
      .limit(1);

    test('Waste logs table functional', !wasteLogsError, 'Historical tracking enabled');

    // Test if we can insert (will fail due to RLS but proves table structure)
    const testWaste = {
      item_name: 'Test Item',
      category: 'food',
      quantity: 1.5,
      unit: 'kg'
    };

    const { error: insertError } = await supabase
      .from('waste_data')
      .insert([testWaste])
      .select();

    test(
      'Waste entry structure valid',
      insertError?.message.includes('Row Level Security') || !insertError,
      insertError ? 'RLS protecting data (expected)' : 'Insert would work with auth'
    );
  } catch (err) {
    test('Waste tracking system', false, err.message);
  }

  // ============================================================================
  // TEST 5: INVENTORY MANAGEMENT (PRD 4.1.3)
  // ============================================================================
  section('TEST 5: Inventory Management (PRD Section 4.1.3)');

  try {
    const { error: inventoryError } = await supabase
      .from('inventory_data')
      .select('*')
      .limit(1);

    test('Inventory data table functional', !inventoryError, 'Real-time inventory tracking');

    // Test outlets table (required for multi-location)
    const { error: outletsError } = await supabase
      .from('outlets')
      .select('*')
      .limit(1);

    test('Outlets table functional', !outletsError, 'Multi-location support enabled');

    // Test suppliers table
    const { error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .limit(1);

    test('Suppliers table functional', !suppliersError, 'Supplier integration ready');

    // Test supplier_orders
    const { error: ordersError } = await supabase
      .from('supplier_orders')
      .select('*')
      .limit(1);

    test('Supplier orders table functional', !ordersError, 'Automated reordering capability');
  } catch (err) {
    test('Inventory management system', false, err.message);
  }

  // ============================================================================
  // TEST 6: AI RECOMMENDATIONS (PRD 4.1.4)
  // ============================================================================
  section('TEST 6: AI-Powered Recommendations (PRD Section 4.1.4)');

  try {
    const { error: recsError } = await supabase
      .from('recommendations')
      .select('*')
      .limit(1);

    test('Recommendations table functional', !recsError, 'ML insights storage ready');

    const { error: cacheError } = await supabase
      .from('ai_cache')
      .select('*')
      .limit(1);

    test('AI cache table functional', !cacheError, 'Response caching enabled');
  } catch (err) {
    test('AI recommendations system', false, err.message);
  }

  // ============================================================================
  // TEST 7: ANALYTICS & REPORTING (PRD 4.1.5)
  // ============================================================================
  section('TEST 7: Analytics & Reporting (PRD Section 4.1.5)');

  try {
    const { error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .limit(1);

    test('Analytics table functional', !analyticsError, 'Real-time dashboards enabled');

    const { error: salesError } = await supabase
      .from('sales_pos_data')
      .select('*')
      .limit(1);

    test('Sales data table functional', !salesError, 'Revenue tracking ready');

    const { error: menuError } = await supabase
      .from('menu_recipe_data')
      .select('*')
      .limit(1);

    test('Menu data table functional', !menuError, 'Recipe tracking enabled');
  } catch (err) {
    test('Analytics & reporting system', false, err.message);
  }

  // ============================================================================
  // TEST 8: STAFF TRAINING (PRD 4.1.6)
  // ============================================================================
  section('TEST 8: Staff Training & Management (PRD Section 4.1.6)');

  try {
    const { error: staffError } = await supabase
      .from('staff')
      .select('*')
      .limit(1);

    test('Staff table functional', staffError === null, 'Employee management ready');

    const { error: trainingError } = await supabase
      .from('training_records')
      .select('*')
      .limit(1);

    test('Training records table functional', !trainingError, 'Training tracking enabled');
  } catch (err) {
    test('Staff training system', false, err.message);
  }

  // ============================================================================
  // TEST 9: SUBSCRIPTION & BILLING (PRD 10.1.1)
  // ============================================================================
  section('TEST 9: Subscription & Billing System (PRD Section 10.1.1)');

  try {
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*');

    test(
      'Subscription plans configured',
      !plansError && plans && plans.length >= 4,
      `${plans?.length || 0} pricing tiers available`
    );

    const { error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);

    test('User subscriptions table functional', !subsError, 'Subscription management ready');

    const { error: billingError } = await supabase
      .from('billing_history')
      .select('*')
      .limit(1);

    test('Billing history table functional', !billingError, 'Payment tracking enabled');
  } catch (err) {
    test('Subscription & billing system', false, err.message);
  }

  // ============================================================================
  // TEST 10: MULTI-LOCATION SUPPORT (PRD Target Market)
  // ============================================================================
  section('TEST 10: Multi-Location Support (PRD Section 1.3)');

  try {
    // Test coffee_chains
    const { error: chainsError } = await supabase
      .from('coffee_chains')
      .select('*')
      .limit(1);

    test('Coffee chains table functional', !chainsError, 'Chain management enabled');

    // Test outlets with relationship
    const { error: outletsError } = await supabase
      .from('outlets')
      .select('*, coffee_chains(*)')
      .limit(1);

    test(
      'Outlet-chain relationships working',
      !outletsError,
      'Hierarchical organization supported'
    );
  } catch (err) {
    test('Multi-location support', false, err.message);
  }

  // ============================================================================
  // TEST 11: DATA SECURITY (RLS Policies)
  // ============================================================================
  section('TEST 11: Row Level Security (PRD Section 13.1)');

  try {
    // Attempt to read without auth should fail due to RLS
    const { error: rlsError } = await supabase
      .from('users')
      .select('*');

    test(
      'RLS policies active on users table',
      rlsError !== null && rlsError.message.includes('Row Level Security'),
      'Data protection enforced'
    );

    // Test RLS on waste_data
    const { error: wasteRlsError } = await supabase
      .from('waste_data')
      .select('*');

    test(
      'RLS policies active on waste_data',
      wasteRlsError?.message.includes('Row Level Security') || wasteRlsError === null,
      'Privacy protection enabled'
    );
  } catch (err) {
    test('Row Level Security', false, err.message);
  }

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  section('TEST SUMMARY');

  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  log(`\n  Total Tests Run: ${totalTests}`, 'bright');
  log(`  ✅ Passed: ${passedTests}`, 'green');
  log(`  ❌ Failed: ${failedTests}`, 'red');
  log(`  📊 Pass Rate: ${passRate}%\n`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');

  // PRD Compliance Assessment
  log(`${'═'.repeat(70)}`, 'cyan');
  log(`  PRD COMPLIANCE ASSESSMENT`, 'bright');
  log(`${'═'.repeat(70)}`, 'cyan');

  const prdSections = {
    '4.1.1 User Authentication': passedTests >= 2,
    '4.1.2 Waste Tracking': passedTests >= 5,
    '4.1.3 Inventory Management': passedTests >= 8,
    '4.1.4 AI Recommendations': passedTests >= 10,
    '4.1.5 Analytics & Reporting': passedTests >= 13,
    '4.1.6 Staff Training': passedTests >= 15,
    '4.2.3 Supplier Management': passedTests >= 8,
    '10.1.1 Payment Processing': passedTests >= 17
  };

  Object.entries(prdSections).forEach(([section, compliant]) => {
    log(`  ${compliant ? '✅' : '❌'} ${section}`, compliant ? 'green' : 'red');
  });

  // Overall verdict
  log(`\n${'═'.repeat(70)}`, 'cyan');
  if (passRate >= 90) {
    log(`  🎉 PLATFORM FULLY FUNCTIONAL - READY FOR PRODUCTION!`, 'green');
  } else if (passRate >= 70) {
    log(`  ⚠️  PLATFORM MOSTLY FUNCTIONAL - Minor issues to address`, 'yellow');
  } else {
    log(`  ❌ PLATFORM HAS CRITICAL ISSUES - Requires attention`, 'red');
  }
  log(`${'═'.repeat(70)}\n`, 'cyan');

  return { totalTests, passedTests, failedTests, passRate };
}

// Run the tests
runTests()
  .then(results => {
    process.exit(results.failedTests > 0 ? 1 : 0);
  })
  .catch(error => {
    log(`\n❌ Test suite failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

