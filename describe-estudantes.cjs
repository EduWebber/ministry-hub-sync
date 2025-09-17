const { createClient } = require('@supabase/supabase-js');

// Use the same configuration as in the backend
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function describeEstudantes() {
  try {
    console.log('Describing estudantes table...');
    
    const { data, error } = await supabase
      .from('estudantes')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Query failed:', error.message);
      return;
    }

    console.log('✅ Sample estudante data:');
    console.log(JSON.stringify(data[0], null, 2));
    
    console.log('\nAvailable columns:');
    const columns = Object.keys(data[0]);
    columns.forEach(col => console.log(`  - ${col}`));
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

describeEstudantes();