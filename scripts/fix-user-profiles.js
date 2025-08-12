#!/usr/bin/env node

/**
 * Fix User Profiles Script
 * This script diagnoses and fixes issues with user profiles in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function diagnoseUserProfiles() {
  console.log('🔍 Diagnosing user profile issues...\n');

  try {
    // 1. Check auth users without profiles
    console.log('1. Checking auth users without profiles...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`   Found ${authUsers.users.length} auth users`);

    // 2. Check profiles in users table
    console.log('\n2. Checking profiles in users table...');
    const { data: profiles, error: profileError } = await supabase
      .from('users')
      .select('id, email, created_at');

    if (profileError) {
      console.error('❌ Error fetching profiles:', profileError);
      return;
    }

    console.log(`   Found ${profiles.length} user profiles`);

    // 3. Find auth users without profiles
    const authUserIds = authUsers.users.map(user => user.id);
    const profileUserIds = profiles.map(profile => profile.id);
    
    const usersWithoutProfiles = authUsers.users.filter(
      authUser => !profileUserIds.includes(authUser.id)
    );

    console.log(`\n3. Found ${usersWithoutProfiles.length} auth users without profiles:`);
    
    if (usersWithoutProfiles.length > 0) {
      usersWithoutProfiles.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });

      // 4. Create missing profiles
      console.log('\n4. Creating missing profiles...');
      
      for (const authUser of usersWithoutProfiles) {
        try {
          const { error: insertError } = await supabase.from('users').insert({
            id: authUser.id,
            email: authUser.email,
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
            company_name: authUser.user_metadata?.company_name || 'Unknown Company',
            company_size: authUser.user_metadata?.company_size || 'small',
            primary_pain: authUser.user_metadata?.primary_pain || 'waste_reduction',
            phone_number: authUser.user_metadata?.phone_number || '',
            business_type: 'restaurant',
            locations: 1,
            annual_revenue: 'under_100k',
            primary_goals: [],
            data_sources: [],
            team_size: '1-10',
            timezone: 'Asia/Kuala_Lumpur',
            trial_start: new Date().toISOString(),
            trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_status: 'trial',
            subscription_plan: 'free',
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          if (insertError) {
            console.error(`   ❌ Failed to create profile for ${authUser.email}:`, insertError.message);
          } else {
            console.log(`   ✅ Created profile for ${authUser.email}`);
          }
        } catch (error) {
          console.error(`   ❌ Error creating profile for ${authUser.email}:`, error.message);
        }
      }
    } else {
      console.log('   ✅ All auth users have profiles!');
    }

    // 5. Check for orphaned profiles (profiles without auth users)
    const orphanedProfiles = profiles.filter(
      profile => !authUserIds.includes(profile.id)
    );

    console.log(`\n5. Found ${orphanedProfiles.length} orphaned profiles:`);
    
    if (orphanedProfiles.length > 0) {
      orphanedProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.id})`);
      });

      // Optionally clean up orphaned profiles
      console.log('\n6. Cleaning up orphaned profiles...');
      
      for (const profile of orphanedProfiles) {
        try {
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', profile.id);

          if (deleteError) {
            console.error(`   ❌ Failed to delete orphaned profile ${profile.email}:`, deleteError.message);
          } else {
            console.log(`   ✅ Deleted orphaned profile ${profile.email}`);
          }
        } catch (error) {
          console.error(`   ❌ Error deleting orphaned profile ${profile.email}:`, error.message);
        }
      }
    } else {
      console.log('   ✅ No orphaned profiles found!');
    }

    // 6. Final verification
    console.log('\n7. Final verification...');
    const { data: finalProfiles, error: finalError } = await supabase
      .from('users')
      .select('id, email');

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
      return;
    }

    const finalAuthUsers = authUsers.users.filter(user => user.email_confirmed_at);
    console.log(`   Auth users: ${finalAuthUsers.length}`);
    console.log(`   User profiles: ${finalProfiles.length}`);
    
    if (finalAuthUsers.length === finalProfiles.length) {
      console.log('   ✅ User count matches!');
    } else {
      console.log('   ⚠️  User count mismatch - some issues may remain');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

async function testUserCreation() {
  console.log('\n🧪 Testing user creation process...\n');

  try {
    // Test creating a user profile directly
    const testUserId = 'test-user-' + Date.now();
    const testEmail = `test-${Date.now()}@example.com`;

    console.log('1. Testing direct profile creation...');
    
    const { error: insertError } = await supabase.from('users').insert({
      id: testUserId,
      email: testEmail,
      first_name: 'Test',
      last_name: 'User',
      company_name: 'Test Company',
      company_size: 'small',
      primary_pain: 'waste_reduction',
      business_type: 'restaurant',
      locations: 1,
      annual_revenue: 'under_100k',
      primary_goals: [],
      data_sources: [],
      team_size: '1-10',
      timezone: 'Asia/Kuala_Lumpur',
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_status: 'trial',
      subscription_plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (insertError) {
      console.error('   ❌ Direct profile creation failed:', insertError.message);
      console.error('   This indicates RLS policy issues');
    } else {
      console.log('   ✅ Direct profile creation successful');
      
      // Clean up test profile
      await supabase.from('users').delete().eq('id', testUserId);
      console.log('   🧹 Cleaned up test profile');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the diagnosis
async function main() {
  console.log('🚀 Starting user profile diagnosis...\n');
  
  await diagnoseUserProfiles();
  await testUserCreation();
  
  console.log('\n✅ Diagnosis complete!');
}

main().catch(console.error);
