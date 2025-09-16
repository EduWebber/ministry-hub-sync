import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabase() {
  console.log('🗄️ Testing database connectivity and structure...\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic database connectivity...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Check profiles table
    console.log('\n2️⃣ Checking profiles table structure...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table access failed:', profilesError.message);
      return false;
    }
    
    console.log('✅ Profiles table accessible');
    if (profilesData && profilesData.length > 0) {
      console.log('   Available columns:', Object.keys(profilesData[0]));
    }
    
    // Test 3: Check estudantes table
    console.log('\n3️⃣ Checking estudantes table structure...');
    const { data: estudantesData, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(1);
    
    if (estudantesError) {
      console.error('❌ Estudantes table access failed:', estudantesError.message);
      return false;
    }
    
    console.log('✅ Estudantes table accessible');
    if (estudantesData && estudantesData.length > 0) {
      console.log('   Available columns:', Object.keys(estudantesData[0]));
    }
    
    // Test 4: Check programacoes table
    console.log('\n4️⃣ Checking programacoes table structure...');
    const { data: programacoesData, error: programacoesError } = await supabase
      .from('programacoes')
      .select('*')
      .limit(1);
    
    if (programacoesError) {
      console.error('❌ Programacoes table access failed:', programacoesError.message);
      return false;
    }
    
    console.log('✅ Programacoes table accessible');
    if (programacoesData && programacoesData.length > 0) {
      console.log('   Available columns:', Object.keys(programacoesData[0]));
    }
    
    // Test 5: Test relationships
    console.log('\n5️⃣ Testing table relationships...');
    const { data: relationshipData, error: relationshipError } = await supabase
      .from('estudantes')
      .select('id, profile_id, perfil:profiles(nome_completo)')
      .limit(1);
    
    if (relationshipError) {
      console.log('⚠️ Relationship test failed:', relationshipError.message);
    } else {
      console.log('✅ Table relationships working');
    }
    
    console.log('\n🎉 Database test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

// Run the test
testDatabase();