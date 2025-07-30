#!/usr/bin/env node

/**
 * System Status Checker
 * Checks the status of all WasteWise system components
 */

import { execSync } from 'child_process';

console.log('🔍 Checking WasteWise System Status...\n');

class SystemStatusChecker {
  constructor() {
    this.services = [
      { name: 'Backend API', port: 3000, url: 'http://localhost:3000/health' },
      { name: 'Frontend App', port: 5173, url: 'http://localhost:5173' },
      { name: 'Data Platform', port: 4000, url: 'http://localhost:4000/health' }
    ];
  }

  checkPortStatus(port) {
    try {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      return result.includes('LISTENING');
    } catch (error) {
      return false;
    }
  }

  checkHealthEndpoint(url, serviceName) {
    try {
      const result = execSync(`curl -s -f ${url}`, { encoding: 'utf8' });
      return result && result.length > 0;
    } catch (error) {
      return false;
    }
  }

  async runChecks() {
    console.log('📊 Service Status:');
    console.log('==================');
    
    for (const service of this.services) {
      const portStatus = this.checkPortStatus(service.port);
      const healthStatus = this.checkHealthEndpoint(service.url, service.name);
      
      console.log(`\n🔧 ${service.name}:`);
      console.log(`   Port ${service.port}: ${portStatus ? '✅ Listening' : '❌ Not listening'}`);
      console.log(`   Health Check: ${healthStatus ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`   URL: ${service.url}`);
    }
    
    console.log('\n📁 Test Data Status:');
    console.log('===================');
    
    try {
      const testDataExists = require('fs').existsSync('./test-data/combined-test-data.json');
      console.log(`Test Data: ${testDataExists ? '✅ Available' : '❌ Not found'}`);
      
      if (testDataExists) {
        const testData = JSON.parse(require('fs').readFileSync('./test-data/combined-test-data.json', 'utf8'));
        console.log(`Restaurants: ${testData.summary.restaurants}`);
        console.log(`Menu Items: ${testData.summary.menu_items}`);
        console.log(`Inventory Items: ${testData.summary.inventory_items}`);
        console.log(`Waste Events: ${testData.summary.waste_events}`);
        console.log(`Sales Records: ${testData.summary.sales_records}`);
        console.log(`AI Recommendations: ${testData.summary.ai_recommendations}`);
        console.log(`Users: ${testData.summary.users}`);
        console.log(`Analytics Records: ${testData.summary.analytics_records}`);
      }
    } catch (error) {
      console.log('❌ Error reading test data');
    }
    
    console.log('\n🌐 Application URLs:');
    console.log('===================');
    console.log('Frontend: http://localhost:5173');
    console.log('Backend API: http://localhost:3000');
    console.log('Data Platform: http://localhost:4000');
    console.log('Health Check: http://localhost:3000/health');
    
    console.log('\n🛠️ Management Commands:');
    console.log('=======================');
    console.log('View logs: Check individual service terminals');
    console.log('Restart backend: cd backend && npm run dev');
    console.log('Restart frontend: cd frontend && npm run dev');
    console.log('Restart data platform: cd data-platform && npm run dev');
    console.log('Stop all: Ctrl+C in respective terminals');
    
    console.log('\n📊 Quick Tests:');
    console.log('===============');
    console.log('Test backend: curl http://localhost:3000/health');
    console.log('Test frontend: curl http://localhost:5173');
    console.log('Test data platform: curl http://localhost:4000/health');
    
    console.log('\n🎯 System Status Summary:');
    console.log('========================');
    
    const allServicesHealthy = this.services.every(service => 
      this.checkPortStatus(service.port) && this.checkHealthEndpoint(service.url, service.name)
    );
    
    if (allServicesHealthy) {
      console.log('✅ All services are running and healthy!');
      console.log('🚀 Your WasteWise system is ready for use.');
    } else {
      console.log('⚠️ Some services may not be fully operational.');
      console.log('💡 Check individual service logs for more details.');
    }
  }
}

// Run status check
const statusChecker = new SystemStatusChecker();
statusChecker.runChecks(); 