import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function fixProfilesRLS() {
  console.log('🔧 Fixing profiles table RLS policies...\n');

  // Check environment variables
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌');
    console.error('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅' : '❌');
    return;
  }

  try {
    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'fix-profiles-rls.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 SQL Script to execute:');
    console.log('─'.repeat(50));
    console.log(sqlContent);
    console.log('─'.repeat(50));

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`\n🔍 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n📝 Executing statement ${i + 1}/${statements.length}:`);
      console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} result:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`❌ Statement ${i + 1} failed:`, err.message);
      }
    }

    console.log('\n🎯 Profiles RLS fix completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Check the Supabase Dashboard > Authentication > Policies');
    console.log('   2. Verify the profiles table RLS policies are working');
    console.log('   3. Test the database connection again');

  } catch (error) {
    console.error('❌ Error fixing profiles RLS:', error.message);
    console.log('\n💡 Manual steps:');
    console.log('   1. Go to Supabase Dashboard > SQL Editor');
    console.log('   2. Copy and paste the contents of fix-profiles-rls.sql');
    console.log('   3. Execute the script');
  }
}

fixProfilesRLS(); 