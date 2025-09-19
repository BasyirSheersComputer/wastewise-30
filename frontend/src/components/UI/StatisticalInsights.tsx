import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Download, 
  Settings,
  TrendingDown,
  Zap,
  Brain,
  Target,
  PieChart,
  Users,
  Package,
  Activity
} from 'lucide-react';

interface ForecastData {
  average_demand: number;
  trend_direction: string;
  trend_magnitude: number;
  confidence: string;
  recommendations: string[];
}

interface ABCAnalysis {
  classified_data: Array<{
    inventory_id: string;
    name: string;
    abc_classification: string;
    annual_value: number;
    cumulative_percentage: number;
  }>;
  analysis_summary: {
    A: { count: number; percentage_of_items: number; total_value: number };
    B: { count: number; percentage_of_items: number; total_value: number };
    C: { count: number; percentage_of_items: number; total_value: number };
  };
  recommendations: {
    A_items: { management: string; ordering: string; safety_stock: string };
    B_items: { management: string; ordering: string; safety_stock: string };
    C_items: { management: string; ordering: string; safety_stock: string };
  };
}

interface AnomalyData {
  anomalies: Array<{
    inventory_id: string;
    name: string;
    is_anomaly: boolean;
    anomaly_score: number;
    quantity: number;
  }>;
  anomaly_count: number;
  summary: {
    total_items: number;
    anomaly_rate: number;
    high_risk_items: number;
  };
}

interface ClusteringData {
  clustering_results: {
    kmeans: {
      clusters: number[];
      silhouette_score: number;
      cluster_count: number;
      cluster_analysis: Record<string, any>;
    };
  };
  summary: {
    best_method: string;
    cluster_count: number;
    silhouette_score: number;
  };
}

const StatisticalInsights: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('forecast');
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [abcAnalysis, setABCAnalysis] = useState<ABCAnalysis | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [clusteringData, setClusteringData] = useState<ClusteringData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatisticalData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all statistical data in parallel
      const [forecastResponse, abcResponse, anomalyResponse, clusteringResponse] = await Promise.allSettled([
        fetch(`/api/statistical-models/forecast?timePeriod=${selectedPeriod}`, { headers }),
        fetch(`/api/statistical-models/abc-analysis?timePeriod=${selectedPeriod}`, { headers }),
        fetch(`/api/statistical-models/anomalies?timePeriod=${selectedPeriod}`, { headers }),
        fetch(`/api/statistical-models/clustering?timePeriod=${selectedPeriod}`, { headers })
      ]);

      // Process forecast data
      if (forecastResponse.status === 'fulfilled' && forecastResponse.value.ok) {
        const forecastResult = await forecastResponse.value.json();
        if (forecastResult.success) {
          setForecastData(forecastResult.data.summary);
        }
      }

      // Process ABC analysis
      if (abcResponse.status === 'fulfilled' && abcResponse.value.ok) {
        const abcResult = await abcResponse.value.json();
        if (abcResult.success) {
          setABCAnalysis(abcResult.data.abc_analysis);
        }
      }

      // Process anomaly data
      if (anomalyResponse.status === 'fulfilled' && anomalyResponse.value.ok) {
        const anomalyResult = await anomalyResponse.value.json();
        if (anomalyResult.success) {
          setAnomalyData(anomalyResult.data);
        }
      }

      // Process clustering data
      if (clusteringResponse.status === 'fulfilled' && clusteringResponse.value.ok) {
        const clusteringResult = await clusteringResponse.value.json();
        if (clusteringResult.success) {
          setClusteringData(clusteringResult.data);
        }
      }

    } catch (err) {
      console.error('Error fetching statistical data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistical data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatisticalData();
  }, [selectedPeriod]);

  const handleExport = () => {
    // Create export data
    const exportData = {
      forecast: forecastData,
      abc_analysis: abcAnalysis,
      anomalies: anomalyData,
      clustering: clusteringData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistical-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'increasing' ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      direction === 'decreasing' ?
      <TrendingDown className="w-4 h-4 text-red-600" /> :
      <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getABCColor = (classification: string) => {
    switch (classification) {
      case 'A': return 'text-red-600 bg-red-100';
      case 'B': return 'text-yellow-600 bg-yellow-100';
      case 'C': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'forecast', name: 'Demand Forecast', icon: TrendingUp },
    { id: 'abc', name: 'ABC Analysis', icon: Target },
    { id: 'anomalies', name: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'clustering', name: 'Product Clustering', icon: PieChart }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            Statistical Insights
          </h1>
          <p className="text-gray-600 mt-1">Advanced analytics and AI-powered predictions</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={fetchStatisticalData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </>
            )}
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div className="text-red-800">
              <p className="font-medium">Error loading statistical data</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            {forecastData ? (
              <>
                {/* Forecast Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Demand</p>
                        <p className="text-2xl font-bold text-gray-900">{forecastData.average_demand}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 mt-2 flex items-center">
                      {getTrendIcon(forecastData.trend_direction)}
                      <span className="ml-1">{forecastData.trend_direction}</span>
                    </p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Trend Magnitude</p>
                        <p className="text-2xl font-bold text-gray-900">{forecastData.trend_magnitude.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-green-600 mt-2">Change rate</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Confidence Level</p>
                        <p className="text-2xl font-bold text-gray-900 capitalize">{forecastData.confidence}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-sm text-purple-600 mt-2">Model confidence</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recommendations</p>
                        <p className="text-2xl font-bold text-gray-900">{forecastData.recommendations.length}</p>
                      </div>
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-sm text-orange-600 mt-2">Action items</p>
                  </div>
                </div>

                {/* Recommendations */}
                {forecastData.recommendations.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                    <div className="space-y-3">
                      {forecastData.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-800">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No forecast data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'abc' && (
          <div className="space-y-6">
            {abcAnalysis ? (
              <>
                {/* ABC Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['A', 'B', 'C'].map((classification) => {
                    const data = abcAnalysis.analysis_summary[classification as keyof typeof abcAnalysis.analysis_summary];
                    return (
                      <div key={classification} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getABCColor(classification)}`}>
                            Class {classification}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{data.count}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Items:</span>
                            <span className="font-medium">{data.percentage_of_items.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Value:</span>
                            <span className="font-medium">RM {data.total_value.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ABC Items Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">ABC Classification Details</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative %</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {abcAnalysis.classified_data.slice(0, 10).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getABCColor(item.abc_classification)}`}>
                                {item.abc_classification}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              RM {item.annual_value.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.cumulative_percentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ABC Recommendations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Management Recommendations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(abcAnalysis.recommendations).map(([classification, recommendations]) => (
                      <div key={classification} className="space-y-3">
                        <h4 className="font-medium text-gray-900">Class {classification} Items</h4>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Management:</span>
                            <p className="text-gray-600">{recommendations.management}</p>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Ordering:</span>
                            <p className="text-gray-600">{recommendations.ordering}</p>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Safety Stock:</span>
                            <p className="text-gray-600">{recommendations.safety_stock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No ABC analysis data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            {anomalyData ? (
              <>
                {/* Anomaly Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900">{anomalyData.summary.total_items}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Anomalies Detected</p>
                        <p className="text-2xl font-bold text-gray-900">{anomalyData.anomaly_count}</p>
                      </div>
                      <div className="bg-red-100 p-3 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Anomaly Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{anomalyData.summary.anomaly_rate.toFixed(1)}%</p>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Activity className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Anomalies Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Detected Anomalies</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anomaly Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {anomalyData.anomalies.filter(item => item.is_anomaly).slice(0, 10).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.anomaly_score.toFixed(3)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Anomaly
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No anomaly detection data available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'clustering' && (
          <div className="space-y-6">
            {clusteringData ? (
              <>
                {/* Clustering Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Clusters Found</p>
                        <p className="text-2xl font-bold text-gray-900">{clusteringData.summary.cluster_count}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <PieChart className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Best Method</p>
                        <p className="text-2xl font-bold text-gray-900 capitalize">{clusteringData.summary.best_method}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Brain className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Silhouette Score</p>
                        <p className="text-2xl font-bold text-gray-900">{clusteringData.summary.silhouette_score.toFixed(3)}</p>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cluster Analysis */}
                {clusteringData.clustering_results.kmeans.cluster_analysis && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cluster Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(clusteringData.clustering_results.kmeans.cluster_analysis).map(([clusterId, analysis]) => (
                        <div key={clusterId} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Cluster {clusterId}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Size:</span>
                              <span className="font-medium">{analysis.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Quantity:</span>
                              <span className="font-medium">{analysis.avg_quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Price:</span>
                              <span className="font-medium">RM {analysis.avg_price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Margin:</span>
                              <span className="font-medium">{(analysis.avg_margin * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No clustering data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticalInsights;
