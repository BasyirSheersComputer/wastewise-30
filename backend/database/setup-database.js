import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseSetup {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey);
  }

  async setupDatabase() {
    try {
      logger.info('Starting database setup...');
      
      // Read and execute schema
      await this.executeSchema();
      
      // Insert default data
      await this.insertDefaultData();
      
      // Verify setup
      await this.verifySetup();
      
      logger.info('Database setup completed successfully!');
      return { success: true, message: 'Database setup completed successfully' };
    } catch (error) {
      logger.error('Database setup failed:', error);
      throw error;
    }
  }

  async executeSchema() {
    try {
      logger.info('Executing database schema...');
      
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Split schema into individual statements
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        try {
          const { error } = await this.supabase.rpc('exec_sql', { sql: statement });
          if (error && !error.message.includes('already exists')) {
            logger.warn(`Statement warning: ${error.message}`);
          }
        } catch (stmtError) {
          // Continue with other statements if one fails
          logger.warn(`Statement failed: ${stmtError.message}`);
        }
      }
      
      logger.info('Database schema executed successfully');
    } catch (error) {
      logger.error('Failed to execute schema:', error);
      throw error;
    }
  }

  async insertDefaultData() {
    try {
      logger.info('Inserting default data...');
      
      // Check if default data already exists
      const { data: existingCategories } = await this.supabase
        .from('issue_categories')
        .select('id')
        .limit(1);
      
      if (existingCategories && existingCategories.length > 0) {
        logger.info('Default data already exists, skipping...');
        return;
      }
      
      // Insert default issue categories
      const categories = [
        { name: 'Bug', description: 'Software bugs and technical issues', icon: 'bug', color: '#EF4444', sort_order: 1 },
        { name: 'Feature Request', description: 'Requests for new features or improvements', icon: 'lightbulb', color: '#3B82F6', sort_order: 2 },
        { name: 'UI/UX', description: 'User interface and user experience issues', icon: 'palette', color: '#8B5CF6', sort_order: 3 },
        { name: 'Performance', description: 'Performance and speed related issues', icon: 'zap', color: '#F59E0B', sort_order: 4 },
        { name: 'Integration', description: 'Third-party integration issues', icon: 'link', color: '#10B981', sort_order: 5 },
        { name: 'Data', description: 'Data related issues and concerns', icon: 'database', color: '#6B7280', sort_order: 6 },
        { name: 'Security', description: 'Security related issues and concerns', icon: 'shield', color: '#DC2626', sort_order: 7 },
        { name: 'Other', description: 'Other issues not covered above', icon: 'help-circle', color: '#9CA3AF', sort_order: 8 }
      ];
      
      const { error: categoriesError } = await this.supabase
        .from('issue_categories')
        .insert(categories);
      
      if (categoriesError) {
        logger.error('Failed to insert issue categories:', categoriesError);
      } else {
        logger.info('Issue categories inserted successfully');
      }
      
      // Insert default issue priorities
      const priorities = [
        { name: 'Critical', description: 'Critical issues that need immediate attention', color: '#DC2626', sort_order: 1, sla_hours: 2 },
        { name: 'High', description: 'High priority issues that should be resolved quickly', color: '#F59E0B', sort_order: 2, sla_hours: 8 },
        { name: 'Medium', description: 'Medium priority issues with normal response time', color: '#3B82F6', sort_order: 3, sla_hours: 24 },
        { name: 'Low', description: 'Low priority issues that can be addressed later', color: '#6B7280', sort_order: 4, sla_hours: 72 }
      ];
      
      const { error: prioritiesError } = await this.supabase
        .from('issue_priorities')
        .insert(priorities);
      
      if (prioritiesError) {
        logger.error('Failed to insert issue priorities:', prioritiesError);
      } else {
        logger.info('Issue priorities inserted successfully');
      }
      
      // Insert default issue statuses
      const statuses = [
        { name: 'Open', description: 'New issue that has been reported', color: '#3B82F6', sort_order: 1, is_final: false },
        { name: 'In Progress', description: 'Issue is being worked on', color: '#F59E0B', sort_order: 2, is_final: false },
        { name: 'In Review', description: 'Issue is being reviewed or tested', color: '#8B5CF6', sort_order: 3, is_final: false },
        { name: 'Resolved', description: 'Issue has been resolved', color: '#10B981', sort_order: 4, is_final: false },
        { name: 'Closed', description: 'Issue has been closed', color: '#6B7280', sort_order: 5, is_final: true },
        { name: 'Cancelled', description: 'Issue has been cancelled', color: '#9CA3AF', sort_order: 6, is_final: true }
      ];
      
      const { error: statusesError } = await this.supabase
        .from('issue_statuses')
        .insert(statuses);
      
      if (statusesError) {
        logger.error('Failed to insert issue statuses:', statusesError);
      } else {
        logger.info('Issue statuses inserted successfully');
      }
      
      logger.info('Default data inserted successfully');
    } catch (error) {
      logger.error('Failed to insert default data:', error);
      throw error;
    }
  }

  async verifySetup() {
    try {
      logger.info('Verifying database setup...');
      
      // Check if all tables exist
      const tables = [
        'users', 'outlets', 'suppliers', 'inventory', 'waste_logs',
        'sales_pos_data', 'customers', 'staff_training',
        'issue_categories', 'issue_priorities', 'issue_statuses', 'issues',
        'subscriptions', 'invoices', 'analytics_cache', 'ai_recommendations_cache', 'audit_logs'
      ];
      
      const verificationResults = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await this.supabase
            .from(table)
            .select('*')
            .limit(1);
          
          verificationResults[table] = {
            exists: !error,
            error: error?.message || null
          };
        } catch (err) {
          verificationResults[table] = {
            exists: false,
            error: err.message
          };
        }
      }
      
      // Check default data
      const { data: categories } = await this.supabase
        .from('issue_categories')
        .select('count')
        .limit(1);
      
      const { data: priorities } = await this.supabase
        .from('issue_priorities')
        .select('count')
        .limit(1);
      
      const { data: statuses } = await this.supabase
        .from('issue_statuses')
        .select('count')
        .limit(1);
      
      const verificationSummary = {
        tables: verificationResults,
        defaultData: {
          categories: categories ? true : false,
          priorities: priorities ? true : false,
          statuses: statuses ? true : false
        }
      };
      
      logger.info('Database verification completed:', verificationSummary);
      return verificationSummary;
    } catch (error) {
      logger.error('Failed to verify setup:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      logger.info('Testing database connection...');
      
      const { data, error } = await this.supabase
        .from('_supabase_migrations')
        .select('*')
        .limit(1);
      
      if (error) {
        logger.error('Database connection test failed:', error);
        return { success: false, error: error.message };
      }
      
      logger.info('Database connection test successful');
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      logger.error('Database connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async cleanupExpiredCache() {
    try {
      logger.info('Cleaning up expired cache entries...');
      
      const { error: analyticsError } = await this.supabase
        .rpc('cleanup_expired_cache');
      
      if (analyticsError) {
        logger.warn('Failed to cleanup analytics cache:', analyticsError);
      }
      
      logger.info('Cache cleanup completed');
      return { success: true, message: 'Cache cleanup completed' };
    } catch (error) {
      logger.error('Cache cleanup failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getDatabaseStats() {
    try {
      logger.info('Getting database statistics...');
      
      const stats = {};
      
      // Get table row counts
      const tables = ['users', 'outlets', 'suppliers', 'inventory', 'waste_logs', 'issues', 'subscriptions'];
      
      for (const table of tables) {
        try {
          const { count, error } = await this.supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          stats[table] = {
            count: count || 0,
            error: error?.message || null
          };
        } catch (err) {
          stats[table] = {
            count: 0,
            error: err.message
          };
        }
      }
      
      logger.info('Database statistics retrieved:', stats);
      return { success: true, data: stats };
    } catch (error) {
      logger.error('Failed to get database statistics:', error);
      return { success: false, error: error.message };
    }
  }
}

// CLI interface
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  const dbSetup = new DatabaseSetup();
  
  switch (command) {
    case 'setup':
      dbSetup.setupDatabase()
        .then(result => {
          console.log('Setup result:', result);
          process.exit(0);
        })
        .catch(error => {
          console.error('Setup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'test':
      dbSetup.testConnection()
        .then(result => {
          console.log('Test result:', result);
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('Test failed:', error);
          process.exit(1);
        });
      break;
      
    case 'verify':
      dbSetup.verifySetup()
        .then(result => {
          console.log('Verification result:', result);
          process.exit(0);
        })
        .catch(error => {
          console.error('Verification failed:', error);
          process.exit(1);
        });
      break;
      
    case 'cleanup':
      dbSetup.cleanupExpiredCache()
        .then(result => {
          console.log('Cleanup result:', result);
          process.exit(0);
        })
        .catch(error => {
          console.error('Cleanup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'stats':
      dbSetup.getDatabaseStats()
        .then(result => {
          console.log('Stats result:', result);
          process.exit(0);
        })
        .catch(error => {
          console.error('Stats failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node setup-database.js <command>');
      console.log('Commands:');
      console.log('  setup   - Set up the complete database schema and default data');
      console.log('  test    - Test database connection');
      console.log('  verify  - Verify database setup');
      console.log('  cleanup - Clean up expired cache entries');
      console.log('  stats   - Get database statistics');
      process.exit(1);
  }
}

export default DatabaseSetup;
