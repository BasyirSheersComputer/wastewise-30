import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * This file is for backend use only and should never be exposed client-side.
 * It uses standard environment variables without the  prefix.
 */

// Validate Supabase configuration
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase configuration:');
  console.error('   URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   Anon Key:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  throw new Error('Supabase configuration is incomplete. Please check your environment variables.');
}

/**
 * Creates and exports a standard Supabase client.
 * This client uses the 'anon' key and should only be used for operations
 * that are protected by Row Level Security (RLS).
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'wastewise-backend',
      },
    },
  },
);

/**
 * Creates a Supabase client with the 'service_role' key.
 * This client has admin access and bypasses all RLS.
 * It should be used exclusively for server-side operations that require
 * elevated privileges.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export const createServiceRoleClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase service role key');
    throw new Error('Service role key is required for admin operations');
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Client-Info': 'wastewise-backend-admin',
        },
      },
    },
  );
};

/**
 * Tests the connection to the Supabase database.
 * This function uses the service role client for a reliable backend connection check.
 * @returns {Promise<boolean>} A boolean indicating connection success or failure.
 */
export async function testConnection() {
  try {
    const adminClient = createServiceRoleClient();
    const { data, error } = await adminClient.from('users').select('count', { head: true });

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
 * Gets Supabase configuration information for debugging purposes.
 * @returns {Object} An object containing the Supabase URL and anon key status.
 */
export function getConfigInfo() {
  return {
    URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
    AnonKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
    ServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
  };
}
