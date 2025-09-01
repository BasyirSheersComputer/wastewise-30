const https = require('https');

console.log('🔍 Testing Frontend Runtime Environment\n');

async function testFrontendRuntime() {
  try {
    // Get the frontend HTML
    const response = await makeRequest('https://wastewise-frontend-451983642521.asia-southeast1.run.app/', 'GET');
    const html = response.data;
    
    console.log('📄 Frontend HTML Analysis:');
    console.log(`✅ HTML length: ${html.length} characters`);
    
    // Check for environment variable patterns
    const envPatterns = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'fbdqrqknqphcyxbmnuaf.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    ];
    
    envPatterns.forEach(pattern => {
      if (html.includes(pattern)) {
        console.log(`✅ Found: ${pattern}`);
      } else {
        console.log(`❌ Missing: ${pattern}`);
      }
    });
    
    // Check for runtime environment injection
    if (html.includes('window.__ENV__')) {
      console.log('\n✅ Found runtime environment injection script');
    } else {
      console.log('\n❌ Missing runtime environment injection script');
    }
    
    if (html.includes('Runtime environment variables injected')) {
      console.log('✅ Found runtime environment variables injection');
    } else {
      console.log('❌ Missing runtime environment variables injection');
    }
    
    // Check for JavaScript files
    const jsFiles = html.match(/src="([^"]*\.js)"/g);
    if (jsFiles) {
      console.log(`\n📦 Found ${jsFiles.length} JavaScript files:`);
      jsFiles.forEach(file => {
        console.log(`   ${file}`);
      });
    }
    
    // Check for specific script content
    if (html.includes('mockSupabase')) {
      console.log('\n⚠️ WARNING: Frontend contains mock Supabase client!');
    }
    
    if (html.includes('createClient')) {
      console.log('\n✅ Frontend contains Supabase client creation code');
    }
    
    // Check for Google OAuth references
    if (html.includes('signInWithOAuth')) {
      console.log('\n✅ Frontend contains OAuth sign-in code');
    }
    
    if (html.includes('google')) {
      console.log('\n✅ Frontend contains Google OAuth references');
    }
    
    console.log('\n🔍 Detailed Analysis:');
    console.log('1. Environment variables should be embedded in the JavaScript bundle');
    console.log('2. Check if the build process is correctly injecting environment variables');
    console.log('3. Verify that the frontend is not using the mock client');
    console.log('4. Runtime environment variables should be injected via window.__ENV__');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
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
        'User-Agent': 'WasteWise-30-Frontend-Test/1.0',
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

testFrontendRuntime();
