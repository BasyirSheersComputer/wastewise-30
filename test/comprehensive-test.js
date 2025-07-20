#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

class ComprehensiveTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
    this.backendProcess = null;
    this.frontendProcess = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async test(title, testFn) {
    try {
      this.log(`Testing: ${title}`, 'test');
      await testFn();
      this.results.passed++;
      this.log(`PASSED: ${title}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ title, error: error.message });
      this.log(`FAILED: ${title} - ${error.message}`, 'error');
    }
  }

  // File Structure Tests
  async testFileStructure() {
    const requiredFiles = [
      'package.json',
      'frontend/package.json',
      'backend/package.json',
      'frontend/index.html',
      'frontend/main.tsx',
      'frontend/App.tsx',
      'frontend/config.ts',
      'backend/index.js',
      'frontend/.env',
      'backend/.env',
      'scripts/start-dev.js',
      'Dockerfile',
      'nginx.conf',
      'start.sh',
      'Jenkinsfile'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
  }

  async testPackageJsonFiles() {
    const packageFiles = ['package.json', 'frontend/package.json', 'backend/package.json'];
    
    for (const file of packageFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const pkg = JSON.parse(content);
      
      if (!pkg.name || !pkg.version) {
        throw new Error(`Invalid package.json: ${file}`);
      }
    }
  }

  async testDependencies() {
    const nodeModulesPaths = ['node_modules', 'frontend/node_modules'];
    
    for (const path of nodeModulesPaths) {
      if (!fs.existsSync(path)) {
        throw new Error(`Missing node_modules: ${path}`);
      }
    }
  }

  async testEnvironmentFiles() {
    const envFiles = [
      { path: 'frontend/.env', required: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] },
      { path: 'backend/.env', required: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] }
    ];
    
    for (const file of envFiles) {
      if (!fs.existsSync(file.path)) {
        throw new Error(`Missing environment file: ${file.path}`);
      }
      
      const content = fs.readFileSync(file.path, 'utf8').replace(/\r\n/g, '\n');
      for (const required of file.required) {
        if (!content.includes(required)) {
          throw new Error(`Missing required environment variable ${required} in ${file.path}`);
        }
      }
    }
  }

  // Build Tests
  async testFrontendBuild() {
    this.log('Building frontend...', 'info');
    execSync('cd frontend && npm run build', { stdio: 'pipe' });
    
    if (!fs.existsSync('frontend/dist')) {
      throw new Error('Frontend build failed - dist directory not created');
    }
    
    if (!fs.existsSync('frontend/dist/index.html')) {
      throw new Error('Frontend build failed - index.html not generated');
    }
  }

  async testBackendSyntax() {
    this.log('Checking backend syntax...', 'info');
    execSync('cd backend && node -c index.js', { stdio: 'pipe' });
    execSync('cd backend && node -c db.js', { stdio: 'pipe' });
    execSync('cd backend && node -c analytics.js', { stdio: 'pipe' });
    execSync('cd backend && node -c recommendations.js', { stdio: 'pipe' });
  }

  // Runtime Tests
  async startBackend() {
    return new Promise((resolve, reject) => {
      this.backendProcess = spawn('node', ['index.js'], {
        cwd: './backend',
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      this.backendProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Backend (HTTP+WS) running on port')) {
          resolve();
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

      this.backendProcess.on('error', reject);
      
      // Timeout after 15 seconds
      setTimeout(() => {
        if (!output.includes('Backend (HTTP+WS) running on port')) {
          reject(new Error('Backend failed to start within 15 seconds'));
        }
      }, 15000);
    });
  }

  async testBackendAPI() {
    return new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000/test', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.message === 'Backend is working!') {
              resolve();
            } else {
              reject(new Error('Invalid API response'));
            }
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('API request timeout')));
    });
  }

  async testWebSocketConnection() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://localhost:3000/inventory');
      
      ws.on('open', () => {
        ws.close();
        resolve();
      });
      
      ws.on('error', reject);
      
      // Set timeout using setTimeout instead of ws.setTimeout
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 5000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve();
      });
    });
  }

  async testEventSourceConnection() {
    return new Promise((resolve, reject) => {
      const req = http.get('http://localhost:3000/stream/analytics?section=dashboard', (res) => {
        if (res.statusCode === 200 && res.headers['content-type']?.includes('text/event-stream')) {
          resolve();
        } else {
          reject(new Error('Invalid EventSource response'));
        }
      });

      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('EventSource request timeout')));
    });
  }

  async startFrontend() {
    return new Promise((resolve, reject) => {
      // Use the full path to npm
      const npmPath = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      this.frontendProcess = spawn(npmPath, ['run', 'dev'], {
        cwd: './frontend',
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      this.frontendProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Local:') && output.includes('http://localhost:')) {
          resolve();
        }
      });

      this.frontendProcess.stderr.on('data', (data) => {
        output += data.toString();
      });

      this.frontendProcess.on('error', reject);
      
      // Timeout after 15 seconds
      setTimeout(() => {
        if (!output.includes('Local:')) {
          reject(new Error('Frontend failed to start within 15 seconds'));
        }
      }, 15000);
    });
  }

  // Configuration Tests
  async testViteConfig() {
    const configPath = 'frontend/vite.config.ts';
    if (!fs.existsSync(configPath)) {
      throw new Error('Vite config file missing');
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    if (!content.includes('defineConfig')) {
      throw new Error('Invalid Vite config');
    }
  }

  async testTypeScriptConfig() {
    const configFiles = ['frontend/tsconfig.app.json', 'frontend/tsconfig.node.json'];
    
    for (const file of configFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`TypeScript config missing: ${file}`);
      }
      
      const content = fs.readFileSync(file, 'utf8');
      const config = JSON.parse(content);
      
      if (!config.compilerOptions) {
        throw new Error(`Invalid TypeScript config: ${file}`);
      }
    }
    
    // Check that the root tsconfig.json exists and is valid
    if (!fs.existsSync('frontend/tsconfig.json')) {
      throw new Error('Root TypeScript config missing: frontend/tsconfig.json');
    }
    
    const rootContent = fs.readFileSync('frontend/tsconfig.json', 'utf8');
    const rootConfig = JSON.parse(rootContent);
    
    if (!rootConfig.references) {
      throw new Error('Invalid root TypeScript config: missing references');
    }
  }

  async testTailwindConfig() {
    const configPath = 'frontend/tailwind.config.js';
    if (!fs.existsSync(configPath)) {
      throw new Error('Tailwind config file missing');
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    if (!content.includes('content:')) {
      throw new Error('Invalid Tailwind config');
    }
  }

  // Docker Tests
  async testDockerfile() {
    const dockerfilePath = 'Dockerfile';
    if (!fs.existsSync(dockerfilePath)) {
      throw new Error('Dockerfile missing');
    }
    
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    if (!content.includes('FROM node:') || !content.includes('COPY')) {
      throw new Error('Invalid Dockerfile');
    }
  }

  async testNginxConfig() {
    const nginxPath = 'nginx.conf';
    if (!fs.existsSync(nginxPath)) {
      throw new Error('Nginx config missing');
    }
    
    const content = fs.readFileSync(nginxPath, 'utf8');
    if (!content.includes('server {') || !content.includes('location /')) {
      throw new Error('Invalid Nginx config');
    }
  }

  // Cleanup
  async cleanup() {
    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
    }
    if (this.frontendProcess) {
      this.frontendProcess.kill('SIGTERM');
    }
  }

  // Main test runner
  async runAllTests() {
    this.log('🚀 Starting Comprehensive WasteWise 30 Test Suite', 'info');
    this.log('================================================', 'info');

    // File Structure Tests
    await this.test('File Structure Validation', () => this.testFileStructure());
    await this.test('Package.json Files Validation', () => this.testPackageJsonFiles());
    await this.test('Dependencies Installation', () => this.testDependencies());
    await this.test('Environment Files', () => this.testEnvironmentFiles());

    // Configuration Tests
    await this.test('Vite Configuration', () => this.testViteConfig());
    await this.test('TypeScript Configuration', () => this.testTypeScriptConfig());
    await this.test('Tailwind Configuration', () => this.testTailwindConfig());
    await this.test('Dockerfile Validation', () => this.testDockerfile());
    await this.test('Nginx Configuration', () => this.testNginxConfig());

    // Build Tests
    await this.test('Frontend Build Process', () => this.testFrontendBuild());
    await this.test('Backend Syntax Check', () => this.testBackendSyntax());

    // Runtime Tests
    await this.test('Backend Server Startup', () => this.startBackend());
    await this.test('Backend API Endpoint', () => this.testBackendAPI());
    await this.test('WebSocket Connection', () => this.testWebSocketConnection());
    await this.test('EventSource Connection', () => this.testEventSourceConnection());
    await this.test('Frontend Development Server', () => this.startFrontend());

    // Results
    this.log('================================================', 'info');
    this.log(`Test Results: ${this.results.passed} passed, ${this.results.failed} failed`, 
             this.results.failed === 0 ? 'success' : 'error');

    if (this.results.errors.length > 0) {
      this.log('Failed Tests:', 'error');
      this.results.errors.forEach(error => {
        this.log(`  - ${error.title}: ${error.error}`, 'error');
      });
    }

    await this.cleanup();
    
    if (this.results.failed === 0) {
      this.log('🎉 All tests passed! System is ready for development.', 'success');
      process.exit(0);
    } else {
      this.log('❌ Some tests failed. Please fix the issues above.', 'error');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new ComprehensiveTest();
tester.runAllTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
}); 