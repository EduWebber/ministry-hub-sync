export function useCacheAsideEstudantesEnhanced() {
  return {
    estudantes: [],
    isLoading: false,
    error: null,
    isFromCache: false,
    fetchEstudantes: () => {},
    refetch: () => {},
    clearCache: () => {},
    cacheMetrics: {},
    healthStatus: 'healthy'
  };
}