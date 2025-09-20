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
    logger.info('Inventory route: Supabase client created successfully');
  } else {
    logger.warn('Inventory route: Supabase environment variables not found, inventory features will be disabled');
  }
} catch (error) {
  logger.error('Inventory route: Failed to create Supabase client:', error.message);
}

// Get all inventory items for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, outlet_id, search } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('inventory')
      .select(`
        *,
        outlets (
          id,
          outlet_name,
          address,
          city,
          state
        ),
        suppliers (
          id,
          supplier_name,
          contact_person,
          email,
          phone
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (outlet_id) {
      query = query.eq('outlet_id', outlet_id);
    }
    if (search) {
      query = query.ilike('item_name', `%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: inventory, error } = await query;

    if (error) {
      logger.error('Error fetching inventory:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    res.json({
      success: true,
      data: inventory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      message: 'Inventory fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Inventory fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch inventory'
    });
  }
});

// Get inventory item by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: item, error } = await supabase
      .from('inventory')
      .select(`
        *,
        outlets (
          id,
          outlet_name,
          address,
          city,
          state
        ),
        suppliers (
          id,
          supplier_name,
          contact_person,
          email,
          phone
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          error: 'NOT_FOUND',
          message: 'Inventory item not found'
        });
      }
      logger.error('Error fetching inventory item:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch inventory item'
      });
    }

    res.json({
      success: true,
      data: item,
      message: 'Inventory item fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Inventory item fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch inventory item'
    });
  }
});

// Create new inventory item
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      outlet_id,
      item_name,
      category,
      unit,
      current_stock,
      min_stock,
      max_stock,
      cost_per_unit,
      supplier_id,
      expiry_date
    } = req.body;

    // Validate required fields
    if (!item_name || !category || !unit) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Item name, category, and unit are required'
      });
    }

    const inventoryData = {
      user_id: userId,
      outlet_id: outlet_id || null,
      item_name,
      category,
      unit,
      current_stock: parseFloat(current_stock) || 0,
      min_stock: parseFloat(min_stock) || 0,
      max_stock: parseFloat(max_stock) || 0,
      cost_per_unit: cost_per_unit ? parseFloat(cost_per_unit) : null,
      supplier_id: supplier_id || null,
      expiry_date: expiry_date || null,
      is_active: true
    };

    const { data: newItem, error } = await supabase
      .from('inventory')
      .insert([inventoryData])
      .select()
      .single();

    if (error) {
      logger.error('Error creating inventory item:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create inventory item'
      });
    }

    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Inventory item created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Inventory creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to create inventory item'
    });
  }
});

// Update inventory item
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

    const { data: updatedItem, error } = await supabase
      .from('inventory')
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
          message: 'Inventory item not found'
        });
      }
      logger.error('Error updating inventory item:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to update inventory item'
      });
    }

    res.json({
      success: true,
      data: updatedItem,
      message: 'Inventory item updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Inventory update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to update inventory item'
    });
  }
});

// Delete inventory item (soft delete)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('inventory')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting inventory item:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to delete inventory item'
      });
    }

    res.json({
      success: true,
      message: 'Inventory item deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Inventory deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete inventory item'
    });
  }
});

// Get inventory categories
router.get('/categories', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: categories, error } = await supabase
      .from('inventory')
      .select('category')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      logger.error('Error fetching categories:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch categories'
      });
    }

    // Get unique categories
    const uniqueCategories = [...new Set(categories.map(item => item.category))].filter(Boolean);

    res.json({
      success: true,
      data: uniqueCategories,
      message: 'Categories fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Categories fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch categories'
    });
  }
});

// Get inventory analytics
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get low stock items
    const { data: lowStock, error: lowStockError } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('current_stock', supabase.rpc('min_stock'));

    // Get expiring items (within 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const { data: expiringItems, error: expiringError } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', sevenDaysFromNow.toISOString().split('T')[0]);

    // Get category distribution
    const { data: categoryData, error: categoryError } = await supabase
      .from('inventory')
      .select('category, current_stock, cost_per_unit')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Calculate category totals
    const categoryTotals = {};
    if (categoryData) {
      categoryData.forEach(item => {
        if (!categoryTotals[item.category]) {
          categoryTotals[item.category] = {
            count: 0,
            totalValue: 0,
            totalStock: 0
          };
        }
        categoryTotals[item.category].count++;
        categoryTotals[item.category].totalStock += parseFloat(item.current_stock) || 0;
        categoryTotals[item.category].totalValue += (parseFloat(item.current_stock) || 0) * (parseFloat(item.cost_per_unit) || 0);
      });
    }

    const analytics = {
      lowStock: lowStock || [],
      expiringItems: expiringItems || [],
      categoryTotals,
      totalItems: categoryData?.length || 0,
      totalValue: Object.values(categoryTotals).reduce((sum, cat) => sum + cat.totalValue, 0)
    };

    res.json({
      success: true,
      data: analytics,
      message: 'Inventory analytics fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Inventory analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch inventory analytics'
    });
  }
});

// Import inventory from CSV
router.post('/import', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { csvData } = req.body;

    if (!csvData || !Array.isArray(csvData)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'CSV data is required and must be an array'
      });
    }

    const inventoryItems = csvData.map(item => ({
      user_id: userId,
      outlet_id: item.outlet_id || null,
      item_name: item.item_name,
      category: item.category,
      unit: item.unit,
      current_stock: parseFloat(item.current_stock) || 0,
      min_stock: parseFloat(item.min_stock) || 0,
      max_stock: parseFloat(item.max_stock) || 0,
      cost_per_unit: item.cost_per_unit ? parseFloat(item.cost_per_unit) : null,
      supplier_id: item.supplier_id || null,
      expiry_date: item.expiry_date || null,
      is_active: true
    }));

    const { data: importedItems, error } = await supabase
      .from('inventory')
      .insert(inventoryItems)
      .select();

    if (error) {
      logger.error('Error importing inventory:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to import inventory'
      });
    }

    res.status(201).json({
      success: true,
      data: importedItems,
      message: `${importedItems.length} inventory items imported successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Inventory import error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to import inventory'
    });
  }
});

// Export inventory to CSV
router.get('/export', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'csv' } = req.query;

    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        *,
        outlets (
          outlet_name
        ),
        suppliers (
          supplier_name
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      logger.error('Error exporting inventory:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to export inventory'
      });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Item Name',
        'Category',
        'Unit',
        'Current Stock',
        'Min Stock',
        'Max Stock',
        'Cost Per Unit',
        'Supplier',
        'Outlet',
        'Expiry Date'
      ];

      const csvRows = inventory.map(item => [
        item.item_name,
        item.category,
        item.unit,
        item.current_stock,
        item.min_stock,
        item.max_stock,
        item.cost_per_unit || '',
        item.suppliers?.supplier_name || '',
        item.outlets?.outlet_name || '',
        item.expiry_date || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="inventory_export.csv"');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: inventory,
        message: 'Inventory exported successfully',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Inventory export error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to export inventory'
    });
  }
});

export default router;
