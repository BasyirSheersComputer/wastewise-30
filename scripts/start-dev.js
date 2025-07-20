#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close();
      resolve(false);
    });
    server.on('error', () => {
      resolve(true);
    });
  });
}

// Function to kill process on a port
async function killProcessOnPort(port) {
  try {
    const { execSync } = require('child_process');
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = output.split('\n').filter(line => line.includes('LISTENING'));
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        console.log(`Killing process ${pid} on port ${port}...`);
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      }
    }
  } catch (error) {
    // Ignore errors if no process found
  }
}

// Function to start a process
function startProcess(command, args, cwd, name) {
  console.log(`Starting ${name}...`);
  
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error(`Error starting ${name}:`, error);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
}

// Main function
async function main() {
  console.log('🚀 Starting WasteWise 30 Development Environment...\n');

  // Check and clear ports if needed
  const backendPort = 3000;
  const frontendPort = 5173;

  console.log('Checking for port conflicts...');
  
  if (await isPortInUse(backendPort)) {
    console.log(`Port ${backendPort} is in use, attempting to free it...`);
    await killProcessOnPort(backendPort);
  }

  if (await isPortInUse(frontendPort)) {
    console.log(`Port ${frontendPort} is in use, attempting to free it...`);
    await killProcessOnPort(frontendPort);
  }

  console.log('Ports are available!\n');

  // Start backend
  const backend = startProcess('npm', ['run', 'dev'], './backend', 'Backend');

  // Wait a moment for backend to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Start frontend
  const frontend = startProcess('npm', ['run', 'dev'], './frontend', 'Frontend');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    process.exit(0);
  });
}

main().catch(console.error); 