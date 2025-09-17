const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function describeProgramacaoItens() {
  try {
    console.log('Describing programacao_itens table...');
    
    const { data, error } = await supabase
      .from('programacao_itens')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log('✅ Sample programacao_itens data:');
    data.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, JSON.stringify(item, null, 2));
    });
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

describeProgramacaoItens();