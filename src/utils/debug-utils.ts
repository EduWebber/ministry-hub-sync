// Utility functions for debugging the application state

export const isMockMode = (): boolean => {
  const mockMode = import.meta.env.VITE_MOCK_MODE === 'true';
  console.log('[DEBUG] isMockMode check:', {
    envVar: import.meta.env.VITE_MOCK_MODE,
    computed: mockMode
  });
  return mockMode;
};

export const debugEnvironment = (): void => {
  console.log('[DEBUG] Environment Variables:', {
    VITE_MOCK_MODE: import.meta.env.VITE_MOCK_MODE,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '[HIDDEN]' : undefined,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '[HIDDEN]' : undefined,
    computedMockMode: isMockMode()
  });
};

export const debugAuthStatus = (user: any, profile: any): void => {
  console.log('[DEBUG] Auth Status:', {
    userExists: !!user,
    profileExists: !!profile,
    userId: user?.id,
    profileId: profile?.id,
    profileRole: profile?.role,
    isMockMode: isMockMode()
  });
};

// Run debug on import
debugEnvironment();