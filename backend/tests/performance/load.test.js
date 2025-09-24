import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Rate('api_response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 20 },   // Ramp up to 20 users
    { duration: '5m', target: 20 },   // Stay at 20 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate
    api_response_time: ['rate<0.1']    // Custom API response time rate
  },
};

// Base URL for the API
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Test data
const testUsers = [
  {
    email: 'test1@example.com',
    password: 'password123',
    company_name: 'Test Company 1'
  },
  {
    email: 'test2@example.com',
    password: 'password123',
    company_name: 'Test Company 2'
  }
];

// Global variables
let authTokens = [];

export function setup() {
  console.log('Setting up performance test...');
  
  // Pre-authenticate test users
  for (const user of testUsers) {
    try {
      const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
        email: user.email,
        password: user.password
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        authTokens.push(data.session.access_token);
      }
    } catch (error) {
      console.log(`Failed to authenticate user ${user.email}: ${error.message}`);
    }
  }
  
  return { authTokens };
}

export default function(data) {
  const token = data.authTokens[Math.floor(Math.random() * data.authTokens.length)];
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test health endpoint
  testHealthEndpoint();
  
  // Test inventory endpoints
  testInventoryEndpoints(headers);
  
  // Test waste tracking endpoints
  testWasteTrackingEndpoints(headers);
  
  // Test AI recommendations
  testAIRecommendations(headers);
  
  // Test analytics endpoints
  testAnalyticsEndpoints(headers);
  
  // Random sleep between requests
  sleep(Math.random() * 2);
}

function testHealthEndpoint() {
  const response = http.get(`${BASE_URL}/health`);
  
  const success = check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
    'health check returns healthy status': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'healthy';
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 1000);
}

function testInventoryEndpoints(headers) {
  // Test GET /api/inventory
  let response = http.get(`${BASE_URL}/api/inventory`, { headers });
  
  let success = check(response, {
    'inventory list status is 200': (r) => r.status === 200,
    'inventory list response time < 2s': (r) => r.timings.duration < 2000,
    'inventory list returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 2000);
  
  // Test POST /api/inventory (create new item)
  const newItem = {
    item_name: `Test Item ${Math.random()}`,
    category: 'Test Category',
    unit: 'kg',
    current_stock: Math.floor(Math.random() * 100),
    min_stock: 10,
    max_stock: 100,
    cost_per_unit: Math.random() * 50
  };
  
  response = http.post(`${BASE_URL}/api/inventory`, JSON.stringify(newItem), { headers });
  
  success = check(response, {
    'inventory create status is 201': (r) => r.status === 201,
    'inventory create response time < 2s': (r) => r.timings.duration < 2000,
    'inventory create returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data.item_name === newItem.item_name;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 2000);
  
  // Test GET /api/inventory/analytics
  response = http.get(`${BASE_URL}/api/inventory/analytics`, { headers });
  
  success = check(response, {
    'inventory analytics status is 200': (r) => r.status === 200,
    'inventory analytics response time < 3s': (r) => r.timings.duration < 3000,
    'inventory analytics returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data.totalItems !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 3000);
}

function testWasteTrackingEndpoints(headers) {
  // Test GET /api/waste
  let response = http.get(`${BASE_URL}/api/waste`, { headers });
  
  let success = check(response, {
    'waste list status is 200': (r) => r.status === 200,
    'waste list response time < 2s': (r) => r.timings.duration < 2000,
    'waste list returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 2000);
  
  // Test POST /api/waste (create new waste log)
  const newWasteLog = {
    date: new Date().toISOString().split('T')[0],
    waste_type: 'Food Waste',
    quantity: Math.random() * 10,
    unit: 'kg',
    cost: Math.random() * 50,
    reason: 'Test waste entry'
  };
  
  response = http.post(`${BASE_URL}/api/waste`, JSON.stringify(newWasteLog), { headers });
  
  success = check(response, {
    'waste create status is 201': (r) => r.status === 201,
    'waste create response time < 2s': (r) => r.timings.duration < 2000,
    'waste create returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data.waste_type === newWasteLog.waste_type;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 2000);
  
  // Test GET /api/waste/analytics
  response = http.get(`${BASE_URL}/api/waste/analytics`, { headers });
  
  success = check(response, {
    'waste analytics status is 200': (r) => r.status === 200,
    'waste analytics response time < 3s': (r) => r.timings.duration < 3000,
    'waste analytics returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data.summary !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 3000);
}

function testAIRecommendations(headers) {
  // Test GET /api/ai/recommendations
  let response = http.get(`${BASE_URL}/api/ai/recommendations?section=dashboard`, { headers });
  
  let success = check(response, {
    'AI recommendations status is 200': (r) => r.status === 200,
    'AI recommendations response time < 5s': (r) => r.timings.duration < 5000,
    'AI recommendations returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 5000);
  
  // Test POST /api/ai/chat
  const chatMessage = {
    message: 'How can I reduce food waste in my restaurant?',
    context: 'general'
  };
  
  response = http.post(`${BASE_URL}/api/ai/chat`, JSON.stringify(chatMessage), { headers });
  
  success = check(response, {
    'AI chat status is 200': (r) => r.status === 200,
    'AI chat response time < 10s': (r) => r.timings.duration < 10000,
    'AI chat returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true && body.data.response !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 10000);
}

function testAnalyticsEndpoints(headers) {
  // Test GET /api/dashboard/overview
  let response = http.get(`${BASE_URL}/api/dashboard/overview`, { headers });
  
  let success = check(response, {
    'dashboard overview status is 200': (r) => r.status === 200,
    'dashboard overview response time < 3s': (r) => r.timings.duration < 3000,
    'dashboard overview returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.analytics !== undefined && body.recommendations !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 3000);
  
  // Test GET /api/dashboard/kpis
  response = http.get(`${BASE_URL}/api/dashboard/kpis`, { headers });
  
  success = check(response, {
    'dashboard KPIs status is 200': (r) => r.status === 200,
    'dashboard KPIs response time < 2s': (r) => r.timings.duration < 2000,
    'dashboard KPIs returns valid data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.kpis !== undefined;
      } catch (e) {
        return false;
      }
    }
  });
  
  errorRate.add(!success);
  apiResponseTime.add(response.timings.duration > 2000);
}

export function teardown(data) {
  console.log('Performance test completed');
  console.log(`Tested with ${data.authTokens.length} authenticated users`);
}
