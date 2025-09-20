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
    logger.info('Suppliers route: Supabase client created successfully');
  } else {
    logger.warn('Suppliers route: Supabase environment variables not found, suppliers features will be disabled');
  }
} catch (error) {
  logger.error('Suppliers route: Failed to create Supabase client:', error.message);
}

// Get all suppliers for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, is_active } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    if (search) {
      query = query.or(`supplier_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: suppliers, error } = await query;

    if (error) {
      logger.error('Error fetching suppliers:', error);
      return res.status(500).json({ error: 'Failed to fetch suppliers' });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      success: true,
      data: suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      message: 'Suppliers fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Suppliers fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch suppliers'
    });
  }
});

// Get supplier by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        inventory (
          id,
          item_name,
          category,
          current_stock,
          cost_per_unit
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
          message: 'Supplier not found'
        });
      }
      logger.error('Error fetching supplier:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch supplier'
      });
    }

    res.json({
      success: true,
      data: supplier,
      message: 'Supplier fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Supplier fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch supplier'
    });
  }
});

// Create new supplier
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      country,
      postal_code,
      payment_terms
    } = req.body;

    // Validate required fields
    if (!supplier_name) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Supplier name is required'
      });
    }

    const supplierData = {
      user_id: userId,
      supplier_name,
      contact_person: contact_person || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      country: country || 'Malaysia',
      postal_code: postal_code || null,
      payment_terms: payment_terms || null,
      is_active: true
    };

    const { data: newSupplier, error } = await supabase
      .from('suppliers')
      .insert([supplierData])
      .select()
      .single();

    if (error) {
      logger.error('Error creating supplier:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create supplier'
      });
    }

    res.status(201).json({
      success: true,
      data: newSupplier,
      message: 'Supplier created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Supplier creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to create supplier'
    });
  }
});

// Update supplier
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

    const { data: updatedSupplier, error } = await supabase
      .from('suppliers')
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
          message: 'Supplier not found'
        });
      }
      logger.error('Error updating supplier:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to update supplier'
      });
    }

    res.json({
      success: true,
      data: updatedSupplier,
      message: 'Supplier updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Supplier update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to update supplier'
    });
  }
});

// Delete supplier (soft delete)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if supplier has associated inventory items
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory')
      .select('id')
      .eq('supplier_id', id)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (inventoryError) {
      logger.error('Error checking supplier inventory:', inventoryError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to check supplier dependencies'
      });
    }

    if (inventoryItems && inventoryItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'DEPENDENCY_ERROR',
        message: 'Cannot delete supplier with active inventory items. Please reassign or remove inventory items first.'
      });
    }

    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting supplier:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to delete supplier'
      });
    }

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Supplier deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete supplier'
    });
  }
});

// Get supplier analytics
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all suppliers
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId);

    if (suppliersError) {
      logger.error('Error fetching suppliers for analytics:', suppliersError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch suppliers'
      });
    }

    // Get supplier inventory data
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('supplier_id, current_stock, cost_per_unit')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('supplier_id', 'is', null);

    if (inventoryError) {
      logger.error('Error fetching inventory for analytics:', inventoryError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch inventory data'
      });
    }

    // Calculate analytics
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.is_active).length;
    const inactiveSuppliers = totalSuppliers - activeSuppliers;

    // Calculate supplier performance metrics
    const supplierMetrics = {};
    inventoryData.forEach(item => {
      if (!supplierMetrics[item.supplier_id]) {
        supplierMetrics[item.supplier_id] = {
          totalItems: 0,
          totalValue: 0,
          totalStock: 0
        };
      }
      supplierMetrics[item.supplier_id].totalItems++;
      supplierMetrics[item.supplier_id].totalStock += parseFloat(item.current_stock) || 0;
      supplierMetrics[item.supplier_id].totalValue += (parseFloat(item.current_stock) || 0) * (parseFloat(item.cost_per_unit) || 0);
    });

    // Group suppliers by location
    const suppliersByLocation = {};
    suppliers.forEach(supplier => {
      const location = supplier.city && supplier.state ? `${supplier.city}, ${supplier.state}` : 'Unknown';
      if (!suppliersByLocation[location]) {
        suppliersByLocation[location] = 0;
      }
      suppliersByLocation[location]++;
    });

    const analytics = {
      summary: {
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        suppliersWithInventory: Object.keys(supplierMetrics).length
      },
      supplierMetrics,
      suppliersByLocation,
      topSuppliers: Object.entries(supplierMetrics)
        .sort(([,a], [,b]) => b.totalValue - a.totalValue)
        .slice(0, 5)
        .map(([supplierId, metrics]) => {
          const supplier = suppliers.find(s => s.id === supplierId);
          return {
            supplier_id: supplierId,
            supplier_name: supplier?.supplier_name || 'Unknown',
            ...metrics
          };
        })
    };

    res.json({
      success: true,
      data: analytics,
      message: 'Supplier analytics fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Supplier analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch supplier analytics'
    });
  }
});

// Get suppliers by location
router.get('/location/:location', authenticateUser, async (req, res) => {
  try {
    const { location } = req.params;
    const userId = req.user.id;

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or(`city.ilike.%${location}%,state.ilike.%${location}%,country.ilike.%${location}%`);

    if (error) {
      logger.error('Error fetching suppliers by location:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch suppliers by location'
      });
    }

    res.json({
      success: true,
      data: suppliers,
      message: `Suppliers in ${location} fetched successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Suppliers by location fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch suppliers by location'
    });
  }
});

// Toggle supplier status
router.patch('/:id/toggle-status', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get current status
    const { data: supplier, error: fetchError } = await supabase
      .from('suppliers')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'NOT_FOUND',
          message: 'Supplier not found'
        });
      }
      logger.error('Error fetching supplier status:', fetchError);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch supplier status'
      });
    }

    // Toggle status
    const { data: updatedSupplier, error } = await supabase
      .from('suppliers')
      .update({ 
        is_active: !supplier.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error toggling supplier status:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to toggle supplier status'
      });
    }

    res.json({
      success: true,
      data: updatedSupplier,
      message: `Supplier ${updatedSupplier.is_active ? 'activated' : 'deactivated'} successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Supplier status toggle error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to toggle supplier status'
    });
  }
});

export default router;
