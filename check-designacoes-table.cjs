const { createClient } = require('@supabase/supabase-js');

// Use the service role key
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU4NzA2NSwiZXhwIjoyMDczMTYzMDY1fQ.frU6B66tPwx5P3FRWd2s5658dT66GQhC5SdQhuK0Fhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDesignacoesTable() {
  try {
    console.log('Checking designacoes table structure...');
    
    // Try to get table info
    const { data, error } = await supabase
      .from('designacoes')
      .select('count', { head: true, count: 'exact' });

    if (error) {
      console.log('❌ Query failed:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Table exists. Row count:', data);
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkDesignacoesTable();