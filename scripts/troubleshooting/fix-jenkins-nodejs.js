#!/usr/bin/env node

/**
 * Jenkins Node.js Fix
 * Provides solutions for the npm not found error in Jenkins
 */

console.log('🔧 Fixing Jenkins Node.js/npm Issue...\n');

class JenkinsNodeJSFix {
  constructor() {
    this.jenkinsUrl = 'http://192.168.20.215:8080';
    this.jobName = 'wastewise-30';
  }

  async provideSolutions() {
    console.log('📋 Issue Identified:');
    console.log('   ❌ npm: not found');
    console.log('   ❌ Node.js is not installed on Jenkins server');
    console.log('   ❌ Build fails at dependency installation stage');

    console.log('\n📋 Step 1: Jenkins Server Node.js Installation');
    await this.jenkinsNodeJSInstallation();

    console.log('\n📋 Step 2: Alternative Jenkinsfile Solutions');
    await this.alternativeSolutions();

    console.log('\n📋 Step 3: Docker-Based Solution');
    await this.dockerBasedSolution();

    console.log('\n📋 Step 4: Verification Steps');
    await this.verificationSteps();

    console.log('\n📋 Step 5: Implementation Guide');
    await this.implementationGuide();
  }

  async jenkinsNodeJSInstallation() {
    console.log('   🔧 Installing Node.js on Jenkins Server:');
    console.log('\n   # SSH into Jenkins server:');
    console.log('   ssh root@192.168.20.215');
    
    console.log('\n   # Install Node.js using package manager:');
    console.log('   # For Ubuntu/Debian:');
    console.log('   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -');
    console.log('   sudo apt-get install -y nodejs');
    
    console.log('\n   # For CentOS/RHEL:');
    console.log('   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -');
    console.log('   sudo yum install -y nodejs');
    
    console.log('\n   # Verify installation:');
    console.log('   node --version');
    console.log('   npm --version');
    
    console.log('\n   # Restart Jenkins service:');
    console.log('   sudo systemctl restart jenkins');
  }

  async alternativeSolutions() {
    console.log('   🔧 Alternative Jenkinsfile Solutions:');
    
    console.log('\n   Option 1: Use Docker for builds');
    console.log('   ```groovy');
    console.log('   stage(\'Install Dependencies\') {');
    console.log('     parallel {');
    console.log('       stage(\'Frontend Dependencies\') {');
    console.log('         agent { docker \'node:20\' }');
    console.log('         steps {');
    console.log('           dir(\'frontend\') {');
    console.log('             sh \'npm ci --only=production\'');
    console.log('           }');
    console.log('         }');
    console.log('       }');
    console.log('       stage(\'Backend Dependencies\') {');
    console.log('         agent { docker \'node:20\' }');
    console.log('         steps {');
    console.log('           dir(\'backend\') {');
    console.log('             sh \'npm ci --only=production\'');
    console.log('           }');
    console.log('         }');
    console.log('       }');
    console.log('     }');
    console.log('   }');
    console.log('   ```');
    
    console.log('\n   Option 2: Use Node.js tool installer');
    console.log('   ```groovy');
    console.log('   tools {');
    console.log('     nodejs \'NodeJS 20.x\'');
    console.log('   }');
    console.log('   ```');
    
    console.log('\n   Option 3: Use nvm (Node Version Manager)');
    console.log('   ```groovy');
    console.log('   stage(\'Setup Node.js\') {');
    console.log('     steps {');
    console.log('       sh \'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\'');
    console.log('       sh \'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm install 20\'');
    console.log('       sh \'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 20\'');
    console.log('     }');
    console.log('   }');
    console.log('   ```');
  }

  async dockerBasedSolution() {
    console.log('   🐳 Docker-Based Solution (Recommended):');
    console.log('\n   # Update Jenkinsfile to use Docker agents:');
    console.log('   ```groovy');
    console.log('   pipeline {');
    console.log('     agent any');
    console.log('     environment {');
    console.log('       DOCKER_IMAGE = \'node:20-alpine\'');
    console.log('     }');
    console.log('     stages {');
    console.log('       stage(\'Install Dependencies\') {');
    console.log('         parallel {');
    console.log('           stage(\'Frontend Dependencies\') {');
    console.log('             agent { docker DOCKER_IMAGE }');
    console.log('             steps {');
    console.log('               dir(\'frontend\') {');
    console.log('                 sh \'npm ci --only=production\'');
    console.log('               }');
    console.log('             }');
    console.log('           }');
    console.log('           stage(\'Backend Dependencies\') {');
    console.log('             agent { docker DOCKER_IMAGE }');
    console.log('             steps {');
    console.log('               dir(\'backend\') {');
    console.log('                 sh \'npm ci --only=production\'');
    console.log('               }');
    console.log('             }');
    console.log('           }');
    console.log('         }');
    console.log('       }');
    console.log('       // ... rest of pipeline');
    console.log('     }');
    console.log('   }');
    console.log('   ```');
  }

  async verificationSteps() {
    console.log('   ✅ Verification Steps:');
    console.log('\n   1. Check Node.js installation:');
    console.log('      ssh root@192.168.20.215');
    console.log('      node --version');
    console.log('      npm --version');
    
    console.log('\n   2. Check Jenkins environment:');
    console.log('      # Go to Jenkins > Manage Jenkins > System Information');
    console.log('      # Look for Node.js in the environment variables');
    
    console.log('\n   3. Test npm in Jenkins workspace:');
    console.log('      # Add a test stage to Jenkinsfile:');
    console.log('      ```groovy');
    console.log('      stage(\'Test Node.js\') {');
    console.log('        steps {');
    console.log('          sh \'node --version\'');
    console.log('          sh \'npm --version\'');
    console.log('        }');
    console.log('      }');
    console.log('      ```');
    
    console.log('\n   4. Verify Docker is available (if using Docker solution):');
    console.log('      # In Jenkins, check if Docker is installed:');
    console.log('      sh \'docker --version\'');
  }

  async implementationGuide() {
    console.log('   📋 Implementation Guide:');
    
    console.log('\n   🎯 Quick Fix (Recommended):');
    console.log('   1. SSH into Jenkins server');
    console.log('   2. Install Node.js 20.x');
    console.log('   3. Restart Jenkins service');
    console.log('   4. Test the pipeline');
    
    console.log('\n   🎯 Alternative Fix (Docker-based):');
    console.log('   1. Update Jenkinsfile to use Docker agents');
    console.log('   2. Ensure Docker is available on Jenkins');
    console.log('   3. Test the pipeline');
    
    console.log('\n   🎯 Long-term Solution:');
    console.log('   1. Install Node.js on Jenkins server');
    console.log('   2. Configure Jenkins tools');
    console.log('   3. Set up proper build environment');
    console.log('   4. Add monitoring and logging');
    
    console.log('\n   📞 Commands to run on Jenkins server:');
    console.log('   ```bash');
    console.log('   # Install Node.js 20.x');
    console.log('   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -');
    console.log('   sudo apt-get install -y nodejs');
    console.log('');
    console.log('   # Verify installation');
    console.log('   node --version');
    console.log('   npm --version');
    console.log('');
    console.log('   # Restart Jenkins');
    console.log('   sudo systemctl restart jenkins');
    console.log('   ```');
    
    console.log('\n   🔧 Jenkins Configuration:');
    console.log('   1. Go to Jenkins > Manage Jenkins > Global Tool Configuration');
    console.log('   2. Add Node.js installation');
    console.log('   3. Configure Node.js version 20.x');
    console.log('   4. Save configuration');
    
    console.log('\n   🚀 After Fix:');
    console.log('   1. Trigger a new build');
    console.log('   2. Monitor the build logs');
    console.log('   3. Verify all stages complete successfully');
    console.log('   4. Check application deployment');
  }
}

// Run the fix
const fix = new JenkinsNodeJSFix();
fix.provideSolutions().catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
}); 