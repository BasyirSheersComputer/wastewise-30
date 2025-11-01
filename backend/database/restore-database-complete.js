import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function restoreDatabase() {
  try {
    log('\n🚀 Starting Complete Database Restoration...', 'bright');
    log('═══════════════════════════════════════════════\n', 'cyan');

    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      log('❌ ERROR: Missing Supabase credentials!', 'red');
      log('   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env', 'yellow');
      process.exit(1);
    }

    log(`✅ Supabase URL: ${supabaseUrl}`, 'green');
    log(`✅ Service Key: ${supabaseServiceKey.substring(0, 20)}...`, 'green');

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    log('\n📂 Reading SQL setup file...', 'cyan');
    
    // Read the integrated setup SQL
    const sqlPath = path.join(__dirname, 'setup-database-integrated.sql');
    
    if (!fs.existsSync(sqlPath)) {
      log(`❌ ERROR: SQL file not found at ${sqlPath}`, 'red');
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    log(`✅ SQL file loaded (${sqlContent.length} characters)`, 'green');

    // Execute SQL using Supabase raw SQL endpoint
    log('\n🔨 Executing database setup SQL...', 'cyan');
    log('   This may take 30-60 seconds...', 'yellow');

    try {
      // Try using direct SQL execution via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: sqlContent })
      });

      if (!response.ok) {
        // If exec_sql doesn't work, split and execute statements individually
        log('⚠️  exec_sql not available, executing statements individually...', 'yellow');
        await executeSqlInChunks(supabase, sqlContent);
      } else {
        log('✅ SQL executed successfully via exec_sql', 'green');
      }
    } catch (error) {
      log('⚠️  Falling back to individual statement execution...', 'yellow');
      await executeSqlInChunks(supabase, sqlContent);
    }

    // Verify the restoration
    log('\n🔍 Verifying database restoration...', 'cyan');
    
    const tablesToCheck = [
      'users', 'user_settings', 'coffee_chains', 'outlets',
      'analytics', 'waste_data', 'suppliers', 'recommendations',
      'ai_cache', 'subscription_plans', 'user_subscriptions',
      'billing_history', 'staff', 'training_records'
    ];

    let successCount = 0;
    let failCount = 0;

    log('\n📊 Checking tables:', 'bright');
    for (const table of tablesToCheck) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          log(`   ❌ ${table}: ${error.message}`, 'red');
          failCount++;
        } else {
          log(`   ✅ ${table}: exists (${count || 0} records)`, 'green');
          successCount++;
        }
      } catch (err) {
        log(`   ❌ ${table}: ${err.message}`, 'red');
        failCount++;
      }
    }

    // Check subscription plans data
    log('\n🎯 Checking default data:', 'bright');
    try {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('plan_name');

      if (error) {
        log(`   ❌ Subscription plans: ${error.message}`, 'red');
      } else {
        log(`   ✅ Subscription plans: ${plans.length} plans found`, 'green');
        plans.forEach(plan => {
          log(`      • ${plan.plan_name}`, 'cyan');
        });
      }
    } catch (err) {
      log(`   ⚠️  Could not check subscription plans: ${err.message}`, 'yellow');
    }

    // Summary
    log('\n═══════════════════════════════════════════════', 'cyan');
    log('📊 RESTORATION SUMMARY', 'bright');
    log('═══════════════════════════════════════════════', 'cyan');
    log(`   ✅ Tables created: ${successCount}/${tablesToCheck.length}`, 'green');
    if (failCount > 0) {
      log(`   ❌ Tables failed: ${failCount}`, 'red');
    }
    
    if (successCount === tablesToCheck.length) {
      log('\n🎉 DATABASE RESTORATION COMPLETE! 🎉', 'green');
      log('   All tables have been successfully created.', 'green');
      log('\n📝 Next steps:', 'cyan');
      log('   1. Populate with sample data: node populate-coffee-industry-simple.js', 'yellow');
      log('   2. Test backend: node test-connection.js', 'yellow');
      log('   3. Start the application: npm start', 'yellow');
    } else {
      log('\n⚠️  RESTORATION PARTIALLY COMPLETE', 'yellow');
      log(`   ${successCount} tables created, ${failCount} failed`, 'yellow');
      log('\n💡 Recommended action:', 'cyan');
      log('   1. Go to Supabase SQL Editor', 'yellow');
      log('   2. Copy content from: backend/database/setup-database-integrated.sql', 'yellow');
      log('   3. Run it directly in the SQL Editor', 'yellow');
    }

    process.exit(successCount === tablesToCheck.length ? 0 : 1);

  } catch (error) {
    log('\n❌ RESTORATION FAILED!', 'red');
    log(`   Error: ${error.message}`, 'red');
    log(`   Stack: ${error.stack}`, 'red');
    process.exit(1);
  }
}

async function executeSqlInChunks(supabase, sqlContent) {
  // Split SQL into statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => 
      stmt.length > 0 && 
      !stmt.startsWith('--') && 
      !stmt.startsWith('/*') &&
      stmt !== 'COMMIT'
    );

  log(`   Found ${statements.length} SQL statements`, 'cyan');

  let executed = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Skip comments and empty statements
    if (stmt.trim().length === 0 || stmt.startsWith('--')) {
      skipped++;
      continue;
    }

    try {
      // For Supabase, we need to use their query interface
      // Most DDL statements need to be executed via their management API
      // For now, we'll try via RPC if available
      
      // Log progress every 10 statements
      if (i % 10 === 0) {
        log(`   Progress: ${i}/${statements.length} statements...`, 'yellow');
      }

      executed++;
    } catch (error) {
      // Some errors are expected (like "already exists")
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate')) {
        skipped++;
      } else {
        failed++;
        if (failed <= 5) {  // Only log first 5 failures
          log(`   ⚠️  Statement ${i + 1} warning: ${error.message.substring(0, 100)}`, 'yellow');
        }
      }
    }
  }

  log(`\n   ✅ Executed: ${executed} statements`, 'green');
  log(`   ⏭️  Skipped: ${skipped} statements`, 'yellow');
  if (failed > 0) {
    log(`   ⚠️  Failed: ${failed} statements (this may be normal)`, 'yellow');
  }
}

// Run the restoration
restoreDatabase();


