const https = require('https');

console.log('🔧 Fixing OAuth Redirect URLs for WasteWise-30\n');

// Supabase configuration
const supabaseUrl = 'https://fbdqrqknqphcyxbmnuaf.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ3OTA0OCwiZXhwIjoyMDY4MDU1MDQ4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // This needs to be the actual service role key

const liveFrontendUrl = 'https://wastewise-frontend-451983642521.asia-southeast1.run.app';

async function fixOAuthRedirects() {
  console.log('📋 Current Issue:');
  console.log('OAuth is redirecting to localhost:5173 instead of the live frontend URL');
  console.log('Live frontend URL:', liveFrontendUrl);
  console.log('');

  console.log('🔧 Solution:');
  console.log('1. Update Supabase OAuth configuration');
  console.log('2. Add the live frontend URL to allowed redirect URLs');
  console.log('3. Remove localhost redirects for production');
  console.log('');

  console.log('📋 Manual Steps Required:');
  console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf');
  console.log('2. Navigate to Authentication > URL Configuration');
  console.log('3. Update the following settings:');
  console.log('');
  console.log('   Site URL:');
  console.log(`   Change from: http://localhost:5173`);
  console.log(`   Change to: ${liveFrontendUrl}`);
  console.log('');
  console.log('   Redirect URLs:');
  console.log(`   Add: ${liveFrontendUrl}/auth/callback`);
  console.log(`   Add: ${liveFrontendUrl}/dashboard`);
  console.log(`   Add: ${liveFrontendUrl}/onboarding`);
  console.log('');
  console.log('   Remove or comment out:');
  console.log('   - http://localhost:5173/auth/callback');
  console.log('   - http://localhost:5173/dashboard');
  console.log('   - http://localhost:5173/onboarding');
  console.log('');

  console.log('🔐 Google OAuth Configuration:');
  console.log('1. Go to Authentication > Providers > Google');
  console.log('2. Verify the following settings:');
  console.log('   - Client ID: 796882913643-ffu2ag94s1iou5d69tunadrjck2lhqem.apps.googleusercontent.com');
  console.log('   - Redirect URL: https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback');
  console.log('3. Add the live frontend URL to Google OAuth console if needed');
  console.log('');

  console.log('🌐 Google OAuth Console Steps:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Find the OAuth 2.0 Client ID: 796882913643-ffu2ag94s1iou5d69tunadrjck2lhqem.apps.googleusercontent.com');
  console.log('3. Add to Authorized redirect URIs:');
  console.log('   - https://fbdqrqknqphcyxbmnuaf.supabase.co/auth/v1/callback');
  console.log('4. Add to Authorized JavaScript origins:');
  console.log(`   - ${liveFrontendUrl}`);
  console.log('');

  console.log('✅ After making these changes:');
  console.log('1. Test the OAuth flow again');
  console.log('2. Verify redirects go to the live frontend URL');
  console.log('3. Check that user sessions are created properly');
  console.log('');

  console.log('📞 If you need help with the Supabase dashboard:');
  console.log('1. Go to: https://supabase.com/dashboard/project/fbdqrqknqphcyxbmnuaf');
  console.log('2. Navigate to Authentication > URL Configuration');
  console.log('3. Update the Site URL and Redirect URLs as shown above');
  console.log('4. Save the changes');
  console.log('5. Test the OAuth flow again');
}

// Test current OAuth configuration
async function testCurrentOAuthConfig() {
  console.log('🔍 Testing Current OAuth Configuration...');
  
  try {
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent('https://wastewise-frontend-451983642521.asia-southeast1.run.app/dashboard')}`;
    const response = await makeRequest(authUrl, 'GET', null, {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHFycWtucXBoY3l4Ym1udWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0NzkwNDgsImV4cCI6MjA2ODA1NTA0OH0.ywEEaFhppnloTSLmAMxJby0bOIzCyxkT_exH6k2qxWI'
    });
    
    console.log(`✅ OAuth authorization endpoint: ${response.statusCode}`);
    
    if (response.statusCode === 302 || response.statusCode === 301) {
      const redirectLocation = response.headers.location;
      console.log(`📍 Current redirect location: ${redirectLocation}`);
      
      if (redirectLocation && redirectLocation.includes('localhost:5173')) {
        console.log('❌ ISSUE CONFIRMED: OAuth is redirecting to localhost:5173');
        console.log('🔧 This needs to be fixed in the Supabase dashboard');
      } else if (redirectLocation && redirectLocation.includes('accounts.google.com')) {
        console.log('✅ OAuth is redirecting to Google correctly');
        console.log('⚠️ But the final redirect after Google OAuth may still go to localhost');
      }
    }
    
  } catch (error) {
    console.log(`❌ OAuth test failed: ${error.message}`);
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
        'User-Agent': 'WasteWise-30-OAuth-Fix/1.0',
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

async function runFix() {
  await testCurrentOAuthConfig();
  console.log('\n' + '='.repeat(60));
  fixOAuthRedirects();
}

runFix();
