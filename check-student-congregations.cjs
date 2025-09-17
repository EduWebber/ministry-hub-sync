const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudentCongregations() {
  try {
    console.log('Checking student congregations...');
    
    // Get distinct congregation_ids from students
    const { data, error } = await supabase
      .from('estudantes')
      .select('congregacao_id')
      .eq('ativo', true)
      .limit(10);

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log('✅ Sample student congregation_ids:');
    const uniqueCongIds = [...new Set(data.map(s => s.congregacao_id))];
    uniqueCongIds.forEach(id => console.log(`  ${id}`));
    
    // Check if any of these congregations exist
    console.log('\nChecking if these congregations exist:');
    for (const id of uniqueCongIds) {
      const { data: congData, error: congError } = await supabase
        .from('congregacoes')
        .select('nome')
        .eq('id', id)
        .single();

      if (congError) {
        console.log(`  ${id}: Not found`);
      } else {
        console.log(`  ${id}: ${congData.nome}`);
      }
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkStudentCongregations();