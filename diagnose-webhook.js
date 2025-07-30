#!/usr/bin/env node

/**
 * Webhook Diagnostic Script
 * Helps identify issues with GitHub webhook to Jenkins
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 Diagnosing Webhook Issues...\n');

class WebhookDiagnostic {
  constructor() {
    this.repository = 'BasyirSheersComputer/wastewise-30';
    this.jenkinsUrl = 'http://192.168.20.215:8080'; // Update with your Jenkins URL
  }

  async runDiagnostics() {
    console.log('📋 Step 1: Checking Git Configuration');
    await this.checkGitConfig();

    console.log('\n📋 Step 2: Checking Recent Commits');
    await this.checkRecentCommits();

    console.log('\n📋 Step 3: Checking Jenkins Accessibility');
    await this.checkJenkinsAccess();

    console.log('\n📋 Step 4: Checking Webhook Configuration');
    await this.checkWebhookConfig();

    console.log('\n📋 Step 5: Generating Test Commands');
    await this.generateTestCommands();

    console.log('\n🎯 Summary and Recommendations');
    await this.generateSummary();
  }

  async checkGitConfig() {
    try {
      const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();

      console.log(`   ✅ Remote URL: ${remoteUrl}`);
      console.log(`   ✅ Current Branch: ${currentBranch}`);
      console.log(`   ✅ Last Commit: ${lastCommit}`);

      if (remoteUrl.includes('github.com')) {
        console.log('   ✅ GitHub repository detected');
      } else {
        console.log('   ❌ Not a GitHub repository');
      }

      if (currentBranch === 'main') {
        console.log('   ✅ On main branch');
      } else {
        console.log(`   ⚠️ Not on main branch (currently on ${currentBranch})`);
      }
    } catch (error) {
      console.log('   ❌ Error checking git configuration:', error.message);
    }
  }

  async checkRecentCommits() {
    try {
      const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' });
      console.log('   📝 Recent commits:');
      console.log(recentCommits.split('\n').map(line => `      ${line}`).join('\n'));
    } catch (error) {
      console.log('   ❌ Error checking recent commits:', error.message);
    }
  }

  async checkJenkinsAccess() {
    try {
      console.log(`   🔍 Testing Jenkins access at: ${this.jenkinsUrl}`);
      
      // Test basic connectivity
      try {
        execSync(`curl -I ${this.jenkinsUrl}`, { stdio: 'pipe' });
        console.log('   ✅ Jenkins server is accessible');
      } catch (error) {
        console.log('   ❌ Jenkins server not accessible');
        console.log('   💡 Check if Jenkins is running and accessible');
      }

      // Test webhook endpoint
      try {
        execSync(`curl -I ${this.jenkinsUrl}/github-webhook/`, { stdio: 'pipe' });
        console.log('   ✅ Webhook endpoint is accessible');
      } catch (error) {
        console.log('   ❌ Webhook endpoint not accessible');
        console.log('   💡 Check Jenkins webhook configuration');
      }

    } catch (error) {
      console.log('   ❌ Error checking Jenkins access:', error.message);
    }
  }

  async checkWebhookConfig() {
    console.log('   📋 Webhook Configuration Checklist:');
    console.log('   [ ] GitHub webhook URL points to Jenkins server');
    console.log('   [ ] Webhook events include "Push"');
    console.log('   [ ] Jenkins job has webhook trigger enabled');
    console.log('   [ ] Jenkins has GitHub credentials configured');
    console.log('   [ ] Job name matches repository name');
    console.log('   [ ] Branch configuration includes main');
    console.log('   [ ] Jenkins is accessible from internet');
    
    console.log('\n   🔗 Expected webhook URL:');
    console.log(`      ${this.jenkinsUrl}/github-webhook/`);
    
    console.log('\n   📝 Expected Jenkins job name:');
    console.log('      wastewise-30');
  }

  async generateTestCommands() {
    console.log('   🧪 Test Commands:');
    console.log('\n   # Test Jenkins accessibility:');
    console.log(`   curl -I ${this.jenkinsUrl}`);
    
    console.log('\n   # Test webhook endpoint:');
    console.log(`   curl -X POST ${this.jenkinsUrl}/github-webhook/ \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -H "X-GitHub-Event: push" \\');
    console.log('     -d \'{"ref":"refs/heads/main","repository":{"full_name":"BasyirSheersComputer/wastewise-30"}}\'');
    
    console.log('\n   # Test manual job trigger:');
    console.log(`   curl -X POST ${this.jenkinsUrl}/job/wastewise-30/build`);
    
    console.log('\n   # Check Jenkins logs:');
    console.log('   sudo tail -f /var/log/jenkins/jenkins.log');
  }

  async generateSummary() {
    console.log('   📊 Common Issues and Solutions:');
    console.log('\n   🚨 Issue 1: Webhook URL Incorrect');
    console.log('      Solution: Update GitHub webhook URL to point to Jenkins server');
    
    console.log('\n   🚨 Issue 2: Jenkins Not Accessible');
    console.log('      Solution: Check Jenkins service status and firewall settings');
    
    console.log('\n   🚨 Issue 3: Job Configuration Issues');
    console.log('      Solution: Verify Jenkins job settings and webhook trigger');
    
    console.log('\n   🚨 Issue 4: Authentication Issues');
    console.log('      Solution: Configure GitHub credentials in Jenkins');
    
    console.log('\n   🎯 Next Steps:');
    console.log('   1. Check GitHub webhook settings');
    console.log('   2. Verify Jenkins job configuration');
    console.log('   3. Test webhook manually');
    console.log('   4. Check Jenkins logs for errors');
    console.log('   5. Verify network connectivity');
    
    console.log('\n   📞 Manual Verification:');
    console.log('   1. Go to GitHub: https://github.com/BasyirSheersComputer/wastewise-30/settings/hooks');
    console.log('   2. Check webhook delivery status');
    console.log('   3. Go to Jenkins: Check job configuration and build history');
    console.log('   4. Test manual build trigger');
  }
}

// Run diagnostics
const diagnostic = new WebhookDiagnostic();
diagnostic.runDiagnostics().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
}); 