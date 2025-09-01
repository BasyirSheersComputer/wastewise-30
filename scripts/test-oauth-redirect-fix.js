const https = require('https');

console.log('🔍 Testing OAuth Redirect Fix\n');

async function testOAuthRedirect() {
  const supabaseUrl = 'https://fbdqrqknqphcyxbmnuaf.supabase.co';
  const liveFrontendUrl = 'https://wastewise-frontend-451983642521.asia-southeast1.run.app';
  
  try {
    // Test OAuth authorization with live frontend redirect
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${liveFrontendUrl}/dashboard`)}`;
    
    console.log('🔗 Testing OAuth redirect to live frontend...');
    console.log(`Auth URL: ${authUrl}`);
    
    const response = await makeRequest(authUrl, 'GET', null, {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI'
    });
    
    console.log(`✅ OAuth endpoint response: ${response.statusCode}`);
    
    if (response.statusCode === 302 || response.statusCode === 301) {
      const redirectLocation = response.headers.location;
      console.log(`📍 Redirect location: ${redirectLocation}`);
      
      // Check if the redirect contains localhost
      if (redirectLocation && redirectLocation.includes('localhost:5173')) {
        console.log('❌ ISSUE STILL EXISTS: OAuth redirecting to localhost:5173');
        console.log('🔧 You need to update Supabase configuration');
        console.log('');
        console.log('📋 Required Action:');
        console.log('1. Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf');
        console.log('2. Navigate to: Authentication > URL Configuration');
        console.log('3. Change Site URL from localhost:5173 to the live frontend URL');
        console.log('4. Update Redirect URLs to include the live frontend URL');
      } else if (redirectLocation && redirectLocation.includes('accounts.google.com')) {
        console.log('✅ OAuth is redirecting to Google correctly');
        console.log('⚠️ Check if the final redirect after Google OAuth goes to localhost');
      }
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

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

testOAuthRedirect();
