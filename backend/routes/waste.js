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
    logger.info('Waste route: Supabase client created successfully');
  } else {
    logger.warn('Waste route: Supabase environment variables not found, waste features will be disabled');
  }
} catch (error) {
  logger.error('Waste route: Failed to create Supabase client:', error.message);
}

// Get all waste logs for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 50, waste_type, outlet_id, date_from, date_to } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('waste_logs')
      .select(`
        *,
        outlets (
          id,
          outlet_name,
          address,
          city,
          state
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Apply filters
    if (waste_type) {
      query = query.eq('waste_type', waste_type);
    }
    if (outlet_id) {
      query = query.eq('outlet_id', outlet_id);
    }
    if (date_from) {
      query = query.gte('date', date_from);
    }
    if (date_to) {
      query = query.lte('date', date_to);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: wasteLogs, error } = await query;

    if (error) {
      logger.error('Error fetching waste logs:', error);
      return res.status(500).json({ error: 'Failed to fetch waste logs' });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('waste_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    res.json({
      success: true,
      data: wasteLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      },
      message: 'Waste logs fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Waste logs fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch waste logs'
    });
  }
});

// Get waste log by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: wasteLog, error } = await supabase
      .from('waste_logs')
      .select(`
        *,
        outlets (
          id,
          outlet_name,
          address,
          city,
          state
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
          message: 'Waste log not found'
        });
      }
      logger.error('Error fetching waste log:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch waste log'
      });
    }

    res.json({
      success: true,
      data: wasteLog,
      message: 'Waste log fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Waste log fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch waste log'
    });
  }
});

// Create new waste log
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      outlet_id,
      date,
      waste_type,
      quantity,
      unit,
      cost,
      reason,
      notes
    } = req.body;

    // Validate required fields
    if (!date || !waste_type || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Date, waste type, quantity, and unit are required'
      });
    }

    const wasteLogData = {
      user_id: userId,
      outlet_id: outlet_id || null,
      date,
      waste_type,
      quantity: parseFloat(quantity),
      unit,
      cost: cost ? parseFloat(cost) : null,
      reason: reason || null,
      notes: notes || null
    };

    const { data: newWasteLog, error } = await supabase
      .from('waste_logs')
      .insert([wasteLogData])
      .select()
      .single();

    if (error) {
      logger.error('Error creating waste log:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create waste log'
      });
    }

    res.status(201).json({
      success: true,
      data: newWasteLog,
      message: 'Waste log created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Waste log creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to create waste log'
    });
  }
});

// Update waste log
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

    // Convert numeric fields
    if (updateData.quantity) {
      updateData.quantity = parseFloat(updateData.quantity);
    }
    if (updateData.cost) {
      updateData.cost = parseFloat(updateData.cost);
    }

    const { data: updatedWasteLog, error } = await supabase
      .from('waste_logs')
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
          message: 'Waste log not found'
        });
      }
      logger.error('Error updating waste log:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to update waste log'
      });
    }

    res.json({
      success: true,
      data: updatedWasteLog,
      message: 'Waste log updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Waste log update error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to update waste log'
    });
  }
});

// Delete waste log
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('waste_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting waste log:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to delete waste log'
      });
    }

    res.json({
      success: true,
      message: 'Waste log deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Waste log deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete waste log'
    });
  }
});

// Get waste analytics
router.get('/analytics', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get waste data for the period
    const { data: wasteData, error } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (error) {
      logger.error('Error fetching waste analytics:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch waste analytics'
      });
    }

    // Calculate analytics
    const totalWaste = wasteData.reduce((sum, log) => sum + parseFloat(log.quantity), 0);
    const totalCost = wasteData.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);
    
    // Group by waste type
    const wasteByType = {};
    wasteData.forEach(log => {
      if (!wasteByType[log.waste_type]) {
        wasteByType[log.waste_type] = {
          quantity: 0,
          cost: 0,
          count: 0
        };
      }
      wasteByType[log.waste_type].quantity += parseFloat(log.quantity);
      wasteByType[log.waste_type].cost += parseFloat(log.cost) || 0;
      wasteByType[log.waste_type].count += 1;
    });

    // Group by date for trends
    const wasteByDate = {};
    wasteData.forEach(log => {
      if (!wasteByDate[log.date]) {
        wasteByDate[log.date] = {
          quantity: 0,
          cost: 0,
          count: 0
        };
      }
      wasteByDate[log.date].quantity += parseFloat(log.quantity);
      wasteByDate[log.date].cost += parseFloat(log.cost) || 0;
      wasteByDate[log.date].count += 1;
    });

    // Calculate averages
    const avgDailyWaste = totalWaste / parseInt(period);
    const avgDailyCost = totalCost / parseInt(period);
    const avgWastePerLog = wasteData.length > 0 ? totalWaste / wasteData.length : 0;

    const analytics = {
      summary: {
        totalWaste,
        totalCost,
        totalLogs: wasteData.length,
        avgDailyWaste,
        avgDailyCost,
        avgWastePerLog
      },
      wasteByType,
      wasteByDate: Object.entries(wasteByDate).map(([date, data]) => ({
        date,
        ...data
      })).sort((a, b) => new Date(a.date) - new Date(b.date)),
      period: parseInt(period),
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }
    };

    res.json({
      success: true,
      data: analytics,
      message: 'Waste analytics fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Waste analytics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch waste analytics'
    });
  }
});

// Get waste reports
router.get('/reports', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'summary', format = 'json' } = req.query;

    const { data: wasteData, error } = await supabase
      .from('waste_logs')
      .select(`
        *,
        outlets (
          outlet_name
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      logger.error('Error fetching waste reports:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch waste reports'
      });
    }

    if (type === 'summary') {
      // Generate summary report
      const totalWaste = wasteData.reduce((sum, log) => sum + parseFloat(log.quantity), 0);
      const totalCost = wasteData.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);
      
      const wasteByType = {};
      const wasteByOutlet = {};
      
      wasteData.forEach(log => {
        // By type
        if (!wasteByType[log.waste_type]) {
          wasteByType[log.waste_type] = { quantity: 0, cost: 0, count: 0 };
        }
        wasteByType[log.waste_type].quantity += parseFloat(log.quantity);
        wasteByType[log.waste_type].cost += parseFloat(log.cost) || 0;
        wasteByType[log.waste_type].count += 1;

        // By outlet
        const outletName = log.outlets?.outlet_name || 'Unknown';
        if (!wasteByOutlet[outletName]) {
          wasteByOutlet[outletName] = { quantity: 0, cost: 0, count: 0 };
        }
        wasteByOutlet[outletName].quantity += parseFloat(log.quantity);
        wasteByOutlet[outletName].cost += parseFloat(log.cost) || 0;
        wasteByOutlet[outletName].count += 1;
      });

      const report = {
        summary: {
          totalWaste,
          totalCost,
          totalLogs: wasteData.length,
          dateRange: {
            start: wasteData.length > 0 ? wasteData[wasteData.length - 1].date : null,
            end: wasteData.length > 0 ? wasteData[0].date : null
          }
        },
        wasteByType,
        wasteByOutlet,
        generatedAt: new Date().toISOString()
      };

      if (format === 'csv') {
        // Convert to CSV
        const csvHeaders = ['Waste Type', 'Quantity', 'Unit', 'Cost', 'Outlet', 'Date', 'Reason'];
        const csvRows = wasteData.map(log => [
          log.waste_type,
          log.quantity,
          log.unit,
          log.cost || '',
          log.outlets?.outlet_name || '',
          log.date,
          log.reason || ''
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="waste_report.csv"');
        res.send(csvContent);
      } else {
        res.json({
          success: true,
          data: report,
          message: 'Waste report generated successfully',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // Return raw data
      res.json({
        success: true,
        data: wasteData,
        message: 'Waste data fetched successfully',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Waste reports error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate waste reports'
    });
  }
});

// Bulk import waste logs
router.post('/bulk-import', authenticateUser, async (req, res) => {
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

    const wasteLogs = csvData.map(log => ({
      user_id: userId,
      outlet_id: log.outlet_id || null,
      date: log.date,
      waste_type: log.waste_type,
      quantity: parseFloat(log.quantity),
      unit: log.unit,
      cost: log.cost ? parseFloat(log.cost) : null,
      reason: log.reason || null,
      notes: log.notes || null
    }));

    const { data: importedLogs, error } = await supabase
      .from('waste_logs')
      .insert(wasteLogs)
      .select();

    if (error) {
      logger.error('Error importing waste logs:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to import waste logs'
      });
    }

    res.status(201).json({
      success: true,
      data: importedLogs,
      message: `${importedLogs.length} waste logs imported successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Waste logs import error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to import waste logs'
    });
  }
});

export default router;
