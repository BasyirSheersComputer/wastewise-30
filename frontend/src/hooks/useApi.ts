/**
 * Comprehensive API Hook for Servora AI Frontend
 * Provides state management, caching, and error handling for API calls
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

// Types for API hook responses
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseApiOptions {
  immediate?: boolean;
  cache?: boolean;
  cacheTime?: number;
  retryCount?: number;
  retryDelay?: number;
}

interface UsePaginatedApiState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  setPage: (page: number) => Promise<void>;
}

// Cache implementation
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

const apiCache = new ApiCache();

/**
 * Generic API hook for single data fetching
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const {
    immediate = true,
    cache = true,
    cacheTime = 300000,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const apiCallRef = useRef(apiCall);
  const cacheKeyRef = useRef<string>();

  // Generate cache key based on API call function
  useEffect(() => {
    cacheKeyRef.current = apiCall.toString().slice(0, 100); // Simplified cache key
  }, [apiCall]);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      // Check cache first
      if (cache && cacheKeyRef.current) {
        const cachedData = apiCache.get(cacheKeyRef.current);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      const result = await apiCallRef.current();
      setData(result);

      // Cache the result
      if (cache && cacheKeyRef.current) {
        apiCache.set(cacheKeyRef.current, result, cacheTime);
      }

      setRetryAttempts(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      // Retry logic
      if (retryAttempts < retryCount) {
        setRetryAttempts(prev => prev + 1);
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * Math.pow(2, retryAttempts)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  }, [cache, cacheTime, retryCount, retryDelay, retryAttempts]);

  const refetch = useCallback(() => {
    // Clear cache if refetching
    if (cache && cacheKeyRef.current) {
      apiCache.delete(cacheKeyRef.current);
    }
    setRetryAttempts(0);
    return fetchData();
  }, [fetchData, cache]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Paginated API hook for list data
 */
export function usePaginatedApi<T>(
  apiCall: (params: { page: number; limit: number; [key: string]: any }) => Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>,
  initialParams: Record<string, any> = {},
  options: UseApiOptions = {}
): UsePaginatedApiState<T> {
  const {
    immediate = true,
    cache = true,
    cacheTime = 300000,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [params, setParams] = useState({
    page: 1,
    limit: 20,
    ...initialParams
  });

  const fetchData = useCallback(async (page: number, isLoadMore = false) => {
    setLoading(true);
    setError(null);

    try {
      const requestParams = { ...params, page };
      const result = await apiCall(requestParams);

      if (isLoadMore) {
        setData(prev => [...prev, ...result.data]);
      } else {
        setData(result.data);
      }

      setPagination(result.pagination);
      setParams(requestParams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall, params]);

  const refetch = useCallback(() => {
    return fetchData(1, false);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (pagination && pagination.page < pagination.totalPages && !loading) {
      return fetchData(pagination.page + 1, true);
    }
    return Promise.resolve();
  }, [fetchData, pagination, loading]);

  const setPage = useCallback((page: number) => {
    return fetchData(page, false);
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData(1, false);
    }
  }, [immediate, fetchData]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return {
    data,
    loading,
    error,
    pagination,
    hasMore,
    refetch,
    loadMore,
    setPage
  };
}

/**
 * Inventory Management Hooks
 */
export function useInventoryItems(params: {
  outlet_id?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
} = {}) {
  return usePaginatedApi(
    (requestParams) => apiService.getInventoryItems(requestParams),
    params
  );
}

export function useInventoryItem(id: string) {
  return useApi(
    () => apiService.get(`/api/inventory/items/${id}`),
    { immediate: !!id }
  );
}

export function useInventoryAnalytics(outletId?: string) {
  return useApi(
    () => apiService.get(`/api/inventory/analytics${outletId ? `?outlet_id=${outletId}` : ''}`),
    { immediate: true }
  );
}

/**
 * Waste Tracking Hooks
 */
export function useWasteLogs(params: {
  outlet_id?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
} = {}) {
  return usePaginatedApi(
    (requestParams) => apiService.getWasteLogs(requestParams),
    params
  );
}

export function useWasteLog(id: string) {
  return useApi(
    () => apiService.get(`/api/waste/logs/${id}`),
    { immediate: !!id }
  );
}

export function useWasteAnalytics(params: {
  outlet_id?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
} = {}) {
  return useApi(
    () => apiService.get(`/api/waste/analytics?${new URLSearchParams(params).toString()}`),
    { immediate: true }
  );
}

/**
 * Suppliers Management Hooks
 */
export function useSuppliers(params: {
  search?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
} = {}) {
  return usePaginatedApi(
    (requestParams) => apiService.get(`/api/suppliers?${new URLSearchParams(requestParams).toString()}`),
    params
  );
}

export function useSupplier(id: string) {
  return useApi(
    () => apiService.get(`/api/suppliers/${id}`),
    { immediate: !!id }
  );
}

/**
 * Outlets Management Hooks
 */
export function useOutlets(params: {
  search?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
} = {}) {
  return usePaginatedApi(
    (requestParams) => apiService.get(`/api/outlets?${new URLSearchParams(requestParams).toString()}`),
    params
  );
}

export function useOutlet(id: string) {
  return useApi(
    () => apiService.get(`/api/outlets/${id}`),
    { immediate: !!id }
  );
}

/**
 * Analytics Hooks
 */
export function useDemandForecast(params: {
  outlet_id: string;
  item_id: string;
  days?: number;
}) {
  return useApi(
    () => apiService.getDemandForecast(params),
    { immediate: !!(params.outlet_id && params.item_id) }
  );
}

export function useWastePrediction(params: {
  outlet_id: string;
  category?: string;
  days?: number;
}) {
  return useApi(
    () => apiService.getWastePrediction(params),
    { immediate: !!params.outlet_id }
  );
}

export function useInventoryOptimization(outletId: string) {
  return useApi(
    () => apiService.getInventoryOptimization(outletId),
    { immediate: !!outletId }
  );
}

export function usePerformanceMetrics(outletId?: string) {
  return useApi(
    () => apiService.get(`/api/analytics/performance-metrics${outletId ? `?outlet_id=${outletId}` : ''}`),
    { immediate: true }
  );
}

export function useTrendAnalysis(params: {
  metric: 'waste' | 'sales' | 'inventory' | 'cost';
  period?: '7d' | '30d' | '90d' | '1y';
  outlet_id?: string;
}) {
  return useApi(
    () => apiService.get(`/api/analytics/trend-analysis?${new URLSearchParams(params).toString()}`),
    { immediate: true }
  );
}

/**
 * Dashboard Hooks
 */
export function useDashboardOverview() {
  return useApi(
    () => apiService.get('/api/dashboard/overview'),
    { immediate: true }
  );
}

export function useDashboardRecommendations(section?: string) {
  return useApi(
    () => apiService.get(`/api/dashboard/recommendations${section ? `?section=${section}` : ''}`),
    { immediate: true }
  );
}

export function useKPIs() {
  return useApi(
    () => apiService.get('/api/dashboard/kpis'),
    { immediate: true }
  );
}

export function useRecentActivity() {
  return useApi(
    () => apiService.get('/api/dashboard/recent-activity'),
    { immediate: true }
  );
}

/**
 * AI/LLM Hooks
 */
export function useRecommendations(params: {
  outlet_id?: string;
  category?: string;
  limit?: number;
} = {}) {
  return useApi(
    () => apiService.get(`/api/ai/recommendations?${new URLSearchParams(params).toString()}`),
    { immediate: true }
  );
}

export function useForecast(params: {
  outlet_id?: string;
  item_id?: string;
  days?: number;
} = {}) {
  return useApi(
    () => apiService.get(`/api/ai/forecast?${new URLSearchParams(params).toString()}`),
    { immediate: !!(params.outlet_id && params.item_id) }
  );
}

/**
 * Billing/Subscription Hooks
 */
export function useSubscriptionPlans() {
  return useApi(
    () => apiService.get('/api/billing/plans'),
    { immediate: true }
  );
}

export function useSubscriptionStatus() {
  return useApi(
    () => apiService.get('/api/billing/status'),
    { immediate: true }
  );
}

export function useBillingHistory() {
  return usePaginatedApi(
    (requestParams) => apiService.get(`/api/billing/history?${new URLSearchParams(requestParams).toString()}`)
  );
}

/**
 * User Management Hooks
 */
export function useUserProfile() {
  return useApi(
    () => apiService.get('/api/user/profile'),
    { immediate: true }
  );
}

export function useTrialStatus() {
  return useApi(
    () => apiService.get('/api/user/trial-status'),
    { immediate: true }
  );
}

/**
 * Mutations Hook for Create/Update/Delete operations
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  } = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage), variables);
      throw err;
    } finally {
      setLoading(false);
      options.onSettled?.(data, error ? new Error(error) : null, variables);
    }
  }, [mutationFn, options, data, error]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    data,
    loading,
    error,
    reset
  };
}

/**
 * Cache utilities
 */
export const cacheUtils = {
  clear: () => apiCache.clear(),
  delete: (key: string) => apiCache.delete(key),
  set: (key: string, data: any, ttl?: number) => apiCache.set(key, data, ttl),
  get: (key: string) => apiCache.get(key)
};

export default {
  useApi,
  usePaginatedApi,
  useInventoryItems,
  useInventoryItem,
  useInventoryAnalytics,
  useWasteLogs,
  useWasteLog,
  useWasteAnalytics,
  useSuppliers,
  useSupplier,
  useOutlets,
  useOutlet,
  useDemandForecast,
  useWastePrediction,
  useInventoryOptimization,
  usePerformanceMetrics,
  useTrendAnalysis,
  useDashboardOverview,
  useDashboardRecommendations,
  useKPIs,
  useRecentActivity,
  useRecommendations,
  useForecast,
  useSubscriptionPlans,
  useSubscriptionStatus,
  useBillingHistory,
  useUserProfile,
  useTrialStatus,
  useMutation,
  cacheUtils
};
