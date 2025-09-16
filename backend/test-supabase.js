const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

// For backend, we should use service role key instead of anon key for full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase config:', { supabaseUrl, supabaseKey: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'Not set' });

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test a simple query
    const { data, error } = await supabase
      .from('family_members')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }

    console.log('Successfully connected to Supabase');
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();