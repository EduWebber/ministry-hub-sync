const { createClient } = require('@supabase/supabase-js');

// Use the correct service role key
const supabaseUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU4NzA2NSwiZXhwIjoyMDczMTYzMDY1fQ.frU6B66tPwx5P3FRWd2s5658dT66GQhC5SdQhuK0Fhk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTestData() {
  try {
    console.log('Fixing test data...');
    
    // First, let's use the service role key to bypass RLS
    console.log('Using service role key to bypass RLS...');
    
    // Update some students to belong to the existing congregation
    const { data: studentsToUpdate, error: fetchError } = await supabase
      .from('estudantes')
      .select('id')
      .limit(10);

    if (fetchError) {
      console.log('❌ Failed to fetch students:', fetchError.message);
      return;
    }

    console.log(`✅ Found ${studentsToUpdate.length} students to update`);
    
    // Update the first 5 students to belong to our congregation
    const congregationId = '7e90ac8e-d2f4-403a-b78f-55ff20ab7edf';
    
    for (let i = 0; i < Math.min(5, studentsToUpdate.length); i++) {
      const studentId = studentsToUpdate[i].id;
      
      const { error: updateError } = await supabase
        .from('estudantes')
        .update({ congregacao_id: congregationId })
        .eq('id', studentId);

      if (updateError) {
        console.log(`❌ Failed to update student ${studentId}:`, updateError.message);
      } else {
        console.log(`✅ Updated student ${studentId} to congregation ${congregationId}`);
      }
    }
    
    // Verify the update
    const { count, error: verifyError } = await supabase
      .from('estudantes')
      .select('*', { count: 'exact', head: true })
      .eq('congregacao_id', congregationId)
      .eq('ativo', true);

    if (verifyError) {
      console.log('❌ Failed to verify update:', verifyError.message);
    } else {
      console.log(`✅ Verification: ${count} students now in congregation ${congregationId}`);
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

fixTestData();