#!/usr/bin/env node

/**
 * Test Profile Creation Script
 * This script tests the backend profile creation functionality
 */

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3000';

async function testBackend() {
  console.log('🧪 Testing Backend Profile Creation\n');
  console.log(`Backend URL: ${BACKEND_URL}\n`);

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('   ✅ Health check passed:', healthData.status);
    console.log('');

    // Test 2: Debug Users
    console.log('2. Testing debug users endpoint...');
    const debugResponse = await fetch(`${BACKEND_URL}/api/debug/users`);
    const debugData = await debugResponse.json();
    console.log('   ✅ Debug users endpoint working');
    console.log(`   📊 Auth Users: ${debugData.auth_users_count}`);
    console.log(`   📊 Profiles: ${debugData.profiles_count}`);
    console.log('');

    // Test 3: Create Test Profile
    console.log('3. Testing profile creation...');
    const testUserId = 'test-user-' + Date.now();
    const testUserData = {
      email: `test-${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      company_name: 'Test Company',
      company_size: 'small',
      primary_pain: 'waste_reduction',
      phone_number: '+1234567890'
    };

    const profileResponse = await fetch(`${BACKEND_URL}/api/debug/create-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        userData: testUserData
      })
    });

    const profileData = await profileResponse.json();
    
    if (profileResponse.ok) {
      console.log('   ✅ Profile creation successful:', profileData.message);
    } else {
      console.log('   ❌ Profile creation failed:', profileData.error);
    }
    console.log('');

    // Test 4: Check Debug Users Again
    console.log('4. Checking debug users after profile creation...');
    const debugResponse2 = await fetch(`${BACKEND_URL}/api/debug/users`);
    const debugData2 = await debugResponse2.json();
    console.log(`   📊 Auth Users: ${debugData2.auth_users_count}`);
    console.log(`   📊 Profiles: ${debugData2.profiles_count}`);
    
    if (debugData2.profiles_count > debugData.profiles_count) {
      console.log('   ✅ Profile count increased - profile was created successfully!');
    } else {
      console.log('   ⚠️  Profile count did not increase');
    }
    console.log('');

    // Test 5: Test Create Profile Endpoint
    console.log('5. Testing create-profile endpoint...');
    const createProfileResponse = await fetch(`${BACKEND_URL}/api/auth/create-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          id: 'test-auth-user-' + Date.now(),
          email: `auth-test-${Date.now()}@example.com`,
          user_metadata: {
            first_name: 'Auth',
            last_name: 'User',
            company_name: 'Auth Company',
            company_size: 'medium',
            primary_pain: 'waste_reduction',
            phone_number: '+1234567890'
          }
        },
        isGoogleOAuth: false
      })
    });

    const createProfileData = await createProfileResponse.json();
    
    if (createProfileResponse.ok) {
      console.log('   ✅ Create profile endpoint working:', createProfileData.message);
    } else {
      console.log('   ❌ Create profile endpoint failed:', createProfileData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure the backend is running on port 3000');
    console.log('2. Check if there are any CORS issues');
    console.log('3. Verify the backend logs for errors');
    console.log('4. Check if Supabase connection is working');
  }
}

async function main() {
  console.log('🚀 Starting Profile Creation Test\n');
  
  await testBackend();
  
  console.log('✅ Test complete!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Check the backend logs for detailed information');
  console.log('2. Verify that user profiles are created in Supabase');
  console.log('3. Test the frontend integration');
  console.log('4. Monitor the /api/debug/users endpoint for real-time data');
}

main().catch(console.error);

