import express from 'express';
import { getRecommendations, getMultiSectionRecommendations } from '../ai/recommendations.js';
import { getAnalyticsData } from '../ai/analytics.js';
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
    logger.info('AI route: Supabase client created successfully');
  } else {
    logger.warn('AI route: Supabase environment variables not found, AI features will be disabled');
  }
} catch (error) {
  logger.error('AI route: Failed to create Supabase client:', error.message);
}

// Get AI recommendations
router.get('/recommendations', authenticateUser, async (req, res) => {
  try {
    const { section = 'dashboard', provider = 'auto', context } = req.query;
    const userId = req.user.id;

    // Get user context data if available
    let userContext = {};
    if (supabase && context === 'user_data') {
      try {
        // Get user's inventory, waste, and supplier data for context
        const [inventoryResult, wasteResult, supplierResult] = await Promise.all([
          supabase.from('inventory').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
          supabase.from('waste_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10),
          supabase.from('suppliers').select('*').eq('user_id', userId).eq('is_active', true).limit(10)
        ]);

        userContext = {
          inventory: inventoryResult.data || [],
          waste: wasteResult.data || [],
          suppliers: supplierResult.data || []
        };
      } catch (contextError) {
        logger.warn('Failed to fetch user context for AI recommendations:', contextError);
      }
    }

    const result = await getRecommendations(section, provider, userContext);

    res.json({
      success: true,
      data: result,
      message: 'AI recommendations fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI recommendations error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch AI recommendations'
    });
  }
});

// Chat with AI
router.post('/chat', authenticateUser, async (req, res) => {
  try {
    const { message, context = 'general', provider = 'auto' } = req.body;
    const userId = req.user.id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Message is required and must be a string'
      });
    }

    // Get user context data if requested
    let userContext = {};
    if (supabase && context !== 'general') {
      try {
        // Get relevant user data based on context
        switch (context) {
          case 'inventory':
            const { data: inventory } = await supabase
              .from('inventory')
              .select('*')
              .eq('user_id', userId)
              .eq('is_active', true)
              .limit(20);
            userContext = { inventory: inventory || [] };
            break;
          
          case 'waste':
            const { data: waste } = await supabase
              .from('waste_logs')
              .select('*')
              .eq('user_id', userId)
              .order('date', { ascending: false })
              .limit(20);
            userContext = { waste: waste || [] };
            break;
          
          case 'suppliers':
            const { data: suppliers } = await supabase
              .from('suppliers')
              .select('*')
              .eq('user_id', userId)
              .eq('is_active', true)
              .limit(20);
            userContext = { suppliers: suppliers || [] };
            break;
          
          case 'outlets':
            const { data: outlets } = await supabase
              .from('outlets')
              .select('*')
              .eq('user_id', userId)
              .eq('is_active', true)
              .limit(20);
            userContext = { outlets: outlets || [] };
            break;
          
          case 'all':
            const [inventoryResult, wasteResult, supplierResult, outletResult] = await Promise.all([
              supabase.from('inventory').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
              supabase.from('waste_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(10),
              supabase.from('suppliers').select('*').eq('user_id', userId).eq('is_active', true).limit(10),
              supabase.from('outlets').select('*').eq('user_id', userId).eq('is_active', true).limit(10)
            ]);
            userContext = {
              inventory: inventoryResult.data || [],
              waste: wasteResult.data || [],
              suppliers: supplierResult.data || [],
              outlets: outletResult.data || []
            };
            break;
        }
      } catch (contextError) {
        logger.warn('Failed to fetch user context for AI chat:', contextError);
      }
    }

    // Generate AI response using the existing recommendation system
    const chatResult = await getRecommendations('chat', provider, {
      ...userContext,
      userMessage: message,
      context: context
    });

    res.json({
      success: true,
      data: {
        message: message,
        response: chatResult.recommendations || chatResult.message || 'I apologize, but I cannot process your request at the moment.',
        context: context,
        provider: chatResult.provider || provider,
        timestamp: new Date().toISOString()
      },
      message: 'AI chat response generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to process AI chat request'
    });
  }
});

// Get demand forecast
router.get('/forecast', authenticateUser, async (req, res) => {
  try {
    const { type = 'demand', period = '30', outlet_id } = req.query;
    const userId = req.user.id;

    let forecastData = {};
    
    if (supabase) {
      try {
        // Get historical data for forecasting
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(period));

        let query = supabase
          .from('waste_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0]);

        if (outlet_id) {
          query = query.eq('outlet_id', outlet_id);
        }

        const { data: wasteData, error: wasteError } = await query;

        if (!wasteError && wasteData) {
          // Generate basic forecast based on historical data
          const wasteByType = {};
          const wasteByDate = {};

          wasteData.forEach(log => {
            // Group by waste type
            if (!wasteByType[log.waste_type]) {
              wasteByType[log.waste_type] = [];
            }
            wasteByType[log.waste_type].push(parseFloat(log.quantity) || 0);

            // Group by date
            if (!wasteByDate[log.date]) {
              wasteByDate[log.date] = 0;
            }
            wasteByDate[log.date] += parseFloat(log.quantity) || 0;
          });

          // Calculate trends and forecasts
          const forecasts = {};
          Object.keys(wasteByType).forEach(type => {
            const values = wasteByType[type];
            if (values.length > 0) {
              const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
              const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0;
              
              forecasts[type] = {
                currentAverage: avg,
                trend: trend,
                forecastNext: Math.max(0, avg + trend),
                confidence: Math.min(95, Math.max(50, 100 - (values.length * 2)))
              };
            }
          });

          forecastData = {
            type: type,
            period: parseInt(period),
            outlet_id: outlet_id,
            forecasts: forecasts,
            historicalData: wasteByDate,
            generatedAt: new Date().toISOString()
          };
        }
      } catch (forecastError) {
        logger.warn('Failed to generate forecast:', forecastError);
      }
    }

    // If no data available, return mock forecast
    if (Object.keys(forecastData).length === 0) {
      forecastData = {
        type: type,
        period: parseInt(period),
        outlet_id: outlet_id,
        forecasts: {
          'Food Waste': {
            currentAverage: 15.5,
            trend: 2.3,
            forecastNext: 17.8,
            confidence: 85
          },
          'Packaging': {
            currentAverage: 8.2,
            trend: -0.5,
            forecastNext: 7.7,
            confidence: 78
          }
        },
        historicalData: {},
        generatedAt: new Date().toISOString(),
        note: 'This is a sample forecast. Connect your data for accurate predictions.'
      };
    }

    res.json({
      success: true,
      data: forecastData,
      message: 'Demand forecast generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI forecast error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate forecast'
    });
  }
});

// Analyze data with AI
router.post('/analyze', authenticateUser, async (req, res) => {
  try {
    const { data, analysis_type = 'general', provider = 'auto' } = req.body;
    const userId = req.user.id;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Data is required for analysis'
      });
    }

    // Prepare context for analysis
    const analysisContext = {
      data: data,
      analysis_type: analysis_type,
      user_id: userId
    };

    // Get AI analysis using the recommendation system
    const analysisResult = await getRecommendations('analysis', provider, analysisContext);

    res.json({
      success: true,
      data: {
        analysis_type: analysis_type,
        input_data: data,
        analysis: analysisResult.recommendations || analysisResult.message || 'Analysis completed',
        insights: analysisResult.insights || [],
        recommendations: analysisResult.recommendations || [],
        provider: analysisResult.provider || provider,
        timestamp: new Date().toISOString()
      },
      message: 'Data analysis completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to analyze data'
    });
  }
});

// Get multiple section recommendations
router.get('/multi-section', authenticateUser, async (req, res) => {
  try {
    const { sections = 'dashboard,waste,supplier,menu', provider = 'auto' } = req.query;
    const userId = req.user.id;

    const sectionArray = Array.isArray(sections) ? sections : sections.split(',');
    
    // Get user context data
    let userContext = {};
    if (supabase) {
      try {
        const [inventoryResult, wasteResult, supplierResult, outletResult] = await Promise.all([
          supabase.from('inventory').select('*').eq('user_id', userId).eq('is_active', true).limit(15),
          supabase.from('waste_logs').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(15),
          supabase.from('suppliers').select('*').eq('user_id', userId).eq('is_active', true).limit(15),
          supabase.from('outlets').select('*').eq('user_id', userId).eq('is_active', true).limit(15)
        ]);

        userContext = {
          inventory: inventoryResult.data || [],
          waste: wasteResult.data || [],
          suppliers: supplierResult.data || [],
          outlets: outletResult.data || []
        };
      } catch (contextError) {
        logger.warn('Failed to fetch user context for multi-section recommendations:', contextError);
      }
    }

    const results = await getMultiSectionRecommendations(sectionArray, provider, userContext);

    res.json({
      success: true,
      data: results,
      message: 'Multi-section recommendations fetched successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Multi-section AI recommendations error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch multi-section recommendations'
    });
  }
});

// Get AI service status
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const status = {
      gemini: {
        available: !!process.env.GEMINI_API_KEY,
        status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
      },
      openai: {
        available: !!process.env.OPENAI_API_KEY,
        status: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
      },
      supabase: {
        available: !!supabase,
        status: supabase ? 'connected' : 'not_connected'
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status,
      message: 'AI service status retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to get AI service status'
    });
  }
});

export default router;
