import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuthConfiguration() {
  console.log('🔧 Testing Supabase authentication URL configuration...\n');
  
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

async function testRegistrationFlow() {
  console.log('\n📝 Testing registration flow with new URL configuration...');
  
  const testEmail = `url.test.${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome_completo: 'Test User URL',
          congregacao: 'Test Congregation'
        }
      }
    });
    
    if (error) {
      console.error('❌ Registration failed:', error.message);
      return false;
    }
    
    console.log('✅ Registration successful');
    console.log('   User ID:', data.user?.id);
    console.log('   Requires confirmation:', data.user?.identities ? 'No' : 'Yes');
    
    return true;
  } catch (error) {
    console.error('❌ Registration exception:', error.message);
    return false;
  }
}

async function verifyURLConfiguration() {
  console.log('🔍 Verifying Supabase URL configuration...\n');
  
  console.log('📍 Current Supabase URL:', SUPABASE_URL);
  console.log('🔑 Current Supabase Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Not set');
  
  // Check if URL matches expected pattern
  const expectedUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
  if (SUPABASE_URL === expectedUrl) {
    console.log('✅ URL configuration is correct');
    return true;
  } else {
    console.log('❌ URL configuration is incorrect');
    console.log('   Expected:', expectedUrl);
    console.log('   Actual:', SUPABASE_URL);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Running Supabase URL configuration tests...\n');
  
  const urlValid = await verifyURLConfiguration();
  const connectionSuccess = await testAuthConfiguration();
  const registrationSuccess = await testRegistrationFlow();
  
  console.log('\n📋 Test Summary:');
  console.log('   URL Configuration:', urlValid ? '✅ Valid' : '❌ Invalid');
  console.log('   Connection:', connectionSuccess ? '✅ Pass' : '❌ Fail');
  console.log('   Registration:', registrationSuccess ? '✅ Pass' : '❌ Fail');
  
  if (urlValid && connectionSuccess && registrationSuccess) {
    console.log('\n🎉 All URL configuration tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { testAuthConfiguration, testRegistrationFlow, verifyURLConfiguration };
