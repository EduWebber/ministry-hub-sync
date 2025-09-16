import React, { useEffect, useState } from 'react';

const TestEnvVars: React.FC = () => {
  const [envVars, setEnvVars] = useState<Record<string, string | boolean | undefined>>({});
  
  useEffect(() => {
    // Check if we're in mock mode
    const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';
    
    // Get all relevant environment variables
    setEnvVars({
      VITE_MOCK_MODE: import.meta.env.VITE_MOCK_MODE,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '[HIDDEN]' : undefined,
      isMockMode: isMockMode,
    });
  }, []);

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
      <h2 className="text-lg font-bold mb-2">Environment Variables Debug</h2>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-mono font-bold">{key}:</span>
            <span className="font-mono">{String(value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-2 bg-white rounded">
        <p className="font-bold">Current Status:</p>
        <p>{envVars.isMockMode ? '🧪 Running in MOCK mode' : '🚀 Running in REAL mode'}</p>
      </div>
    </div>
  );
};

export default TestEnvVars;