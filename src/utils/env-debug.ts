// Utility to debug environment variables
export const debugEnvVars = () => {
  console.log('=== Environment Variables Debug ===');
  console.log('VITE_MOCK_MODE:', import.meta.env.VITE_MOCK_MODE);
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('isMockMode (computed):', import.meta.env.VITE_MOCK_MODE === 'true');
  console.log('====================================');
};

// Run the debug function
debugEnvVars();