const { createClient } = require('@supabase/supabase-js');

// Use the service role key
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU4NzA2NSwiZXhwIjoyMDczMTYzMDY1fQ.frU6B66tPwx5P3FRWd2s5658dT66GQhC5SdQhuK0Fhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function describeDesignacoes() {
  try {
    console.log('Describing designacoes table...');
    
    const { data, error } = await supabase
      .from('designacoes')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log('✅ Sample designacao data:');
    console.log(JSON.stringify(data[0], null, 2));
    
    console.log('\nAvailable columns:');
    const columns = Object.keys(data[0]);
    columns.forEach(col => console.log(`  - ${col}`));
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

describeDesignacoes();