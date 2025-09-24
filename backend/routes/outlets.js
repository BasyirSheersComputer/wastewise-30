import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import { authenticateUser } from '../utils/authMiddleware.js';

dotenv.config();

const router = express.Router();

// Create Supabase client only if environment variables are available
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    logger.info('Outlets route: Supabase client created successfully');
  } else {
    logger.warn('Outlets route: Supabase environment variables not found, outlets features will be disabled');
  }
} catch (error) {
  logger.error('Outlets route: Failed to create Supabase client:', error.message);
}

// Get all outlets for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, is_active } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('outlets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (search) {
      query = query.or(`outlet_name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: outlets, error } = await query;

    if (error) {
      logger.error('Error fetching outlets:', error);
      return res.status(500).json({ error: 'Failed to fetch outlets' });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('outlets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      success: true,
      data: outlets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      message: 'Outlets fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlets fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch outlets'
    });
  }
});

// Get outlet by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: outlet, error } = await supabase
      .from('outlets')
      .select(`
        *,
        inventory (
          id,
          item_name,
          category,
          current_stock,
          min_stock,
          max_stock
        ),
        waste_logs (
          id,
          date,
          waste_type,
          quantity,
          unit,
          cost
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'NOT_FOUND',
          message: 'Outlet not found'
        });
      }
      logger.error('Error fetching outlet:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch outlet'
      });
    }

    res.json({
      success: true,
      data: outlet,
      message: 'Outlet fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlet fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch outlet'
    });
  }
});

// Create new outlet
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      outlet_name,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      manager_name,
      capacity,
      opening_hours
    } = req.body;

    // Validate required fields
    if (!outlet_name) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Outlet name is required'
      });
    }

    const outletData = {
      user_id: userId,
      outlet_name,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || 'Malaysia',
      postal_code: postal_code || null,
      phone: phone || null,
      email: email || null,
      manager_name: manager_name || null,
      capacity: capacity ? parseInt(capacity) : null,
      opening_hours: opening_hours || null,
      is_active: true
    };

    const { data: newOutlet, error } = await supabase
      .from('outlets')
      .insert([outletData])
      .select()
      .single();

    if (error) {
      logger.error('Error creating outlet:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create outlet'
      });
    }

    res.status(201).json({
      success: true,
      data: newOutlet,
      message: 'Outlet created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlet creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to create outlet'
    });
  }
});

// Update outlet
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;
    updateData.updated_at = new Date().toISOString();

    // Convert capacity to integer if provided
    if (updateData.capacity) {
      updateData.capacity = parseInt(updateData.capacity);
    }

    const { data: updatedOutlet, error } = await supabase
      .from('outlets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'NOT_FOUND',
          message: 'Outlet not found'
        });
      }
      logger.error('Error updating outlet:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to update outlet'
      });
    }

    res.json({
      success: true,
      data: updatedOutlet,
      message: 'Outlet updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlet update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to update outlet'
    });
  }
});

// Delete outlet (soft delete)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if outlet has associated inventory items
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory')
      .select('id')
      .eq('outlet_id', id)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (inventoryError) {
      logger.error('Error checking outlet inventory:', inventoryError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to check outlet dependencies'
      });
    }

    // Check if outlet has associated waste logs
    const { data: wasteLogs, error: wasteError } = await supabase
      .from('waste_logs')
      .select('id')
      .eq('outlet_id', id)
      .eq('user_id', userId);

    if (wasteError) {
      logger.error('Error checking outlet waste logs:', wasteError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to check outlet dependencies'
      });
    }

    if ((inventoryItems && inventoryItems.length > 0) || (wasteLogs && wasteLogs.length > 0)) {
      return res.status(400).json({
        success: false,
        error: 'DEPENDENCY_ERROR',
        message: 'Cannot delete outlet with associated inventory items or waste logs. Please reassign or remove them first.'
      });
    }

    const { error } = await supabase
      .from('outlets')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting outlet:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to delete outlet'
      });
    }

    res.json({
      success: true,
      message: 'Outlet deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlet deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete outlet'
    });
  }
});

// Get outlet analytics
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all outlets
    const { data: outlets, error: outletsError } = await supabase
      .from('outlets')
      .select('*')
      .eq('user_id', userId);

    if (outletsError) {
      logger.error('Error fetching outlets for analytics:', outletsError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch outlets'
      });
    }

    // Get outlet inventory data
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('outlet_id, current_stock, cost_per_unit, category')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('outlet_id', 'is', null);

    if (inventoryError) {
      logger.error('Error fetching inventory for analytics:', inventoryError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch inventory data'
      });
    }

    // Get outlet waste data
    const { data: wasteData, error: wasteError } = await supabase
      .from('waste_logs')
      .select('outlet_id, quantity, cost, waste_type, date')
      .eq('user_id', userId)
      .not('outlet_id', 'is', null);

    if (wasteError) {
      logger.error('Error fetching waste data for analytics:', wasteError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch waste data'
      });
    }

    // Calculate analytics
    const totalOutlets = outlets.length;
    const activeOutlets = outlets.filter(o => o.is_active).length;
    const inactiveOutlets = totalOutlets - activeOutlets;

    // Calculate outlet performance metrics
    const outletMetrics = {};
    
    // Inventory metrics
    inventoryData.forEach(item => {
      if (!outletMetrics[item.outlet_id]) {
        outletMetrics[item.outlet_id] = {
          totalItems: 0,
          totalValue: 0,
          totalStock: 0,
          categories: new Set()
        };
      }
      outletMetrics[item.outlet_id].totalItems++;
      outletMetrics[item.outlet_id].totalStock += parseFloat(item.current_stock) || 0;
      outletMetrics[item.outlet_id].totalValue += (parseFloat(item.current_stock) || 0) * (parseFloat(item.cost_per_unit) || 0);
      outletMetrics[item.outlet_id].categories.add(item.category);
    });

    // Waste metrics
    wasteData.forEach(log => {
      if (!outletMetrics[log.outlet_id]) {
        outletMetrics[log.outlet_id] = {
          totalItems: 0,
          totalValue: 0,
          totalStock: 0,
          categories: new Set(),
          totalWaste: 0,
          totalWasteCost: 0,
          wasteTypes: new Set()
        };
      }
      outletMetrics[log.outlet_id].totalWaste += parseFloat(log.quantity) || 0;
      outletMetrics[log.outlet_id].totalWasteCost += parseFloat(log.cost) || 0;
      outletMetrics[log.outlet_id].wasteTypes.add(log.waste_type);
    });

    // Convert sets to arrays for JSON serialization
    Object.keys(outletMetrics).forEach(outletId => {
      outletMetrics[outletId].categories = Array.from(outletMetrics[outletId].categories);
      outletMetrics[outletId].wasteTypes = Array.from(outletMetrics[outletId].wasteTypes || []);
    });

    // Group outlets by location
    const outletsByLocation = {};
    outlets.forEach(outlet => {
      const location = outlet.city && outlet.state ? `${outlet.city}, ${outlet.state}` : 'Unknown';
      if (!outletsByLocation[location]) {
        outletsByLocation[location] = 0;
      }
      outletsByLocation[location]++;
    });

    const analytics = {
      summary: {
        totalOutlets,
        activeOutlets,
        inactiveOutlets,
        outletsWithInventory: Object.keys(outletMetrics).length
      },
      outletMetrics,
      outletsByLocation,
      topOutlets: Object.entries(outletMetrics)
        .sort(([,a], [,b]) => b.totalValue - a.totalValue)
        .slice(0, 5)
        .map(([outletId, metrics]) => {
          const outlet = outlets.find(o => o.id === outletId);
          return {
            outlet_id: outletId,
            outlet_name: outlet?.outlet_name || 'Unknown',
            ...metrics
          };
        })
    };

    res.json({
      success: true,
      data: analytics,
      message: 'Outlet analytics fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlet analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch outlet analytics'
    });
  }
});

// Get outlets by location
router.get('/location/:location', authenticateUser, async (req, res) => {
  try {
    const { location } = req.params;
    const userId = req.user.id;

    const { data: outlets, error } = await supabase
      .from('outlets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`city.ilike.%${location}%,state.ilike.%${location}%,country.ilike.%${location}%`);

    if (error) {
      logger.error('Error fetching outlets by location:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch outlets by location'
      });
    }

    res.json({
      success: true,
      data: outlets,
      message: `Outlets in ${location} fetched successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlets by location fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch outlets by location'
    });
  }
});

// Toggle outlet status
router.patch('/:id/toggle-status', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get current status
    const { data: outlet, error: fetchError } = await supabase
      .from('outlets')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'NOT_FOUND',
          message: 'Outlet not found'
        });
      }
      logger.error('Error fetching outlet status:', fetchError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch outlet status'
      });
    }

    // Toggle status
    const { data: updatedOutlet, error } = await supabase
      .from('outlets')
      .update({ 
        is_active: !outlet.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error toggling outlet status:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to toggle outlet status'
      });
    }

    res.json({
      success: true,
      data: updatedOutlet,
      message: `Outlet ${updatedOutlet.is_active ? 'activated' : 'deactivated'} successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Outlet status toggle error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to toggle outlet status'
    });
  }
});

export default router;
