// Test script to check API endpoint responses
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          resolve({ error: 'Invalid JSON', raw: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPIEndpoints() {
  console.log('🔍 Testing API Endpoints for Dynamic Responses...\n');
  
  try {
    // Test health endpoint first
    console.log('🏥 Testing health endpoint...');
    const health = await makeRequest('/health');
    console.log('Health status:', health.status);
    
    // Test recommendations endpoint multiple times
    const endpoints = [
      '/api/recommendations?section=dashboard',
      '/api/recommendations?section=waste',
      '/api/recommendations?section=inventory'
    ];
    
    for (let i = 0; i < 3; i++) {
      console.log(`\n🔄 Test Run ${i + 1}:`);
      
      for (const endpoint of endpoints) {
        console.log(`\n📊 Testing: ${endpoint}`);
        
        const startTime = Date.now();
        const result = await makeRequest(endpoint);
        const duration = Date.now() - startTime;
        
        console.log(`⏱️  Response time: ${duration}ms`);
        
        if (result.recommendations) {
          console.log(`📝 Response length: ${result.recommendations.length} characters`);
          
          // Show first 150 characters
          const preview = result.recommendations.substring(0, 150);
          console.log(`📄 Preview: ${preview}...`);
          
          // Check for dynamic indicators
          const hasTimestamp = result.timestamp;
          const hasProvider = result.provider;
          const isDefault = result.recommendations.includes('default') || 
                           result.recommendations.includes('temporarily unavailable');
          
          console.log(`🕒 Has timestamp: ${hasTimestamp ? 'Yes' : 'No'}`);
          console.log(`🤖 Provider: ${hasProvider || 'None'}`);
          console.log(`⚠️  Is default response: ${isDefault ? 'Yes' : 'No'}`);
          
          if (!isDefault) {
            console.log('✅ Response appears dynamic');
          } else {
            console.log('❌ Response appears static/default');
          }
        } else {
          console.log('❌ No recommendations in response');
        }
        
        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error.message);
  }
}

// Run the test
testAPIEndpoints();

