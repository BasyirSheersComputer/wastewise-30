#!/usr/bin/env node

/**
 * CI/CD Automation Test Script
 * Tests the build trigger automation for WasteWise project
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Testing CI/CD Build Trigger Automation...\n');

// Test 1: Verify project structure
console.log('📋 Test 1: Project Structure Validation');
try {
  const requiredFiles = [
    'Dockerfile',
    'Jenkinsfile',
    'frontend/package.json',
    'backend/package.json',
    'frontend/src/App.tsx',
    'backend/index.js'
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      process.exit(1);
    }
  });
  console.log('✅ Project structure validation passed\n');
} catch (error) {
  console.error('❌ Project structure validation failed:', error.message);
  process.exit(1);
}

// Test 2: Verify Dockerfile syntax
console.log('🐳 Test 2: Dockerfile Validation');
try {
  const dockerfileContent = fs.readFileSync('Dockerfile', 'utf8');
  
  // Check for required stages
  const requiredStages = [
    'FROM node:20 AS frontend-build',
    'FROM node:20 AS backend-build',
    'FROM nginx:alpine'
  ];
  
  requiredStages.forEach(stage => {
    if (dockerfileContent.includes(stage)) {
      console.log(`✅ Found stage: ${stage.split(' ')[2]}`);
    } else {
      console.log(`❌ Missing stage: ${stage.split(' ')[2]}`);
      process.exit(1);
    }
  });
  
  // Check for proper COPY commands
  if (dockerfileContent.includes('COPY frontend/') && 
      dockerfileContent.includes('COPY backend/')) {
    console.log('✅ Proper directory structure in Dockerfile');
  } else {
    console.log('❌ Dockerfile missing proper directory structure');
    process.exit(1);
  }
  
  console.log('✅ Dockerfile validation passed\n');
} catch (error) {
  console.error('❌ Dockerfile validation failed:', error.message);
  process.exit(1);
}

// Test 3: Verify Jenkinsfile syntax
console.log('🔧 Test 3: Jenkinsfile Validation');
try {
  const jenkinsfileContent = fs.readFileSync('Jenkinsfile', 'utf8');
  
  // Check for required stages
  const requiredStages = [
    'Validate Project Structure',
    'Install Dependencies',
    'Lint and Test',
    'Build Docker Image',
    'Test Docker Image',
    'Push to DockerHub',
    'Deploy to Production',
    'Health Check'
  ];
  
  requiredStages.forEach(stage => {
    if (jenkinsfileContent.includes(stage)) {
      console.log(`✅ Found stage: ${stage}`);
    } else {
      console.log(`❌ Missing stage: ${stage}`);
      process.exit(1);
    }
  });
  
  // Check for environment variables
  const requiredEnvVars = [
    'IMAGE_NAME',
    'TAG',
    'SSH_CRED_ID',
    'DOCKER_CRED_ID',
    'REMOTE_HOST',
    'REMOTE_USER',
    'CONTAINER_NAME'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (jenkinsfileContent.includes(envVar)) {
      console.log(`✅ Found environment variable: ${envVar}`);
    } else {
      console.log(`❌ Missing environment variable: ${envVar}`);
      process.exit(1);
    }
  });
  
  console.log('✅ Jenkinsfile validation passed\n');
} catch (error) {
  console.error('❌ Jenkinsfile validation failed:', error.message);
  process.exit(1);
}

// Test 4: Check Git status and recent commits
console.log('📝 Test 4: Git Status and Recent Activity');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim() === '') {
    console.log('✅ Working directory is clean');
  } else {
    console.log('⚠️ Working directory has uncommitted changes');
  }
  
  const recentCommits = execSync('git log --oneline -3', { encoding: 'utf8' });
  console.log('📊 Recent commits:');
  console.log(recentCommits);
  
  console.log('✅ Git status check passed\n');
} catch (error) {
  console.error('❌ Git status check failed:', error.message);
  process.exit(1);
}

// Test 5: Verify package.json files
console.log('📦 Test 5: Package.json Validation');
try {
  const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  
  // Check frontend package.json
  if (frontendPackage.scripts && frontendPackage.scripts.build) {
    console.log('✅ Frontend has build script');
  } else {
    console.log('❌ Frontend missing build script');
    process.exit(1);
  }
  
  // Check backend package.json
  if (backendPackage.scripts && backendPackage.scripts.start) {
    console.log('✅ Backend has start script');
  } else {
    console.log('❌ Backend missing start script');
    process.exit(1);
  }
  
  console.log('✅ Package.json validation passed\n');
} catch (error) {
  console.error('❌ Package.json validation failed:', error.message);
  process.exit(1);
}

// Test 6: Simulate CI/CD trigger conditions
console.log('🔄 Test 6: CI/CD Trigger Conditions');
try {
  // Check if we're on main branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  if (currentBranch === 'main') {
    console.log('✅ On main branch (CI/CD trigger branch)');
  } else {
    console.log(`⚠️ On branch: ${currentBranch} (CI/CD may not trigger)`);
  }
  
  // Check for recent changes
  const lastCommit = execSync('git log -1 --format="%H"', { encoding: 'utf8' }).trim();
  console.log(`📝 Last commit: ${lastCommit.substring(0, 8)}`);
  
  // Check if remote is ahead
  const remoteStatus = execSync('git status -uno', { encoding: 'utf8' });
  if (remoteStatus.includes('Your branch is up to date')) {
    console.log('✅ Local branch is up to date with remote');
  } else {
    console.log('⚠️ Local branch may be behind remote');
  }
  
  console.log('✅ CI/CD trigger conditions check passed\n');
} catch (error) {
  console.error('❌ CI/CD trigger conditions check failed:', error.message);
  process.exit(1);
}

// Summary
console.log('🎉 CI/CD Automation Test Summary:');
console.log('✅ All tests passed!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Check your Jenkins dashboard for the triggered build');
console.log('2. Monitor the pipeline stages in Jenkins');
console.log('3. Verify the deployment to your production server');
console.log('4. Check the application at: http://192.168.20.215:8899');
console.log('');
console.log('🔗 Jenkins Pipeline URL:');
console.log('http://your-jenkins-server/job/your-pipeline-name/');
console.log('');
console.log('📊 Expected Pipeline Stages:');
console.log('- Checkout Source');
console.log('- Validate Project Structure');
console.log('- Install Dependencies (parallel)');
console.log('- Lint and Test (parallel)');
console.log('- Build Docker Image');
console.log('- Test Docker Image');
console.log('- Push to DockerHub');
console.log('- Deploy to Production');
console.log('- Health Check'); 