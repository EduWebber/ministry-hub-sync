const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCongregations() {
  try {
    console.log('Analyzing congregations and students...');
    
    // Get all congregations
    const { data: congregacoes, error: congError } = await supabase
      .from('congregacoes')
      .select('id, nome');

    if (congError) {
      console.log('❌ Failed to fetch congregations:', congError.message);
      return;
    }

    console.log('✅ Found congregations:');
    for (const cong of congregacoes) {
      console.log(`  ${cong.id}: ${cong.nome}`);
      
      // Count students in this congregation
      const { count, error: countError } = await supabase
        .from('estudantes')
        .select('*', { count: 'exact', head: true })
        .eq('congregacao_id', cong.id)
        .eq('ativo', true);

      if (countError) {
        console.log(`    ❌ Error counting students: ${countError.message}`);
      } else {
        console.log(`    🧑‍🎓 ${count} active students`);
      }
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

analyzeCongregations();