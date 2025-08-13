#!/usr/bin/env node

/**
 * Test Backend User Creation Script
 * This script tests the backend endpoints for user creation and profile creation
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function testBackendEndpoints() {
  console.log('🧪 Testing Backend User Creation Endpoints\n');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      body: null
    },
    {
      name: 'Debug Users',
      method: 'GET',
      endpoint: '/api/debug/users',
      body: null
    },
    {
      name: 'Create Profile (Manual)',
      method: 'POST',
      endpoint: '/api/auth/create-profile',
      body: {
        user: {
          id: 'test-user-' + Date.now(),
          email: `test-${Date.now()}@example.com`,
          user_metadata: {
            first_name: 'Test',
            last_name: 'User',
            company_name: 'Test Company',
            company_size: 'small',
            primary_pain: 'waste_reduction',
            phone_number: '+1234567890'
          }
        },
        isGoogleOAuth: false
      }
    },
    {
      name: 'Create Profile (Google OAuth)',
      method: 'POST',
      endpoint: '/api/auth/create-profile',
      body: {
        user: {
          id: 'test-google-user-' + Date.now(),
          email: `google-test-${Date.now()}@gmail.com`,
          user_metadata: {
            first_name: 'Google',
            last_name: 'User',
            full_name: 'Google Test User',
            organization: 'Google Company',
            company_size: 'medium',
            primary_pain: 'waste_reduction'
          }
        },
        isGoogleOAuth: true
      }
    },
    {
      name: 'Google OAuth Callback',
      method: 'POST',
      endpoint: '/api/auth/google/callback',
      body: {
        user: {
          id: 'test-callback-user-' + Date.now(),
          email: `callback-test-${Date.now()}@gmail.com`,
          user_metadata: {
            first_name: 'Callback',
            last_name: 'User',
            full_name: 'Callback Test User',
            organization: 'Callback Company'
          }
        },
        isNewUser: true
      }
    },
    {
      name: 'Debug Create Profile',
      method: 'POST',
      endpoint: '/api/debug/create-profile',
      body: {
        userId: 'debug-test-user-' + Date.now(),
        userData: {
          email: `debug-test-${Date.now()}@example.com`,
          first_name: 'Debug',
          last_name: 'User',
          company_name: 'Debug Company',
          company_size: 'large',
          primary_pain: 'waste_reduction'
        }
      }
    }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`);
    console.log(`   Endpoint: ${test.method} ${test.endpoint}`);
    
    try {
      const response = await fetch(`${BACKEND_URL}${test.endpoint}`, {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: test.body ? JSON.stringify(test.body) : undefined
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ PASSED (${response.status})`);
        if (test.name === 'Debug Users') {
          console.log(`   📊 Auth Users: ${data.auth_users_count}`);
          console.log(`   📊 Profiles: ${data.profiles_count}`);
        }
        passedTests++;
      } else {
        console.log(`   ❌ FAILED (${response.status}): ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('📊 Test Summary:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend logs for details.');
  }
}

async function testUserRegistration() {
  console.log('\n🔐 Testing User Registration Flow\n');

  try {
    // Test user registration
    const registrationData = {
      email: `reg-test-${Date.now()}@example.com`,
      password: 'testpassword123',
      first_name: 'Registration',
      last_name: 'User',
      company_name: 'Registration Company',
      company_size: 'small',
      primary_pain: 'waste_reduction',
      phone_number: '+1234567890'
    };

    console.log('📝 Testing user registration...');
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Registration successful');
      console.log(`   👤 User ID: ${data.user?.id}`);
      console.log(`   📅 Trial End: ${data.trialEnd}`);
    } else {
      console.log(`   ❌ Registration failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Registration error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting Backend User Creation Tests\n');
  
  await testBackendEndpoints();
  await testUserRegistration();
  
  console.log('\n✅ Testing complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Check the backend logs for detailed information');
  console.log('2. Verify that user profiles are created in Supabase');
  console.log('3. Test the frontend integration');
  console.log('4. Monitor the /api/debug/users endpoint for real-time data');
}

main().catch(console.error);

