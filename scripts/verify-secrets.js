#!/usr/bin/env node

/**
 * Secret Verification Script for WasteWise-30
 * Verifies that all required secrets are properly configured in Cloud Run
 */

const https = require('https');

const BACKEND_URL = 'https://wastewise-backend-451983642521.asia-southeast1.run.app';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => req.destroy());
    req.end();
  });
}

async function checkHealth() {
  log('\n🔍 Checking Backend Health...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/health`);
    if (response.status === 200) {
      log('✅ Backend is healthy and responding', 'green');
      log(`   Environment: ${response.data.environment}`, 'blue');
      log(`   Version: ${response.data.version}`, 'blue');
      return true;
    } else {
      log(`❌ Backend health check failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend health check error: ${error.message}`, 'red');
    return false;
  }
}

async function checkDatabaseConnection() {
  log('\n🗄️  Checking Database Connection...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/test-db`);
    if (response.status === 200) {
      const data = response.data;
      log(`✅ Database connection: ${data.status}`, 'green');
      log(`   Connection URL: ${data.connection.url}`, 'blue');
      log(`   Connection Key: ${data.connection.key}`, 'blue');
      log(`   Tests Passed: ${data.summary.passed}/${data.summary.total} (${data.summary.percentage}%)`, 'blue');
      
      if (data.summary.percentage < 100) {
        log('⚠️  Some database tests failed:', 'yellow');
        Object.entries(data.tests).forEach(([test, passed]) => {
          log(`   ${test}: ${passed ? '✅' : '❌'}`, passed ? 'green' : 'red');
        });
      }
      
      return data.summary.percentage >= 75; // At least 75% of tests should pass
    } else {
      log(`❌ Database test failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Database test error: ${error.message}`, 'red');
    return false;
  }
}

async function checkAIService() {
  log('\n🤖 Checking AI Service...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/dashboard/overview`);
    if (response.status === 200) {
      const data = response.data;
      
      if (data.recommendations && data.recommendations.includes('Error getting recommendations from AI service')) {
        log('❌ AI service is failing', 'red');
        log('   This indicates missing or invalid API keys', 'yellow');
        return false;
      } else if (data.recommendations) {
        log('✅ AI service is working', 'green');
        log(`   Recommendations: ${data.recommendations.substring(0, 100)}...`, 'blue');
        return true;
      } else {
        log('⚠️  AI service status unclear', 'yellow');
        return false;
      }
    } else {
      log(`❌ AI service test failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ AI service test error: ${error.message}`, 'red');
    return false;
  }
}

async function checkTestEndpoint() {
  log('\n🧪 Checking Test Endpoint...', 'blue');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/test`);
    if (response.status === 200) {
      const data = response.data;
      log('✅ Test endpoint is working', 'green');
      log(`   Supabase URL: ${data.supabaseUrl}`, 'blue');
      log(`   Gemini API Key: ${data.geminiApiKey}`, 'blue');
      log(`   OpenAI API Key: ${data.openaiApiKey}`, 'blue');
      return true;
    } else {
      log(`❌ Test endpoint failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Test endpoint error: ${error.message}`, 'red');
    return false;
  }
}

async function generateReport(results) {
  log('\n' + '='.repeat(60), 'bold');
  log('📊 SECRET VERIFICATION REPORT', 'bold');
  log('='.repeat(60), 'bold');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const percentage = Math.round((passedTests / totalTests) * 100);
  
  log(`\nOverall Status: ${passedTests}/${totalTests} tests passed (${percentage}%)`, percentage >= 75 ? 'green' : 'red');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`   ${test}: ${status}`, color);
  });
  
  log('\n' + '='.repeat(60), 'bold');
  
  if (percentage >= 75) {
    log('🎉 Most secrets are working correctly!', 'green');
    if (!results.aiService) {
      log('\n⚠️  AI Service Issues:', 'yellow');
      log('   - Check if Gemini API key is configured in Secret Manager', 'yellow');
      log('   - Verify the secret name is "gemini-api-key"', 'yellow');
      log('   - Ensure the API key is valid and has sufficient quota', 'yellow');
    }
  } else {
    log('❌ Multiple issues detected with secret configuration', 'red');
    log('\n🔧 Recommended Actions:', 'yellow');
    log('   1. Run the setup-individual-secrets.sh script to create missing secrets', 'yellow');
    log('   2. Verify all required secrets exist in Secret Manager', 'yellow');
    log('   3. Check Cloud Run service configuration', 'yellow');
    log('   4. Review deployment logs for errors', 'yellow');
  }
  
  log('\n📋 Next Steps:', 'blue');
  log('   1. If AI service is failing, add your Gemini API key:', 'blue');
  log('      gcloud secrets versions add gemini-api-key --data-file=- <<< "your-api-key"', 'blue');
  log('   2. Redeploy the service after adding secrets:', 'blue');
  log('      gcloud builds submit --config=cloudbuild.yaml .', 'blue');
  log('   3. Check Cloud Run logs for detailed error messages:', 'blue');
  log('      gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=wastewise-backend" --limit=10', 'blue');
}

async function main() {
  log('🔐 WasteWise-30 Secret Verification Tool', 'bold');
  log('Checking secrets configuration in Cloud Run...', 'blue');
  
  const results = {
    health: await checkHealth(),
    database: await checkDatabaseConnection(),
    aiService: await checkAIService(),
    testEndpoint: await checkTestEndpoint()
  };
  
  await generateReport(results);
}

// Run the verification
main().catch(error => {
  log(`\n❌ Verification failed: ${error.message}`, 'red');
  process.exit(1);
});
