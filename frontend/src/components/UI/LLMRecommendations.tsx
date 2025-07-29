import React, { useEffect, useState } from 'react';
import { subscribeToAnalytics } from '../../services/llmService';
import { Lightbulb, Clock, AlertTriangle, CheckCircle, Database, Zap } from 'lucide-react';

interface LLMRecommendationsProps {
  section?: string;
}

interface AnalyticsData {
  section: string;
  analytics: any;
  recommendations: string;
  timestamp: string;
  provider: string;
  error?: string;
}

const LLMRecommendations: React.FC<LLMRecommendationsProps> = ({ section = 'dashboard' }) => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [provider, setProvider] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAnalytics(
      (data: AnalyticsData) => {
        setRecommendations(data.recommendations || '');
        setAnalytics(data.analytics);
        setProvider(data.provider);
        setLastUpdated(new Date(data.timestamp));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to connect to analytics stream.');
        setLoading(false);
      },
      section
    );
    return unsubscribe;
  }, [section]);

  const getRecommendationIcon = (recommendation: string) => {
    if (recommendation.includes('🚨') || recommendation.includes('⚠️')) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    } else if (recommendation.includes('💰') || recommendation.includes('📈')) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (recommendation.includes('📊') || recommendation.includes('🎯')) {
      return <Lightbulb className="w-4 h-4 text-blue-600" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'gemini':
        return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'chatgpt':
        return <Database className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatRecommendations = (recs: string) => {
    return recs.split('\n\n').filter(rec => rec.trim());
  };

  const getProviderName = () => {
    switch (provider) {
      case 'gemini':
        return 'Gemini AI';
      case 'chatgpt':
        return 'ChatGPT';
      default:
        return 'AI Service';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          <div className="flex items-center space-x-2">
            {provider && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                {getProviderIcon()}
                <span>{getProviderName()}</span>
              </div>
            )}
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {loading && (
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading recommendations...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}
        
        {!loading && !error && recommendations && (
          <div className="space-y-4">
            {formatRecommendations(recommendations).map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getRecommendationIcon(recommendation)}
                <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !error && !recommendations && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No recommendations available yet.</p>
          </div>
        )}
        
        {/* Analytics Summary (if available) */}
        {analytics && !loading && !error && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Data Summary:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {analytics.wasteData && (
                <div className="bg-blue-50 p-2 rounded">
                  <span className="font-medium">Waste Entries:</span> {analytics.wasteData.length}
                </div>
              )}
              {analytics.suppliers && (
                <div className="bg-green-50 p-2 rounded">
                  <span className="font-medium">Suppliers:</span> {analytics.suppliers.length}
                </div>
              )}
              {analytics.staff && (
                <div className="bg-purple-50 p-2 rounded">
                  <span className="font-medium">Staff:</span> {analytics.staff.length}
                </div>
              )}
              {analytics.topItems && (
                <div className="bg-orange-50 p-2 rounded">
                  <span className="font-medium">Top Items:</span> {analytics.topItems.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMRecommendations;
