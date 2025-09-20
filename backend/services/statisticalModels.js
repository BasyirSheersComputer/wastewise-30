/**
 * Statistical Models Service for WasteWise
 * Implements demand forecasting, waste prediction, and inventory optimization models
 */

export default class StatisticalModels {
  constructor(databaseService, cacheService) {
    this.databaseService = databaseService;
    this.cacheService = cacheService;
  }

  /**
   * Demand Forecasting Model
   * Uses time series analysis to predict future demand
   */
  async forecastDemand(userId, outletId, itemId, days = 30) {
    try {
      const cacheKey = `demand_forecast:${userId}:${outletId}:${itemId}:${days}`;
      
      // Check cache first
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get historical sales data
      const salesData = await this.getHistoricalSalesData(userId, outletId, itemId);
      
      if (salesData.length < 7) {
        throw new Error('Insufficient historical data for forecasting');
      }

      // Apply different forecasting methods
      const forecasts = {
        simpleMovingAverage: this.simpleMovingAverage(salesData, days),
        exponentialSmoothing: this.exponentialSmoothing(salesData, days),
        linearRegression: this.linearRegression(salesData, days),
        seasonalAdjustment: this.seasonalAdjustment(salesData, days)
      };

      // Calculate weighted average of all methods
      const finalForecast = this.calculateWeightedForecast(forecasts, salesData);

      // Add confidence intervals
      const confidenceIntervals = this.calculateConfidenceIntervals(salesData, finalForecast);

      const result = {
        forecasts,
        finalForecast,
        confidenceIntervals,
        accuracy: this.calculateForecastAccuracy(salesData),
        recommendations: this.generateDemandRecommendations(finalForecast, salesData),
        metadata: {
          userId,
          outletId,
          itemId,
          forecastDays: days,
          dataPoints: salesData.length,
          generatedAt: new Date().toISOString()
        }
      };

      // Cache the result for 1 hour
      await this.cacheService.set(cacheKey, JSON.stringify(result), 3600);
      
      return result;
    } catch (error) {
      console.error('Error in demand forecasting:', error);
      throw new Error(`Demand forecasting failed: ${error.message}`);
    }
  }

  /**
   * Waste Prediction Model
   * Predicts future waste based on historical patterns and external factors
   */
  async predictWaste(userId, outletId, category = null, days = 30) {
    try {
      const cacheKey = `waste_prediction:${userId}:${outletId}:${category}:${days}`;
      
      // Check cache first
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get historical waste data
      const wasteData = await this.getHistoricalWasteData(userId, outletId, category);
      
      if (wasteData.length < 7) {
        throw new Error('Insufficient historical waste data for prediction');
      }

      // Apply waste prediction models
      const predictions = {
        trendAnalysis: this.trendAnalysis(wasteData, days),
        seasonalPattern: this.seasonalPattern(wasteData, days),
        correlationAnalysis: await this.correlationAnalysis(userId, outletId, wasteData, days),
        machineLearning: await this.machineLearningPrediction(wasteData, days)
      };

      // Calculate ensemble prediction
      const finalPrediction = this.calculateEnsemblePrediction(predictions, wasteData);

      // Add risk factors
      const riskFactors = await this.identifyRiskFactors(userId, outletId, wasteData);

      const result = {
        predictions,
        finalPrediction,
        riskFactors,
        wasteReductionOpportunities: this.identifyWasteReductionOpportunities(wasteData, finalPrediction),
        costImpact: this.calculateWasteCostImpact(finalPrediction),
        recommendations: this.generateWasteRecommendations(finalPrediction, riskFactors),
        metadata: {
          userId,
          outletId,
          category,
          predictionDays: days,
          dataPoints: wasteData.length,
          generatedAt: new Date().toISOString()
        }
      };

      // Cache the result for 2 hours
      await this.cacheService.set(cacheKey, JSON.stringify(result), 7200);
      
      return result;
    } catch (error) {
      console.error('Error in waste prediction:', error);
      throw new Error(`Waste prediction failed: ${error.message}`);
    }
  }

  /**
   * Inventory Optimization Model
   * Optimizes inventory levels to minimize waste while ensuring availability
   */
  async optimizeInventory(userId, outletId) {
    try {
      const cacheKey = `inventory_optimization:${userId}:${outletId}`;
      
      // Check cache first
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get current inventory and historical data
      const inventoryData = await this.getCurrentInventory(userId, outletId);
      const salesHistory = await this.getSalesHistory(userId, outletId);
      const wasteHistory = await this.getWasteHistory(userId, outletId);

      const optimizations = {};

      for (const item of inventoryData) {
        const itemOptimization = await this.optimizeItemInventory(
          item,
          salesHistory.filter(s => s.item_id === item.id),
          wasteHistory.filter(w => w.item_id === item.id)
        );
        
        optimizations[item.id] = itemOptimization;
      }

      // Calculate overall recommendations
      const recommendations = this.generateInventoryRecommendations(optimizations);
      const costSavings = this.calculateCostSavings(optimizations);
      const riskAssessment = this.assessInventoryRisks(optimizations);

      const result = {
        optimizations,
        recommendations,
        costSavings,
        riskAssessment,
        summary: {
          totalItems: inventoryData.length,
          highPriorityItems: Object.values(optimizations).filter(o => o.priority === 'high').length,
          mediumPriorityItems: Object.values(optimizations).filter(o => o.priority === 'medium').length,
          lowPriorityItems: Object.values(optimizations).filter(o => o.priority === 'low').length,
          estimatedMonthlySavings: costSavings.monthly,
          estimatedAnnualSavings: costSavings.annual
        },
        metadata: {
          userId,
          outletId,
          generatedAt: new Date().toISOString()
        }
      };

      // Cache the result for 4 hours
      await this.cacheService.set(cacheKey, JSON.stringify(result), 14400);
      
      return result;
    } catch (error) {
      console.error('Error in inventory optimization:', error);
      throw new Error(`Inventory optimization failed: ${error.message}`);
    }
  }

  // Helper methods for demand forecasting

  async getHistoricalSalesData(userId, outletId, itemId) {
    const { data, error } = await this.databaseService
      .from('sales_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('outlet_id', outletId)
      .eq('item_id', itemId)
      .order('transaction_date', { ascending: false })
      .limit(90); // Last 90 days

    if (error) throw error;
    return data || [];
  }

  simpleMovingAverage(data, days) {
    if (data.length < days) return [];
    
    const windowSize = Math.min(7, data.length);
    const recentData = data.slice(0, windowSize);
    const avg = recentData.reduce((sum, item) => sum + item.quantity, 0) / windowSize;
    
    return Array(days).fill().map(() => Math.round(avg));
  }

  exponentialSmoothing(data, days, alpha = 0.3) {
    if (data.length < 2) return [];
    
    let forecast = data[0].quantity;
    const forecasts = [];
    
    for (let i = 1; i < data.length; i++) {
      forecast = alpha * data[i].quantity + (1 - alpha) * forecast;
    }
    
    return Array(days).fill().map(() => Math.round(forecast));
  }

  linearRegression(data, days) {
    if (data.length < 2) return [];
    
    const n = data.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = data.map(item => item.quantity);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return Array.from({length: days}, (_, i) => 
      Math.round(Math.max(0, slope * (n + i) + intercept))
    );
  }

  seasonalAdjustment(data, days) {
    // Simple seasonal adjustment based on day of week
    const dayOfWeekPattern = [0, 1, 2, 3, 4, 5, 6].map(day => {
      const dayData = data.filter(item => new Date(item.transaction_date).getDay() === day);
      return dayData.length > 0 ? dayData.reduce((sum, item) => sum + item.quantity, 0) / dayData.length : 0;
    });
    
    return Array.from({length: days}, (_, i) => {
      const dayOfWeek = (new Date().getDay() + i) % 7;
      return Math.round(dayOfWeekPattern[dayOfWeek]);
    });
  }

  calculateWeightedForecast(forecasts, historicalData) {
    // Weight recent methods more heavily
    const weights = {
      simpleMovingAverage: 0.2,
      exponentialSmoothing: 0.3,
      linearRegression: 0.3,
      seasonalAdjustment: 0.2
    };
    
    const days = forecasts.simpleMovingAverage.length;
    return Array.from({length: days}, (_, dayIndex) => {
      let weightedSum = 0;
      Object.entries(weights).forEach(([method, weight]) => {
        weightedSum += forecasts[method][dayIndex] * weight;
      });
      return Math.round(weightedSum);
    });
  }

  calculateConfidenceIntervals(historicalData, forecast) {
    const variance = this.calculateVariance(historicalData);
    const standardError = Math.sqrt(variance);
    
    return forecast.map(value => ({
      value,
      lowerBound: Math.max(0, value - 1.96 * standardError),
      upperBound: value + 1.96 * standardError,
      confidence: 0.95
    }));
  }

  calculateForecastAccuracy(historicalData) {
    if (historicalData.length < 14) return { mae: 0, mape: 0 };
    
    // Simple accuracy calculation based on recent data variance
    const recentData = historicalData.slice(0, 7);
    const mean = recentData.reduce((sum, item) => sum + item.quantity, 0) / recentData.length;
    const mae = recentData.reduce((sum, item) => sum + Math.abs(item.quantity - mean), 0) / recentData.length;
    const mape = (mae / mean) * 100;
    
    return { mae: Math.round(mae * 100) / 100, mape: Math.round(mape * 100) / 100 };
  }

  generateDemandRecommendations(forecast, historicalData) {
    const avgDemand = forecast.reduce((sum, val) => sum + val, 0) / forecast.length;
    const currentStock = historicalData[0]?.current_stock || 0;
    
    const recommendations = [];
    
    if (avgDemand > currentStock * 1.5) {
      recommendations.push({
        type: 'stock_increase',
        message: 'Consider increasing stock levels to meet forecasted demand',
        priority: 'high',
        suggestedIncrease: Math.round(avgDemand - currentStock)
      });
    } else if (avgDemand < currentStock * 0.5) {
      recommendations.push({
        type: 'stock_reduction',
        message: 'Consider reducing stock levels to avoid overstocking',
        priority: 'medium',
        suggestedReduction: Math.round(currentStock - avgDemand)
      });
    }
    
    if (forecast.some(val => val > avgDemand * 2)) {
      recommendations.push({
        type: 'demand_spike',
        message: 'Prepare for potential demand spikes in the forecast period',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  // Helper methods for waste prediction

  async getHistoricalWasteData(userId, outletId, category) {
    let query = this.databaseService
      .from('waste_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('outlet_id', outletId)
      .order('waste_date', { ascending: false })
      .limit(90);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  trendAnalysis(wasteData, days) {
    if (wasteData.length < 3) return [];
    
    const recent = wasteData.slice(0, 7);
    const older = wasteData.slice(7, 14);
    
    const recentAvg = recent.reduce((sum, item) => sum + item.quantity, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, item) => sum + item.quantity, 0) / older.length : recentAvg;
    
    const trend = (recentAvg - olderAvg) / olderAvg;
    
    return Array.from({length: days}, (_, i) => 
      Math.round(Math.max(0, recentAvg * (1 + trend * (i + 1) / 7)))
    );
  }

  seasonalPattern(wasteData, days) {
    const dayOfWeekPattern = [0, 1, 2, 3, 4, 5, 6].map(day => {
      const dayData = wasteData.filter(item => new Date(item.waste_date).getDay() === day);
      return dayData.length > 0 ? dayData.reduce((sum, item) => sum + item.quantity, 0) / dayData.length : 0;
    });
    
    return Array.from({length: days}, (_, i) => {
      const dayOfWeek = (new Date().getDay() + i) % 7;
      return Math.round(dayOfWeekPattern[dayOfWeek]);
    });
  }

  async correlationAnalysis(userId, outletId, wasteData, days) {
    // Analyze correlation with sales and inventory
    const salesData = await this.getHistoricalSalesData(userId, outletId, null);
    const inventoryData = await this.getCurrentInventory(userId, outletId);
    
    // Simple correlation analysis
    const correlation = this.calculateCorrelation(wasteData, salesData);
    
    const avgWaste = wasteData.reduce((sum, item) => sum + item.quantity, 0) / wasteData.length;
    
    return Array.from({length: days}, (_, i) => 
      Math.round(avgWaste * (1 + correlation * 0.1))
    );
  }

  async machineLearningPrediction(wasteData, days) {
    // Simplified ML prediction using pattern recognition
    const patterns = this.identifyWastePatterns(wasteData);
    const predictions = [];
    
    for (let i = 0; i < days; i++) {
      const patternPrediction = patterns.reduce((sum, pattern) => {
        return sum + (pattern.weight * pattern.predict(i));
      }, 0);
      
      predictions.push(Math.round(patternPrediction));
    }
    
    return predictions;
  }

  calculateEnsemblePrediction(predictions, historicalData) {
    const weights = {
      trendAnalysis: 0.3,
      seasonalPattern: 0.3,
      correlationAnalysis: 0.2,
      machineLearning: 0.2
    };
    
    const days = predictions.trendAnalysis.length;
    return Array.from({length: days}, (_, dayIndex) => {
      let weightedSum = 0;
      Object.entries(weights).forEach(([method, weight]) => {
        weightedSum += predictions[method][dayIndex] * weight;
      });
      return Math.round(weightedSum);
    });
  }

  async identifyRiskFactors(userId, outletId, wasteData) {
    const riskFactors = [];
    
    // Analyze waste trends
    const recentWaste = wasteData.slice(0, 7);
    const olderWaste = wasteData.slice(7, 14);
    
    if (recentWaste.length > 0 && olderWaste.length > 0) {
      const recentAvg = recentWaste.reduce((sum, item) => sum + item.quantity, 0) / recentWaste.length;
      const olderAvg = olderWaste.reduce((sum, item) => sum + item.quantity, 0) / olderWaste.length;
      
      if (recentAvg > olderAvg * 1.2) {
        riskFactors.push({
          factor: 'increasing_waste_trend',
          severity: 'high',
          description: 'Waste levels have increased by more than 20% recently'
        });
      }
    }
    
    // Check for seasonal risks
    const currentMonth = new Date().getMonth();
    const seasonalRisks = this.getSeasonalRisks(currentMonth);
    riskFactors.push(...seasonalRisks);
    
    return riskFactors;
  }

  identifyWasteReductionOpportunities(wasteData, prediction) {
    const opportunities = [];
    
    // Identify high-waste periods
    const avgWaste = prediction.reduce((sum, val) => sum + val, 0) / prediction.length;
    const highWasteDays = prediction.filter(val => val > avgWaste * 1.5).length;
    
    if (highWasteDays > 0) {
      opportunities.push({
        type: 'portion_optimization',
        description: `${highWasteDays} days predicted with high waste - consider portion optimization`,
        potentialSavings: highWasteDays * avgWaste * 0.3
      });
    }
    
    return opportunities;
  }

  calculateWasteCostImpact(prediction) {
    const avgDailyWaste = prediction.reduce((sum, val) => sum + val, 0) / prediction.length;
    const estimatedCostPerUnit = 2.5; // USD per unit of waste
    
    return {
      daily: avgDailyWaste * estimatedCostPerUnit,
      weekly: avgDailyWaste * estimatedCostPerUnit * 7,
      monthly: avgDailyWaste * estimatedCostPerUnit * 30,
      annual: avgDailyWaste * estimatedCostPerUnit * 365
    };
  }

  generateWasteRecommendations(prediction, riskFactors) {
    const recommendations = [];
    
    riskFactors.forEach(risk => {
      if (risk.severity === 'high') {
        recommendations.push({
          type: 'risk_mitigation',
          priority: 'high',
          message: `Address ${risk.factor}: ${risk.description}`,
          action: this.getRiskMitigationAction(risk.factor)
        });
      }
    });
    
    const avgWaste = prediction.reduce((sum, val) => sum + val, 0) / prediction.length;
    if (avgWaste > 50) {
      recommendations.push({
        type: 'waste_reduction',
        priority: 'medium',
        message: 'High average waste predicted - implement waste reduction strategies',
        action: 'Review portion sizes and preparation methods'
      });
    }
    
    return recommendations;
  }

  // Helper methods for inventory optimization

  async getCurrentInventory(userId, outletId) {
    const { data, error } = await this.databaseService
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .eq('outlet_id', outletId);
    
    if (error) throw error;
    return data || [];
  }

  async getSalesHistory(userId, outletId) {
    const { data, error } = await this.databaseService
      .from('sales_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('outlet_id', outletId)
      .order('transaction_date', { ascending: false })
      .limit(90);
    
    if (error) throw error;
    return data || [];
  }

  async getWasteHistory(userId, outletId) {
    const { data, error } = await this.databaseService
      .from('waste_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('outlet_id', outletId)
      .order('waste_date', { ascending: false })
      .limit(90);
    
    if (error) throw error;
    return data || [];
  }

  async optimizeItemInventory(item, salesHistory, wasteHistory) {
    const avgDailySales = salesHistory.length > 0 ? 
      salesHistory.reduce((sum, sale) => sum + sale.quantity, 0) / Math.min(30, salesHistory.length) : 0;
    
    const avgDailyWaste = wasteHistory.length > 0 ? 
      wasteHistory.reduce((sum, waste) => sum + waste.quantity, 0) / Math.min(30, wasteHistory.length) : 0;
    
    const currentStock = item.current_stock;
    const minStock = item.min_stock || 0;
    const maxStock = item.max_stock || currentStock * 2;
    
    // Calculate optimal stock levels
    const safetyStock = Math.ceil(avgDailySales * 2); // 2 days safety stock
    const optimalStock = Math.ceil(avgDailySales * 7); // 7 days of stock
    const reorderPoint = safetyStock;
    const reorderQuantity = optimalStock - safetyStock;
    
    // Determine priority based on waste ratio and stock levels
    const wasteRatio = avgDailyWaste / (avgDailySales + avgDailyWaste);
    let priority = 'low';
    
    if (wasteRatio > 0.3 || currentStock > maxStock * 0.8) {
      priority = 'high';
    } else if (wasteRatio > 0.15 || currentStock < minStock) {
      priority = 'medium';
    }
    
    return {
      itemId: item.id,
      itemName: item.name,
      currentStock,
      optimalStock,
      safetyStock,
      reorderPoint,
      reorderQuantity,
      avgDailySales,
      avgDailyWaste,
      wasteRatio,
      priority,
      recommendations: this.generateItemRecommendations(item, currentStock, optimalStock, wasteRatio),
      costImpact: this.calculateItemCostImpact(item, currentStock, optimalStock, avgDailyWaste)
    };
  }

  generateInventoryRecommendations(optimizations) {
    const recommendations = [];
    
    const highPriorityItems = Object.values(optimizations).filter(o => o.priority === 'high');
    const mediumPriorityItems = Object.values(optimizations).filter(o => o.priority === 'medium');
    
    if (highPriorityItems.length > 0) {
      recommendations.push({
        type: 'urgent_action',
        priority: 'high',
        message: `${highPriorityItems.length} items require immediate attention`,
        items: highPriorityItems.map(item => item.itemName)
      });
    }
    
    if (mediumPriorityItems.length > 0) {
      recommendations.push({
        type: 'review_needed',
        priority: 'medium',
        message: `${mediumPriorityItems.length} items should be reviewed`,
        items: mediumPriorityItems.map(item => item.itemName)
      });
    }
    
    return recommendations;
  }

  calculateCostSavings(optimizations) {
    let monthlySavings = 0;
    let annualSavings = 0;
    
    Object.values(optimizations).forEach(optimization => {
      const wasteReduction = optimization.avgDailyWaste * 0.3; // Assume 30% waste reduction
      const costPerUnit = 2.5; // Estimated cost per unit
      
      monthlySavings += wasteReduction * costPerUnit * 30;
    });
    
    annualSavings = monthlySavings * 12;
    
    return { monthly: Math.round(monthlySavings), annual: Math.round(annualSavings) };
  }

  assessInventoryRisks(optimizations) {
    const risks = [];
    
    Object.values(optimizations).forEach(optimization => {
      if (optimization.wasteRatio > 0.4) {
        risks.push({
          item: optimization.itemName,
          risk: 'high_waste',
          severity: 'high',
          description: 'Very high waste ratio detected'
        });
      }
      
      if (optimization.currentStock < optimization.safetyStock) {
        risks.push({
          item: optimization.itemName,
          risk: 'stockout',
          severity: 'high',
          description: 'Stock level below safety threshold'
        });
      }
    });
    
    return risks;
  }

  // Utility methods

  calculateVariance(data) {
    if (data.length < 2) return 0;
    
    const mean = data.reduce((sum, item) => sum + item.quantity, 0) / data.length;
    const variance = data.reduce((sum, item) => sum + Math.pow(item.quantity - mean, 2), 0) / data.length;
    
    return variance;
  }

  calculateCorrelation(data1, data2) {
    if (data1.length < 2 || data2.length < 2) return 0;
    
    const n = Math.min(data1.length, data2.length);
    const x = data1.slice(0, n).map(item => item.quantity);
    const y = data2.slice(0, n).map(item => item.quantity);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return isNaN(correlation) ? 0 : correlation;
  }

  identifyWastePatterns(wasteData) {
    // Simplified pattern identification
    const patterns = [];
    
    // Daily pattern
    const dailyAvg = wasteData.reduce((sum, item) => sum + item.quantity, 0) / wasteData.length;
    patterns.push({
      type: 'daily_average',
      weight: 0.4,
      predict: () => dailyAvg
    });
    
    // Trend pattern
    if (wasteData.length > 7) {
      const recent = wasteData.slice(0, 3);
      const older = wasteData.slice(3, 6);
      const recentAvg = recent.reduce((sum, item) => sum + item.quantity, 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + item.quantity, 0) / older.length;
      const trend = (recentAvg - olderAvg) / olderAvg;
      
      patterns.push({
        type: 'trend',
        weight: 0.3,
        predict: (day) => recentAvg * (1 + trend * day / 7)
      });
    }
    
    // Seasonal pattern
    patterns.push({
      type: 'seasonal',
      weight: 0.3,
      predict: (day) => dailyAvg * (1 + Math.sin(day * Math.PI / 7) * 0.1)
    });
    
    return patterns;
  }

  getSeasonalRisks(month) {
    const risks = [];
    
    // Define seasonal risk patterns
    const seasonalRisks = {
      0: { factor: 'post_holiday_waste', severity: 'medium' }, // January
      11: { factor: 'holiday_preparation', severity: 'high' }, // December
      6: { factor: 'summer_seasonal', severity: 'medium' }, // July
      7: { factor: 'summer_seasonal', severity: 'medium' } // August
    };
    
    if (seasonalRisks[month]) {
      risks.push({
        factor: seasonalRisks[month].factor,
        severity: seasonalRisks[month].severity,
        description: `Seasonal risk factor for ${this.getMonthName(month)}`
      });
    }
    
    return risks;
  }

  getRiskMitigationAction(factor) {
    const actions = {
      increasing_waste_trend: 'Review portion sizes and preparation methods',
      post_holiday_waste: 'Adjust inventory levels post-holiday',
      holiday_preparation: 'Increase safety stock for holiday period',
      summer_seasonal: 'Monitor temperature-sensitive items closely'
    };
    
    return actions[factor] || 'Monitor closely and adjust as needed';
  }

  generateItemRecommendations(item, currentStock, optimalStock, wasteRatio) {
    const recommendations = [];
    
    if (currentStock > optimalStock * 1.2) {
      recommendations.push('Reduce stock levels to avoid overstocking');
    } else if (currentStock < optimalStock * 0.8) {
      recommendations.push('Increase stock levels to meet demand');
    }
    
    if (wasteRatio > 0.2) {
      recommendations.push('High waste ratio - review portion sizes');
    }
    
    return recommendations;
  }

  calculateItemCostImpact(item, currentStock, optimalStock, avgDailyWaste) {
    const wasteReduction = avgDailyWaste * 0.3; // Assume 30% reduction
    const costPerUnit = 2.5; // Estimated cost per unit
    
    return {
      monthlyWasteSavings: wasteReduction * costPerUnit * 30,
      annualWasteSavings: wasteReduction * costPerUnit * 365
    };
  }

  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }
}

