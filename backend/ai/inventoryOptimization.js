// Inventory Optimization Models for Servora AI
// Based on PRD Implementation Methodology

import { getTopSellingItems, getWasteStats } from '../database/db.js';
import logger from '../utils/logger.js';

/**
 * Economic Order Quantity (EOQ) Calculator
 */
export class EOQCalculator {
  constructor() {
    this.holdingCostRate = 0.20; // 20% annual holding cost
    this.orderingCost = 50.0;    // Cost per order
  }

  calculateEOQ(annualDemand, unitCost) {
    try {
      const holdingCost = unitCost * this.holdingCostRate;
      
      // EOQ formula: sqrt(2 * D * S / H)
      const eoq = Math.sqrt((2 * annualDemand * this.orderingCost) / holdingCost);
      
      // Calculate related metrics
      const annualOrderingCost = (annualDemand / eoq) * this.orderingCost;
      const annualHoldingCost = (eoq / 2) * holdingCost;
      const totalCost = annualOrderingCost + annualHoldingCost;
      
      return {
        eoq: Math.round(eoq * 100) / 100,
        annual_ordering_cost: Math.round(annualOrderingCost * 100) / 100,
        annual_holding_cost: Math.round(annualHoldingCost * 100) / 100,
        total_cost: Math.round(totalCost * 100) / 100,
        optimal_order_frequency: Math.round((annualDemand / eoq) * 100) / 100,
        unit_cost: unitCost,
        annual_demand: annualDemand
      };
    } catch (error) {
      logger.error('EOQ calculation failed:', error);
      return { error: error.message };
    }
  }

  calculateReorderPoint(leadTimeDays, dailyDemand, safetyStock = 0) {
    try {
      const reorderPoint = (leadTimeDays * dailyDemand) + safetyStock;
      return {
        reorder_point: Math.round(reorderPoint * 100) / 100,
        lead_time_days: leadTimeDays,
        daily_demand: dailyDemand,
        safety_stock: safetyStock
      };
    } catch (error) {
      logger.error('Reorder point calculation failed:', error);
      return { error: error.message };
    }
  }
}

/**
 * Dynamic EOQ with Demand Variability
 */
export class DynamicEOQCalculator {
  constructor() {
    this.serviceLevel = 0.95; // 95% service level
    this.zScore = 1.96; // Z-score for 95% service level
  }

  calculateDynamicEOQ(demandData, unitCost, leadTimeDays) {
    try {
      // Calculate demand statistics
      const demands = demandData.map(item => item.quantity || 0);
      const meanDemand = demands.reduce((a, b) => a + b, 0) / demands.length;
      const variance = demands.reduce((acc, val) => acc + Math.pow(val - meanDemand, 2), 0) / demands.length;
      const stdDemand = Math.sqrt(variance);
      
      // Safety stock calculation
      const safetyStock = this.zScore * stdDemand * Math.sqrt(leadTimeDays);
      
      // Dynamic EOQ calculation
      const annualDemand = meanDemand * 365;
      const holdingCost = unitCost * 0.20;
      
      const eoq = Math.sqrt((2 * annualDemand * 50) / holdingCost);
      
      // Reorder point with safety stock
      const reorderPoint = (leadTimeDays * meanDemand) + safetyStock;
      
      return {
        eoq: Math.round(eoq * 100) / 100,
        safety_stock: Math.round(safetyStock * 100) / 100,
        reorder_point: Math.round(reorderPoint * 100) / 100,
        mean_demand: Math.round(meanDemand * 100) / 100,
        demand_std: Math.round(stdDemand * 100) / 100,
        service_level: this.serviceLevel,
        lead_time_days: leadTimeDays,
        unit_cost: unitCost
      };
    } catch (error) {
      logger.error('Dynamic EOQ calculation failed:', error);
      return { error: error.message };
    }
  }
}

/**
 * ABC Analysis for Inventory Classification
 */
export class ABCAnalyzer {
  constructor() {
    this.abcThresholds = {
      'A': 0.80,  // Top 80% of value
      'B': 0.95,  // Next 15% of value
      'C': 1.00   // Remaining 5% of value
    };
  }

  performABCAnalysis(inventoryData) {
    try {
      // Calculate annual consumption value
      const enrichedData = inventoryData.map(item => ({
        ...item,
        annual_value: (item.annual_quantity || item.quantity || 0) * (item.unit_cost || item.price || 0)
      }));
      
      // Sort by annual value (descending)
      const sortedData = enrichedData.sort((a, b) => b.annual_value - a.annual_value);
      
      // Calculate cumulative percentage
      let cumulativeValue = 0;
      const totalValue = sortedData.reduce((sum, item) => sum + item.annual_value, 0);
      
      const classifiedData = sortedData.map(item => {
        cumulativeValue += item.annual_value;
        const cumulativePercentage = (cumulativeValue / totalValue) * 100;
        
        let classification;
        if (cumulativePercentage <= this.abcThresholds['A'] * 100) {
          classification = 'A';
        } else if (cumulativePercentage <= this.abcThresholds['B'] * 100) {
          classification = 'B';
        } else {
          classification = 'C';
        }
        
        return {
          ...item,
          cumulative_value: cumulativeValue,
          cumulative_percentage: Math.round(cumulativePercentage * 100) / 100,
          abc_classification: classification
        };
      });
      
      // Generate analysis summary
      const analysisSummary = {};
      ['A', 'B', 'C'].forEach(classification => {
        const classData = classifiedData.filter(item => item.abc_classification === classification);
        analysisSummary[classification] = {
          count: classData.length,
          percentage_of_items: Math.round((classData.length / classifiedData.length) * 10000) / 100,
          total_value: Math.round(classData.reduce((sum, item) => sum + item.annual_value, 0) * 100) / 100,
          percentage_of_value: Math.round((classData.reduce((sum, item) => sum + item.annual_value, 0) / totalValue) * 10000) / 100,
          avg_unit_cost: Math.round((classData.reduce((sum, item) => sum + (item.unit_cost || item.price || 0), 0) / classData.length) * 100) / 100,
          avg_annual_quantity: Math.round((classData.reduce((sum, item) => sum + (item.annual_quantity || item.quantity || 0), 0) / classData.length) * 100) / 100
        };
      });
      
      return {
        classified_data: classifiedData,
        analysis_summary: analysisSummary,
        recommendations: this._generateABCRecommendations(analysisSummary),
        total_value: Math.round(totalValue * 100) / 100
      };
    } catch (error) {
      logger.error('ABC analysis failed:', error);
      return { error: error.message };
    }
  }

  _generateABCRecommendations(analysisSummary) {
    return {
      'A_items': {
        management: 'Tight control, frequent review',
        ordering: 'Small, frequent orders',
        safety_stock: 'Low safety stock',
        forecasting: 'Detailed forecasting required',
        review_frequency: 'Weekly'
      },
      'B_items': {
        management: 'Moderate control',
        ordering: 'Regular review and ordering',
        safety_stock: 'Moderate safety stock',
        forecasting: 'Standard forecasting',
        review_frequency: 'Bi-weekly'
      },
      'C_items': {
        management: 'Simple control',
        ordering: 'Large, infrequent orders',
        safety_stock: 'High safety stock',
        forecasting: 'Simple forecasting or rule-based',
        review_frequency: 'Monthly'
      }
    };
  }
}

/**
 * Multi-Objective Inventory Optimization
 */
export class InventoryOptimizer {
  constructor() {
    this.objectives = {
      'minimize_cost': this._costObjective,
      'maximize_service_level': this._serviceLevelObjective,
      'minimize_waste': this._wasteObjective
    };
  }

  optimizeInventory(products, constraints = {}) {
    try {
      const results = {};
      
      // Calculate individual objectives
      const costResult = this._costObjective(products, constraints);
      const serviceResult = this._serviceLevelObjective(products, constraints);
      const wasteResult = this._wasteObjective(products, constraints);
      
      // Weighted optimization
      const weights = {
        cost: constraints.cost_weight || 0.4,
        service: constraints.service_weight || 0.3,
        waste: constraints.waste_weight || 0.3
      };
      
      const weightedScore = 
        weights.cost * (1 - costResult.normalized_cost) +
        weights.service * serviceResult.normalized_service_level +
        weights.waste * (1 - wasteResult.normalized_waste);
      
      // Generate recommendations
      const recommendations = this._generateOptimizationRecommendations(
        products, costResult, serviceResult, wasteResult
      );
      
      return {
        optimization_results: {
          cost_optimization: costResult,
          service_level_optimization: serviceResult,
          waste_optimization: wasteResult,
          weighted_score: Math.round(weightedScore * 10000) / 10000
        },
        recommendations,
        weights,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Inventory optimization failed:', error);
      return { error: error.message };
    }
  }

  _costObjective(products, constraints) {
    let totalCost = 0;
    let totalValue = 0;
    
    products.forEach(product => {
      const annualDemand = product.annual_demand || product.quantity * 365;
      const unitCost = product.unit_cost || product.price || 1;
      const holdingRate = product.holding_rate || 0.2;
      const orderingCost = product.ordering_cost || 50;
      
      // Calculate EOQ
      const eoq = Math.sqrt((2 * annualDemand * orderingCost) / (unitCost * holdingRate));
      
      // Calculate costs
      const orderingCosts = (annualDemand / eoq) * orderingCost;
      const holdingCosts = (eoq / 2) * unitCost * holdingRate;
      const totalProductCost = orderingCosts + holdingCosts;
      
      totalCost += totalProductCost;
      totalValue += annualDemand * unitCost;
    });
    
    const normalizedCost = totalValue > 0 ? totalCost / totalValue : 0;
    
    return {
      total_cost: Math.round(totalCost * 100) / 100,
      total_value: Math.round(totalValue * 100) / 100,
      normalized_cost: Math.round(normalizedCost * 10000) / 10000,
      cost_efficiency: Math.round((1 - normalizedCost) * 10000) / 100
    };
  }

  _serviceLevelObjective(products, constraints) {
    let totalServiceLevel = 0;
    let productCount = 0;
    
    products.forEach(product => {
      const demandVariability = product.demand_std || 0;
      const leadTime = product.lead_time || 7;
      const safetyStock = product.safety_stock || 0;
      
      // Calculate service level (simplified)
      const serviceLevel = Math.min(0.99, Math.max(0.5, 1 - (demandVariability / (product.quantity || 1))));
      totalServiceLevel += serviceLevel;
      productCount++;
    });
    
    const avgServiceLevel = productCount > 0 ? totalServiceLevel / productCount : 0;
    
    return {
      average_service_level: Math.round(avgServiceLevel * 10000) / 10000,
      normalized_service_level: Math.round(avgServiceLevel * 10000) / 10000,
      service_level_percentage: Math.round(avgServiceLevel * 10000) / 100
    };
  }

  _wasteObjective(products, constraints) {
    let totalWaste = 0;
    let totalInventory = 0;
    
    products.forEach(product => {
      const wasteRate = product.waste_rate || 0.05; // 5% default waste rate
      const inventoryValue = (product.quantity || 0) * (product.unit_cost || product.price || 0);
      
      totalWaste += inventoryValue * wasteRate;
      totalInventory += inventoryValue;
    });
    
    const normalizedWaste = totalInventory > 0 ? totalWaste / totalInventory : 0;
    
    return {
      total_waste_value: Math.round(totalWaste * 100) / 100,
      total_inventory_value: Math.round(totalInventory * 100) / 100,
      normalized_waste: Math.round(normalizedWaste * 10000) / 10000,
      waste_reduction_potential: Math.round((1 - normalizedWaste) * 10000) / 100
    };
  }

  _generateOptimizationRecommendations(products, costResult, serviceResult, wasteResult) {
    const recommendations = [];
    
    // Cost optimization recommendations
    if (costResult.normalized_cost > 0.1) {
      recommendations.push({
        type: 'cost_optimization',
        priority: 'high',
        message: 'High inventory costs detected. Consider implementing EOQ optimization.',
        impact: `Potential savings: RM ${Math.round(costResult.total_cost * 0.2 * 100) / 100}`,
        action: 'Implement EOQ calculations for all products'
      });
    }
    
    // Service level recommendations
    if (serviceResult.average_service_level < 0.9) {
      recommendations.push({
        type: 'service_level',
        priority: 'medium',
        message: 'Service level below target. Consider increasing safety stock.',
        impact: `Current service level: ${Math.round(serviceResult.service_level_percentage * 100) / 100}%`,
        action: 'Review and adjust safety stock levels'
      });
    }
    
    // Waste reduction recommendations
    if (wasteResult.normalized_waste > 0.05) {
      recommendations.push({
        type: 'waste_reduction',
        priority: 'high',
        message: 'High waste levels detected. Implement waste reduction strategies.',
        impact: `Waste value: RM ${wasteResult.total_waste_value}`,
        action: 'Implement FIFO system and improve demand forecasting'
      });
    }
    
    return recommendations;
  }
}

/**
 * Main Inventory Optimization Service
 */
export class InventoryOptimizationService {
  constructor() {
    this.eoqCalculator = new EOQCalculator();
    this.dynamicEOQCalculator = new DynamicEOQCalculator();
    this.abcAnalyzer = new ABCAnalyzer();
    this.inventoryOptimizer = new InventoryOptimizer();
  }

  async getInventoryOptimization(timePeriod = '30d') {
    try {
      // Get inventory data
      const [topItems, wasteData] = await Promise.all([
        getTopSellingItems(),
        getWasteStats()
      ]);
      
      // Prepare inventory data for analysis
      const inventoryData = this._prepareInventoryData(topItems, wasteData);
      
      // Perform ABC Analysis
      const abcAnalysis = this.abcAnalyzer.performABCAnalysis(inventoryData);
      
      // Calculate EOQ for each item
      const eoqResults = inventoryData.map(item => {
        const annualDemand = (item.quantity || 0) * 365;
        const unitCost = item.price || item.unit_cost || 1;
        return {
          ...item,
          eoq: this.eoqCalculator.calculateEOQ(annualDemand, unitCost)
        };
      });
      
      // Dynamic EOQ with demand variability
      const dynamicEOQResults = inventoryData.map(item => {
        const demandData = wasteData.filter(waste => 
          waste.item_id === item.inventory_id
        ).map(waste => ({ quantity: waste.quantity }));
        
        if (demandData.length > 0) {
          return {
            ...item,
            dynamic_eoq: this.dynamicEOQCalculator.calculateDynamicEOQ(
              demandData, 
              item.price || item.unit_cost || 1, 
              7 // 7 days lead time
            )
          };
        }
        return item;
      });
      
      // Multi-objective optimization
      const optimizationResults = this.inventoryOptimizer.optimizeInventory(inventoryData);
      
      return {
        success: true,
        data: {
          inventory_data: inventoryData,
          abc_analysis: abcAnalysis,
          eoq_results: eoqResults,
          dynamic_eoq_results: dynamicEOQResults,
          optimization_results: optimizationResults,
          summary: this._generateOptimizationSummary(abcAnalysis, optimizationResults)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Inventory optimization service error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  _prepareInventoryData(topItems, wasteData) {
    return topItems.map(item => {
      // Calculate waste rate for this item
      const itemWaste = wasteData.filter(waste => 
        waste.item_id === item.inventory_id
      );
      const totalWaste = itemWaste.reduce((sum, waste) => sum + (waste.quantity || 0), 0);
      const wasteRate = item.quantity > 0 ? totalWaste / item.quantity : 0;
      
      return {
        inventory_id: item.inventory_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit_cost: item.price,
        margin: item.margin,
        annual_quantity: item.quantity * 365, // Estimate
        waste_rate: Math.min(wasteRate, 0.5), // Cap at 50%
        demand_std: item.quantity * 0.2, // 20% variability estimate
        lead_time: 7, // 7 days default
        holding_rate: 0.2, // 20% annual holding cost
        ordering_cost: 50 // RM 50 per order
      };
    });
  }

  _generateOptimizationSummary(abcAnalysis, optimizationResults) {
    const summary = {
      total_items: abcAnalysis.classified_data?.length || 0,
      abc_distribution: abcAnalysis.analysis_summary || {},
      optimization_score: optimizationResults.optimization_results?.weighted_score || 0,
      key_recommendations: []
    };
    
    // Add key recommendations
    if (optimizationResults.recommendations) {
      summary.key_recommendations = optimizationResults.recommendations.slice(0, 3);
    }
    
    // Add ABC insights
    if (abcAnalysis.analysis_summary) {
      const aItems = abcAnalysis.analysis_summary.A;
      if (aItems && aItems.count > 0) {
        summary.key_recommendations.push({
          type: 'abc_management',
          priority: 'high',
          message: `${aItems.count} A-class items require tight control`,
          impact: `RM ${aItems.total_value} in value`,
          action: 'Implement weekly review for A-class items'
        });
      }
    }
    
    return summary;
  }
}

export default InventoryOptimizationService;
