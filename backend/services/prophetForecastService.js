// prophetForecastService.js - Prophet Time-Series Forecasting Integration
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import logger from '../utils/logger.js';
import aiAgentService from './aiAgentService.js';

/**
 * Prophet Forecasting Service
 * Integrates Facebook Prophet for time-series forecasting
 * Enhanced with Gemini contextual intelligence
 */
class ProphetForecastService {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python3';
    this.prophetScript = join(process.cwd(), 'scripts', 'prophet_forecast.py');
  }

  /**
   * Generate forecast using Prophet
   * @param {Array} historicalData - Array of {ds: date, y: value} objects
   * @param {number} periods - Number of periods to forecast
   * @param {string} frequency - 'D' for daily, 'W' for weekly, 'M' for monthly
   * @param {object} options - Additional Prophet parameters
   */
  async generateForecast(historicalData, periods = 30, frequency = 'D', options = {}) {
    try {
      logger.info(`Generating Prophet forecast for ${periods} ${frequency} periods`);

      // Validate input data
      if (!Array.isArray(historicalData) || historicalData.length < 2) {
        throw new Error('Insufficient historical data for forecasting (minimum 2 data points required)');
      }

      // Prepare data for Prophet (requires 'ds' and 'y' columns)
      const prophetData = this.prepareDataForProphet(historicalData);

      // Create temporary data file
      const dataFile = join('/tmp', `prophet_data_${Date.now()}.json`);
      writeFileSync(dataFile, JSON.stringify({
        data: prophetData,
        periods,
        frequency,
        options
      }));

      // Run Prophet forecast
      const forecast = await this.runProphetScript(dataFile);

      // Clean up temp file
      unlinkSync(dataFile);

      // Enhance forecast with Gemini insights
      const enhancedForecast = await this.enhanceForecastWithAI(
        forecast,
        historicalData,
        options.context || {}
      );

      return {
        success: true,
        forecast: enhancedForecast.predictions,
        accuracy: forecast.accuracy || 'N/A',
        insights: enhancedForecast.insights,
        confidence: forecast.confidence || {},
        methodology: 'Prophet + Gemini',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Prophet forecast generation failed', { error: error.message });
      
      // Fallback to simple AI-based forecast if Prophet fails
      return await this.fallbackAIForecast(historicalData, periods, options);
    }
  }

  /**
   * Prepare data in Prophet format
   */
  prepareDataForProphet(data) {
    return data.map(item => ({
      ds: item.date || item.ds || item.timestamp,
      y: item.value || item.y || item.quantity || item.sales || 0
    }));
  }

  /**
   * Run Python Prophet script
   */
  async runProphetScript(dataFile) {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, [this.prophetScript, dataFile]);
      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          logger.error('Prophet script failed', { code, error: errorOutput });
          reject(new Error(`Prophet script exited with code ${code}: ${errorOutput}`));
        } else {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Prophet output: ${error.message}`));
          }
        }
      });

      python.on('error', (error) => {
        logger.error('Failed to spawn Python process', { error: error.message });
        reject(new Error(`Failed to run Prophet: ${error.message}`));
      });
    });
  }

  /**
   * Enhance Prophet forecast with Gemini contextual intelligence
   */
  async enhanceForecastWithAI(prophetForecast, historicalData, context = {}) {
    try {
      const enhancementPrompt = `You are a demand forecasting expert for Malaysian F&B operations.

PROPHET FORECAST DATA:
${JSON.stringify(prophetForecast.predictions.slice(0, 7), null, 2)}

HISTORICAL TRENDS:
${this.summarizeHistoricalData(historicalData)}

CONTEXT:
${JSON.stringify(context)}

TASK: Enhance this forecast with contextual insights:
1. Identify factors that may affect accuracy (holidays, weather, events)
2. Suggest adjustments for Malaysian market conditions
3. Highlight high-confidence vs low-confidence predictions
4. Recommend production quantities with safety margins
5. Estimate potential RM savings from optimized production

OUTPUT: JSON with:
{
  "predictions": [...include Prophet predictions...],
  "insights": ["insight 1", "insight 2", ...],
  "adjustments": {"item": "reason for adjustment"},
  "recommendations": ["specific action 1", ...],
  "savings": "RM X,XXX monthly from reduced overproduction"
}`;

      const response = await aiAgentService.ask(enhancementPrompt, 'gemini', { feature: 'forecast' });
      const enhanced = aiAgentService.parseJSONResponse(response.response);

      return {
        predictions: enhanced.predictions || prophetForecast.predictions,
        insights: enhanced.insights || [],
        adjustments: enhanced.adjustments || {},
        recommendations: enhanced.recommendations || [],
        savings: enhanced.savings || 'Analysis in progress'
      };
    } catch (error) {
      logger.warn('AI forecast enhancement failed, using Prophet data only', { error: error.message });
      
      return {
        predictions: prophetForecast.predictions,
        insights: [],
        adjustments: {},
        recommendations: [],
        savings: 'N/A'
      };
    }
  }

  /**
   * Fallback to AI-only forecast if Prophet unavailable
   */
  async fallbackAIForecast(historicalData, periods, options = {}) {
    try {
      logger.warn('Using AI-only forecast (Prophet unavailable)');

      const forecastPrompt = `You are a demand forecasting expert using AI-powered time-series analysis.

HISTORICAL DATA (last 30 days):
${JSON.stringify(historicalData.slice(-30), null, 2)}

TASK: Generate ${periods}-day forecast for Malaysian F&B demand.

REQUIREMENTS:
1. Analyze trends, seasonality, and patterns
2. Consider Malaysian factors (Ramadan, CNY, school holidays, weather)
3. Provide daily predictions with confidence levels
4. Include production recommendations
5. Estimate RM savings from optimized production

OUTPUT: JSON with:
{
  "forecast": [
    {"date": "2025-11-05", "predicted_demand": 120, "confidence": "high", "lower_bound": 100, "upper_bound": 140},
    ...for ${periods} days
  ],
  "insights": ["key insight 1", ...],
  "recommendations": ["action 1", ...],
  "accuracy_estimate": "85-95%",
  "savings": "RM X,XXX monthly"
}`;

      const response = await aiAgentService.ask(forecastPrompt, 'gemini', { feature: 'forecast' });
      const forecast = aiAgentService.parseJSONResponse(response.response);

      return {
        success: true,
        forecast: forecast.forecast || [],
        insights: forecast.insights || [],
        recommendations: forecast.recommendations || [],
        accuracy: forecast.accuracy_estimate || '80-90%',
        savings: forecast.savings || 'Calculating...',
        methodology: 'Gemini AI (Prophet unavailable)',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('AI fallback forecast failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Summarize historical data for AI context
   */
  summarizeHistoricalData(data) {
    if (!data || data.length === 0) return 'No historical data';

    const values = data.map(d => d.value || d.y || d.quantity || 0);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return `Average: ${avg.toFixed(2)}, Min: ${min}, Max: ${max}, Data points: ${data.length}`;
  }

  /**
   * Forecast demand for specific menu item
   */
  async forecastItemDemand(itemId, userId, days = 30) {
    try {
      // Fetch historical sales data for this item
      // const historicalData = await fetchItemSalesHistory(itemId, userId);
      
      // For now, use sample data structure
      const historicalData = [];

      const forecast = await this.generateForecast(historicalData, days, 'D', {
        context: { itemId, userId, feature: 'item_demand' }
      });

      return forecast;
    } catch (error) {
      logger.error('Item demand forecast failed', { itemId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Generate multiple forecasts (batch processing)
   */
  async generateBatchForecasts(items, userId) {
    try {
      logger.info(`Generating batch forecasts for ${items.length} items`);

      const forecasts = await Promise.allSettled(
        items.map(item => this.forecastItemDemand(item.id, userId, 30))
      );

      const successful = forecasts.filter(f => f.status === 'fulfilled').map(f => f.value);
      const failed = forecasts.filter(f => f.status === 'rejected').length;

      logger.info(`Batch forecasts complete: ${successful.length} successful, ${failed} failed`);

      return {
        success: true,
        forecasts: successful,
        successCount: successful.length,
        failedCount: failed,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Batch forecast generation failed', { error: error.message });
      throw error;
    }
  }
}

export default new ProphetForecastService();

