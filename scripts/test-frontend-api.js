#!/usr/bin/env node

const https = require('https');

const BACKEND_URL = 'https://wastewise-backend-451983642521.asia-southeast1.run.app';
const FRONTEND_URL = 'https://wastewise-frontend-451983642521.asia-southeast1.run.app';

console.log('🌐 Testing Frontend API Integration');
console.log('===================================\n');

// Test 1: Check if frontend can access backend API
async function testFrontendAPIAccess() {
  console.log('1️⃣ Testing Frontend API Access...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'wastewise-backend-451983642521.asia-southeast1.run.app',
      port: 443,
      path: '/health',
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Referer': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`   ✅ API call successful: ${res.statusCode}`);
          console.log(`   📄 Response: ${JSON.stringify(response, null, 2)}`);
          console.log(`   🌐 CORS Headers:`);
          console.log(`      - Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
          console.log(`      - Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'Not set'}`);
          console.log(`      - Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`);
          resolve(true);
        } catch (error) {
          console.log(`   ❌ Failed to parse response: ${error.message}`);
          console.log(`   📄 Raw response: ${data}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ API call failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('   ⏰ API call timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test 2: Test with different HTTP methods
async function testHTTPMethods() {
  console.log('\n2️⃣ Testing Different HTTP Methods...');
  
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  const results = [];
  
  for (const method of methods) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'wastewise-backend-451983642521.asia-southeast1.run.app',
        port: 443,
        path: '/health',
        method: method,
        headers: {
          'Origin': FRONTEND_URL,
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        console.log(`   ${method}: ${res.statusCode} ${res.statusMessage}`);
        results.push(res.statusCode < 500);
        resolve();
      });
      
      req.on('error', (error) => {
        console.log(`   ${method}: ❌ ${error.message}`);
        results.push(false);
        resolve();
      });
      
      req.setTimeout(5000, () => {
        console.log(`   ${method}: ⏰ Timeout`);
        req.destroy();
        results.push(false);
        resolve();
      });
      
      req.end();
    });
  }
  
  const successCount = results.filter(r => r).length;
  console.log(`   📊 Success rate: ${successCount}/${methods.length} methods`);
  
  return successCount === methods.length;
}

// Test 3: Test CORS preflight
async function testCORSPreflight() {
  console.log('\n3️⃣ Testing CORS Preflight...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'wastewise-backend-451983642521.asia-southeast1.run.app',
      port: 443,
      path: '/health',
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`   ✅ Preflight response: ${res.statusCode}`);
      console.log(`   🌐 CORS Headers:`);
      console.log(`      - Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`      - Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`      - Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not set'}`);
      console.log(`      - Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'Not set'}`);
      console.log(`      - Max-Age: ${res.headers['access-control-max-age'] || 'Not set'}`);
      
      const isCORSValid = res.statusCode === 204 || res.statusCode === 200;
      resolve(isCORSValid);
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Preflight failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('   ⏰ Preflight timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test 4: Test with credentials
async function testWithCredentials() {
  console.log('\n4️⃣ Testing with Credentials...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'wastewise-backend-451983642521.asia-southeast1.run.app',
      port: 443,
      path: '/health',
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Authorization': 'Bearer test-token',
        'Cookie': 'session=test-session',
        'User-Agent': 'WasteWise-Frontend/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Request with credentials: ${res.statusCode}`);
        console.log(`   📄 Response length: ${data.length} bytes`);
        console.log(`   🔐 Credentials allowed: ${res.headers['access-control-allow-credentials'] === 'true'}`);
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Credentials test failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('   ⏰ Credentials test timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Main test function
async function runAllTests() {
  const results = [];
  
  results.push(await testFrontendAPIAccess());
  results.push(await testHTTPMethods());
  results.push(await testCORSPreflight());
  results.push(await testWithCredentials());
  
  console.log('\n📊 Frontend API Integration Test Results');
  console.log('========================================');
  console.log(`✅ Passed: ${results.filter(r => r).length}/${results.length}`);
  console.log(`❌ Failed: ${results.filter(r => !r).length}/${results.length}`);
  
  if (results.every(r => r)) {
    console.log('\n🎉 All frontend API integration tests passed!');
    console.log('   The frontend should be able to communicate with the backend successfully.');
  } else {
    console.log('\n⚠️  Some frontend API integration tests failed.');
    console.log('   There might be CORS or network connectivity issues.');
  }
  
  console.log('\n🔗 Test URLs:');
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`   Backend API: ${BACKEND_URL}/health`);
  console.log(`   Demo Login: ${FRONTEND_URL} (demo@wastewise.com / demo123)`);
}

// Run the tests
runAllTests().catch(console.error);

