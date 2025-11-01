/**
 * Integration Routes
 * Handles external system integrations (StoreHub, POS systems, etc.)
 */

import express from 'express';
import { authenticateUser } from '../utils/authMiddleware.js';
import StoreHubService from '../services/storehubService.js';
import logger from '../utils/logger.js';

const router = express.Router();
const storehubService = new StoreHubService();

/**
 * @route GET /api/integrations
 * @desc Get all integrations for user
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { supabase } = req;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      integrations: data || []
    });
  } catch (error) {
    logger.error('Failed to fetch integrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations'
    });
  }
});

/**
 * @route POST /api/integrations/storehub/initialize
 * @desc Initialize StoreHub integration
 */
router.post('/storehub/initialize', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, apiKey, apiSecret } = req.body;

    if (!storeId || !apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        error: 'Missing required credentials (storeId, apiKey, apiSecret)'
      });
    }

    const result = await storehubService.initializeIntegration(userId, {
      storeId,
      apiKey,
      apiSecret
    });

    res.json(result);
  } catch (error) {
    logger.error('StoreHub initialization failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize StoreHub integration'
    });
  }
});

/**
 * @route POST /api/integrations/storehub/sync/sales
 * @desc Sync sales data from StoreHub
 */
router.post('/storehub/sync/sales', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, outletId } = req.body;

    const result = await storehubService.syncSalesData(userId, {
      startDate,
      endDate,
      outletId
    });

    res.json(result);
  } catch (error) {
    logger.error('StoreHub sales sync failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync sales data'
    });
  }
});

/**
 * @route POST /api/integrations/storehub/sync/inventory
 * @desc Sync inventory data from StoreHub
 */
router.post('/storehub/sync/inventory', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { outletId } = req.body;

    const result = await storehubService.syncInventoryData(userId, outletId);

    res.json(result);
  } catch (error) {
    logger.error('StoreHub inventory sync failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync inventory data'
    });
  }
});

/**
 * @route POST /api/integrations/storehub/webhook
 * @desc Handle StoreHub webhooks (no auth - uses webhook signature verification)
 */
router.post('/storehub/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature (implement based on StoreHub's webhook signature method)
    const signature = req.headers['x-storehub-signature'];
    const isValid = await _verifyWebhookSignature(req.body, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const webhookData = JSON.parse(req.body.toString());
    const result = await storehubService.handleWebhook(webhookData);

    res.json(result);
  } catch (error) {
    logger.error('StoreHub webhook processing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

/**
 * @route DELETE /api/integrations/storehub
 * @desc Deactivate StoreHub integration
 */
router.delete('/storehub', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { supabase } = req;

    const { error } = await supabase
      .from('integrations')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('integration_type', 'storehub');

    if (error) throw error;

    res.json({
      success: true,
      message: 'StoreHub integration deactivated'
    });
  } catch (error) {
    logger.error('Failed to deactivate StoreHub integration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate integration'
    });
  }
});

/**
 * @route GET /api/integrations/storehub/status
 * @desc Get StoreHub integration status
 */
router.get('/storehub/status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { supabase } = req;

    const { data, error } = await supabase
      .from('integrations')
      .select('status, config, created_at, updated_at')
      .eq('user_id', userId)
      .eq('integration_type', 'storehub')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    if (!data) {
      return res.json({
        success: true,
        connected: false,
        message: 'StoreHub integration not configured'
      });
    }

    res.json({
      success: true,
      connected: data.status === 'active',
      status: data.status,
      lastSync: data.config?.lastSyncAt || null,
      configuredAt: data.created_at
    });
  } catch (error) {
    logger.error('Failed to get StoreHub status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get integration status'
    });
  }
});

/**
 * Verify webhook signature
 * @private
 */
async function _verifyWebhookSignature(payload, signature) {
  // TODO: Implement StoreHub's webhook signature verification
  // StoreHub typically uses HMAC-SHA256 with a secret key
  // For now, return true (implement proper verification in production)
  
  if (!signature) {
    logger.warn('Webhook received without signature');
    return false;
  }

  // Placeholder - implement actual verification
  // const secret = process.env.STOREHUB_WEBHOOK_SECRET;
  // const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  // return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  
  return true; // Remove this in production
}

export default router;

