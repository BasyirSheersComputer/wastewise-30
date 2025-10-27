/**
 * Integration Test Routes
 * Provides endpoints for testing POS, ERP, CRM, and WFM integrations
 */

import express from 'express';
import { authenticateUser } from '../utils/authMiddleware.js';
import IntegrationManager from '../services/integrationManager.js';
import { supabase } from '../services/supabaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();
const integrationManager = new IntegrationManager({ useMock: true }); // Use mock for testing

/**
 * Initialize integration for testing
 */
router.post('/:integrationType/initialize', authenticateUser, async (req, res) => {
  try {
    const { integrationType } = req.params;
    const userId = req.user.id;
    const credentials = req.body;

    // Mock credentials if not provided
    const mockCredentials = {
      storeId: credentials.storeId || 'store_mock_001',
      apiKey: credentials.apiKey || 'mock_api_key',
      apiSecret: credentials.apiSecret || 'mock_api_secret',
      ...credentials
    };

    const result = await integrationManager.initializeIntegration(
      userId,
      integrationType,
      mockCredentials
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Integration initialization failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize integration'
    });
  }
});

/**
 * Test data sync
 */
router.post('/:integrationType/sync/:dataType', authenticateUser, async (req, res) => {
  try {
    const { integrationType, dataType } = req.params;
    const userId = req.user.id;
    const options = req.body;

    // Set default date ranges if not provided
    const defaultOptions = {
      startDate: options.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: options.endDate || new Date().toISOString(),
      ...options
    };

    const startTime = Date.now();
    
    // Fetch data from mock simulator
    const syncResult = await integrationManager.syncData(
      userId,
      integrationType,
      dataType,
      defaultOptions
    );

    // Store synced data
    const storeResult = await integrationManager.storeSyncedData(
      userId,
      integrationType,
      dataType,
      syncResult
    );

    const duration = Date.now() - startTime;

    // Log sync
    await supabase
      .from('integration_sync_logs')
      .insert({
        user_id: userId,
        integration_type: integrationType,
        data_type: dataType,
        status: 'success',
        records_synced: storeResult.stored || syncResult.count || 0,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date().toISOString()
      });

    res.json({
      success: true,
      sync: syncResult,
      storage: storeResult,
      duration_ms: duration
    });
  } catch (error) {
    logger.error('Data sync failed:', error);
    
    // Log failed sync
    await supabase
      .from('integration_sync_logs')
      .insert({
        user_id: req.user.id,
        integration_type: req.params.integrationType,
        data_type: req.params.dataType,
        status: 'failed',
        error_message: error.message
      });

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync data'
    });
  }
});

/**
 * Run full integration test
 */
router.post('/:integrationType/test', authenticateUser, async (req, res) => {
  try {
    const { integrationType } = req.params;
    const userId = req.user.id;
    const testStartTime = Date.now();

    const testResults = {
      integration_type: integrationType,
      tests: [],
      overall_status: 'passed'
    };

    // Test 1: Initialize integration
    try {
      const initResult = await integrationManager.initializeIntegration(
        userId,
        integrationType,
        { storeId: 'test_store', apiKey: 'test_key' }
      );
      testResults.tests.push({
        name: 'initialize',
        status: 'passed',
        details: initResult
      });
    } catch (error) {
      testResults.tests.push({
        name: 'initialize',
        status: 'failed',
        error: error.message
      });
      testResults.overall_status = 'failed';
    }

    // Test 2: Data sync based on integration type
    const dataTypes = {
      storehub: ['sales', 'inventory'],
      erp: ['purchase_orders', 'suppliers', 'inventory'],
      klaviyo: ['customers', 'segments'],
      lark: ['staff', 'schedules', 'attendance']
    };

    const typesToTest = dataTypes[integrationType] || [];
    
    for (const dataType of typesToTest) {
      try {
        const syncResult = await integrationManager.syncData(
          userId,
          integrationType,
          dataType,
          {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString()
          }
        );
        
        testResults.tests.push({
          name: `sync_${dataType}`,
          status: 'passed',
          records_count: syncResult.count || syncResult.data?.length || 0
        });
      } catch (error) {
        testResults.tests.push({
          name: `sync_${dataType}`,
          status: 'failed',
          error: error.message
        });
        testResults.overall_status = 'partial';
      }
    }

    const duration = Date.now() - testStartTime;

    // Store test results
    await supabase
      .from('integration_test_results')
      .insert({
        user_id: userId,
        integration_type: integrationType,
        test_type: 'full',
        status: testResults.overall_status,
        test_details: testResults,
        duration_ms: duration
      });

    res.json({
      success: true,
      ...testResults,
      duration_ms: duration
    });
  } catch (error) {
    logger.error('Integration test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to run integration test'
    });
  }
});

/**
 * Get integration status
 */
router.get('/:integrationType/status', authenticateUser, async (req, res) => {
  try {
    const { integrationType } = req.params;
    const userId = req.user.id;

    const status = await integrationManager.getIntegrationStatus(userId, integrationType);

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('Failed to get integration status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get integration status'
    });
  }
});

/**
 * List all integrations
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await integrationManager.listIntegrations(userId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Failed to list integrations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list integrations'
    });
  }
});

/**
 * Get sync logs
 */
router.get('/logs', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, integrationType } = req.query;

    let query = supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (integrationType) {
      query = query.eq('integration_type', integrationType);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      logs: data || []
    });
  } catch (error) {
    logger.error('Failed to get sync logs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sync logs'
    });
  }
});

/**
 * Get test results
 */
router.get('/test-results', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, integrationType } = req.query;

    let query = supabase
      .from('integration_test_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (integrationType) {
      query = query.eq('integration_type', integrationType);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      results: data || []
    });
  } catch (error) {
    logger.error('Failed to get test results:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get test results'
    });
  }
});

export default router;

