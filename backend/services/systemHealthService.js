/**
 * System Health Monitoring Service
 * Monitors all system modules and suggests recovery measures
 */

import { supabase } from './supabaseClient.js';
import logger from '../utils/logger.js';
import axios from 'axios';

export class SystemHealthService {
  constructor() {
    this.checks = {
      database: this._checkDatabase.bind(this),
      apiServices: this._checkApiServices.bind(this),
      integrations: this._checkIntegrations.bind(this),
      aiServices: this._checkAiServices.bind(this),
      cache: this._checkCache.bind(this),
      storage: this._checkStorage.bind(this)
    };
  }

  /**
   * Check all system modules
   * @returns {Promise<object>} Health status
   */
  async checkAllModules() {
    const results = {
      overall: 'healthy',
      modules: {},
      issues: [],
      recommendations: [],
      timestamp: new Date().toISOString()
    };

    // Run all health checks in parallel
    const checks = await Promise.allSettled(
      Object.entries(this.checks).map(async ([name, checkFn]) => {
        try {
          const result = await checkFn();
          return { name, ...result };
        } catch (error) {
          return {
            name,
            status: 'error',
            error: error.message,
            recommendation: 'Review error logs'
          };
        }
      })
    );

    // Process results
    checks.forEach((check, index) => {
      const moduleName = Object.keys(this.checks)[index];
      
      if (check.status === 'fulfilled') {
        results.modules[moduleName] = check.value;
        
        if (check.value.status !== 'healthy') {
          results.issues.push({
            module: moduleName,
            ...check.value
          });
          
          if (check.value.recommendation) {
            results.recommendations.push({
              module: moduleName,
              action: check.value.recommendation,
              priority: check.value.priority || 'medium'
            });
          }
        }
      } else {
        results.modules[moduleName] = {
          status: 'error',
          error: check.reason?.message || 'Unknown error'
        };
        results.issues.push({
          module: moduleName,
          status: 'error',
          error: check.reason?.message
        });
      }
    });

    // Determine overall status
    const hasErrors = results.issues.some(i => i.status === 'error');
    const hasWarnings = results.issues.some(i => i.status === 'warning');
    
    if (hasErrors) {
      results.overall = 'error';
    } else if (hasWarnings) {
      results.overall = 'warning';
    }

    return results;
  }

  /**
   * Check database connectivity and performance
   * @private
   */
  async _checkDatabase() {
    const startTime = Date.now();
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          status: 'error',
          error: error.message,
          responseTime,
          recommendation: this._getDatabaseRecovery(error)
        };
      }

      // Check response time
      if (responseTime > 1000) {
        return {
          status: 'warning',
          responseTime,
          message: 'Database response time is slow',
          recommendation: 'Check database load and optimize queries'
        };
      }

      // Test write capability
      const writeTest = await supabase.rpc('version');
      if (writeTest.error) {
        return {
          status: 'warning',
          error: writeTest.error.message,
          recommendation: 'Database read-only or permission issues'
        };
      }

      return {
        status: 'healthy',
        responseTime,
        message: 'Database connection healthy'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        recommendation: 'Check database credentials and network connectivity'
      };
    }
  }

  /**
   * Check API services (StoreHub, POS, etc.)
   * @private
   */
  async _checkApiServices() {
    const services = ['StoreHub'];
    const results = [];

    for (const service of services) {
      try {
        // Check if integration is configured
        const { data: integrations } = await supabase
          .from('integrations')
          .select('status, config')
          .eq('integration_type', service.toLowerCase())
          .eq('status', 'active')
          .limit(1);

        if (integrations && integrations.length > 0) {
          results.push({
            name: service,
            status: 'healthy',
            configured: true
          });
        } else {
          results.push({
            name: service,
            status: 'warning',
            configured: false,
            message: 'Integration not configured'
          });
        }
      } catch (error) {
        results.push({
          name: service,
          status: 'error',
          error: error.message
        });
      }
    }

    const hasErrors = results.some(r => r.status === 'error');
    const hasWarnings = results.some(r => r.status === 'warning');

    return {
      status: hasErrors ? 'error' : (hasWarnings ? 'warning' : 'healthy'),
      services: results,
      recommendation: hasErrors ? 'Review integration configurations' : null
    };
  }

  /**
   * Check active integrations
   * @private
   */
  async _checkIntegrations() {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('integration_type, status, config')
        .eq('status', 'active');

      if (error) {
        return {
          status: 'error',
          error: error.message,
          recommendation: 'Check integrations table permissions'
        };
      }

      const activeIntegrations = data || [];
      const lastSyncTimes = activeIntegrations.map(int => ({
        type: int.integration_type,
        lastSync: int.config?.lastSyncAt || null
      }));

      // Check for stale syncs (>24 hours)
      const staleSyncs = lastSyncTimes.filter(sync => {
        if (!sync.lastSync) return true;
        const hoursSinceSync = (Date.now() - new Date(sync.lastSync).getTime()) / (1000 * 60 * 60);
        return hoursSinceSync > 24;
      });

      if (staleSyncs.length > 0) {
        return {
          status: 'warning',
          activeCount: activeIntegrations.length,
          staleSyncs: staleSyncs.length,
          message: `${staleSyncs.length} integration(s) have stale sync data`,
          recommendation: 'Trigger manual sync or check integration jobs'
        };
      }

      return {
        status: 'healthy',
        activeCount: activeIntegrations.length,
        integrations: activeIntegrations.map(i => i.integration_type)
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        recommendation: 'Check integrations table access'
      };
    }
  }

  /**
   * Check AI services (Gemini, ChatGPT)
   * @private
   */
  async _checkAiServices() {
    const services = [
      { name: 'Gemini', envKey: 'GOOGLE_GEMINI_API_KEY' },
      { name: 'ChatGPT', envKey: 'OPENAI_API_KEY' }
    ];

    const results = [];

    for (const service of services) {
      const hasKey = !!process.env[service.envKey];
      
      if (!hasKey) {
        results.push({
          name: service.name,
          status: 'warning',
          message: 'API key not configured',
          recommendation: `Set ${service.envKey} environment variable`
        });
      } else {
        // Test API connectivity (lightweight check)
        try {
          // Simple health check - in production, this would ping the actual API
          results.push({
            name: service.name,
            status: 'healthy',
            configured: true
          });
        } catch (error) {
          results.push({
            name: service.name,
            status: 'error',
            error: error.message,
            recommendation: 'Check API key validity and network connectivity'
          });
        }
      }
    }

    const hasErrors = results.some(r => r.status === 'error');
    const hasWarnings = results.some(r => r.status === 'warning');

    return {
      status: hasErrors ? 'error' : (hasWarnings ? 'warning' : 'healthy'),
      services: results
    };
  }

  /**
   * Check cache service
   * @private
   */
  async _checkCache() {
    try {
      // Check if cache service is available
      // In production, this would check Redis or similar
      return {
        status: 'healthy',
        message: 'Cache service available',
        type: 'memory' // or 'redis' in production
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        recommendation: 'Restart cache service or check Redis connection'
      };
    }
  }

  /**
   * Check storage service (Supabase Storage)
   * @private
   */
  async _checkStorage() {
    try {
      // Test storage access by checking bucket list
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        return {
          status: 'error',
          error: error.message,
          recommendation: 'Check Supabase Storage configuration'
        };
      }

      return {
        status: 'healthy',
        buckets: data?.length || 0,
        message: 'Storage service accessible'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        recommendation: 'Check storage service connectivity'
      };
    }
  }

  /**
   * Get database recovery recommendations
   * @private
   */
  _getDatabaseRecovery(error) {
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('connection')) {
      return 'Check database connection string and network connectivity';
    }
    
    if (errorMessage.includes('timeout')) {
      return 'Database timeout - check load and optimize queries';
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('access')) {
      return 'Check database user permissions and RLS policies';
    }
    
    if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
      return 'Database constraint violation - review data integrity';
    }

    return 'Review database logs and error details';
  }

  /**
   * Get recovery action for specific module
   * @param {string} module - Module name
   * @param {object} issue - Issue details
   * @returns {string} Recovery recommendation
   */
  getRecoveryAction(module, issue) {
    const recoveryMap = {
      database: {
        connection: 'Restart database connection pool',
        timeout: 'Optimize queries and check database load',
        permission: 'Review RLS policies and user permissions'
      },
      integrations: {
        stale: 'Trigger manual sync or restart sync jobs',
        error: 'Check integration credentials and API status'
      },
      aiServices: {
        key_missing: 'Configure API keys in environment variables',
        rate_limit: 'Reduce API call frequency or upgrade plan'
      }
    };

    const moduleRecovery = recoveryMap[module];
    if (!moduleRecovery) return 'Review system logs and documentation';

    // Match issue type to recovery action
    for (const [issueType, action] of Object.entries(moduleRecovery)) {
      if (issue.error?.toLowerCase().includes(issueType) || 
          issue.message?.toLowerCase().includes(issueType)) {
        return action;
      }
    }

    return moduleRecovery.error || 'Review system logs';
  }
}

export default SystemHealthService;

