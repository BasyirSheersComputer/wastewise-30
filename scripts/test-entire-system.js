#!/usr/bin/env node

/**
 * Comprehensive System Test
 * Tests all components of the WasteWise system with test data
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Testing Entire WasteWise System with Test Data...\n');

class SystemTester {
  constructor() {
    this.testResults = [];
    this.testData = null;
  }

  async runAllTests() {
    try {
      console.log('📋 Step 1: Loading test data...');
      await this.loadTestData();
      
      console.log('📋 Step 2: Testing backend services...');
      await this.testBackendServices();
      
      console.log('📋 Step 3: Testing frontend services...');
      await this.testFrontendServices();
      
      console.log('📋 Step 4: Testing data platform...');
      await this.testDataPlatform();
      
      console.log('📋 Step 5: Testing API endpoints...');
      await this.testAPIEndpoints();
      
      console.log('📋 Step 6: Testing data integration...');
      await this.testDataIntegration();
      
      console.log('📋 Step 7: Testing AI capabilities...');
      await this.testAICapabilities();
      
      console.log('📋 Step 8: Testing analytics...');
      await this.testAnalytics();
      
      this.showTestResults();
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      process.exit(1);
    }
  }

  async loadTestData() {
    try {
      const testDataPath = './test-data/combined-test-data.json';
      if (fs.existsSync(testDataPath)) {
        this.testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
        console.log('   ✅ Test data loaded successfully');
        console.log(`   📊 Data summary: ${this.testData.summary.restaurants} restaurants, ${this.testData.summary.menu_items} menu items, ${this.testData.summary.sales_records} sales records`);
      } else {
        throw new Error('Test data not found');
      }
    } catch (error) {
      console.log('   ❌ Failed to load test data:', error.message);
      throw error;
    }
  }

  async testBackendServices() {
    console.log('   🔧 Testing backend services...');
    
    const tests = [
      {
        name: 'Backend Health Check',
        command: 'curl -s http://localhost:3000/health',
        expected: 'healthy'
      },
      {
        name: 'Backend Port Status',
        command: 'netstat -ano | findstr :3000',
        expected: 'LISTENING'
      }
    ];
    
    for (const test of tests) {
      try {
        const result = execSync(test.command, { encoding: 'utf8' });
        const passed = result.includes(test.expected);
        this.testResults.push({
          test: test.name,
          status: passed ? 'PASS' : 'FAIL',
          details: passed ? 'Service is healthy' : 'Service not responding'
        });
        console.log(`   ${passed ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          test: test.name,
          status: 'FAIL',
          details: 'Service not available'
        });
        console.log(`   ❌ ${test.name} - Service not available`);
      }
    }
  }

  async testFrontendServices() {
    console.log('   🌐 Testing frontend services...');
    
    const tests = [
      {
        name: 'Frontend Accessibility',
        command: 'curl -s -I http://localhost:5173',
        expected: 'HTTP'
      },
      {
        name: 'Frontend Port Status',
        command: 'netstat -ano | findstr :5173',
        expected: 'LISTENING'
      }
    ];
    
    for (const test of tests) {
      try {
        const result = execSync(test.command, { encoding: 'utf8' });
        const passed = result.includes(test.expected);
        this.testResults.push({
          test: test.name,
          status: passed ? 'PASS' : 'FAIL',
          details: passed ? 'Frontend is accessible' : 'Frontend not responding'
        });
        console.log(`   ${passed ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          test: test.name,
          status: 'FAIL',
          details: 'Frontend not available'
        });
        console.log(`   ❌ ${test.name} - Frontend not available`);
      }
    }
  }

  async testDataPlatform() {
    console.log('   🤖 Testing data platform...');
    
    const tests = [
      {
        name: 'Data Platform Health Check',
        command: 'curl -s http://localhost:4000/health',
        expected: 'healthy'
      },
      {
        name: 'Data Platform Port Status',
        command: 'netstat -ano | findstr :4000',
        expected: 'LISTENING'
      }
    ];
    
    for (const test of tests) {
      try {
        const result = execSync(test.command, { encoding: 'utf8' });
        const passed = result.includes(test.expected);
        this.testResults.push({
          test: test.name,
          status: passed ? 'PASS' : 'FAIL',
          details: passed ? 'Data platform is healthy' : 'Data platform not responding'
        });
        console.log(`   ${passed ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          test: test.name,
          status: 'FAIL',
          details: 'Data platform not available'
        });
        console.log(`   ❌ ${test.name} - Data platform not available`);
      }
    }
  }

  async testAPIEndpoints() {
    console.log('   🔌 Testing API endpoints...');
    
    const endpoints = [
      { name: 'Health Endpoint', url: 'http://localhost:3000/health' },
      { name: 'Analytics Endpoint', url: 'http://localhost:3000/api/analytics' },
      { name: 'Waste Events Endpoint', url: 'http://localhost:3000/api/waste-events' },
      { name: 'Sales Endpoint', url: 'http://localhost:3000/api/sales' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const result = execSync(`curl -s -f ${endpoint.url}`, { encoding: 'utf8' });
        const passed = result && result.length > 0;
        this.testResults.push({
          test: endpoint.name,
          status: passed ? 'PASS' : 'FAIL',
          details: passed ? 'Endpoint responding' : 'Endpoint not responding'
        });
        console.log(`   ${passed ? '✅' : '❌'} ${endpoint.name}`);
      } catch (error) {
        this.testResults.push({
          test: endpoint.name,
          status: 'FAIL',
          details: 'Endpoint not available'
        });
        console.log(`   ❌ ${endpoint.name} - Endpoint not available`);
      }
    }
  }

  async testDataIntegration() {
    console.log('   🔗 Testing data integration...');
    
    if (!this.testData) {
      console.log('   ⚠️ No test data available for integration testing');
      return;
    }
    
    const tests = [
      {
        name: 'Test Data Validation',
        test: () => {
          return this.testData.summary.restaurants > 0 &&
                 this.testData.summary.menu_items > 0 &&
                 this.testData.summary.sales_records > 0;
        },
        details: 'Test data contains required records'
      },
      {
        name: 'Data Structure Validation',
        test: () => {
          return this.testData.data.restaurants.length > 0 &&
                 this.testData.data.menuItems.length > 0 &&
                 this.testData.data.sales.length > 0;
        },
        details: 'Data structure is valid'
      }
    ];
    
    for (const test of tests) {
      const passed = test.test();
      this.testResults.push({
        test: test.name,
        status: passed ? 'PASS' : 'FAIL',
        details: test.details
      });
      console.log(`   ${passed ? '✅' : '❌'} ${test.name}`);
    }
  }

  async testAICapabilities() {
    console.log('   🤖 Testing AI capabilities...');
    
    const tests = [
      {
        name: 'AI Recommendations Available',
        test: () => {
          return this.testData && this.testData.summary.ai_recommendations > 0;
        },
        details: 'AI recommendations are available'
      },
      {
        name: 'AI Data Structure',
        test: () => {
          return this.testData && this.testData.data.aiRecommendations.length > 0;
        },
        details: 'AI data structure is valid'
      }
    ];
    
    for (const test of tests) {
      const passed = test.test();
      this.testResults.push({
        test: test.name,
        status: passed ? 'PASS' : 'FAIL',
        details: test.details
      });
      console.log(`   ${passed ? '✅' : '❌'} ${test.name}`);
    }
  }

  async testAnalytics() {
    console.log('   📊 Testing analytics...');
    
    const tests = [
      {
        name: 'Analytics Data Available',
        test: () => {
          return this.testData && this.testData.summary.analytics_records > 0;
        },
        details: 'Analytics data is available'
      },
      {
        name: 'Analytics Structure',
        test: () => {
          return this.testData && this.testData.data.analytics.length > 0;
        },
        details: 'Analytics structure is valid'
      }
    ];
    
    for (const test of tests) {
      const passed = test.test();
      this.testResults.push({
        test: test.name,
        status: passed ? 'PASS' : 'FAIL',
        details: test.details
      });
      console.log(`   ${passed ? '✅' : '❌'} ${test.name}`);
    }
  }

  showTestResults() {
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    console.log(`\n✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    console.log('===================');
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status} - ${result.details}`);
    });
    
    console.log('\n🎯 System Status:');
    console.log('=================');
    
    if (passed === total) {
      console.log('🎉 All tests passed! Your WasteWise system is fully operational.');
      console.log('🚀 The system is ready for production use with test data.');
    } else if (passed >= total * 0.8) {
      console.log('✅ Most tests passed! Your WasteWise system is mostly operational.');
      console.log('⚠️ Some components may need attention.');
    } else {
      console.log('❌ Many tests failed. Please check system configuration.');
      console.log('🔧 Review the failed tests above for troubleshooting.');
    }
    
    console.log('\n🌐 Access Your System:');
    console.log('=====================');
    console.log('Frontend: http://localhost:5173');
    console.log('Backend API: http://localhost:3000');
    console.log('Data Platform: http://localhost:4000');
    console.log('Health Check: http://localhost:3000/health');
    
    console.log('\n📁 Test Data Files:');
    console.log('===================');
    console.log('Combined Data: test-data/combined-test-data.json');
    console.log('Database Script: database/test-data.sql');
    console.log('Individual Files: test-data/*.json');
    
    console.log('\n🛠️ Next Steps:');
    console.log('===============');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Explore the dashboard with test data');
    console.log('3. Test AI recommendations and analytics');
    console.log('4. Verify waste tracking functionality');
    console.log('5. Check data platform integration');
  }
}

// Run the comprehensive test
const systemTester = new SystemTester();
systemTester.runAllTests().catch(error => {
  console.error('❌ System test failed:', error);
  process.exit(1);
}); 