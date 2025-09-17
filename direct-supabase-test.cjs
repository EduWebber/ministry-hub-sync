const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU4NzA2NSwiZXhwIjoyMDczMTYzMDY1fQ.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

console.log('Testing direct Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\nTesting connection with a simple query...');
    
    // Try to get the schema
    const { data, error } = await supabase
      .from('estudantes')
      .select('id, nome')
      .limit(1);

    if (error) {
      console.log('❌ Query failed:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Query successful!');
    console.log('Data:', data);
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('Error stack:', error.stack);
  }
}

testConnection();