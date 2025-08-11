#!/usr/bin/env node

/**
 * Secret Verification Script for WasteWise-30
 * 
 * This script verifies that all required secrets are properly loaded
 * in the deployed containers.
 */

import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);

const REQUIRED_SECRETS = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'GEMINI_API_KEY',
    'OPENAI_API_KEY',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'DATABASE_URL'
];

const OPTIONAL_SECRETS = [
    'SMTP_USER',
    'SMTP_PASS',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
];

async function checkContainerSecrets(containerName) {
    console.log(`\n🔍 Checking secrets in ${containerName}...`);
    
    try {
        // Get environment variables from container
        const { stdout } = await execAsync(`docker exec ${containerName} env`);
        const envVars = stdout.split('\n').reduce((acc, line) => {
            const [key, value] = line.split('=');
            if (key && value) {
                acc[key] = value;
            }
            return acc;
        }, {});

        // Check required secrets
        const missingRequired = [];
        const presentRequired = [];
        
        REQUIRED_SECRETS.forEach(secret => {
            if (envVars[secret]) {
                const maskedValue = envVars[secret].substring(0, 8) + '...';
                presentRequired.push(`${secret}=${maskedValue}`);
            } else {
                missingRequired.push(secret);
            }
        });

        // Check optional secrets
        const missingOptional = [];
        const presentOptional = [];
        
        OPTIONAL_SECRETS.forEach(secret => {
            if (envVars[secret]) {
                const maskedValue = envVars[secret].substring(0, 8) + '...';
                presentOptional.push(`${secret}=${maskedValue}`);
            } else {
                missingOptional.push(secret);
            }
        });

        // Report results
        if (presentRequired.length > 0) {
            console.log(`✅ Required secrets found (${presentRequired.length}/${REQUIRED_SECRETS.length}):`);
            presentRequired.forEach(secret => console.log(`   ${secret}`));
        }

        if (missingRequired.length > 0) {
            console.log(`❌ Missing required secrets (${missingRequired.length}/${REQUIRED_SECRETS.length}):`);
            missingRequired.forEach(secret => console.log(`   ${secret}`));
        }

        if (presentOptional.length > 0) {
            console.log(`ℹ️  Optional secrets found (${presentOptional.length}/${OPTIONAL_SECRETS.length}):`);
            presentOptional.forEach(secret => console.log(`   ${secret}`));
        }

        if (missingOptional.length > 0) {
            console.log(`⚠️  Missing optional secrets (${missingOptional.length}/${OPTIONAL_SECRETS.length}):`);
            missingOptional.forEach(secret => console.log(`   ${secret}`));
        }

        return {
            container: containerName,
            required: { present: presentRequired.length, missing: missingRequired.length, total: REQUIRED_SECRETS.length },
            optional: { present: presentOptional.length, missing: missingOptional.length, total: OPTIONAL_SECRETS.length },
            allRequiredPresent: missingRequired.length === 0
        };

    } catch (error) {
        console.log(`❌ Error checking ${containerName}: ${error.message}`);
        return {
            container: containerName,
            error: error.message,
            allRequiredPresent: false
        };
    }
}

async function checkContainerHealth(containerName) {
    console.log(`\n🏥 Checking health of ${containerName}...`);
    
    try {
        const { stdout } = await execAsync(`docker inspect ${containerName} --format='{{.State.Health.Status}}'`);
        const healthStatus = stdout.trim();
        
        if (healthStatus === 'healthy') {
            console.log(`✅ ${containerName} is healthy`);
            return true;
        } else if (healthStatus === 'unhealthy') {
            console.log(`❌ ${containerName} is unhealthy`);
            return false;
        } else {
            console.log(`⚠️  ${containerName} health status: ${healthStatus}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error checking health of ${containerName}: ${error.message}`);
        return false;
    }
}

async function checkContainerLogs(containerName, lines = 10) {
    console.log(`\n📋 Recent logs from ${containerName}:`);
    
    try {
        const { stdout } = await execAsync(`docker logs --tail=${lines} ${containerName}`);
        console.log(stdout);
    } catch (error) {
        console.log(`❌ Error getting logs from ${containerName}: ${error.message}`);
    }
}

async function main() {
    console.log('🔐 WasteWise-30 Secret Verification Script');
    console.log('==========================================');

    const containers = ['wastewise-backend', 'wastewise-frontend'];
    const results = [];

    for (const container of containers) {
        // Check if container exists and is running
        try {
            const { stdout } = await execAsync(`docker ps --filter name=${container} --format='{{.Names}}'`);
            if (!stdout.trim()) {
                console.log(`\n❌ Container ${container} is not running`);
                continue;
            }
        } catch (error) {
            console.log(`\n❌ Error checking container ${container}: ${error.message}`);
            continue;
        }

        // Check secrets
        const secretResult = await checkContainerSecrets(container);
        results.push(secretResult);

        // Check health
        await checkContainerHealth(container);

        // Show recent logs
        await checkContainerLogs(container);
    }

    // Summary
    console.log('\n📊 SUMMARY');
    console.log('==========');
    
    const allRequiredPresent = results.every(r => r.allRequiredPresent);
    const totalRequired = results.reduce((sum, r) => sum + (r.required?.total || 0), 0);
    const totalPresent = results.reduce((sum, r) => sum + (r.required?.present || 0), 0);

    if (allRequiredPresent) {
        console.log('✅ All required secrets are present in all containers!');
    } else {
        console.log('❌ Some required secrets are missing from containers');
    }

    console.log(`📈 Secret Coverage: ${totalPresent}/${totalRequired} (${Math.round((totalPresent/totalRequired)*100)}%)`);

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (!allRequiredPresent) {
        console.log('1. Check Jenkins credentials configuration');
        console.log('2. Verify .env file is properly created on the deployment host');
        console.log('3. Ensure docker-compose.yml is mounting the .env file correctly');
        console.log('4. Check container logs for any environment loading errors');
    } else {
        console.log('1. All secrets are properly configured!');
        console.log('2. Consider enabling optional services if needed');
        console.log('3. Monitor application logs for any runtime issues');
    }
}

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { checkContainerSecrets, checkContainerHealth, checkContainerLogs };
