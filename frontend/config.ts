// Configuration for the frontend
export const config = {
  // Backend configuration
  backend: {
    baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  },
  
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Development settings
  dev: {
    apiProxy: '/api',
  }
};

// Helper function to get backend URL
export const getBackendUrl = (endpoint: string = '') => {
  return `${config.backend.baseUrl}${endpoint}`;
};

// Helper function to get WebSocket URL
export const getWebSocketUrl = (endpoint: string = '') => {
  return `${config.backend.wsUrl}${endpoint}`;
}; 