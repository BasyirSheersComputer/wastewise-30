import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables are not set!')
  console.error('Please create a .env file in the frontend directory with:')
  console.error('VITE_SUPABASE_URL=https://your-project-url.supabase.co')
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key-here')
  console.error('')
  console.error('To get these values:')
  console.error('1. Go to https://supabase.com')
  console.error('2. Create a new project or select existing one')
  console.error('3. Go to Settings > API')
  console.error('4. Copy the Project URL and anon public key')
  console.error('')
  console.error('For now, using mock authentication for development...')
}

// Create real client with fallback for development
const realSupabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

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

// Export mock client if Supabase is not configured, otherwise export real client
export const supabase = (!supabaseUrl || !supabaseKey) ? mockSupabase : realSupabase;