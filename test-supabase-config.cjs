const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test the current configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase configuration...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test a simple query to see if we can connect
  supabase.from('profiles').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Connection test failed:', error.message);
      } else {
        console.log('✅ Connection test successful!');
      }
    })
    .catch(error => {
      console.log('💥 Connection test error:', error.message);
    });
} else {
  console.log('❌ Missing Supabase configuration');
}