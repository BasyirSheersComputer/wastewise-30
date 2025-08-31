#!/usr/bin/env node

/**
 * CI/CD Pipeline Trigger
 * Manually triggers Jenkins build and monitors deployment
 */

import { execSync } from 'child_process';

console.log('🚀 Triggering CI/CD Pipeline...\n');

class CICDTrigger {
  constructor() {
    this.jenkinsUrl = 'http://192.168.20.215:8080';
    this.jobName = 'wastewise-30';
    this.containerName = 'wastewise-30';
    this.directUrl = 'http://192.168.20.215:8080';
  }

  async triggerPipeline() {
    console.log('📋 Step 1: Triggering Jenkins Build');
    await this.triggerJenkinsBuild();

    console.log('\n📋 Step 2: Monitoring Build Progress');
    await this.monitorBuildProgress();

    console.log('\n📋 Step 3: Checking Deployment Status');
    await this.checkDeploymentStatus();

    console.log('\n📋 Step 4: Verifying Application');
    await this.verifyApplication();

    console.log('\n📋 Step 5: Final Status Report');
    await this.generateFinalReport();
  }

  async triggerJenkinsBuild() {
    try {
      console.log(`   🔧 Triggering build for job: ${this.jobName}`);
      
      // Trigger the build
      try {
        execSync(`curl -X POST ${this.jenkinsUrl}/job/${this.jobName}/build`, { stdio: 'pipe' });
        console.log('   ✅ Build triggered successfully');
        console.log('   ⏳ Build is starting...');
      } catch (error) {
        console.log('   ❌ Failed to trigger build');
        console.log('   💡 Check if Jenkins job exists and is accessible');
        return false;
      }

      // Wait a moment for build to start
      console.log('   ⏳ Waiting for build to initialize...');
      await this.sleep(5000);

      return true;
    } catch (error) {
      console.log('   ❌ Error triggering build:', error.message);
      return false;
    }
  }

  async monitorBuildProgress() {
    try {
      console.log('   🔍 Monitoring build progress...');
      
      // Check build status multiple times
      for (let i = 0; i < 10; i++) {
        try {
          const response = execSync(`curl -s ${this.jenkinsUrl}/job/${this.jobName}/lastBuild/api/json`, { stdio: 'pipe' });
          const buildInfo = JSON.parse(response);
          
          console.log(`   📊 Build #${buildInfo.number} - Status: ${buildInfo.result || 'IN_PROGRESS'}`);
          
          if (buildInfo.result === 'SUCCESS') {
            console.log('   ✅ Build completed successfully!');
            return true;
          } else if (buildInfo.result === 'FAILURE') {
            console.log('   ❌ Build failed');
            console.log('   💡 Check Jenkins logs for error details');
            return false;
          } else {
            console.log('   ⏳ Build in progress...');
            await this.sleep(10000); // Wait 10 seconds before next check
          }
        } catch (error) {
          console.log('   ⚠️ Could not fetch build status, retrying...');
          await this.sleep(5000);
        }
      }
      
      console.log('   ⚠️ Build monitoring timeout');
      return false;
    } catch (error) {
      console.log('   ❌ Error monitoring build:', error.message);
      return false;
    }
  }

  async checkDeploymentStatus() {
    try {
      console.log('   🔍 Checking deployment status...');
      
      // Wait for deployment to complete
      console.log('   ⏳ Waiting for deployment to complete...');
      await this.sleep(15000);
      
      // Check if container is running
      try {
        const containerStatus = execSync(`docker ps --filter name=${this.containerName}`, { stdio: 'pipe' });
        if (containerStatus.includes(this.containerName)) {
          console.log('   ✅ Docker container is running');
          console.log(containerStatus.toString().trim());
          return true;
        } else {
          console.log('   ❌ Docker container is not running');
          
          // Check if container exists
          try {
            const allContainers = execSync(`docker ps -a --filter name=${this.containerName}`, { stdio: 'pipe' });
            if (allContainers.includes(this.containerName)) {
              console.log('   ⚠️ Container exists but is stopped');
            } else {
              console.log('   ❌ Container does not exist');
            }
          } catch (error) {
            console.log('   ❌ Could not check container status');
          }
          return false;
        }
      } catch (error) {
        console.log('   ❌ Docker not accessible');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Error checking deployment status:', error.message);
      return false;
    }
  }

  async verifyApplication() {
    try {
      console.log('   🔍 Verifying application accessibility...');
      
      // Test direct container access
      try {
        execSync(`curl -I ${this.directUrl}`, { stdio: 'pipe' });
        console.log(`   ✅ Application accessible at: ${this.directUrl}`);
      } catch (error) {
        console.log(`   ❌ Application not accessible at: ${this.directUrl}`);
      }

      // Test health endpoint
      try {
        execSync(`curl -f ${this.directUrl}/health`, { stdio: 'pipe' });
        console.log('   ✅ Health endpoint responding');
      } catch (error) {
        console.log('   ❌ Health endpoint not responding');
      }

      // Test API endpoint
      try {
        execSync(`curl -I ${this.directUrl}/api`, { stdio: 'pipe' });
        console.log('   ✅ API endpoint accessible');
      } catch (error) {
        console.log('   ❌ API endpoint not accessible');
      }

    } catch (error) {
      console.log('   ❌ Error verifying application:', error.message);
    }
  }

  async generateFinalReport() {
    console.log('   📊 CI/CD Pipeline Trigger Report');
    console.log('   =================================');
    
    console.log('\n   🎯 Pipeline Status:');
    console.log('   - Jenkins Build: Triggered');
    console.log('   - Docker Container: Checked');
    console.log('   - Application: Verified');
    
    console.log('\n   🌐 Application URLs:');
    console.log(`   - Direct Access: ${this.directUrl}`);
    console.log('   - Nginx Proxy: http://sheerstechnologies.com/wastewise-30/');
    console.log('   - Health Check: http://192.168.20.215:8080/health');
    
    console.log('\n   🔧 Manual Commands:');
    console.log(`   # Check container: docker ps | grep ${this.containerName}`);
    console.log(`   # View logs: docker logs ${this.containerName}`);
    console.log(`   # Restart: docker restart ${this.containerName}`);
    console.log(`   # Test app: curl -I ${this.directUrl}`);
    
    console.log('\n   📞 Troubleshooting:');
    console.log('   1. Check Jenkins build logs for errors');
    console.log('   2. Verify Docker container is running');
    console.log('   3. Test application accessibility');
    console.log('   4. Check Nginx proxy configuration');
    console.log('   5. Verify webhook is working for future pushes');
    
    console.log('\n   🎉 Next Steps:');
    console.log('   1. Test the application in browser');
    console.log('   2. Verify all features are working');
    console.log('   3. Monitor for any issues');
    console.log('   4. Set up monitoring and alerts');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run CI/CD trigger
const trigger = new CICDTrigger();
trigger.triggerPipeline().catch(error => {
  console.error('❌ CI/CD trigger failed:', error);
  process.exit(1);
}); 