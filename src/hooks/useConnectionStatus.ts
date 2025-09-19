import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        // Test Supabase connection with a simple query
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) {
          setIsConnected(false);
          console.error('Supabase connection error:', error);
        } else {
          setIsConnected(true);
        }
      } catch (error) {
        setIsConnected(false);
        console.error('Network error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check connection immediately
    checkConnection();

    // Set up interval to check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isLoading,
    isOnline: isConnected,
    pendingOperations: 0,
    failedOperations: 0,
    isSyncing: false,
    autoSyncEnabled: true,
    setAutoSyncEnabled: () => {},
    syncNow: async () => ({ success: true, syncedCount: 0 })
  };
};