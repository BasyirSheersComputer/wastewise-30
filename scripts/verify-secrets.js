#!/usr/bin/env node

const { execSync } = require('child_process');

const PROJECT_ID = '451983642521';
const FRONTEND_SECRET = 'wastewise-30-secret';
const BACKEND_SECRET = 'wastewise-30-secret-backend';

console.log('🔐 Verifying Google Secret Manager Secrets');
console.log('==========================================\n');

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(`Error: ${error.message}`);
    return null;
  }
}

function checkSecret(secretName, description) {
  console.log(`📋 Checking ${description} (${secretName})...`);
  
  // Check if secret exists
  const listResult = runCommand(`gcloud secrets list --filter="name:${secretName}" --project=${PROJECT_ID}`);
  
  if (!listResult || !listResult.includes(secretName)) {
    console.log(`❌ Secret ${secretName} does not exist`);
    return false;
  }
  
  console.log(`✅ Secret ${secretName} exists`);
  
  // Get the latest version
  const versionResult = runCommand(`gcloud secrets versions list ${secretName} --project=${PROJECT_ID} --limit=1`);
  
  if (!versionResult) {
    console.log(`❌ Could not get version info for ${secretName}`);
    return false;
  }
  
  console.log(`📅 Latest version info:\n${versionResult}`);
  
  // Try to access the secret content (this will be masked for security)
  const accessResult = runCommand(`gcloud secrets versions access latest --secret=${secretName} --project=${PROJECT_ID}`);
  
  if (!accessResult) {
    console.log(`❌ Could not access secret content for ${secretName}`);
    return false;
  }
  
  console.log(`✅ Secret content is accessible (${accessResult.length} characters)`);
  console.log(`📄 Content preview: ${accessResult.substring(0, 100)}...`);
  
  return true;
}

function createOrUpdateSecret(secretName, description, content) {
  console.log(`\n🔧 Creating/Updating ${description} (${secretName})...`);
  
  // Check if secret exists
  const listResult = runCommand(`gcloud secrets list --filter="name:${secretName}" --project=${PROJECT_ID}`);
  
  if (!listResult || !listResult.includes(secretName)) {
    console.log(`📝 Creating new secret: ${secretName}`);
    const createResult = runCommand(`echo -n "${content}" | gcloud secrets create ${secretName} --data-file=- --project=${PROJECT_ID}`);
    
    if (!createResult) {
      console.log(`❌ Failed to create secret ${secretName}`);
      return false;
    }
    
    console.log(`✅ Secret ${secretName} created successfully`);
  } else {
    console.log(`📝 Updating existing secret: ${secretName}`);
    const updateResult = runCommand(`echo -n "${content}" | gcloud secrets versions add ${secretName} --data-file=- --project=${PROJECT_ID}`);
    
    if (!updateResult) {
      console.log(`❌ Failed to update secret ${secretName}`);
      return false;
    }
    
    console.log(`✅ Secret ${secretName} updated successfully`);
  }
  
  return true;
}

async function main() {
  console.log('🔍 Checking existing secrets...\n');
  
  const frontendExists = checkSecret(FRONTEND_SECRET, 'Frontend Secret');
  const backendExists = checkSecret(BACKEND_SECRET, 'Backend Secret');
  
  console.log('\n' + '='.repeat(50));
  console.log('📝 SECRET SETUP INSTRUCTIONS');
  console.log('='.repeat(50));
  
  if (!frontendExists) {
    console.log('\n🔧 Frontend Secret Setup Required:');
    console.log('The frontend secret should contain:');
    console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
    console.log('VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key');
    
    const frontendContent = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key`;
    
    console.log('\n💡 To create the frontend secret, run:');
    console.log(`echo -n "${frontendContent}" | gcloud secrets create ${FRONTEND_SECRET} --data-file=- --project=${PROJECT_ID}`);
  }
  
  if (!backendExists) {
    console.log('\n🔧 Backend Secret Setup Required:');
    console.log('The backend secret should contain:');
    console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
    
    const backendContent = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`;
    
    console.log('\n💡 To create the backend secret, run:');
    console.log(`echo -n "${backendContent}" | gcloud secrets create ${BACKEND_SECRET} --data-file=- --project=${PROJECT_ID}`);
  }
  
  if (frontendExists && backendExists) {
    console.log('\n✅ Both secrets exist!');
    console.log('If you\'re still having issues, the secret content might be incorrect.');
    console.log('\n🔍 To check secret content (will be masked):');
    console.log(`gcloud secrets versions access latest --secret=${FRONTEND_SECRET} --project=${PROJECT_ID}`);
    console.log(`gcloud secrets versions access latest --secret=${BACKEND_SECRET} --project=${PROJECT_ID}`);
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Update the secret content with your actual Supabase credentials');
  console.log('2. Trigger a new Cloud Build deployment');
  console.log('3. Check the build logs for the secret parsing debug output');
  
  console.log('\n📋 Example secret content format:');
  console.log('Frontend Secret:');
  console.log('VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123DEF456...');
  
  console.log('\nBackend Secret:');
  console.log('VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
}

main().catch(console.error);
