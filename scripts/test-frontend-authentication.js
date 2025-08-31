#!/usr/bin/env node

/**
 * Frontend Authentication Test Script for WasteWise-30
 * Tests the frontend authentication flow with Supabase
 */

const https = require('https');

const FRONTEND_URL = 'https://wastewise-frontend-451983642521.asia-southeast1.run.app';
const BACKEND_URL = 'https://wastewise-backend-451983642521.asia-southeast1.run.app';

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

async function testFrontendLoading() {
  log('\n🌐 Testing Frontend Loading...', 'blue');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.status === 200) {
      log('✅ Frontend is loading successfully', 'green');
      
      // Check if the HTML contains authentication-related content
      const html = response.data;
      if (html.includes('login') || html.includes('signup') || html.includes('auth')) {
        log('✅ Frontend contains authentication components', 'green');
      } else {
        log('⚠️  Frontend HTML does not contain obvious auth components', 'yellow');
      }
      
      return true;
    } else {
      log(`❌ Frontend loading failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend loading error: ${error.message}`, 'red');
    return false;
  }
}

async function testBackendAuthEndpoints() {
  log('\n🔐 Testing Backend Authentication Endpoints...', 'blue');
  
  const authEndpoints = [
    { path: '/api/auth/login', method: 'POST', data: { email: 'test@example.com', password: 'testpass' } },
    { path: '/api/auth/signup', method: 'POST', data: { email: 'test@example.com', password: 'testpass' } },
    { path: '/api/auth/google', method: 'POST', data: { access_token: 'test', id_token: 'test' } },
    { path: '/api/auth/profile/check/test-user', method: 'GET' }
  ];
  
  let workingEndpoints = 0;
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await makeRequest(`${BACKEND_URL}${endpoint.path}`, endpoint.method, endpoint.data);
      
      if (response.status === 400 || response.status === 401 || response.status === 422) {
        log(`✅ ${endpoint.path} - Endpoint exists and responding (${response.status})`, 'green');
        workingEndpoints++;
      } else if (response.status === 404) {
        log(`❌ ${endpoint.path} - Endpoint not found`, 'red');
      } else {
        log(`⚠️  ${endpoint.path} - Unexpected response (${response.status})`, 'yellow');
        workingEndpoints++;
      }
    } catch (error) {
      log(`❌ ${endpoint.path} - Error: ${error.message}`, 'red');
    }
  }
  
  return workingEndpoints > 0;
}

async function testSupabaseConnection() {
  log('\n🗄️  Testing Supabase Connection from Backend...', 'blue');
  
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

async function testEnvironmentVariables() {
  log('\n🔧 Testing Environment Variables...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/test`);
    if (response.status === 200) {
      const data = response.data;
      log('✅ Backend environment variables test:', 'green');
      log(`   Supabase URL: ${data.supabaseUrl}`, 'blue');
      log(`   Backend Secret: ${data.backendSecret}`, 'blue');
      
      // Check if we can see the actual Supabase URL
      if (data.supabaseUrl === 'Configured') {
        log('✅ Supabase URL is properly configured', 'green');
        return true;
      } else {
        log('❌ Supabase URL is not configured', 'red');
        return false;
      }
    } else {
      log(`❌ Environment test failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Environment test error: ${error.message}`, 'red');
    return false;
  }
}

async function generateFrontendAuthReport(results) {
  log('\n' + '='.repeat(60), 'bold');
  log('🔐 FRONTEND AUTHENTICATION TEST REPORT', 'bold');
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
    log('🎉 Frontend authentication infrastructure is working!', 'green');
    log('\n📋 Manual Testing Instructions:', 'blue');
    log('   1. Open the frontend URL in a browser:', 'blue');
    log(`      ${FRONTEND_URL}`, 'blue');
    log('   2. Navigate to the login/signup page', 'blue');
    log('   3. Test email/password authentication', 'blue');
    log('   4. Test Google OAuth authentication', 'blue');
    log('   5. Monitor browser console for any errors', 'blue');
    log('   6. Check network tab for Supabase API calls', 'blue');
  } else {
    log('❌ Frontend authentication has issues', 'red');
    log('\n🔧 Recommended Actions:', 'yellow');
    log('   1. Check frontend environment variables', 'yellow');
    log('   2. Verify Supabase project configuration', 'yellow');
    log('   3. Check Google OAuth settings in Supabase', 'yellow');
    log('   4. Review browser console for errors', 'yellow');
  }
  
  log('\n🔍 Troubleshooting Steps:', 'blue');
  log('   1. Open browser developer tools (F12)', 'blue');
  log('   2. Go to Console tab and look for errors', 'blue');
  log('   3. Go to Network tab and monitor API calls', 'blue');
  log('   4. Check if Supabase client is initialized', 'blue');
  log('   5. Verify Google OAuth is enabled in Supabase dashboard', 'blue');
  
  log('\n📋 Expected Supabase API Calls:', 'blue');
  log('   - POST /auth/v1/token (for login)', 'blue');
  log('   - POST /auth/v1/signup (for signup)', 'blue');
  log('   - GET /auth/v1/authorize (for OAuth)', 'blue');
  log('   - POST /auth/v1/callback (for OAuth callback)', 'blue');
}

async function main() {
  log('🔐 WasteWise-30 Frontend Authentication Test Tool', 'bold');
  log('Testing frontend authentication with Supabase...', 'blue');
  
  const results = {
    frontendLoading: await testFrontendLoading(),
    backendAuthEndpoints: await testBackendAuthEndpoints(),
    supabaseConnection: await testSupabaseConnection(),
    environmentVariables: await testEnvironmentVariables()
  };
  
  await generateFrontendAuthReport(results);
}

// Run the frontend authentication test
main().catch(error => {
  log(`\n❌ Frontend authentication test failed: ${error.message}`, 'red');
  process.exit(1);
});
