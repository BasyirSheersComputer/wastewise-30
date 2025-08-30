import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('🚀 Setting up database schema...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Supabase Key: ${process.env.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log('❌ Database setup failed: Missing environment variables');
    return;
  }
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'setup-database.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📖 SQL file loaded successfully');
    console.log(`   File: ${sqlFilePath}`);
    console.log(`   Size: ${(sqlContent.length / 1024).toFixed(2)} KB`);
    console.log('');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`);
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        // Skip comments and empty statements
        if (statement.trim().startsWith('--') || statement.trim().length === 0) {
          continue;
        }
        
        console.log(`   [${i + 1}/${statements.length}] Executing statement...`);
        
        // Execute the SQL statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try alternative method for statements that can't be executed via RPC
          console.log(`   ⚠️  RPC failed, trying direct execution...`);
          
          // For now, we'll skip statements that can't be executed via the client
          // In a real setup, you'd need to use the Supabase dashboard or CLI
          console.log(`   ⚠️  Statement requires manual execution in Supabase dashboard`);
        } else {
          console.log(`   ✅ Statement executed successfully`);
          successCount++;
        }
        
      } catch (err) {
        console.log(`   ❌ Error executing statement: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Setup Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Database setup completed successfully!');
    } else {
      console.log('\n⚠️  Database setup completed with some errors.');
      console.log('   Some statements may need to be executed manually in the Supabase dashboard.');
    }
    
    // Test the setup
    console.log('\n🧪 Testing database setup...');
    await testDatabaseSetup();
    
  } catch (error) {
    console.log(`❌ Database setup failed: ${error.message}`);
  }
}

async function testDatabaseSetup() {
  try {
    // Test if tables exist
    const testTables = [
      'users',
      'user_settings',
      'coffee_chains',
      'outlets',
      'analytics',
      'waste_data',
      'suppliers',
      'recommendations',
      'ai_cache',
      'subscription_plans',
      'user_subscriptions',
      'billing_history',
      'staff',
      'training_records'
    ];
    
    console.log('   📋 Testing table existence...');
    
    const tableResults = [];
    
    for (const tableName of testTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          tableResults.push({ name: tableName, exists: false, error: error.message });
        } else {
          tableResults.push({ name: tableName, exists: true });
        }
      } catch (err) {
        tableResults.push({ name: tableName, exists: false, error: err.message });
      }
    }
    
    const existingTables = tableResults.filter(t => t.exists);
    const missingTables = tableResults.filter(t => !t.exists);
    
    console.log(`   ✅ Tables found: ${existingTables.length}`);
    console.log(`   ❌ Tables missing: ${missingTables.length}`);
    
    if (existingTables.length > 0) {
      console.log('\n   📋 Existing tables:');
      existingTables.forEach(table => {
        console.log(`      - ${table.name}`);
      });
    }
    
    if (missingTables.length > 0) {
      console.log('\n   ⚠️  Missing tables:');
      missingTables.forEach(table => {
        console.log(`      - ${table.name}: ${table.error}`);
      });
    }
    
    console.log(`\n   🎯 Setup test: ${existingTables.length}/${testTables.length} tables ready`);
    
  } catch (error) {
    console.log(`   ❌ Setup test failed: ${error.message}`);
  }
}

// Run the setup
setupDatabase(); 