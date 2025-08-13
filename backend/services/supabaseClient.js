// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
const { config } = require('../config/firebase-config');

/**
 * Supabase Client Configuration
 * Uses Firebase config for environment variables
 */

// Validate Supabase configuration
if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('❌ Missing Supabase configuration:');
  console.error('   URL:', config.supabase.url ? '✅ Set' : '❌ Missing');
  console.error('   Anon Key:', config.supabase.anonKey ? '✅ Set' : '❌ Missing');
  throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
}

// Create Supabase client
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'wastewise-backend'
      }
    }
  }
);

/**
 * Create Supabase client with service role (admin access)
 * Use this for server-side operations that require elevated privileges
 */
const createServiceRoleClient = () => {
  if (!config.supabase.serviceRoleKey) {
    console.error('❌ Missing Supabase service role key');
    throw new Error('Service role key is required for admin operations');
  }

  return createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'wastewise-backend-admin'
        }
      }
    }
  );
};

/**
 * Test Supabase connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error.message);
    return false;
  }
}

/**
 * Get Supabase configuration info (for debugging)
 * @returns {Object}
 */
function getConfigInfo() {
  return {
    url: config.supabase.url,
    hasAnonKey: !!config.supabase.anonKey,
    hasServiceRoleKey: !!config.supabase.serviceRoleKey,
    environment: config.app.nodeEnv
  };
}

module.exports = {
  supabase,
  createServiceRoleClient,
  testConnection,
  getConfigInfo
};
