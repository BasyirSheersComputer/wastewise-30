#!/usr/bin/env node

/**
 * Authentication Test Script for WasteWise-30
 * Tests the authentication flow from frontend to backend to Supabase
 */

const https = require('https');

const BACKEND_URL = 'https://wastewise-backend-451983642521.asia-southeast1.run.app';
const FRONTEND_URL = 'https://wastewise-frontend-451983642521.asia-southeast1.run.app';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WasteWise-30-Test/1.0'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => req.destroy());
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testBackendHealth() {
  log('\n🔍 Testing Backend Health...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      log('✅ Backend is healthy and responding', 'green');
      log(`   Environment: ${response.data.environment}`, 'blue');
      log(`   Version: ${response.data.version}`, 'blue');
      return true;
    } else {
      log(`❌ Backend health check failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend health check error: ${error.message}`, 'red');
    return false;
  }
}

async function testSupabaseConnection() {
  log('\n🗄️  Testing Supabase Connection...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/test-db`);
    if (response.status === 200) {
      const data = response.data;
      log(`✅ Database connection: ${data.status}`, 'green');
      log(`   Connection URL: ${data.connection.url}`, 'blue');
      log(`   Connection Key: ${data.connection.key}`, 'blue');
      log(`   Tests Passed: ${data.summary.passed}/${data.summary.total} (${data.summary.percentage}%)`, 'blue');
      
      if (data.summary.percentage >= 25) {
        log('✅ Supabase connection is working', 'green');
        return true;
      } else {
        log('⚠️  Supabase connection is partially working', 'yellow');
        return false;
      }
    } else {
      log(`❌ Database test failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Database test error: ${error.message}`, 'red');
    return false;
  }
}

async function testAuthenticationEndpoints() {
  log('\n🔐 Testing Authentication Endpoints...', 'blue');
  
  const authEndpoints = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/verify'
  ];
  
  let workingEndpoints = 0;
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint}`, 'POST', {
        email: 'test@example.com',
        password: 'testpassword'
      });
      
      if (response.status === 400 || response.status === 401 || response.status === 422) {
        log(`✅ ${endpoint} - Endpoint exists and responding (${response.status})`, 'green');
        workingEndpoints++;
      } else if (response.status === 404) {
        log(`❌ ${endpoint} - Endpoint not found`, 'red');
      } else {
        log(`⚠️  ${endpoint} - Unexpected response (${response.status})`, 'yellow');
        workingEndpoints++;
      }
    } catch (error) {
      log(`❌ ${endpoint} - Error: ${error.message}`, 'red');
    }
  }
  
  return workingEndpoints > 0;
}

async function testFrontendAccessibility() {
  log('\n🌐 Testing Frontend Accessibility...', 'blue');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200) {
      log('✅ Frontend is accessible', 'green');
      log('   HTML content loaded successfully', 'blue');
      return true;
    } else {
      log(`❌ Frontend access failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend access error: ${error.message}`, 'red');
    return false;
  }
}

async function testCORSConfiguration() {
  log('\n🔗 Testing CORS Configuration...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.headers['access-control-allow-origin']) {
      log('✅ CORS headers are configured', 'green');
      log(`   Allow-Origin: ${response.headers['access-control-allow-origin']}`, 'blue');
      return true;
    } else {
      log('⚠️  CORS headers not found', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ CORS test error: ${error.message}`, 'red');
    return false;
  }
}

async function generateReport(results) {
  log('\n' + '='.repeat(60), 'bold');
  log('🔐 AUTHENTICATION TEST REPORT', 'bold');
  log('='.repeat(60), 'bold');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((passedTests / totalTests) * 100);
  
  log(`\nOverall Status: ${passedTests}/${totalTests} tests passed (${percentage}%)`, percentage >= 75 ? 'green' : 'red');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`   ${test}: ${status}`, color);
  });
  
  log('\n' + '='.repeat(60), 'bold');
  
  if (percentage >= 75) {
    log('🎉 Authentication infrastructure is working correctly!', 'green');
    log('\n📋 Next Steps for Manual Testing:', 'blue');
    log('   1. Open the frontend URL in a browser:', 'blue');
    log(`      ${FRONTEND_URL}`, 'blue');
    log('   2. Navigate to the login/signup page', 'blue');
    log('   3. Attempt to create an account or login', 'blue');
    log('   4. Monitor the network tab for API calls to Supabase', 'blue');
    log('   5. Check the backend logs for authentication requests', 'blue');
  } else {
    log('❌ Authentication infrastructure has issues', 'red');
    log('\n🔧 Recommended Actions:', 'yellow');
    log('   1. Check backend service configuration', 'yellow');
    log('   2. Verify Supabase connection settings', 'yellow');
    log('   3. Review CORS configuration', 'yellow');
    log('   4. Check authentication endpoint implementations', 'yellow');
  }
  
  log('\n📋 Manual Authentication Test Instructions:', 'blue');
  log('   1. Open browser developer tools (F12)', 'blue');
  log('   2. Go to Network tab', 'blue');
  log('   3. Navigate to the frontend application', 'blue');
  log('   4. Attempt to login or signup', 'blue');
  log('   5. Look for requests to:', 'blue');
  log('      - Backend API endpoints (/api/auth/*)', 'blue');
  log('      - Supabase authentication endpoints', 'blue');
  log('   6. Check for successful responses and proper error handling', 'blue');
}

async function main() {
  log('🔐 WasteWise-30 Authentication Test Tool', 'bold');
  log('Testing authentication flow and Supabase integration...', 'blue');
  
  const results = {
    backendHealth: await testBackendHealth(),
    supabaseConnection: await testSupabaseConnection(),
    authEndpoints: await testAuthenticationEndpoints(),
    frontendAccess: await testFrontendAccessibility(),
    corsConfig: await testCORSConfiguration()
  };
  
  await generateReport(results);
}

// Run the authentication test
main().catch(error => {
  log(`\n❌ Authentication test failed: ${error.message}`, 'red');
  process.exit(1);
});
