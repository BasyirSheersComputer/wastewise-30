// Statistical Models Implementation for Servora AI
// Based on PRD Implementation Methodology

import { getTopSellingItems, getWasteStats } from '../database/db.js';
import logger from '../utils/logger.js';

/**
 * Feature Engineering Framework
 */
export class FeatureEngine {
  constructor() {
    this.temporalFeatures = new TemporalFeatureEngine();
    this.categoricalEncoder = new CategoricalEncoder();
    this.lagEngine = new LagFeatureEngine();
  }

  async extractFeatures(data) {
    try {
      // Extract temporal features
      const temporalFeatures = await this.temporalFeatures.extractFeatures(data);
      
      // Encode categorical features
      const encodedFeatures = await this.categoricalEncoder.encodeFeatures(
        temporalFeatures, 'quantity'
      );
      
      // Create lag features
      const lagFeatures = await this.lagEngine.createLagFeatures(
        encodedFeatures, 'quantity'
      );
      
      return lagFeatures;
    } catch (error) {
      logger.error('Feature extraction failed:', error);
      return data;
    }
  }
}

/**
 * Temporal Feature Engineering
 */
export class TemporalFeatureEngine {
  extractFeatures(data) {
    try {
      const features = data.map(item => {
        const timestamp = new Date(item.date || item.timestamp || Date.now());
        
        return {
          ...item,
          hour: timestamp.getHours(),
          day_of_week: timestamp.getDay(),
          day_of_month: timestamp.getDate(),
          month: timestamp.getMonth() + 1,
          quarter: Math.ceil((timestamp.getMonth() + 1) / 3),
          is_weekend: [0, 6].includes(timestamp.getDay()),
          is_holiday: this._checkHolidays(timestamp),
          // Rolling statistics (simplified for demo)
          sales_7d_avg: this._calculateRollingAverage(data, item, 7),
          sales_30d_avg: this._calculateRollingAverage(data, item, 30),
          sales_trend_7d: this._calculateTrend(data, item, 7)
        };
      });
      
      return features;
    } catch (error) {
      logger.error('Temporal feature extraction failed:', error);
      return data;
    }
  }

  _checkHolidays(timestamp) {
    // Simplified holiday check - in production, use proper holiday API
    const holidays = [
      '2024-01-01', '2024-07-04', '2024-12-25'
    ];
    const dateStr = timestamp.toISOString().split('T')[0];
    return holidays.includes(dateStr);
  }

  _calculateRollingAverage(data, currentItem, window) {
    // Simplified rolling average calculation
    const currentIndex = data.findIndex(item => item.id === currentItem.id);
    if (currentIndex < window - 1) return currentItem.quantity || 0;
    
    const windowData = data.slice(currentIndex - window + 1, currentIndex + 1);
    const sum = windowData.reduce((acc, item) => acc + (item.quantity || 0), 0);
    return sum / window;
  }

  _calculateTrend(data, currentItem, window) {
    // Simplified trend calculation
    const currentIndex = data.findIndex(item => item.id === currentItem.id);
    if (currentIndex < window - 1) return 0;
    
    const windowData = data.slice(currentIndex - window + 1, currentIndex + 1);
    const quantities = windowData.map(item => item.quantity || 0);
    
    // Simple linear trend
    const n = quantities.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = quantities;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope || 0;
  }
}

/**
 * Categorical Feature Encoding
 */
export class CategoricalEncoder {
  encodeFeatures(data, targetCol) {
    try {
      const encodedData = data.map(item => {
        const encoded = { ...item };
        
        // Target encoding for categorical features
        if (item.category) {
          encoded.category_target_encoded = this._targetEncode(data, 'category', targetCol, item.category);
        }
        
        if (item.reason) {
          encoded.reason_target_encoded = this._targetEncode(data, 'reason', targetCol, item.reason);
        }
        
        // Frequency encoding
        if (item.category) {
          encoded.category_frequency = this._frequencyEncode(data, 'category', item.category);
        }
        
        return encoded;
      });
      
      return encodedData;
    } catch (error) {
      logger.error('Categorical encoding failed:', error);
      return data;
    }
  }

  _targetEncode(data, column, targetCol, value) {
    const matchingItems = data.filter(item => item[column] === value);
    if (matchingItems.length === 0) return 0;
    
    const sum = matchingItems.reduce((acc, item) => acc + (item[targetCol] || 0), 0);
    return sum / matchingItems.length;
  }

  _frequencyEncode(data, column, value) {
    const totalCount = data.length;
    const valueCount = data.filter(item => item[column] === value).length;
    return valueCount / totalCount;
  }
}

/**
 * Lag Feature Engineering
 */
export class LagFeatureEngine {
  createLagFeatures(data, targetCol, lags = [1, 2, 3, 7, 14, 30]) {
    try {
      // Sort data by date
      const sortedData = [...data].sort((a, b) => 
        new Date(a.date || a.timestamp) - new Date(b.date || b.timestamp)
      );
      
      const features = sortedData.map((item, index) => {
        const feature = { ...item };
        
        // Create lag features
        lags.forEach(lag => {
          const lagIndex = index - lag;
          if (lagIndex >= 0) {
            feature[`${targetCol}_lag_${lag}`] = sortedData[lagIndex][targetCol] || 0;
          } else {
            feature[`${targetCol}_lag_${lag}`] = 0;
          }
        });
        
        // Moving averages
        const windows = [3, 7, 14, 30];
        windows.forEach(window => {
          feature[`${targetCol}_ma_${window}`] = this._calculateMovingAverage(
            sortedData, index, targetCol, window
          );
        });
        
        return feature;
      });
      
      return features;
    } catch (error) {
      logger.error('Lag feature creation failed:', error);
      return data;
    }
  }

  _calculateMovingAverage(data, currentIndex, targetCol, window) {
    const startIndex = Math.max(0, currentIndex - window + 1);
    const windowData = data.slice(startIndex, currentIndex + 1);
    const sum = windowData.reduce((acc, item) => acc + (item[targetCol] || 0), 0);
    return sum / windowData.length;
  }
}

/**
 * Demand Forecasting Models
 */
export class DemandForecaster {
  constructor() {
    this.arimaForecaster = new ARIMAForecaster();
    this.exponentialSmoothing = new ExponentialSmoothingForecaster();
    this.ensembleForecaster = new EnsembleForecaster();
  }

  async forecastDemand(data, forecastHorizon = 30) {
    try {
      // Prepare data for forecasting
      const preparedData = await this._prepareForecastingData(data);
      
      // Generate forecasts using different models
      const forecasts = await Promise.allSettled([
        this.arimaForecaster.forecast_demand(preparedData, forecastHorizon),
        this.exponentialSmoothing.forecast_with_smoothing(preparedData, 'triple'),
        this.ensembleForecaster.train_ensemble(preparedData)
      ]);
      
      // Combine results
      const results = {
        arima: forecasts[0].status === 'fulfilled' ? forecasts[0].value : null,
        exponential_smoothing: forecasts[1].status === 'fulfilled' ? forecasts[1].value : null,
        ensemble: forecasts[2].status === 'fulfilled' ? forecasts[2].value : null,
        timestamp: new Date().toISOString()
      };
      
      return results;
    } catch (error) {
      logger.error('Demand forecasting failed:', error);
      return { error: error.message, timestamp: new Date().toISOString() };
    }
  }

  async _prepareForecastingData(data) {
    // Convert data to time series format
    const timeSeries = data.map(item => ({
      date: new Date(item.date || item.timestamp),
      value: item.quantity || 0,
      sku: item.inventory_id || item.item_id
    })).sort((a, b) => a.date - b.date);
    
    return timeSeries;
  }
}

/**
 * ARIMA Forecasting
 */
export class ARIMAForecaster {
  async forecast_demand(data, forecastHorizon = 30) {
    try {
      // Simplified ARIMA implementation
      const values = data.map(item => item.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      
      // Simple trend calculation
      const trend = this._calculateTrend(values);
      
      // Generate forecast
      const forecast = [];
      let lastValue = values[values.length - 1];
      
      for (let i = 0; i < forecastHorizon; i++) {
        const predictedValue = lastValue + trend + (Math.random() - 0.5) * Math.sqrt(variance) * 0.1;
        forecast.push(Math.max(0, predictedValue)); // Ensure non-negative
        lastValue = predictedValue;
      }
      
      return {
        forecast,
        confidence_intervals: this._calculateConfidenceIntervals(forecast, variance),
        model_params: { mean, variance, trend },
        rmse: this._calculateRMSE(values, values.map(() => mean))
      };
    } catch (error) {
      logger.error('ARIMA forecasting failed:', error);
      return { error: error.message };
    }
  }

  _calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  _calculateConfidenceIntervals(forecast, variance) {
    const zScore = 1.96; // 95% confidence
    const margin = zScore * Math.sqrt(variance);
    
    return forecast.map(value => ({
      lower: Math.max(0, value - margin),
      upper: value + margin
    }));
  }

  _calculateRMSE(actual, predicted) {
    const squaredErrors = actual.map((val, i) => Math.pow(val - predicted[i], 2));
    const mse = squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length;
    return Math.sqrt(mse);
  }
}

/**
 * Exponential Smoothing Forecasting
 */
export class ExponentialSmoothingForecaster {
  async forecast_with_smoothing(data, method = 'triple') {
    try {
      const values = data.map(item => item.value);
      
      let forecast;
      switch (method) {
        case 'simple':
          forecast = this._simpleExponentialSmoothing(values);
          break;
        case 'double':
          forecast = this._doubleExponentialSmoothing(values);
          break;
        case 'triple':
          forecast = this._tripleExponentialSmoothing(values);
          break;
        default:
          forecast = this._tripleExponentialSmoothing(values);
      }
      
      return {
        forecast,
        fitted_values: this._getFittedValues(values, method),
        method,
        aic: this._calculateAIC(values, forecast),
        bic: this._calculateBIC(values, forecast)
      };
    } catch (error) {
      logger.error('Exponential smoothing failed:', error);
      return { error: error.message };
    }
  }

  _simpleExponentialSmoothing(values, alpha = 0.3) {
    if (values.length === 0) return [];
    
    const smoothed = [values[0]];
    for (let i = 1; i < values.length; i++) {
      smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1]);
    }
    
    // Generate forecast
    const forecast = [];
    let lastSmoothed = smoothed[smoothed.length - 1];
    for (let i = 0; i < 30; i++) {
      forecast.push(lastSmoothed);
    }
    
    return forecast;
  }

  _doubleExponentialSmoothing(values, alpha = 0.3, beta = 0.3) {
    if (values.length < 2) return this._simpleExponentialSmoothing(values, alpha);
    
    const level = [values[0]];
    const trend = [values[1] - values[0]];
    
    for (let i = 1; i < values.length; i++) {
      const prevLevel = level[i - 1];
      const prevTrend = trend[i - 1];
      
      const newLevel = alpha * values[i] + (1 - alpha) * (prevLevel + prevTrend);
      const newTrend = beta * (newLevel - prevLevel) + (1 - beta) * prevTrend;
      
      level.push(newLevel);
      trend.push(newTrend);
    }
    
    // Generate forecast
    const forecast = [];
    const lastLevel = level[level.length - 1];
    const lastTrend = trend[trend.length - 1];
    
    for (let i = 1; i <= 30; i++) {
      forecast.push(lastLevel + i * lastTrend);
    }
    
    return forecast;
  }

  _tripleExponentialSmoothing(values, alpha = 0.3, beta = 0.3, gamma = 0.3, seasonLength = 7) {
    if (values.length < seasonLength * 2) {
      return this._doubleExponentialSmoothing(values, alpha, beta);
    }
    
    // Simplified triple exponential smoothing
    const forecast = this._doubleExponentialSmoothing(values, alpha, beta);
    
    // Add seasonal component (simplified)
    const seasonalIndices = this._calculateSeasonalIndices(values, seasonLength);
    const seasonalForecast = forecast.map((value, i) => {
      const seasonalIndex = i % seasonLength;
      return value * (1 + seasonalIndices[seasonalIndex] * 0.1);
    });
    
    return seasonalForecast;
  }

  _calculateSeasonalIndices(values, seasonLength) {
    const indices = new Array(seasonLength).fill(0);
    const counts = new Array(seasonLength).fill(0);
    
    for (let i = 0; i < values.length; i++) {
      const seasonIndex = i % seasonLength;
      indices[seasonIndex] += values[i];
      counts[seasonIndex]++;
    }
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return indices.map((sum, i) => (sum / counts[i]) / avg - 1);
  }

  _getFittedValues(values, method) {
    // Return simplified fitted values
    return values.map((val, i) => {
      if (i === 0) return val;
      return val * 0.7 + values[i - 1] * 0.3; // Simple smoothing
    });
  }

  _calculateAIC(values, forecast) {
    const n = values.length;
    const k = 3; // Number of parameters
    const mse = values.reduce((acc, val, i) => acc + Math.pow(val - (forecast[i] || val), 2), 0) / n;
    return n * Math.log(mse) + 2 * k;
  }

  _calculateBIC(values, forecast) {
    const n = values.length;
    const k = 3; // Number of parameters
    const mse = values.reduce((acc, val, i) => acc + Math.pow(val - (forecast[i] || val), 2), 0) / n;
    return n * Math.log(mse) + k * Math.log(n);
  }
}

/**
 * Ensemble Forecasting
 */
export class EnsembleForecaster {
  async train_ensemble(data) {
    try {
      const values = data.map(item => item.value);
      
      // Simple ensemble of different approaches
      const arimaForecast = this._simpleARIMA(values);
      const smoothingForecast = this._simpleSmoothing(values);
      const naiveForecast = this._naiveForecast(values);
      
      // Calculate weights based on historical performance (simplified)
      const weights = { arima: 0.4, smoothing: 0.4, naive: 0.2 };
      
      // Generate ensemble forecast
      const ensembleForecast = [];
      for (let i = 0; i < 30; i++) {
        const ensembleValue = 
          weights.arima * arimaForecast[i] +
          weights.smoothing * smoothingForecast[i] +
          weights.naive * naiveForecast[i];
        ensembleForecast.push(Math.max(0, ensembleValue));
      }
      
      return {
        individual_forecasts: {
          arima: arimaForecast,
          smoothing: smoothingForecast,
          naive: naiveForecast
        },
        ensemble_forecast: ensembleForecast,
        weights,
        model_scores: {
          arima: this._calculateScore(values, arimaForecast),
          smoothing: this._calculateScore(values, smoothingForecast),
          naive: this._calculateScore(values, naiveForecast)
        }
      };
    } catch (error) {
      logger.error('Ensemble forecasting failed:', error);
      return { error: error.message };
    }
  }

  _simpleARIMA(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = this._calculateTrend(values);
    const forecast = [];
    
    for (let i = 0; i < 30; i++) {
      forecast.push(mean + trend * i);
    }
    
    return forecast;
  }

  _simpleSmoothing(values) {
    const alpha = 0.3;
    let smoothed = values[0];
    const forecast = [];
    
    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed;
    }
    
    for (let i = 0; i < 30; i++) {
      forecast.push(smoothed);
    }
    
    return forecast;
  }

  _naiveForecast(values) {
    const lastValue = values[values.length - 1];
    return new Array(30).fill(lastValue);
  }

  _calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  _calculateScore(actual, predicted) {
    const mse = actual.reduce((acc, val, i) => acc + Math.pow(val - (predicted[i] || val), 2), 0) / actual.length;
    return Math.sqrt(mse);
  }
}

/**
 * Main Statistical Models Service
 */
export class StatisticalModelsService {
  constructor() {
    this.featureEngine = new FeatureEngine();
    this.demandForecaster = new DemandForecaster();
  }

  async getDemandForecast(timePeriod = '30d') {
    try {
      // Get historical data
      const [topItems, wasteData] = await Promise.all([
        getTopSellingItems(),
        getWasteStats()
      ]);
      
      // Combine and prepare data
      const combinedData = this._combineData(topItems, wasteData);
      
      // Extract features
      const features = await this.featureEngine.extractFeatures(combinedData);
      
      // Generate forecasts
      const forecasts = await this.demandForecaster.forecastDemand(features);
      
      return {
        success: true,
        data: {
          historical_data: combinedData,
          features: features.slice(0, 10), // Sample features
          forecasts,
          summary: this._generateForecastSummary(forecasts)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Statistical models service error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  _combineData(topItems, wasteData) {
    // Combine sales and waste data for comprehensive analysis
    const combined = [];
    
    // Add sales data
    topItems.forEach(item => {
      combined.push({
        id: `sales_${item.inventory_id}`,
        inventory_id: item.inventory_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        margin: item.margin,
        type: 'sales',
        date: new Date().toISOString(),
        category: this._categorizeItem(item.name)
      });
    });
    
    // Add waste data
    wasteData.forEach(item => {
      combined.push({
        id: `waste_${item.item_id}`,
        inventory_id: item.item_id,
        quantity: -item.quantity, // Negative for waste
        type: 'waste',
        reason: item.reason,
        date: item.date,
        category: this._categorizeItem(item.item_id)
      });
    });
    
    return combined;
  }

  _categorizeItem(itemName) {
    const name = itemName.toLowerCase();
    if (name.includes('coffee') || name.includes('bean')) return 'coffee';
    if (name.includes('milk') || name.includes('dairy')) return 'dairy';
    if (name.includes('sugar') || name.includes('syrup')) return 'sweetener';
    if (name.includes('cup') || name.includes('container')) return 'packaging';
    return 'other';
  }

  _generateForecastSummary(forecasts) {
    if (!forecasts.ensemble) return { message: 'No forecasts available' };
    
    const ensemble = forecasts.ensemble.ensemble_forecast || [];
    const avgForecast = ensemble.reduce((a, b) => a + b, 0) / ensemble.length;
    const trend = ensemble.length > 1 ? ensemble[ensemble.length - 1] - ensemble[0] : 0;
    
    return {
      average_demand: Math.round(avgForecast * 100) / 100,
      trend_direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
      trend_magnitude: Math.abs(trend),
      confidence: 'medium', // Simplified confidence
      recommendations: this._generateForecastRecommendations(avgForecast, trend)
    };
  }

  _generateForecastRecommendations(avgDemand, trend) {
    const recommendations = [];
    
    if (trend > 0.1) {
      recommendations.push('Consider increasing inventory levels due to upward demand trend');
    } else if (trend < -0.1) {
      recommendations.push('Consider reducing inventory levels due to downward demand trend');
    }
    
    if (avgDemand > 50) {
      recommendations.push('High demand items - ensure adequate stock levels');
    } else if (avgDemand < 10) {
      recommendations.push('Low demand items - consider reducing order quantities');
    }
    
    return recommendations;
  }
}

export default StatisticalModelsService;
