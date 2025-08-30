import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined' || supabaseKey === 'undefined') {
  console.warn('⚠️ Supabase environment variables are not set or invalid!')
  console.warn('Using mock authentication for development...')
  console.warn('VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'not set')
  console.warn('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'set' : 'not set')
}

// Create real client only if we have valid Supabase credentials
const realSupabase = (supabaseUrl && supabaseKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseKey.includes('placeholder')) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Mock authentication for development
let mockSession: any = null;
let mockAuthListeners: Array<(event: string, session: any) => void> = [];

const mockSupabase = {
  auth: {
    getSession: async () => {
      return { data: { session: mockSession } };
    },
    getUser: async () => {
      return { data: { user: mockSession?.user || null } };
    },
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Mock authentication logic
      if (email === 'demo@wastewise.com' && password === 'demo123') {
        mockSession = {
          user: {
            id: 'mock-user-id',
            email: email,
            created_at: new Date().toISOString(),
          },
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        };
        
        // Notify listeners
        mockAuthListeners.forEach(listener => listener('SIGNED_IN', mockSession));
        
        return { data: { user: mockSession.user }, error: null };
      } else {
        return { data: { user: null }, error: { message: 'Invalid credentials' } };
      }
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      // Mock signup logic
      mockSession = {
        user: {
          id: 'mock-user-id-' + Date.now(),
          email: email,
          user_metadata: options?.data || {},
          created_at: new Date().toISOString(),
        },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };
      
      // Notify listeners
      mockAuthListeners.forEach(listener => listener('SIGNED_UP', mockSession));
      
      return { data: { user: mockSession.user }, error: null };
    },
    signInWithOAuth: async ({ provider, options }: { provider: string; options?: any }) => {
      // Mock OAuth logic
      console.log(`Mock OAuth signin with ${provider}`, options);
      
      // Simulate OAuth flow
      setTimeout(() => {
        mockSession = {
          user: {
            id: 'mock-oauth-user-id-' + Date.now(),
            email: 'user@gmail.com',
            user_metadata: {
              full_name: 'Google User',
              avatar_url: 'https://via.placeholder.com/150',
            },
            created_at: new Date().toISOString(),
          },
          access_token: 'mock-oauth-access-token',
          refresh_token: 'mock-oauth-refresh-token',
        };
        
        // Notify listeners
        mockAuthListeners.forEach(listener => listener('SIGNED_IN', mockSession));
        
        // Redirect if specified
        if (options?.redirectTo) {
          window.location.href = options.redirectTo;
        }
      }, 1000);
      
      return { data: { user: null }, error: null };
    },
    signOut: async () => {
      mockSession = null;
      // Notify listeners
      mockAuthListeners.forEach(listener => listener('SIGNED_OUT', null));
      return { error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      mockAuthListeners.push(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = mockAuthListeners.indexOf(callback);
              if (index > -1) {
                mockAuthListeners.splice(index, 1);
              }
            }
          }
        }
      };
    }
  },
  from: (table: string) => ({
    insert: async (data: any[]) => {
      console.log(`Mock insert into ${table}:`, data);
      return { error: null };
    },
    upsert: async (data: any) => {
      console.log(`Mock upsert into ${table}:`, data);
      return { error: null };
    },
    update: async (data: any) => {
      console.log(`Mock update in ${table}:`, data);
      return { error: null };
    },
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'users' && column === 'id') {
            return {
              data: {
                trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              },
              error: null
            };
          }
          return { data: null, error: null };
        }
      })
    })
  })
};

// Export mock client if Supabase is not configured or has placeholder values, otherwise export real client
export const supabase = (!realSupabase) ? mockSupabase : realSupabase;