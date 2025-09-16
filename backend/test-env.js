require('dotenv').config({ path: '../.env' });

console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY);

// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config:', { supabaseUrl, supabaseKey: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'NOT SET' });

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test a simple query
  supabase
    .from('estudantes')
    .select('id')
    .limit(1)
    .then(result => {
      console.log('Query result:', result);
    })
    .catch(error => {
      console.error('Query error:', error);
    });
} else {
  console.log('Missing Supabase configuration');
}