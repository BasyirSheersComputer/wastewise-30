/**
 * Start Server and Run Tests
 * Starts the backend server, waits for it to be ready, then runs integration tests
 */

import { spawn } from 'child_process';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';
const MAX_WAIT_TIME = 30000; // 30 seconds
const CHECK_INTERVAL = 1000; // 1 second

let serverProcess = null;

/**
 * Check if server is ready
 */
async function checkServerReady() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Wait for server to be ready
 */
async function waitForServer() {
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    if (await checkServerReady()) {
      console.log('✅ Server is ready!\n');
      return true;
    }
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
  
  console.log('\n❌ Server did not start in time');
  return false;
}

/**
 * Start backend server
 */
function startServer() {
  console.log('🚀 Starting backend server...');
  
  serverProcess = spawn('node', ['index.js'], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('listening on port')) {
      console.log(`   ${output.trim()}`);
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (!output.includes('WARN') && !output.includes('⚠️')) {
      console.error(`   Error: ${output.trim()}`);
    }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });
}

/**
 * Run integration tests
 */
async function runTests() {
  console.log('\n🧪 Running integration tests...\n');
  
  return new Promise((resolve) => {
    const testProcess = spawn('node', ['test-all-systems.js'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    });

    testProcess.on('exit', (code) => {
      resolve(code);
    });
  });
}

/**
 * Cleanup
 */
function cleanup() {
  if (serverProcess) {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill();
  }
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

/**
 * Main execution
 */
async function main() {
  try {
    startServer();
    
    console.log('⏳ Waiting for server to be ready');
    const ready = await waitForServer();
    
    if (!ready) {
      cleanup();
      return;
    }
    
    const testCode = await runTests();
    
    cleanup();
    process.exit(testCode);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    cleanup();
    process.exit(1);
  }
}

main();

