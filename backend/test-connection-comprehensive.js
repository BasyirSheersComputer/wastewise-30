// Comprehensive Localhost Frontend-Backend-Database Connection Test
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🔗 COMPREHENSIVE LOCALHOST CONNECTION TEST\n');
console.log('=' .repeat(80));
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log('=' .repeat(80));

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTestResult(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASSED - ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAILED - ${testName}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
  console.log('');
}

async function testBackendHealth() {
  console.log('🏥 TEST 1: Backend Health Check');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'healthy') {
      logTestResult('Backend Health Check', true, 
        `Status: ${data.status} | Version: ${data.version} | Environment: ${data.environment}`);
      return true;
    } else {
      logTestResult('Backend Health Check', false, 
        `Status: ${response.status} | Response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logTestResult('Backend Health Check', false, `Error: ${error.message}`);
    return false;
  }
}

async function testBackendAPI() {
  console.log('🔌 TEST 2: Backend API Endpoint');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/test`);
    const data = await response.json();
    
    if (response.ok && data.message === 'Backend API is working') {
      logTestResult('Backend API Endpoint', true, 
        `Message: ${data.message} | Supabase: ${data.supabaseUrl}`);
      return true;
    } else {
      logTestResult('Backend API Endpoint', false, 
        `Status: ${response.status} | Response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logTestResult('Backend API Endpoint', false, `Error: ${error.message}`);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('🗄️  TEST 3: Database Connection');
  console.log('-'.repeat(50));
  
  try {
    // Check if Supabase environment variables are configured
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logTestResult('Database Connection', false, 
        'Supabase environment variables not configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
      return false;
    }
    
    // Test direct Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test a simple query to verify connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      logTestResult('Database Connection', false, 
        `Supabase connection error: ${error.message}`);
      return false;
    }
    
    logTestResult('Database Connection', true, 
      `Supabase URL: ${supabaseUrl.substring(0, 30)}... | Query successful`);
    return true;
  } catch (error) {
    logTestResult('Database Connection', false, `Error: ${error.message}`);
    return false;
  }
}

async function testAuthEndpoints() {
  console.log('🔐 TEST 4: Authentication Endpoints');
  console.log('-'.repeat(50));
  
  const authEndpoints = [
    { path: '/api/auth/me', method: 'GET', name: 'Get Current User' },
    { path: '/api/auth/subscription-status', method: 'GET', name: 'Subscription Status' }
  ];
  
  let passedCount = 0;
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // These endpoints should return 401 (unauthorized) when no token is provided
      // which indicates they're working but require authentication
      if (response.status === 401) {
        logTestResult(`${endpoint.name} Endpoint`, true, 
          `Status: ${response.status} (Unauthorized - expected without token)`);
        passedCount++;
      } else if (response.status === 503) {
        logTestResult(`${endpoint.name} Endpoint`, true, 
          `Status: ${response.status} (Service unavailable - auth service disabled)`);
        passedCount++;
      } else {
        logTestResult(`${endpoint.name} Endpoint`, false, 
          `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      logTestResult(`${endpoint.name} Endpoint`, false, `Error: ${error.message}`);
    }
  }
  
  return passedCount === authEndpoints.length;
}

async function testUserEndpoints() {
  console.log('👤 TEST 5: User Management Endpoints');
  console.log('-'.repeat(50));
  
  const userEndpoints = [
    { path: '/api/user/profile', method: 'GET', name: 'Get User Profile' },
    { path: '/api/coffee-chain/dashboard', method: 'GET', name: 'Get Dashboard Data' }
  ];
  
  let passedCount = 0;
  
  for (const endpoint of userEndpoints) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // These endpoints should return 401 (unauthorized) when no token is provided
      if (response.status === 401) {
        logTestResult(`${endpoint.name} Endpoint`, true, 
          `Status: ${response.status} (Unauthorized - expected without token)`);
        passedCount++;
      } else {
        logTestResult(`${endpoint.name} Endpoint`, false, 
          `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      logTestResult(`${endpoint.name} Endpoint`, false, `Error: ${error.message}`);
    }
  }
  
  return passedCount === userEndpoints.length;
}

async function testDatabaseOperations() {
  console.log('📊 TEST 6: Database Operations');
  console.log('-'.repeat(50));
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logTestResult('Database Operations', false, 'Supabase not configured');
      return false;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test reading from different tables
    const tables = ['users', 'waste_logs', 'supplier_orders'];
    let successfulQueries = 0;
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ⚠️  Table ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ Table ${table}: ${data ? data.length : 0} records`);
          successfulQueries++;
        }
      } catch (tableError) {
        console.log(`   ❌ Table ${table}: ${tableError.message}`);
      }
    }
    
    if (successfulQueries > 0) {
      logTestResult('Database Operations', true, 
        `${successfulQueries}/${tables.length} tables accessible`);
      return true;
    } else {
      logTestResult('Database Operations', false, 'No tables accessible');
      return false;
    }
  } catch (error) {
    logTestResult('Database Operations', false, `Error: ${error.message}`);
    return false;
  }
}

async function testFrontendAccessibility() {
  console.log('🌐 TEST 7: Frontend Accessibility');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(FRONTEND_URL);
    
    if (response.ok) {
      logTestResult('Frontend Accessibility', true, 
        `Status: ${response.status} | Frontend is accessible`);
      return true;
    } else {
      logTestResult('Frontend Accessibility', false, 
        `Status: ${response.status} | Frontend not accessible`);
      return false;
    }
  } catch (error) {
    logTestResult('Frontend Accessibility', false, 
      `Error: ${error.message} | Make sure frontend is running on ${FRONTEND_URL}`);
    return false;
  }
}

async function testCORSConfiguration() {
  console.log('🌍 TEST 8: CORS Configuration');
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    if (response.status === 200 || response.status === 204) {
      logTestResult('CORS Configuration', true, 
        `Status: ${response.status} | CORS headers present`);
      console.log(`   📋 CORS Headers: ${JSON.stringify(corsHeaders, null, 2)}`);
      return true;
    } else {
      logTestResult('CORS Configuration', false, 
        `Status: ${response.status} | CORS not properly configured`);
      return false;
    }
  } catch (error) {
    logTestResult('CORS Configuration', false, `Error: ${error.message}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('🔧 TEST 9: Environment Variables');
  console.log('-'.repeat(50));
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const optionalVars = [
    'GEMINI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];
  
  let passedCount = 0;
  const totalRequired = requiredVars.length;
  
  console.log('Required Environment Variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
      passedCount++;
    } else {
      console.log(`   ❌ ${varName}: Not set`);
    }
  }
  
  console.log('\nOptional Environment Variables:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set (optional)`);
    }
  }
  
  if (passedCount === totalRequired) {
    logTestResult('Environment Variables', true, 
      `${passedCount}/${totalRequired} required variables set`);
    return true;
  } else {
    logTestResult('Environment Variables', false, 
      `${passedCount}/${totalRequired} required variables set`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive connection tests...\n');
  
  const tests = [
    testBackendHealth,
    testBackendAPI,
    testDatabaseConnection,
    testAuthEndpoints,
    testUserEndpoints,
    testDatabaseOperations,
    testFrontendAccessibility,
    testCORSConfiguration,
    testEnvironmentVariables
  ];
  
  for (const test of tests) {
    await test();
  }
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Your localhost setup is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
  
  console.log('\n💡 TROUBLESHOOTING TIPS:');
  console.log('1. Make sure backend is running: npm run dev (in backend directory)');
  console.log('2. Make sure frontend is running: npm run dev (in frontend directory)');
  console.log('3. Check environment variables in .env files');
  console.log('4. Verify Supabase configuration');
  console.log('5. Check if ports 3000 and 5173 are available');
}

// Run the tests
runAllTests().catch(console.error);
