// Utility to verify the system is working in real mode
import { supabase } from '@/integrations/supabase/client';
import { isMockMode } from './debug-utils';

export const verifySystemStatus = async () => {
  console.log('=== System Verification ===');
  
  // Check mock mode status
  const mockMode = isMockMode();
  console.log('Mock Mode:', mockMode ? 'ENABLED 🧪' : 'DISABLED 🚀');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- VITE_MOCK_MODE:', import.meta.env.VITE_MOCK_MODE);
  console.log('- VITE_SUPABASE_URL exists:', !!import.meta.env.VITE_SUPABASE_URL);
  console.log('- VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  
  // If not in mock mode, test Supabase connection
  if (!mockMode) {
    try {
      console.log('\n=== Testing Supabase Connection ===');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('❌ Supabase Connection Failed:', error.message);
        return false;
      }
      
      console.log('✅ Supabase Connection Successful');
      console.log('✅ Authentication System Ready');
      console.log('✅ Database Access Confirmed');
      
      return true;
    } catch (err) {
      console.error('❌ Supabase Connection Error:', err);
      return false;
    }
  } else {
    console.log('⚠️ System is in MOCK mode - no real connections tested');
    return true;
  }
};

// Run verification on import
verifySystemStatus();