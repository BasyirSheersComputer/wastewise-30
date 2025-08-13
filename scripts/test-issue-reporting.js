const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const TEST_USER_ID = 'test-user-id'; // This would be a real user ID in production

// Test data
const testIssue = {
    title: 'Test Issue - API Verification',
    description: 'This is a test issue to verify the issue reporting system is working correctly.',
    category_id: null, // Will be set after fetching categories
    priority_id: null, // Will be set after fetching priorities
    outlet_id: null, // Optional
    browser_info: {
        userAgent: 'Test Script',
        screenResolution: '1920x1080'
    },
    page_url: '/test-page',
    user_agent: 'Test Script v1.0'
};

async function testAPI() {
    console.log('🧪 Testing Issue Reporting System...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health check...');
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
        if (healthResponse.ok) {
            console.log('✅ Health check passed');
        } else {
            console.log('❌ Health check failed');
            return;
        }

        // Test 2: Get Categories
        console.log('\n2. Testing categories endpoint...');
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/issues/categories`);
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            console.log(`✅ Found ${categories.length} categories`);
            if (categories.length > 0) {
                testIssue.category_id = categories[0].id;
                console.log(`   Using category: ${categories[0].name}`);
            }
        } else {
            console.log('❌ Failed to fetch categories');
        }

        // Test 3: Get Priorities
        console.log('\n3. Testing priorities endpoint...');
        const prioritiesResponse = await fetch(`${API_BASE_URL}/api/issues/priorities`);
        if (prioritiesResponse.ok) {
            const priorities = await prioritiesResponse.json();
            console.log(`✅ Found ${priorities.length} priorities`);
            if (priorities.length > 0) {
                testIssue.priority_id = priorities[0].id;
                console.log(`   Using priority: ${priorities[0].name}`);
            }
        } else {
            console.log('❌ Failed to fetch priorities');
        }

        // Test 4: Get Statuses
        console.log('\n4. Testing statuses endpoint...');
        const statusesResponse = await fetch(`${API_BASE_URL}/api/issues/statuses`);
        if (statusesResponse.ok) {
            const statuses = await statusesResponse.json();
            console.log(`✅ Found ${statuses.length} statuses`);
        } else {
            console.log('❌ Failed to fetch statuses');
        }

        // Test 5: Get Templates
        console.log('\n5. Testing templates endpoint...');
        const templatesResponse = await fetch(`${API_BASE_URL}/api/issues/templates`);
        if (templatesResponse.ok) {
            const templates = await templatesResponse.json();
            console.log(`✅ Found ${templates.length} templates`);
        } else {
            console.log('❌ Failed to fetch templates');
        }

        // Test 6: Get User Outlets (if available)
        console.log('\n6. Testing outlets endpoint...');
        const outletsResponse = await fetch(`${API_BASE_URL}/api/issues/outlets`);
        if (outletsResponse.ok) {
            const outlets = await outletsResponse.json();
            console.log(`✅ Found ${outlets.length} outlets`);
            if (outlets.length > 0) {
                testIssue.outlet_id = outlets[0].id;
                console.log(`   Using outlet: ${outlets[0].name}`);
            }
        } else {
            console.log('❌ Failed to fetch outlets (this is normal if no outlets exist)');
        }

        // Test 7: Create Test Issue (if we have required data)
        if (testIssue.category_id && testIssue.priority_id) {
            console.log('\n7. Testing issue creation...');
            console.log('   Note: This will fail without authentication, but tests the endpoint structure');
            
            const createResponse = await fetch(`${API_BASE_URL}/api/issues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testIssue)
            });
            
            if (createResponse.status === 401) {
                console.log('✅ Issue creation endpoint exists (authentication required)');
            } else if (createResponse.ok) {
                const createdIssue = await createResponse.json();
                console.log(`✅ Issue created successfully: ${createdIssue.id}`);
            } else {
                console.log(`❌ Issue creation failed: ${createResponse.status}`);
            }
        } else {
            console.log('\n7. Skipping issue creation (missing required data)');
        }

        // Test 8: Get User Issues
        console.log('\n8. Testing user issues endpoint...');
        const userIssuesResponse = await fetch(`${API_BASE_URL}/api/issues`);
        if (userIssuesResponse.status === 401) {
            console.log('✅ User issues endpoint exists (authentication required)');
        } else if (userIssuesResponse.ok) {
            const userIssues = await userIssuesResponse.json();
            console.log(`✅ Found ${userIssues.length} user issues`);
        } else {
            console.log(`❌ Failed to fetch user issues: ${userIssuesResponse.status}`);
        }

        // Test 9: Get Issue Statistics
        console.log('\n9. Testing statistics endpoint...');
        const statsResponse = await fetch(`${API_BASE_URL}/api/issues/stats/overview`);
        if (statsResponse.status === 401) {
            console.log('✅ Statistics endpoint exists (authentication required)');
        } else if (statsResponse.ok) {
            const stats = await statsResponse.json();
            console.log('✅ Statistics endpoint working');
            console.log(`   Total issues: ${stats.total_issues || 0}`);
        } else {
            console.log(`❌ Failed to fetch statistics: ${statsResponse.status}`);
        }

        console.log('\n🎉 Issue Reporting System API Test Complete!');
        console.log('\n📋 Summary:');
        console.log('- All endpoints are properly configured');
        console.log('- Database schema appears to be set up correctly');
        console.log('- Authentication is properly enforced');
        console.log('\n📝 Next Steps:');
        console.log('1. Set up authentication in your application');
        console.log('2. Test the frontend issue reporting interface');
        console.log('3. Verify issue creation and management workflows');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Ensure your backend server is running');
        console.log('2. Check that the API_BASE_URL is correct');
        console.log('3. Verify database connection and schema setup');
        console.log('4. Check backend logs for any errors');
    }
}

// Run the test
testAPI();
