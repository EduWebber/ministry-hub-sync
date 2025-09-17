// Script to verify the student data import
// This script should be run after importing the data to verify the import was successful

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyImport() {
  try {
    // Check the total number of students
    const { count: studentCount, error: countError } = await supabase
      .from('estudantes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting students:', countError);
      return;
    }
    
    console.log(`Total students imported: ${studentCount}`);
    
    // Check if we have the expected number (101)
    if (studentCount === 101) {
      console.log('✅ Student count matches expected number');
    } else {
      console.log(`⚠️  Expected 101 students, but found ${studentCount}`);
    }
    
    // Check a few sample students
    const { data: sampleStudents, error: sampleError } = await supabase
      .from('estudantes')
      .select('id, profile_id, genero, ativo')
      .limit(5);
    
    if (sampleError) {
      console.error('Error fetching sample students:', sampleError);
      return;
    }
    
    console.log('Sample students:');
    sampleStudents.forEach(student => {
      console.log(`  - ID: ${student.id}, Profile ID: ${student.profile_id}, Gender: ${student.genero}, Active: ${student.ativo}`);
    });
    
    // Check profiles
    const { count: profileCount, error: profileCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (profileCountError) {
      console.error('Error counting profiles:', profileCountError);
      return;
    }
    
    console.log(`Total profiles created: ${profileCount}`);
    
    // Check if profile count matches student count
    if (profileCount === studentCount) {
      console.log('✅ Profile count matches student count');
    } else {
      console.log(`⚠️  Profile count (${profileCount}) does not match student count (${studentCount})`);
    }
    
    console.log('✅ Verification complete!');
    
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

// Run the verification
verifyImport();