import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthStatus() {
  console.log('🔐 Testing authentication status...');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return;
    }
    
    if (session?.user) {
      console.log('✅ User is authenticated');
      console.log('📧 Email:', session.user.email);
      console.log('🆔 User ID:', session.user.id);
      
      // Check user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile error:', profileError.message);
        console.log('ℹ️ This might be why the Estudantes page is not accessible');
      } else {
        console.log('👤 Profile loaded successfully');
        console.log('   Name:', profile.nome_completo);
        console.log('   Role:', profile.role);
        console.log('   Congregation:', profile.congregacao);
      }
    } else {
      console.log('ℹ️ No active session');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Authentication status test failed:', error.message);
    return false;
  }
}

async function testConnection() {
  console.log('\n📡 Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Run tests
async function runAllTests() {
  console.log('🧪 Running authentication and connection tests...\n');
  
  const connectionSuccess = await testConnection();
  const authSuccess = await testAuthStatus();
  
  console.log('\n📋 Test Summary:');
  console.log('   Connection:', connectionSuccess ? '✅ Pass' : '❌ Fail');
  console.log('   Authentication:', authSuccess ? '✅ Pass' : '❌ Fail');
  
  if (connectionSuccess && authSuccess) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testAuthStatus, testConnection };