// dataPipelineOrchestrator.js - Orchestrate data flow from multiple sources
import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';
import aiAgentService from './aiAgentService.js';
import prophetForecastService from './prophetForecastService.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

/**
 * Data Pipeline Orchestrator
 * Integrates data from CRM, ERP, file uploads, and manual entries
 * Ensures seamless flow into AI agent and forecasting workflows
 */
class DataPipelineOrchestrator {
  constructor() {
    this.dataStreams = new Map();
    this.integrationStatus = {
      supabase: !!supabase,
      crm: false, // To be configured
      erp: false, // To be configured
      fileUploads: true,
      manualEntry: true
    };
  }

  /**
   * Aggregate data from all sources for a specific feature
   */
  async aggregateDataForFeature(feature, userId, timeRange = '30d') {
    try {
      logger.info(`Aggregating data for feature: ${feature}`, { userId, timeRange });

      const dataSources = await Promise.allSettled([
        this.fetchSupabaseData(feature, userId, timeRange),
        this.fetchUploadedData(feature, userId, timeRange),
        this.fetchCRMData(feature, userId, timeRange),
        this.fetchERPData(feature, userId, timeRange)
      ]);

      const aggregatedData = {
        supabase: dataSources[0].status === 'fulfilled' ? dataSources[0].value : [],
        uploads: dataSources[1].status === 'fulfilled' ? dataSources[1].value : [],
        crm: dataSources[2].status === 'fulfilled' ? dataSources[2].value : [],
        erp: dataSources[3].status === 'fulfilled' ? dataSources[3].value : [],
        metadata: {
          feature,
          userId,
          timeRange,
          timestamp: new Date().toISOString()
        }
      };

      // Merge all sources into unified dataset
      const unifiedData = this.mergeDataSources(aggregatedData);

      return {
        success: true,
        data: unifiedData,
        sources: {
          supabase: aggregatedData.supabase.length,
          uploads: aggregatedData.uploads.length,
          crm: aggregatedData.crm.length,
          erp: aggregatedData.erp.length
        },
        totalRecords: unifiedData.length
      };
    } catch (error) {
      logger.error('Data aggregation failed', { feature, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Fetch data from Supabase
   */
  async fetchSupabaseData(feature, userId, timeRange) {
    if (!supabase) return [];

    try {
      const startDate = this.getStartDate(timeRange);
      let query;

      switch (feature) {
        case 'waste':
          query = supabase
            .from('waste_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });
          break;

        case 'inventory':
          query = supabase
            .from('inventory')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);
          break;

        case 'forecast':
          query = supabase
            .from('sales_pos_data')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false});
          break;

        case 'suppliers':
          query = supabase
            .from('supplier_orders')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });
          break;

        case 'staff':
          query = supabase
            .from('training_records')
            .select('*')
            .eq('user_id', userId)
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });
          break;

        default:
          return [];
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Supabase data fetch failed', { feature, error: error.message });
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Supabase fetch error', { feature, error: error.message });
      return [];
    }
  }

  /**
   * Fetch uploaded file data from memory store
   */
  async fetchUploadedData(feature, userId, timeRange) {
    try {
      const sessionKey = `${userId}_${feature}_upload`;
      const storedData = aiAgentService.getFromMemory(sessionKey);
      
      return storedData ? [storedData] : [];
    } catch (error) {
      logger.error('Upload data fetch failed', { error: error.message });
      return [];
    }
  }

  /**
   * Fetch CRM data (placeholder for future integration)
   */
  async fetchCRMData(feature, userId, timeRange) {
    // TODO: Implement CRM integration
    // This would connect to external CRM APIs like Salesforce, HubSpot, etc.
    logger.info('CRM integration not yet configured');
    return [];
  }

  /**
   * Fetch ERP data (placeholder for future integration)
   */
  async fetchERPData(feature, userId, timeRange) {
    // TODO: Implement ERP integration
    // This would connect to ERP systems like SAP, Oracle, Odoo, etc.
    logger.info('ERP integration not yet configured');
    return [];
  }

  /**
   * Merge data from multiple sources
   */
  mergeDataSources(aggregatedData) {
    try {
      const allData = [
        ...aggregatedData.supabase,
        ...aggregatedData.uploads,
        ...aggregatedData.crm,
        ...aggregatedData.erp
      ];

      // Remove duplicates based on ID or unique identifier
      const uniqueData = Array.from(
        new Map(allData.map(item => [item.id || JSON.stringify(item), item])).values()
      );

      // Sort by date (most recent first)
      return uniqueData.sort((a, b) => {
        const dateA = new Date(a.created_at || a.date || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.date || b.timestamp || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      logger.error('Data merge failed', { error: error.message });
      return [];
    }
  }

  /**
   * Process data pipeline for forecasting
   */
  async processForecastPipeline(userId, itemId = null) {
    try {
      logger.info('Processing forecast pipeline', { userId, itemId });

      // 1. Aggregate historical sales data
      const aggregated = await this.aggregateDataForFeature('forecast', userId, '1y');

      // 2. Prepare for Prophet
      const timeSeriesData = this.convertToTimeSeries(aggregated.data, itemId);

      // 3. Generate Prophet forecast
      const forecast = await prophetForecastService.generateForecast(
        timeSeriesData,
        30, // 30-day forecast
        'D', // Daily frequency
        { context: { userId, itemId } }
      );

      // 4. Store forecast results
      await this.storeForecastResults(userId, itemId, forecast);

      return {
        success: true,
        forecast,
        dataPoints: timeSeriesData.length,
        sources: aggregated.sources
      };
    } catch (error) {
      logger.error('Forecast pipeline failed', { userId, itemId, error: error.message });
      throw error;
    }
  }

  /**
   * Convert aggregated data to time-series format
   */
  convertToTimeSeries(data, itemId = null) {
    try {
      let filtered = data;

      // Filter by item if specified
      if (itemId) {
        filtered = data.filter(d => d.item_id === itemId || d.id === itemId);
      }

      // Convert to {ds, y} format for Prophet
      return filtered.map(item => ({
        ds: item.date || item.created_at || item.timestamp,
        y: item.sales || item.quantity || item.revenue || 0
      }));
    } catch (error) {
      logger.error('Time-series conversion failed', { error: error.message });
      return [];
    }
  }

  /**
   * Store forecast results
   */
  async storeForecastResults(userId, itemId, forecast) {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('forecast_models_results')
        .insert([{
          user_id: userId,
          item_id: itemId,
          forecast_data: forecast.forecast,
          accuracy: forecast.accuracy,
          methodology: forecast.methodology,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        logger.error('Failed to store forecast results', { error: error.message });
      } else {
        logger.info('Forecast results stored successfully');
      }
    } catch (error) {
      logger.error('Store forecast error', { error: error.message });
    }
  }

  /**
   * Get start date from time range string
   */
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Get integration status
   */
  getIntegrationStatus() {
    return {
      ...this.integrationStatus,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Register new data stream (for CRM/ERP integrations)
   */
  registerDataStream(streamId, fetchFunction) {
    this.dataStreams.set(streamId, fetchFunction);
    logger.info(`Data stream registered: ${streamId}`);
  }

  /**
   * Process uploaded file into pipeline
   */
  async processUploadedFile(feature, parsedData, userId) {
    try {
      logger.info(`Processing uploaded data into pipeline`, { feature, userId, records: parsedData.length });

      // Store in memory for immediate use
      const sessionKey = `${userId}_${feature}_pipeline`;
      aiAgentService.storeInMemory(sessionKey, {
        data: parsedData,
        source: 'upload',
        timestamp: new Date().toISOString()
      }, 120); // Store for 2 hours

      // If forecast data, trigger forecast pipeline
      if (feature === 'forecast' && Array.isArray(parsedData) && parsedData.length > 0) {
        await this.processForecastPipeline(userId);
      }

      return {
        success: true,
        stored: true,
        recordCount: parsedData.length
      };
    } catch (error) {
      logger.error('Upload pipeline processing failed', { error: error.message });
      throw error;
    }
  }
}

export default new DataPipelineOrchestrator();

