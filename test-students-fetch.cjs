const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStudentsFetch() {
  try {
    console.log('Fetching students for congregation...');
    
    const { data, error } = await supabase
      .from('estudantes')
      .select('id, nome, ativo, congregacao_id')
      .eq('congregacao_id', '7e90ac8e-d2f4-403a-b78f-55ff20ab7edf')
      .eq('ativo', true)
      .limit(5);

    if (error) {
      console.log('❌ Query failed:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('✅ Found students:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testStudentsFetch();