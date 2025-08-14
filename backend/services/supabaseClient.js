// supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase Client Configuration
 * Uses environment variables directly
 */

// Validate Supabase configuration
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration:');
  console.error('   URL:', process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   Anon Key:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
}

// Create Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
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
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase service role key');
    throw new Error('Service role key is required for admin operations');
  }

  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    url: process.env.VITE_SUPABASE_URL,
    hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    environment: process.env.NODE_ENV
  };
}

module.exports = {
  supabase,
  createServiceRoleClient,
  testConnection,
  getConfigInfo
};
