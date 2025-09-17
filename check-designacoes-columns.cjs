const { createClient } = require('@supabase/supabase-js');

// Use the service role key
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU4NzA2NSwiZXhwIjoyMDczMTYzMDY1fQ.frU6B66tPwx5P3FRWd2s5658dT66GQhC5SdQhuK0Fhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDesignacoesColumns() {
  try {
    console.log('Checking designacoes table columns...');
    
    // Query the information schema to get column names
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'designacoes')
      .eq('table_schema', 'public');

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log('✅ Designacoes table columns:');
    data.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkDesignacoesColumns();