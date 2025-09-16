import { useState, useEffect } from 'react';
import { downloadDataForOffline } from '@/utils/offlineLocalDB';

interface OfflineStatus {
  isOnline: boolean;
  isOfflineMode: boolean;
  isDownloading: boolean;
  lastSync: Date | null;
}

export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isOfflineMode: false,
    isDownloading: false,
    lastSync: null,
  });

  useEffect(() => {
    // Update online/offline status
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isOfflineMode: true,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enableOfflineMode = () => {
    setStatus(prev => ({
      ...prev,
      isOfflineMode: true,
    }));
  };

  const disableOfflineMode = () => {
    setStatus(prev => ({
      ...prev,
      isOfflineMode: false,
    }));
  };

  const downloadOfflineData = async () => {
    setStatus(prev => ({
      ...prev,
      isDownloading: true,
    }));

    try {
      const success = await downloadDataForOffline();
      
      setStatus(prev => ({
        ...prev,
        isDownloading: false,
        lastSync: success ? new Date() : prev.lastSync,
      }));

      return success;
    } catch (error) {
      console.error('Error downloading offline data:', error);
      
      setStatus(prev => ({
        ...prev,
        isDownloading: false,
      }));

      return false;
    }
  };

  const syncWithServer = async () => {
    // This would implement the sync logic with the server
    console.log('Syncing with server...');
    // Implementation would go here
  };

  return {
    ...status,
    enableOfflineMode,
    disableOfflineMode,
    downloadOfflineData,
    syncWithServer,
  };
};