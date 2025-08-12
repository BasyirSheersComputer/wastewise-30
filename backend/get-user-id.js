import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function getUserIds() {
  try {
    console.log('🔍 Fetching user IDs from Supabase...');
    
    // Method 1: Try to get users from profiles table (if it exists)
    console.log('📋 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .limit(10);
    
    if (!profilesError && profiles && profiles.length > 0) {
      console.log('✅ Found users in profiles table:');
      profiles.forEach(profile => {
        console.log(`   - ID: ${profile.id}`);
        console.log(`   - Email: ${profile.email || 'N/A'}`);
        console.log(`   - Name: ${profile.first_name || ''} ${profile.last_name || ''}`);
        console.log('   ---');
      });
      return;
    }
    
    // Method 2: Try to get users from users table (if it exists)
    console.log('📋 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .limit(10);
    
    if (!usersError && users && users.length > 0) {
      console.log('✅ Found users in users table:');
      users.forEach(user => {
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email || 'N/A'}`);
        console.log(`   - Name: ${user.first_name || ''} ${user.last_name || ''}`);
        console.log('   ---');
      });
      return;
    }
    
    // Method 3: Check if any tables have user_id references
    console.log('📋 Checking for user references in other tables...');
    const tablesToCheck = [
      'coffee_chains',
      'outlets', 
      'supplier_data',
      'inventory_data',
      'analytics'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('user_id')
          .limit(1);
        
        if (!error && data && data.length > 0 && data[0].user_id) {
          console.log(`✅ Found user_id in ${tableName}: ${data[0].user_id}`);
          console.log('💡 You can use this user_id in the populate-database.js script');
          return;
        }
      } catch (err) {
        // Table might not exist, continue to next
      }
    }
    
    console.log('⚠️  No existing users found');
    console.log('💡 You need to create a user first through the frontend or Supabase dashboard');
    console.log('💡 Then update the populate-database.js script with the real user ID');
    console.log('');
    console.log('🔧 Alternative: You can manually create a test user in Supabase dashboard');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to Authentication > Users');
    console.log('   3. Create a new user or note down an existing user ID');
    console.log('   4. Update the populate-database.js script with that user ID');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getUserIds();
