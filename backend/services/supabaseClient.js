// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Validate environment variables
if (!process.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is not set in environment variables');
}

if (!process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not set in environment variables');
}

// Create Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Enhanced database operations with logging
export const db = {
  // Generic query method
  async query(table, operation, options = {}) {
    const startTime = Date.now();
    
    try {
      let query = supabase.from(table);
      
      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending !== false 
        });
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      // Execute query
      const { data, error, count } = await query.select(options.select || '*');
      
      const duration = Date.now() - startTime;
      logger.dbQuery(table, operation, duration);
      
      if (error) {
        logger.dbError(table, operation, error);
        throw error;
      }
      
      return { data, count };
    } catch (error) {
      logger.dbError(table, operation, error);
      throw error;
    }
  },

  // Insert operation
  async insert(table, data) {
    const startTime = Date.now();
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      const duration = Date.now() - startTime;
      logger.dbQuery(table, 'insert', duration);
      
      if (error) {
        logger.dbError(table, 'insert', error);
        throw error;
      }
      
      return result;
    } catch (error) {
      logger.dbError(table, 'insert', error);
      throw error;
    }
  },

  // Update operation
  async update(table, data, filters) {
    const startTime = Date.now();
    
    try {
      let query = supabase.from(table).update(data);
      
      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data: result, error } = await query.select();
      
      const duration = Date.now() - startTime;
      logger.dbQuery(table, 'update', duration);
      
      if (error) {
        logger.dbError(table, 'update', error);
        throw error;
      }
      
      return result;
    } catch (error) {
      logger.dbError(table, 'update', error);
      throw error;
    }
  },

  // Delete operation
  async delete(table, filters) {
    const startTime = Date.now();
    
    try {
      let query = supabase.from(table).delete();
      
      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data: result, error } = await query.select();
      
      const duration = Date.now() - startTime;
      logger.dbQuery(table, 'delete', duration);
      
      if (error) {
        logger.dbError(table, 'delete', error);
        throw error;
      }
      
      return result;
    } catch (error) {
      logger.dbError(table, 'delete', error);
      throw error;
    }
  },

  // Upsert operation
  async upsert(table, data) {
    const startTime = Date.now();
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .upsert(data)
        .select();
      
      const duration = Date.now() - startTime;
      logger.dbQuery(table, 'upsert', duration);
      
      if (error) {
        logger.dbError(table, 'upsert', error);
        throw error;
      }
      
      return result;
    } catch (error) {
      logger.dbError(table, 'upsert', error);
      throw error;
    }
  }
};

// Auth operations
export const auth = {
  // Sign up
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Auth signup error', error);
      throw error;
    }
  },

  // Sign in
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Auth signin error', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logger.error('Auth signout error', error);
      throw error;
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      logger.error('Auth get user error', error);
      throw error;
    }
  },

  // Refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Auth refresh session error', error);
      throw error;
    }
  }
};

// Storage operations
export const storage = {
  // Upload file
  async upload(bucket, path, file) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Storage upload error', error);
      throw error;
    }
  },

  // Download file
  async download(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Storage download error', error);
      throw error;
    }
  },

  // Get public URL
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
};

export { supabase };
export default supabase;
