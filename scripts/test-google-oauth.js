const https = require('https');

console.log('🔐 Testing Google OAuth Configuration for WasteWise-30\n');

// Test 1: Check if Supabase OAuth endpoints are accessible
async function testSupabaseOAuthEndpoints() {
  console.log('🌐 Testing Supabase OAuth Endpoints...');
  
  const supabaseUrl = 'https://fbdqrqknqphcyxbmnuaf.supabase.co';
  const endpoints = [
    '/auth/v1/authorize',
    '/auth/v1/token',
    '/auth/v1/user'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${supabaseUrl}${endpoint}`, 'GET');
      console.log(`✅ ${endpoint} - ${response.statusCode}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.message}`);
    }
  }
}

// Test 2: Check frontend environment variables
async function testFrontendEnvironment() {
  console.log('\n🔧 Testing Frontend Environment Variables...');
  
  try {
    const response = await makeRequest('https://wastewise-frontend-451983642521.asia-southeast1.run.app/', 'GET');
    console.log(`✅ Frontend is accessible (${response.statusCode})`);
    
    // Check if the HTML contains Supabase configuration
    const html = response.data;
    if (html.includes('VITE_SUPABASE_URL')) {
      console.log('✅ Frontend HTML contains Supabase configuration');
    } else {
      console.log('⚠️ Frontend HTML does not contain Supabase configuration');
    }
    
    if (html.includes('google')) {
      console.log('✅ Frontend HTML contains Google OAuth references');
    } else {
      console.log('⚠️ Frontend HTML does not contain Google OAuth references');
    }
  } catch (error) {
    console.log(`❌ Frontend test failed: ${error.message}`);
  }
}

// Test 3: Check backend OAuth endpoints
async function testBackendOAuthEndpoints() {
  console.log('\n🔐 Testing Backend OAuth Endpoints...');
  
  const backendUrl = 'https://wastewise-backend-451983642521.asia-southeast1.run.app';
  const endpoints = [
    '/api/auth/google',
    '/api/auth/google/callback'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${backendUrl}${endpoint}`, 'POST', JSON.stringify({
        access_token: 'test',
        id_token: 'test'
      }));
      console.log(`✅ ${endpoint} - ${response.statusCode} (expected 400 for invalid tokens)`);
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.message}`);
    }
  }
}

// Test 4: Check Supabase project configuration
async function testSupabaseConfiguration() {
  console.log('\n🗄️ Testing Supabase Project Configuration...');
  
  const supabaseUrl = 'https://fbdqrqknqphcyxbmnuaf.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI';
  
  try {
    const response = await makeRequest(`${supabaseUrl}/rest/v1/`, 'GET', null, {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    });
    console.log(`✅ Supabase REST API accessible (${response.statusCode})`);
  } catch (error) {
    console.log(`❌ Supabase REST API test failed: ${error.message}`);
  }
}

// Test 5: Simulate OAuth flow
async function testOAuthFlow() {
  console.log('\n🔄 Testing OAuth Flow Simulation...');
  
  const supabaseUrl = 'https://fbdqrqknqphcyxbmnuaf.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI';
  
  try {
    // Test OAuth authorization URL generation
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('https://wastewise-frontend-451983642521.asia-southeast1.run.app/dashboard')}`;
    console.log(`🔗 OAuth Authorization URL: ${authUrl}`);
    
    // Test if the URL is accessible (should redirect to Google)
    const response = await makeRequest(authUrl, 'GET', null, {
      'apikey': anonKey
    });
    console.log(`✅ OAuth authorization endpoint accessible (${response.statusCode})`);
    
    if (response.statusCode === 302 || response.statusCode === 301) {
      console.log('✅ OAuth flow is properly configured (redirecting to Google)');
    } else {
      console.log('⚠️ OAuth flow may not be properly configured');
    }
  } catch (error) {
    console.log(`❌ OAuth flow test failed: ${error.message}`);
  }
}

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'WasteWise-30-OAuth-Test/1.0',
        ...headers
      }
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  try {
    await testSupabaseOAuthEndpoints();
    await testFrontendEnvironment();
    await testBackendOAuthEndpoints();
    await testSupabaseConfiguration();
    await testOAuthFlow();
    
    console.log('\n============================================================');
    console.log('🔐 GOOGLE OAUTH CONFIGURATION TEST REPORT');
    console.log('============================================================');
    console.log('📋 Next Steps:');
    console.log('1. Check if Google OAuth is enabled in Supabase dashboard');
    console.log('2. Verify OAuth redirect URLs are configured correctly');
    console.log('3. Test OAuth flow manually in browser');
    console.log('4. Check browser console for any JavaScript errors');
    console.log('============================================================');
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
}

runAllTests();
