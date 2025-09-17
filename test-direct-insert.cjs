const { createClient } = require('@supabase/supabase-js');

// Use the service role key
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU4NzA2NSwiZXhwIjoyMDczMTYzMDY1fQ.frU6B66tPwx5P3FRWd2s5658dT66GQhC5SdQhuK0Fhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectInsert() {
  try {
    console.log('Testing direct insert into designacoes table...');
    
    // First, let's try to describe the table structure
    console.log('Attempting to query designacoes table...');
    
    // Try a simple select to see if we can access the table at all
    const { data: selectData, error: selectError } = await supabase
      .from('designacoes')
      .select('count', { head: true, count: 'exact' });

    if (selectError) {
      console.log('❌ Select failed:', selectError.message);
    } else {
      console.log('✅ Select successful. Row count:', selectData);
    }
    
    // Now try to insert
    console.log('Attempting to insert into designacoes table...');
    const { data, error } = await supabase
      .from('designacoes')
      .insert({
        programacao_id: '11111111-1111-1111-1111-111111111111',
        congregacao_id: '7e90ac8e-d2f4-403a-b78f-55ff20ab7edf'
      })
      .select();

    if (error) {
      console.log('❌ Insert failed:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Insert successful:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testDirectInsert();