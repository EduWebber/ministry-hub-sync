const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/backend/.env' });

// For backend, we should use service role key instead of anon key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase config:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

// Test with just the URL and key directly
console.log('\n🧪 Testing direct Supabase client creation...');

try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created successfully');
  
  // Test a simple query
  supabase
    .from('estudantes')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Query failed:', error.message);
        console.log('Full error:', error);
      } else {
        console.log('✅ Query successful');
        console.log('Data:', data);
      }
    })
    .catch(err => {
      console.log('❌ Query error:', err.message);
    });
} catch (error) {
  console.log('❌ Client creation failed:', error.message);
}