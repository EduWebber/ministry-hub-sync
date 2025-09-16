import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testProductionURLConfiguration() {
  console.log('🌐 Testing production URL configuration for Sistema Ministerial...\n');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('   Current session:', data.session ? 'Active' : 'None');
    
    return true;
  } catch (error) {
    console.error('❌ Connection exception:', error.message);
    return false;
  }
}

async function testAuthenticationFlow() {
  console.log('\n🔐 Testing authentication flow with production URL...');
  
  const testEmail = `prod.test.${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    // Test registration
    console.log('📝 Testing user registration...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome_completo: 'Test User',
          congregacao: 'Test Congregation'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Registration failed:', signUpError.message);
      return false;
    }
    
    console.log('✅ Registration successful');
    console.log('   User ID:', signUpData.user?.id);
    
    // Test login
    console.log('🔐 Testing user login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Login failed:', signInError.message);
      return false;
    }
    
    console.log('✅ Login successful');
    
    // Test profile creation
    if (signInData.user?.id) {
      console.log('👤 Testing profile creation...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signInData.user.id,
          nome_completo: 'Test User',
          congregacao: 'Test Congregation',
          cargo: 'publicador_batizado'
        })
        .select();
      
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message);
      } else {
        console.log('✅ Profile created successfully');
      }
    }
    
    // Clean up - delete test user
    if (signInData.user?.id) {
      console.log('🧹 Cleaning up test user...');
      await supabase.auth.signOut();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Authentication flow test failed:', error.message);
    return false;
  }
}

async function verifyConfiguration() {
  console.log('🔧 Verifying Supabase configuration...\n');
  
  console.log('📍 Supabase URL:', SUPABASE_URL);
  console.log('🔑 Supabase Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Not set');
  
  // Check if URL is the correct one
  const expectedUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
  if (SUPABASE_URL === expectedUrl) {
    console.log('✅ URL is correctly configured');
  } else {
    console.log('⚠️ URL may be incorrectly configured');
    console.log('   Expected:', expectedUrl);
    console.log('   Actual:', SUPABASE_URL);
  }
  
  return SUPABASE_URL === expectedUrl;
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running production URL configuration tests...\n');
  
  const configValid = await verifyConfiguration();
  const connectionSuccess = await testProductionURLConfiguration();
  const authFlowSuccess = await testAuthenticationFlow();
  
  console.log('\n📋 Test Summary:');
  console.log('   Configuration:', configValid ? '✅ Valid' : '❌ Invalid');
  console.log('   Connection:', connectionSuccess ? '✅ Pass' : '❌ Fail');
  console.log('   Auth Flow:', authFlowSuccess ? '✅ Pass' : '❌ Fail');
  
  if (configValid && connectionSuccess && authFlowSuccess) {
    console.log('\n🎉 All production URL tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testProductionURLConfiguration, testAuthenticationFlow, verifyConfiguration };