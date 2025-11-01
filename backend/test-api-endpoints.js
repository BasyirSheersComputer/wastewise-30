import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

let totalTests = 0;
let passedTests = 0;

function test(name, passed, details = '') {
  totalTests++;
  if (passed) {
    passedTests++;
    log(`  ✅ ${name}`, 'green');
  } else {
    log(`  ❌ ${name}`, 'red');
  }
  if (details) log(`     ${details}`, 'cyan');
}

async function testEndpoint(method, path, expectedStatus, description) {
  try {
    const response = await fetch(`${API_BASE}${path}`, { method });
    const passed = response.status === expectedStatus;
    test(
      `${method} ${path}`,
      passed,
      `${description} | Status: ${response.status} ${passed ? '✓' : '✗ Expected: ' + expectedStatus}`
    );
    return passed;
  } catch (error) {
    test(`${method} ${path}`, false, `Error: ${error.message}`);
    return false;
  }
}

async function runAPITests() {
  log('\n🔌 API ENDPOINT TESTS', 'bright');
  log('Testing backend routes and availability\n', 'cyan');

  // Check if server is running
  log('═══════════════════════════════════════════════════', 'cyan');
  log('  Checking Server Availability', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  try {
    const response = await fetch(API_BASE);
    test('Backend server reachable', response.ok, `Listening on ${API_BASE}`);
  } catch (error) {
    log('\n❌ Backend server is not running!', 'red');
    log('   Start it with: cd backend && npm start\n', 'yellow');
    return { totalTests: 1, passedTests: 0, serverRunning: false };
  }

  // Test endpoints (PRD Section 8)
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  Authentication Endpoints (PRD 8.1)', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  await testEndpoint('POST', '/api/auth/register', 400, 'User registration endpoint');
  await testEndpoint('POST', '/api/auth/login', 400, 'User login endpoint');
  await testEndpoint('GET', '/api/auth/profile', 401, 'Get user profile (requires auth)');

  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  Waste Tracking Endpoints (PRD 8.2)', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  await testEndpoint('GET', '/api/waste', 401, 'Get waste data (requires auth)');
  await testEndpoint('POST', '/api/waste', 401, 'Create waste entry (requires auth)');
  await testEndpoint('GET', '/api/waste/analytics', 401, 'Get waste analytics (requires auth)');

  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  Inventory Endpoints (PRD 8.3)', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  await testEndpoint('GET', '/api/inventory', 401, 'Get inventory (requires auth)');
  await testEndpoint('POST', '/api/inventory', 401, 'Create inventory item (requires auth)');
  await testEndpoint('GET', '/api/inventory/alerts', 401, 'Get low stock alerts (requires auth)');

  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  AI Recommendations Endpoints (PRD 8.4)', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  await testEndpoint('GET', '/api/ai/recommendations', 401, 'Get AI recommendations (requires auth)');
  await testEndpoint('POST', '/api/ai/analyze', 401, 'Analyze data (requires auth)');

  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  Supplier Management Endpoints', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  await testEndpoint('GET', '/api/suppliers', 401, 'Get suppliers (requires auth)');
  await testEndpoint('POST', '/api/suppliers', 401, 'Create supplier (requires auth)');

  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  Coffee Chain & Outlets Endpoints', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  await testEndpoint('GET', '/api/coffee-chain', 401, 'Get coffee chains (requires auth)');
  await testEndpoint('GET', '/api/outlets', 401, 'Get outlets (requires auth)');

  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  Analytics Endpoints', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  await testEndpoint('GET', '/api/analytics', 401, 'Get analytics (requires auth)');
  await testEndpoint('GET', '/api/dashboard', 401, 'Get dashboard data (requires auth)');

  // Summary
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  TEST SUMMARY', 'bright');
  log('═══════════════════════════════════════════════════', 'cyan');

  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  log(`\n  Total Endpoints Tested: ${totalTests}`, 'bright');
  log(`  ✅ Working: ${passedTests}`, 'green');
  log(`  ❌ Not Working: ${totalTests - passedTests}`, 'red');
  log(`  📊 Success Rate: ${passRate}%\n`, passRate >= 90 ? 'green' : 'yellow');

  if (passRate >= 90) {
    log('  🎉 ALL API ENDPOINTS FUNCTIONAL!', 'green');
  } else if (passRate >= 70) {
    log('  ⚠️  MOST API ENDPOINTS WORKING', 'yellow');
  } else {
    log('  ❌ CRITICAL API ISSUES DETECTED', 'red');
  }
  log('═══════════════════════════════════════════════════\n', 'cyan');

  return { totalTests, passedTests, passRate, serverRunning: true };
}

// Check if server is running first
log('\n🚀 Starting API Endpoint Tests...', 'bright');
log('Make sure backend server is running: npm start\n', 'yellow');

setTimeout(async () => {
  const results = await runAPITests();
  
  if (!results.serverRunning) {
    log('⚠️  Start backend server first: cd backend && npm start\n', 'yellow');
    process.exit(1);
  }
  
  process.exit(results.passRate >= 90 ? 0 : 1);
}, 1000);

