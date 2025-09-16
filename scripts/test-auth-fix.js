import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthFix() {
  console.log('🔧 Testing authentication fix...\n');
  
  try {
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful');
    
    // Test authentication flow
    console.log('\n2️⃣ Testing authentication flow...');
    
    // Try to sign in with test user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: 'senha123'
    });
    
    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return false;
    }
    
    console.log('✅ Authentication successful');
    console.log('   User ID:', authData.user?.id);
    
    // Test profile loading
    console.log('\n3️⃣ Testing profile loading...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile loading failed:', profileError.message);
      return false;
    }
    
    console.log('✅ Profile loaded successfully');
    console.log('   Name:', profileData.nome_completo);
    console.log('   Role:', profileData.role);
    
    // Test estudantes access
    console.log('\n4️⃣ Testing estudantes access...');
    const { data: estudantesData, error: estudantesError } = await supabase
      .from('estudantes')
      .select('count')
      .eq('profile_id', authData.user?.id);
    
    if (estudantesError) {
      console.error('❌ Estudantes access failed:', estudantesError.message);
      return false;
    }
    
    console.log('✅ Estudantes access successful');
    
    // Logout
    console.log('\n5️⃣ Logging out...');
    await supabase.auth.signOut();
    console.log('✅ Logout successful');
    
    console.log('\n🎉 All authentication tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Authentication fix test failed:', error.message);
    return false;
  }
}

// Run the test
testAuthFix();