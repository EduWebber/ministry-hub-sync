const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCongregations() {
  try {
    console.log('Fetching congregations...');
    
    const { data, error } = await supabase
      .from('congregacoes')
      .select('id, nome')
      .limit(10);

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log('✅ Found congregations:');
    data.forEach(cong => {
      console.log(`  ${cong.id}: ${cong.nome}`);
    });
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

listCongregations();