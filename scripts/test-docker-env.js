#!/usr/bin/env node

/**
 * Test script to verify Docker environment variable configuration
 * This script checks if required environment variables are set and validates their format
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
        log('❌ .env file not found!', 'red');
        log('Please create .env file from template:', 'yellow');
        log('cp config/environment/docker.env.example .env', 'blue');
        return false;
    }
    
    log('✅ .env file found', 'green');
    return true;
}

function validateEnvVariables() {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const variables = {};
    
    // Parse .env file
    lines.forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                variables[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    
    // Required variables for frontend build
    const frontendVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
        'VITE_API_BASE_URL'
    ];
    
    // Required variables for backend runtime
    const backendVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'JWT_SECRET'
    ];
    
    log('\n🔍 Validating Frontend Build Variables:', 'blue');
    let frontendValid = true;
    frontendVars.forEach(varName => {
        const value = variables[varName];
        if (!value || value === 'your-anon-key-here' || value.includes('placeholder')) {
            log(`❌ ${varName}: Not set or using placeholder value`, 'red');
            frontendValid = false;
        } else {
            log(`✅ ${varName}: Set`, 'green');
        }
    });
    
    log('\n🔍 Validating Backend Runtime Variables:', 'blue');
    let backendValid = true;
    backendVars.forEach(varName => {
        const value = variables[varName];
        if (!value || value === 'your-anon-key-here' || value.includes('placeholder')) {
            log(`❌ ${varName}: Not set or using placeholder value`, 'red');
            backendValid = false;
        } else {
            log(`✅ ${varName}: Set`, 'green');
        }
    });
    
    // Check for common issues
    log('\n🔍 Checking for Common Issues:', 'blue');
    
    if (variables.VITE_SUPABASE_URL && !variables.VITE_SUPABASE_URL.includes('supabase.co')) {
        log('⚠️  VITE_SUPABASE_URL: May not be a valid Supabase URL', 'yellow');
    }
    
    if (variables.VITE_API_BASE_URL && variables.VITE_API_BASE_URL.includes('localhost')) {
        log('⚠️  VITE_API_BASE_URL: Using localhost - ensure this is correct for Docker', 'yellow');
    }
    
    if (variables.JWT_SECRET && variables.JWT_SECRET.length < 32) {
        log('⚠️  JWT_SECRET: Should be at least 32 characters for security', 'yellow');
    }
    
    return frontendValid && backendValid;
}

function checkDockerFiles() {
    log('\n🔍 Checking Docker Configuration:', 'blue');
    
    const dockerFiles = [
        'Dockerfile.frontend',
        'Dockerfile.backend',
        'docker-compose.yml'
    ];
    
    let allExist = true;
    dockerFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✅ ${file}: Found`, 'green');
        } else {
            log(`❌ ${file}: Not found`, 'red');
            allExist = false;
        }
    });
    
    return allExist;
}

function checkBuildScripts() {
    log('\n🔍 Checking Build Scripts:', 'blue');
    
    const scripts = [
        'scripts/build-docker.sh',
        'scripts/build-docker.ps1'
    ];
    
    let allExist = true;
    scripts.forEach(script => {
        if (fs.existsSync(script)) {
            log(`✅ ${script}: Found`, 'green');
        } else {
            log(`❌ ${script}: Not found`, 'red');
            allExist = false;
        }
    });
    
    return allExist;
}

function main() {
    log('🚀 Docker Environment Variable Test', 'blue');
    log('=====================================\n', 'blue');
    
    let allChecksPassed = true;
    
    // Check if .env file exists
    if (!checkEnvFile()) {
        allChecksPassed = false;
    }
    
    // Check Docker files
    if (!checkDockerFiles()) {
        allChecksPassed = false;
    }
    
    // Check build scripts
    if (!checkBuildScripts()) {
        allChecksPassed = false;
    }
    
    // Validate environment variables
    if (allChecksPassed) {
        if (!validateEnvVariables()) {
            allChecksPassed = false;
        }
    }
    
    log('\n📋 Summary:', 'blue');
    if (allChecksPassed) {
        log('✅ All checks passed! Your Docker environment is properly configured.', 'green');
        log('\nNext steps:', 'blue');
        log('1. Run: ./scripts/build-docker.sh (Linux/macOS) or .\\scripts\\build-docker.ps1 (Windows)', 'blue');
        log('2. Run: docker-compose up -d', 'blue');
    } else {
        log('❌ Some checks failed. Please fix the issues above before building Docker images.', 'red');
        log('\nFor detailed setup instructions, see: docs/deployment/DOCKER_ENVIRONMENT_SETUP.md', 'yellow');
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    checkEnvFile,
    validateEnvVariables,
    checkDockerFiles,
    checkBuildScripts
};
