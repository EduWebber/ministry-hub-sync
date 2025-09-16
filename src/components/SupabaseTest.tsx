import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SupabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<any[]>([]);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    try {
      // Test basic connection by querying profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (error) {
        setTestResult(`❌ Error: ${error.message}`);
        console.error('Supabase Error:', error);
      } else {
        setTestResult(`✅ Success! Found ${data?.length || 0} profiles`);
        setProfiles(data || []);
        console.log('Profiles data:', data);
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Run test on component mount
    testSupabaseConnection();
  }, []);

  return (
    <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg mt-4">
      <h2 className="text-lg font-bold mb-2">Supabase Connection Test</h2>
      <button 
        onClick={testSupabaseConnection}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      
      <div className="mt-4 p-2 bg-white rounded">
        <p className="font-bold">Test Result:</p>
        <p>{testResult}</p>
      </div>
      
      {profiles.length > 0 && (
        <div className="mt-4 p-2 bg-white rounded">
          <p className="font-bold">Sample Profiles:</p>
          <ul className="list-disc pl-5">
            {profiles.map((profile, index) => (
              <li key={index}>
                {profile.nome || profile.email || profile.id} ({profile.role || 'no role'})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;