// Advanced Analytics Models for Servora AI
// Based on PRD Implementation Methodology

import { getTopSellingItems, getWasteStats } from '../database/db.js';
import logger from '../utils/logger.js';

/**
 * Clustering and Segmentation Models
 */
export class ProductClusterer {
  constructor() {
    this.clusteringMethods = {
      'kmeans': this._kmeansClustering,
      'dbscan': this._dbscanClustering,
      'hierarchical': this._hierarchicalClustering
    };
  }

  async clusterProducts(features) {
    try {
      const results = {};
      
      // Apply different clustering methods
      for (const [method, algorithm] of Object.entries(this.clusteringMethods)) {
        try {
          const clusters = algorithm(features);
          const silhouetteScore = this._calculateSilhouetteScore(features, clusters);
          
          results[method] = {
            clusters,
            silhouette_score: Math.round(silhouetteScore * 10000) / 10000,
            cluster_count: new Set(clusters).size,
            cluster_analysis: this._analyzeClusterCharacteristics(features, clusters)
          };
        } catch (error) {
          logger.error(`${method} clustering failed:`, error);
          results[method] = { error: error.message };
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Product clustering failed:', error);
      return { error: error.message };
    }
  }

  _kmeansClustering(features, k = 5) {
    // Simplified K-means implementation
    const data = features.map(f => [f.quantity || 0, f.price || 0, f.margin || 0]);
    const n = data.length;
    
    if (n === 0) return [];
    
    // Initialize centroids randomly
    const centroids = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      centroids.push([...data[randomIndex]]);
    }
    
    let clusters = new Array(n).fill(0);
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;
    
    while (changed && iterations < maxIterations) {
      changed = false;
      const newClusters = [...clusters];
      
      // Assign points to nearest centroid
      for (let i = 0; i < n; i++) {
        let minDistance = Infinity;
        let bestCluster = 0;
        
        for (let j = 0; j < k; j++) {
          const distance = this._euclideanDistance(data[i], centroids[j]);
          if (distance < minDistance) {
            minDistance = distance;
            bestCluster = j;
          }
        }
        
        if (newClusters[i] !== bestCluster) {
          newClusters[i] = bestCluster;
          changed = true;
        }
      }
      
      clusters = newClusters;
      
      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterPoints = data.filter((_, i) => clusters[i] === j);
        if (clusterPoints.length > 0) {
          const newCentroid = [
            clusterPoints.reduce((sum, point) => sum + point[0], 0) / clusterPoints.length,
            clusterPoints.reduce((sum, point) => sum + point[1], 0) / clusterPoints.length,
            clusterPoints.reduce((sum, point) => sum + point[2], 0) / clusterPoints.length
          ];
          centroids[j] = newCentroid;
        }
      }
      
      iterations++;
    }
    
    return clusters;
  }

  _dbscanClustering(features, eps = 0.5, minPts = 3) {
    // Simplified DBSCAN implementation
    const data = features.map(f => [f.quantity || 0, f.price || 0, f.margin || 0]);
    const n = data.length;
    const clusters = new Array(n).fill(-1); // -1 = noise
    let clusterId = 0;
    
    for (let i = 0; i < n; i++) {
      if (clusters[i] !== -1) continue;
      
      const neighbors = this._getNeighbors(data, i, eps);
      if (neighbors.length < minPts) {
        clusters[i] = -1; // Noise
        continue;
      }
      
      // Start new cluster
      clusters[i] = clusterId;
      const seedSet = [...neighbors];
      
      for (let j = 0; j < seedSet.length; j++) {
        const q = seedSet[j];
        
        if (clusters[q] === -1) {
          clusters[q] = clusterId;
        }
        
        if (clusters[q] !== -1) continue;
        
        clusters[q] = clusterId;
        const qNeighbors = this._getNeighbors(data, q, eps);
        if (qNeighbors.length >= minPts) {
          seedSet.push(...qNeighbors);
        }
      }
      
      clusterId++;
    }
    
    return clusters;
  }

  _hierarchicalClustering(features, k = 5) {
    // Simplified hierarchical clustering
    const data = features.map(f => [f.quantity || 0, f.price || 0, f.margin || 0]);
    const n = data.length;
    
    if (n === 0) return [];
    
    // Initialize each point as its own cluster
    let clusters = Array.from({length: n}, (_, i) => i);
    const distances = this._calculateDistanceMatrix(data);
    
    // Merge clusters until we have k clusters
    while (new Set(clusters).size > k) {
      let minDistance = Infinity;
      let mergeI = -1, mergeJ = -1;
      
      // Find closest clusters
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (clusters[i] !== clusters[j] && distances[i][j] < minDistance) {
            minDistance = distances[i][j];
            mergeI = i;
            mergeJ = j;
          }
        }
      }
      
      if (mergeI === -1) break;
      
      // Merge clusters
      const targetCluster = clusters[mergeI];
      for (let i = 0; i < n; i++) {
        if (clusters[i] === clusters[mergeJ]) {
          clusters[i] = targetCluster;
        }
      }
    }
    
    // Renumber clusters to start from 0
    const uniqueClusters = [...new Set(clusters)];
    const clusterMap = {};
    uniqueClusters.forEach((cluster, index) => {
      clusterMap[cluster] = index;
    });
    
    return clusters.map(c => clusterMap[c]);
  }

  _getNeighbors(data, pointIndex, eps) {
    const neighbors = [];
    const point = data[pointIndex];
    
    for (let i = 0; i < data.length; i++) {
      if (i !== pointIndex) {
        const distance = this._euclideanDistance(point, data[i]);
        if (distance <= eps) {
          neighbors.push(i);
        }
      }
    }
    
    return neighbors;
  }

  _calculateDistanceMatrix(data) {
    const n = data.length;
    const distances = Array.from({length: n}, () => new Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = this._euclideanDistance(data[i], data[j]);
        distances[i][j] = distance;
        distances[j][i] = distance;
      }
    }
    
    return distances;
  }

  _euclideanDistance(point1, point2) {
    const sum = point1.reduce((acc, val, i) => acc + Math.pow(val - point2[i], 2), 0);
    return Math.sqrt(sum);
  }

  _calculateSilhouetteScore(features, clusters) {
    // Simplified silhouette score calculation
    const data = features.map(f => [f.quantity || 0, f.price || 0, f.margin || 0]);
    const n = data.length;
    let totalScore = 0;
    
    for (let i = 0; i < n; i++) {
      const clusterId = clusters[i];
      const sameCluster = data.filter((_, j) => clusters[j] === clusterId);
      const otherClusters = [...new Set(clusters)].filter(c => c !== clusterId);
      
      if (sameCluster.length <= 1 || otherClusters.length === 0) {
        continue;
      }
      
      // Calculate a(i) - average distance to points in same cluster
      const a = sameCluster.reduce((sum, point, j) => {
        if (j === i) return sum;
        return sum + this._euclideanDistance(data[i], point);
      }, 0) / (sameCluster.length - 1);
      
      // Calculate b(i) - minimum average distance to other clusters
      let b = Infinity;
      for (const otherCluster of otherClusters) {
        const otherClusterPoints = data.filter((_, j) => clusters[j] === otherCluster);
        const avgDistance = otherClusterPoints.reduce((sum, point) => 
          sum + this._euclideanDistance(data[i], point), 0) / otherClusterPoints.length;
        b = Math.min(b, avgDistance);
      }
      
      const silhouette = (b - a) / Math.max(a, b);
      totalScore += silhouette;
    }
    
    return totalScore / n;
  }

  _analyzeClusterCharacteristics(features, clusters) {
    const clusterAnalysis = {};
    const uniqueClusters = [...new Set(clusters)];
    
    uniqueClusters.forEach(clusterId => {
      const clusterData = features.filter((_, i) => clusters[i] === clusterId);
      
      if (clusterData.length > 0) {
        clusterAnalysis[clusterId] = {
          size: clusterData.length,
          avg_quantity: Math.round((clusterData.reduce((sum, item) => sum + (item.quantity || 0), 0) / clusterData.length) * 100) / 100,
          avg_price: Math.round((clusterData.reduce((sum, item) => sum + (item.price || 0), 0) / clusterData.length) * 100) / 100,
          avg_margin: Math.round((clusterData.reduce((sum, item) => sum + (item.margin || 0), 0) / clusterData.length) * 10000) / 10000,
          quantity_volatility: this._calculateVolatility(clusterData.map(item => item.quantity || 0)),
          price_volatility: this._calculateVolatility(clusterData.map(item => item.price || 0))
        };
      }
    });
    
    return clusterAnalysis;
  }

  _calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.round(Math.sqrt(variance) * 100) / 100;
  }
}

/**
 * Customer Segmentation
 */
export class CustomerSegmenter {
  constructor() {
    this.segmentTypes = {
      'rfm': this._rfmSegmentation,
      'behavioral': this._behavioralSegmentation,
      'value_based': this._valueBasedSegmentation
    };
  }

  async segmentCustomers(transactionData) {
    try {
      const results = {};
      
      // Apply different segmentation methods
      for (const [method, algorithm] of Object.entries(this.segmentTypes)) {
        try {
          const segments = algorithm(transactionData);
          results[method] = {
            segments,
            segment_analysis: this._analyzeSegments(transactionData, segments),
            recommendations: this._generateSegmentRecommendations(segments)
          };
        } catch (error) {
          logger.error(`${method} segmentation failed:`, error);
          results[method] = { error: error.message };
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Customer segmentation failed:', error);
      return { error: error.message };
    }
  }

  _rfmSegmentation(transactionData) {
    // RFM Analysis (Recency, Frequency, Monetary)
    const customerData = this._calculateRFM(transactionData);
    
    // K-means clustering on RFM scores
    const rfmScores = customerData.map(customer => [
      customer.recency_score,
      customer.frequency_score,
      customer.monetary_score
    ]);
    
    const clusters = this._kmeansClustering(rfmScores, 4);
    
    return customerData.map((customer, i) => ({
      ...customer,
      segment: this._assignRFMSegmentName(customer, clusters[i])
    }));
  }

  _calculateRFM(transactionData) {
    // Group transactions by customer
    const customerTransactions = {};
    transactionData.forEach(transaction => {
      const customerId = transaction.customer_id || 'anonymous';
      if (!customerTransactions[customerId]) {
        customerTransactions[customerId] = [];
      }
      customerTransactions[customerId].push(transaction);
    });
    
    const now = new Date();
    const customerData = [];
    
    Object.entries(customerTransactions).forEach(([customerId, transactions]) => {
      const lastTransaction = new Date(Math.max(...transactions.map(t => new Date(t.date || t.timestamp))));
      const recency = Math.floor((now - lastTransaction) / (1000 * 60 * 60 * 24)); // days
      const frequency = transactions.length;
      const monetary = transactions.reduce((sum, t) => sum + (t.amount || t.quantity * t.price || 0), 0);
      
      customerData.push({
        customer_id: customerId,
        recency,
        frequency,
        monetary,
        recency_score: this._calculateRFMScore(recency, 'recency'),
        frequency_score: this._calculateRFMScore(frequency, 'frequency'),
        monetary_score: this._calculateRFMScore(monetary, 'monetary')
      });
    });
    
    return customerData;
  }

  _calculateRFMScore(value, type) {
    // Simplified RFM scoring (1-5 scale)
    const ranges = {
      recency: [0, 7, 30, 90, 180], // days
      frequency: [1, 2, 5, 10, 20], // transactions
      monetary: [0, 50, 200, 500, 1000] // amount
    };
    
    const range = ranges[type];
    for (let i = 0; i < range.length; i++) {
      if (value <= range[i]) {
        return 5 - i;
      }
    }
    return 1;
  }

  _assignRFMSegmentName(customer, clusterId) {
    const segments = {
      0: 'Champions',      // High RFM
      1: 'Loyal Customers', // High F&M, Medium R
      2: 'At Risk',        // High R, Low F&M
      3: 'Lost Customers'  // Low RFM
    };
    
    return segments[clusterId] || 'Unknown';
  }

  _behavioralSegmentation(transactionData) {
    // Behavioral segmentation based on purchase patterns
    const customerData = this._calculateBehavioralMetrics(transactionData);
    
    // Simple clustering based on behavioral metrics
    const behavioralScores = customerData.map(customer => [
      customer.avg_order_value,
      customer.purchase_frequency,
      customer.product_diversity
    ]);
    
    const clusters = this._kmeansClustering(behavioralScores, 3);
    
    return customerData.map((customer, i) => ({
      ...customer,
      segment: this._assignBehavioralSegmentName(customer, clusters[i])
    }));
  }

  _calculateBehavioralMetrics(transactionData) {
    const customerTransactions = {};
    transactionData.forEach(transaction => {
      const customerId = transaction.customer_id || 'anonymous';
      if (!customerTransactions[customerId]) {
        customerTransactions[customerId] = [];
      }
      customerTransactions[customerId].push(transaction);
    });
    
    const customerData = [];
    
    Object.entries(customerTransactions).forEach(([customerId, transactions]) => {
      const orderValues = transactions.map(t => t.amount || t.quantity * t.price || 0);
      const uniqueProducts = new Set(transactions.map(t => t.product_id || t.inventory_id));
      
      customerData.push({
        customer_id: customerId,
        avg_order_value: orderValues.reduce((a, b) => a + b, 0) / orderValues.length,
        purchase_frequency: transactions.length,
        product_diversity: uniqueProducts.size,
        total_spent: orderValues.reduce((a, b) => a + b, 0)
      });
    });
    
    return customerData;
  }

  _assignBehavioralSegmentName(customer, clusterId) {
    const segments = {
      0: 'High Value',
      1: 'Regular',
      2: 'Occasional'
    };
    
    return segments[clusterId] || 'Unknown';
  }

  _valueBasedSegmentation(transactionData) {
    // Value-based segmentation
    const customerData = this._calculateBehavioralMetrics(transactionData);
    
    return customerData.map(customer => {
      let segment;
      if (customer.total_spent > 1000) {
        segment = 'VIP';
      } else if (customer.total_spent > 500) {
        segment = 'High Value';
      } else if (customer.total_spent > 100) {
        segment = 'Medium Value';
      } else {
        segment = 'Low Value';
      }
      
      return {
        ...customer,
        segment
      };
    });
  }

  _kmeansClustering(data, k) {
    // Simplified K-means for segmentation
    const n = data.length;
    if (n === 0) return [];
    
    const centroids = [];
    for (let i = 0; i < k; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      centroids.push([...data[randomIndex]]);
    }
    
    let clusters = new Array(n).fill(0);
    let changed = true;
    let iterations = 0;
    
    while (changed && iterations < 50) {
      changed = false;
      const newClusters = [...clusters];
      
      for (let i = 0; i < n; i++) {
        let minDistance = Infinity;
        let bestCluster = 0;
        
        for (let j = 0; j < k; j++) {
          const distance = this._euclideanDistance(data[i], centroids[j]);
          if (distance < minDistance) {
            minDistance = distance;
            bestCluster = j;
          }
        }
        
        if (newClusters[i] !== bestCluster) {
          newClusters[i] = bestCluster;
          changed = true;
        }
      }
      
      clusters = newClusters;
      
      // Update centroids
      for (let j = 0; j < k; j++) {
        const clusterPoints = data.filter((_, i) => clusters[i] === j);
        if (clusterPoints.length > 0) {
          const dimensions = data[0].length;
          const newCentroid = [];
          for (let d = 0; d < dimensions; d++) {
            newCentroid[d] = clusterPoints.reduce((sum, point) => sum + point[d], 0) / clusterPoints.length;
          }
          centroids[j] = newCentroid;
        }
      }
      
      iterations++;
    }
    
    return clusters;
  }

  _euclideanDistance(point1, point2) {
    const sum = point1.reduce((acc, val, i) => acc + Math.pow(val - point2[i], 2), 0);
    return Math.sqrt(sum);
  }

  _analyzeSegments(transactionData, segments) {
    const segmentAnalysis = {};
    const uniqueSegments = [...new Set(segments.map(s => s.segment))];
    
    uniqueSegments.forEach(segmentName => {
      const segmentData = segments.filter(s => s.segment === segmentName);
      
      if (segmentData.length > 0) {
        segmentAnalysis[segmentName] = {
          size: segmentData.length,
          percentage: Math.round((segmentData.length / segments.length) * 10000) / 100,
          avg_recency: Math.round((segmentData.reduce((sum, s) => sum + (s.recency || 0), 0) / segmentData.length) * 100) / 100,
          avg_frequency: Math.round((segmentData.reduce((sum, s) => sum + (s.frequency || 0), 0) / segmentData.length) * 100) / 100,
          avg_monetary: Math.round((segmentData.reduce((sum, s) => sum + (s.monetary || 0), 0) / segmentData.length) * 100) / 100,
          total_value: Math.round(segmentData.reduce((sum, s) => sum + (s.monetary || s.total_spent || 0), 0) * 100) / 100
        };
      }
    });
    
    return segmentAnalysis;
  }

  _generateSegmentRecommendations(segments) {
    const recommendations = [];
    const segmentCounts = {};
    
    segments.forEach(segment => {
      segmentCounts[segment.segment] = (segmentCounts[segment.segment] || 0) + 1;
    });
    
    Object.entries(segmentCounts).forEach(([segment, count]) => {
      const percentage = (count / segments.length) * 100;
      
      switch (segment) {
        case 'Champions':
          recommendations.push({
            segment,
            action: 'Reward and retain',
            strategy: 'VIP treatment, exclusive offers',
            priority: 'high'
          });
          break;
        case 'At Risk':
          recommendations.push({
            segment,
            action: 'Win back',
            strategy: 'Special discounts, personalized outreach',
            priority: 'high'
          });
          break;
        case 'Lost Customers':
          recommendations.push({
            segment,
            action: 'Re-engage',
            strategy: 'Win-back campaigns, new product introductions',
            priority: 'medium'
          });
          break;
        default:
          recommendations.push({
            segment,
            action: 'Maintain',
            strategy: 'Regular engagement, standard offers',
            priority: 'low'
          });
      }
    });
    
    return recommendations;
  }
}

/**
 * Anomaly Detection
 */
export class AnomalyDetector {
  constructor() {
    this.methods = {
      'zscore': this._zscoreDetection,
      'iqr': this._iqrDetection,
      'isolation_forest': this._isolationForestDetection
    };
  }

  async detectAnomalies(data, method = 'zscore') {
    try {
      if (method in this.methods) {
        return this.methods[method](data);
      } else {
        return this.methods['zscore'](data);
      }
    } catch (error) {
      logger.error('Anomaly detection failed:', error);
      return { error: error.message };
    }
  }

  _zscoreDetection(data, threshold = 3.0) {
    const values = data.map(item => item.quantity || item.value || 0);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length);
    
    const anomalies = data.map((item, i) => {
      const zScore = Math.abs((values[i] - mean) / std);
      return {
        ...item,
        z_score: Math.round(zScore * 10000) / 10000,
        is_anomaly: zScore > threshold,
        anomaly_score: Math.round(zScore * 10000) / 10000
      };
    });
    
    return {
      anomalies,
      threshold,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
      anomaly_count: anomalies.filter(a => a.is_anomaly).length
    };
  }

  _iqrDetection(data) {
    const values = data.map(item => item.quantity || item.value || 0).sort((a, b) => a - b);
    const q1 = this._percentile(values, 25);
    const q3 = this._percentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const anomalies = data.map(item => {
      const value = item.quantity || item.value || 0;
      const isAnomaly = value < lowerBound || value > upperBound;
      
      return {
        ...item,
        is_anomaly: isAnomaly,
        anomaly_score: isAnomaly ? Math.abs(value - (q1 + q3) / 2) / iqr : 0,
        lower_bound: lowerBound,
        upper_bound: upperBound
      };
    });
    
    return {
      anomalies,
      q1: Math.round(q1 * 100) / 100,
      q3: Math.round(q3 * 100) / 100,
      iqr: Math.round(iqr * 100) / 100,
      anomaly_count: anomalies.filter(a => a.is_anomaly).length
    };
  }

  _isolationForestDetection(data) {
    // Simplified Isolation Forest implementation
    const values = data.map(item => item.quantity || item.value || 0);
    const n = values.length;
    const trees = 100;
    const sampleSize = Math.min(256, n);
    
    const anomalyScores = new Array(n).fill(0);
    
    for (let tree = 0; tree < trees; tree++) {
      const sample = this._randomSample(values, sampleSize);
      const scores = this._isolationTree(sample, values);
      
      for (let i = 0; i < n; i++) {
        anomalyScores[i] += scores[i];
      }
    }
    
    // Normalize scores
    const maxScore = Math.max(...anomalyScores);
    const normalizedScores = anomalyScores.map(score => score / maxScore);
    
    const anomalies = data.map((item, i) => ({
      ...item,
      anomaly_score: Math.round(normalizedScores[i] * 10000) / 10000,
      is_anomaly: normalizedScores[i] > 0.5
    }));
    
    return {
      anomalies,
      anomaly_count: anomalies.filter(a => a.is_anomaly).length,
      method: 'isolation_forest'
    };
  }

  _percentile(sortedArray, percentile) {
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  _randomSample(array, size) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
  }

  _isolationTree(sample, data) {
    // Simplified isolation tree
    const scores = new Array(data.length).fill(0);
    const maxDepth = Math.ceil(Math.log2(sample.length));
    
    for (let i = 0; i < data.length; i++) {
      const depth = this._calculateDepth(data[i], sample, maxDepth);
      scores[i] = depth;
    }
    
    return scores;
  }

  _calculateDepth(value, sample, maxDepth) {
    // Simplified depth calculation
    const sortedSample = [...sample].sort((a, b) => a - b);
    const min = sortedSample[0];
    const max = sortedSample[sortedSample.length - 1];
    
    if (value < min || value > max) return maxDepth;
    
    // Binary search to find position
    let left = 0, right = sortedSample.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (sortedSample[mid] === value) return Math.floor(maxDepth / 2);
      if (sortedSample[mid] < value) left = mid + 1;
      else right = mid - 1;
    }
    
    return Math.floor(maxDepth / 2);
  }
}

/**
 * Main Analytics Models Service
 */
export class AnalyticsModelsService {
  constructor() {
    this.productClusterer = new ProductClusterer();
    this.customerSegmenter = new CustomerSegmenter();
    this.anomalyDetector = new AnomalyDetector();
  }

  async getAnalyticsInsights(timePeriod = '30d') {
    try {
      // Get data
      const [topItems, wasteData] = await Promise.all([
        getTopSellingItems(),
        getWasteStats()
      ]);
      
      // Prepare data for analysis
      const productData = this._prepareProductData(topItems, wasteData);
      const transactionData = this._prepareTransactionData(topItems, wasteData);
      
      // Perform analytics
      const productClustering = await this.productClusterer.clusterProducts(productData);
      const customerSegmentation = await this.customerSegmenter.segmentCustomers(transactionData);
      const anomalyDetection = await this.anomalyDetector.detectAnomalies(productData);
      
      return {
        success: true,
        data: {
          product_clustering: productClustering,
          customer_segmentation: customerSegmentation,
          anomaly_detection: anomalyDetection,
          summary: this._generateAnalyticsSummary(productClustering, customerSegmentation, anomalyDetection)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Analytics models service error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  _prepareProductData(topItems, wasteData) {
    return topItems.map(item => {
      const itemWaste = wasteData.filter(waste => waste.item_id === item.inventory_id);
      const totalWaste = itemWaste.reduce((sum, waste) => sum + (waste.quantity || 0), 0);
      
      return {
        inventory_id: item.inventory_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        margin: item.margin,
        waste_quantity: totalWaste,
        waste_rate: item.quantity > 0 ? totalWaste / item.quantity : 0,
        category: this._categorizeItem(item.name)
      };
    });
  }

  _prepareTransactionData(topItems, wasteData) {
    // Simulate transaction data from sales and waste data
    const transactions = [];
    
    topItems.forEach(item => {
      // Add sales transactions
      for (let i = 0; i < Math.min(item.quantity, 10); i++) {
        transactions.push({
          customer_id: `customer_${Math.floor(Math.random() * 100)}`,
          product_id: item.inventory_id,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: item.price,
          amount: item.price * (Math.floor(Math.random() * 3) + 1),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
    
    return transactions;
  }

  _categorizeItem(itemName) {
    const name = itemName.toLowerCase();
    if (name.includes('coffee') || name.includes('bean')) return 'coffee';
    if (name.includes('milk') || name.includes('dairy')) return 'dairy';
    if (name.includes('sugar') || name.includes('syrup')) return 'sweetener';
    if (name.includes('cup') || name.includes('container')) return 'packaging';
    return 'other';
  }

  _generateAnalyticsSummary(productClustering, customerSegmentation, anomalyDetection) {
    const summary = {
      product_insights: {},
      customer_insights: {},
      anomaly_insights: {},
      recommendations: []
    };
    
    // Product clustering insights
    if (productClustering.kmeans && !productClustering.kmeans.error) {
      summary.product_insights = {
        cluster_count: productClustering.kmeans.cluster_count,
        best_method: 'kmeans',
        silhouette_score: productClustering.kmeans.silhouette_score
      };
    }
    
    // Customer segmentation insights
    if (customerSegmentation.rfm && !customerSegmentation.rfm.error) {
      const segmentAnalysis = customerSegmentation.rfm.segment_analysis;
      summary.customer_insights = {
        total_segments: Object.keys(segmentAnalysis).length,
        largest_segment: Object.entries(segmentAnalysis).reduce((a, b) => 
          a[1].size > b[1].size ? a : b
        )[0],
        high_value_customers: segmentAnalysis['Champions']?.size || 0
      };
    }
    
    // Anomaly detection insights
    if (anomalyDetection.anomalies) {
      summary.anomaly_insights = {
        total_anomalies: anomalyDetection.anomaly_count,
        anomaly_rate: Math.round((anomalyDetection.anomaly_count / anomalyDetection.anomalies.length) * 10000) / 100
      };
    }
    
    // Generate recommendations
    if (summary.anomaly_insights.anomaly_rate > 10) {
      summary.recommendations.push({
        type: 'anomaly_management',
        priority: 'high',
        message: 'High anomaly rate detected. Review data quality and processes.',
        action: 'Investigate and address data quality issues'
      });
    }
    
    if (summary.customer_insights.high_value_customers > 0) {
      summary.recommendations.push({
        type: 'customer_retention',
        priority: 'high',
        message: 'Focus on retaining high-value customers.',
        action: 'Implement VIP customer programs'
      });
    }
    
    return summary;
  }
}

export default AnalyticsModelsService;
