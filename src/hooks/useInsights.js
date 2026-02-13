import { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';

export function useInsights() {
  const [insights, setInsights] = useState([]);
  const [allInsights, setAllInsights] = useState([]);
  const [pinnedInsights, setPinnedInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHighConfidence, setShowHighConfidence] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockApi.fetchInsights();
      setInsights(data);
      setAllInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePin = (insight) => {
    setPinnedInsights(prev => {
      const isPinned = prev.some(item => item.id === insight.id);
      if (isPinned) {
        return prev.filter(item => item.id !== insight.id);
      } else {
        const fullInsight = allInsights.find(i => i.id === insight.id) || insight;
        return [...prev, fullInsight];
      }
    });
  };

  const isPinned = (id) => {
    return pinnedInsights.some(item => item.id === id);
  };

  const filteredInsights = showHighConfidence
    ? insights.filter(i => i.meta.confidence_score > 0.8)
    : insights;

  return {
    insights: filteredInsights,
    allInsights,
    pinnedInsights,
    loading,
    error,
    showHighConfidence,
    setShowHighConfidence,
    togglePin,
    isPinned,
    refetch: fetchInsights
  };
}