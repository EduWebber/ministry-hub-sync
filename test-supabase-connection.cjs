const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/backend/.env' });

// For backend, we should use service role key instead of anon key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase config:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testing Supabase connection...');
    
    // Test a simple query to see if we can connect
    const { data, error } = await supabase
      .from('estudantes')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('Error details:', error);
      return;
    }

    console.log('✅ Supabase connection successful');
    console.log('Sample data:', data);
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testConnection();