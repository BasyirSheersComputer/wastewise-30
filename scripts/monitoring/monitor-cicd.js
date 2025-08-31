#!/usr/bin/env node

/**
 * CI/CD Pipeline Monitor
 * Monitors the status of Jenkins builds and deployments
 */

import { execSync } from 'child_process';

console.log('🔍 Monitoring CI/CD Pipeline Status...\n');

class CICDMonitor {
  constructor() {
    this.jenkinsUrl = 'http://192.168.20.215:8080';
    this.jobName = 'wastewise-30';
    this.containerName = 'wastewise-30';
    this.appUrl = 'http://sheerstechnologies.com/wastewise-30/';
    this.directUrl = 'http://192.168.20.215:8080';
  }

  async monitorPipeline() {
    console.log('📋 Step 1: Checking Jenkins Build Status');
    await this.checkJenkinsBuild();

    console.log('\n📋 Step 2: Checking Docker Container Status');
    await this.checkDockerContainer();

    console.log('\n📋 Step 3: Checking Application Health');
    await this.checkApplicationHealth();

    console.log('\n📋 Step 4: Checking Webhook Status');
    await this.checkWebhookStatus();

    console.log('\n📋 Step 5: Generating Status Report');
    await this.generateStatusReport();
  }

  async checkJenkinsBuild() {
    try {
      console.log(`   🔍 Checking Jenkins job: ${this.jobName}`);
      
      // Test Jenkins accessibility
      try {
        execSync(`curl -I ${this.jenkinsUrl}`, { stdio: 'pipe' });
        console.log('   ✅ Jenkins server is accessible');
      } catch (error) {
        console.log('   ❌ Jenkins server not accessible');
        return;
      }

      // Test job endpoint
      try {
        execSync(`curl -I ${this.jenkinsUrl}/job/${this.jobName}/`, { stdio: 'pipe' });
        console.log('   ✅ Jenkins job exists');
      } catch (error) {
        console.log('   ❌ Jenkins job not found');
        console.log('   💡 Check if job name is correct: wastewise-30');
        return;
      }

      // Test build trigger
      try {
        const response = execSync(`curl -s ${this.jenkinsUrl}/job/${this.jobName}/lastBuild/api/json`, { stdio: 'pipe' });
        const buildInfo = JSON.parse(response);
        console.log(`   📊 Last Build: #${buildInfo.number}`);
        console.log(`   📊 Build Status: ${buildInfo.result || 'IN_PROGRESS'}`);
        console.log(`   📊 Build Time: ${new Date(buildInfo.timestamp).toLocaleString()}`);
        
        if (buildInfo.result === 'SUCCESS') {
          console.log('   ✅ Last build was successful');
        } else if (buildInfo.result === 'FAILURE') {
          console.log('   ❌ Last build failed');
        } else {
          console.log('   ⚠️ Build is in progress or unknown status');
        }
      } catch (error) {
        console.log('   ⚠️ Could not fetch build information');
      }

    } catch (error) {
      console.log('   ❌ Error checking Jenkins build:', error.message);
    }
  }

  async checkDockerContainer() {
    try {
      console.log(`   🔍 Checking Docker container: ${this.containerName}`);
      
      // Check if container is running
      try {
        const containerStatus = execSync(`docker ps --filter name=${this.containerName} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`, { stdio: 'pipe' });
        if (containerStatus.includes(this.containerName)) {
          console.log('   ✅ Docker container is running');
          console.log(containerStatus.toString().trim());
        } else {
          console.log('   ❌ Docker container is not running');
          
          // Check if container exists but stopped
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
        }
      } catch (error) {
        console.log('   ❌ Docker not accessible or container not found');
      }

    } catch (error) {
      console.log('   ❌ Error checking Docker container:', error.message);
    }
  }

  async checkApplicationHealth() {
    try {
      console.log('   🔍 Checking application health endpoints');
      
      // Test direct container access
      try {
        execSync(`curl -I ${this.directUrl}`, { stdio: 'pipe' });
        console.log(`   ✅ Direct container access: ${this.directUrl}`);
      } catch (error) {
        console.log(`   ❌ Direct container access failed: ${this.directUrl}`);
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
      console.log('   ❌ Error checking application health:', error.message);
    }
  }

  async checkWebhookStatus() {
    try {
      console.log('   🔍 Checking webhook configuration');
      
      console.log('   📋 Webhook Configuration Checklist:');
      console.log('   [ ] GitHub webhook URL: http://192.168.20.215:8080/github-webhook/');
      console.log('   [ ] Webhook events include "Push"');
      console.log('   [ ] Jenkins job has webhook trigger enabled');
      console.log('   [ ] Job name matches: wastewise-30');
      
      console.log('\n   🔗 Manual verification needed:');
      console.log('   1. Go to: https://github.com/BasyirSheersComputer/wastewise-30/settings/hooks');
      console.log('   2. Check webhook delivery status');
      console.log('   3. Verify recent deliveries have 200 status codes');

    } catch (error) {
      console.log('   ❌ Error checking webhook status:', error.message);
    }
  }

  async generateStatusReport() {
    console.log('   📊 CI/CD Pipeline Status Report');
    console.log('   ===============================');
    
    console.log('\n   🎯 Expected Flow:');
    console.log('   1. Git Push → GitHub Webhook → Jenkins Build → Docker Build → Deploy');
    console.log('   2. Application accessible at: http://sheerstechnologies.com/wastewise-30/');
    console.log('   3. Direct access at: http://192.168.20.215:8080');
    
    console.log('\n   🚀 Manual Trigger Commands:');
    console.log(`   # Trigger Jenkins build: curl -X POST ${this.jenkinsUrl}/job/${this.jobName}/build`);
    console.log(`   # Check container: docker ps | grep ${this.containerName}`);
    console.log(`   # Test application: curl -I ${this.directUrl}`);
    
    console.log('\n   🔧 Troubleshooting Commands:');
    console.log('   # Check Jenkins logs: sudo tail -f /var/log/jenkins/jenkins.log');
    console.log('   # Check container logs: docker logs wastewise-30');
    console.log('   # Restart container: docker restart wastewise-30');
    
    console.log('\n   📞 Next Steps:');
    console.log('   1. Verify webhook configuration in GitHub');
    console.log('   2. Check Jenkins job settings');
    console.log('   3. Monitor build logs for errors');
    console.log('   4. Test application accessibility');
    console.log('   5. Verify deployment success');
  }
}

// Run monitoring
const monitor = new CICDMonitor();
monitor.monitorPipeline().catch(error => {
  console.error('❌ Monitoring failed:', error);
  process.exit(1);
}); 