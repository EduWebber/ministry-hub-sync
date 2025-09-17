const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listProgramacoes() {
  try {
    console.log('Fetching programacoes...');
    
    const { data, error } = await supabase
      .from('programacoes')
      .select('id, titulo, data')
      .limit(10);

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log('✅ Found programacoes:');
    data.forEach(prog => {
      console.log(`  ${prog.id}: ${prog.titulo} (${prog.data})`);
    });
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

listProgramacoes();