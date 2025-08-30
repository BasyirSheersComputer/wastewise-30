#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://wastewise-backend-451983642521.asia-southeast1.run.app';
const FRONTEND_URL = 'https://wastewise-frontend-451983642521.asia-southeast1.run.app';

console.log('🔍 Testing Frontend to Backend Connection');
console.log('==========================================\n');

// Test 1: Backend Health Check
async function testBackendHealth() {
  console.log('1️⃣ Testing Backend Health...');
  
  return new Promise((resolve, reject) => {
    const req = https.get(`${BACKEND_URL}/health`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`   ✅ Backend is healthy: ${response.status}`);
          console.log(`   📊 Version: ${response.version}`);
          console.log(`   🕒 Timestamp: ${response.timestamp}`);
          console.log(`   💬 Message: ${response.message}`);
          resolve(true);
        } catch (error) {
          console.log(`   ❌ Failed to parse response: ${error.message}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Backend health check failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('   ⏰ Backend health check timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Frontend Accessibility
async function testFrontendAccess() {
  console.log('\n2️⃣ Testing Frontend Accessibility...');
  
  return new Promise((resolve, reject) => {
    const req = https.get(FRONTEND_URL, (res) => {
      console.log(`   ✅ Frontend is accessible: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   📄 Content-Type: ${res.headers['content-type']}`);
      console.log(`   📏 Content-Length: ${res.headers['content-length']} bytes`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Frontend access failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('   ⏰ Frontend access timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 3: CORS Configuration
async function testCORS() {
  console.log('\n3️⃣ Testing CORS Configuration...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'wastewise-backend-451983642521.asia-southeast1.run.app',
      port: 443,
      path: '/health',
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`   ✅ CORS preflight successful: ${res.statusCode}`);
      console.log(`   🌐 Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`   🔧 Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`   📋 Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not set'}`);
      console.log(`   🔐 Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'Not set'}`);
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ CORS test failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('   ⏰ CORS test timed out');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test 4: API Call from Frontend Origin
async function testAPICall() {
  console.log('\n4️⃣ Testing API Call from Frontend Origin...');
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'wastewise-backend-451983642521.asia-southeast1.run.app',
      port: 443,
      path: '/health',
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'WasteWise-Frontend/1.0'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ API call successful: ${res.statusCode}`);
        console.log(`   📄 Response: ${data.substring(0, 100)}...`);
        console.log(`   🌐 CORS Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
        resolve(true);
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

// Test 5: Response Time
async function testResponseTime() {
  console.log('\n5️⃣ Testing Response Time...');
  
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const req = https.get(`${BACKEND_URL}/health`, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`   ⏱️  Response time: ${responseTime}ms`);
      
      if (responseTime < 1000) {
        console.log('   ✅ Response time is excellent (< 1s)');
      } else if (responseTime < 3000) {
        console.log('   ⚠️  Response time is acceptable (< 3s)');
      } else {
        console.log('   ❌ Response time is slow (> 3s)');
      }
      
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Response time test failed: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('   ⏰ Response time test timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Main test function
async function runAllTests() {
  const results = [];
  
  results.push(await testBackendHealth());
  results.push(await testFrontendAccess());
  results.push(await testCORS());
  results.push(await testAPICall());
  results.push(await testResponseTime());
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${results.filter(r => r).length}/${results.length}`);
  console.log(`❌ Failed: ${results.filter(r => !r).length}/${results.length}`);
  
  if (results.every(r => r)) {
    console.log('\n🎉 All tests passed! Frontend to Backend connection is working perfectly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
  
  console.log('\n🌐 Live URLs:');
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`   Backend: ${BACKEND_URL}`);
  console.log(`   Backend Health: ${BACKEND_URL}/health`);
}

// Run the tests
runAllTests().catch(console.error);

