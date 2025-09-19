// Debug utilities used across the app
// Provides a single place to determine whether the app runs in mock mode.

export const isMockMode = (): boolean => {
  // Vite exposes env vars on import.meta.env and only VITE_ prefixed vars are exposed to the client
  return import.meta.env?.VITE_MOCK_MODE === 'true';
};
