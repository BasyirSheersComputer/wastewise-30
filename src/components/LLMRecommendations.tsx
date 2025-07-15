import React, { useEffect, useState } from 'react';
import { subscribeToAnalytics } from '../services/llmService';

const LLMRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAnalytics(
      (data) => {
        setRecommendations(data.recommendations || '');
        setLastUpdated(new Date());
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Failed to connect to analytics stream.');
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return (
    <div className="glass-card p-lg mt-lg">
      <h3 className="text-md font-semibold text-text-primary mb-md flex items-center">
        <span>AI Recommendations</span>
        {lastUpdated && (
          <span className="ml-auto text-xs text-text-secondary">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </h3>
      {loading && (
        <div className="flex items-center space-x-2 text-text-secondary">
          <span className="loader" /> {/* You can style .loader with a spinner in CSS */}
          <span>Loading recommendations...</span>
        </div>
      )}
      {error && (
        <div className="text-error bg-error/10 p-sm rounded mb-md">{error}</div>
      )}
      {!loading && !error && (
        <pre className="whitespace-pre-wrap text-sm text-text-primary">{recommendations}</pre>
      )}
    </div>
  );
};

export default LLMRecommendations;
