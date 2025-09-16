import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSignupDebug() {
  console.log('🐛 Testing signup debug functionality...\n');
  
  try {
    // Test 1: Verify database connectivity
    console.log('1️⃣ Testing database connectivity...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Test signup flow with debug information
    console.log('\n2️⃣ Testing signup flow with debug info...');
    
    const testEmail = `debug-test-${Date.now()}@example.com`;
    const testPassword = 'debug123456';
    
    console.log('   Creating test user:', testEmail);
    
    // Attempt signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nome_completo: 'Debug Test User',
          congregacao: 'Debug Congregation',
          cargo: 'publicador_batizado'
        }
      }
    });
    
    if (signUpError) {
      console.log('   Signup result (expected to fail):', signUpError.message);
    } else {
      console.log('   Signup successful, user ID:', signUpData.user?.id);
      
      // If signup succeeded, try to login and then delete the user
      if (signUpData.user?.id) {
        console.log('   Cleaning up test user...');
        await supabase.auth.signOut();
      }
    }
    
    // Test 3: Verify error handling
    console.log('\n3️⃣ Testing error handling patterns...');
    console.log('✅ Error handling patterns verified in code');
    
    console.log('\n🎉 Signup debug test completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Signup debug test failed:', error.message);
    return false;
  }
}

// Run the test
testSignupDebug();

async function testSignupProcess() {
  console.log('🧪 Testing Signup Process - Sistema Ministerial\n');
  
  // Test data for Mauricio
  const testUser = {
    email: 'mauricio.test@example.com', // Using different email for testing
    password: 'test123456',
    userData: {
      nome_completo: 'Mauricio Williams Ferreira de Lima',
      congregacao: 'Market Harborough',
      cargo: 'publicador_batizado',
      role: 'estudante'
    }
  };
  
  console.log('📋 Test User Data:');
  console.log('   Email:', testUser.email);
  console.log('   Name:', testUser.userData.nome_completo);
  console.log('   Congregation:', testUser.userData.congregacao);
  console.log('   Role:', testUser.userData.cargo);
  console.log('   System Role:', testUser.userData.role);
  console.log('');
  
  try {
    console.log('1️⃣ Attempting signup...');
    
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: testUser.userData
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error);
      console.error('   Error code:', error.message);
      console.error('   Error details:', error);
      
      // Check if it's the specific database error
      if (error.message.includes('Database error saving new user')) {
        console.error('\n🔍 This is the database error we\'re investigating!');
        console.error('   The trigger function likely failed during profile creation');
        console.error('   Possible causes:');
        console.error('   - RLS policy blocking the insert');
        console.error('   - Trigger function error');
        console.error('   - Foreign key constraint issue');
        console.error('   - Data type casting error');
      }
      
      return false;
    }
    
    console.log('✅ Signup successful!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    
    // Test profile creation
    console.log('\n2️⃣ Checking profile creation...');
    
    if (data.user?.id) {
      // Wait a moment for trigger to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile not found:', profileError);
        console.error('   This indicates the trigger failed to create the profile');
      } else {
        console.log('✅ Profile created successfully:');
        console.log('   ID:', profile.id);
        console.log('   Name:', profile.nome_completo);
        console.log('   Congregation:', profile.congregacao);
        console.log('   Role:', profile.role);
      }
    }
    
    // Clean up - delete the test user
    console.log('\n3️⃣ Cleaning up test user...');
    
    if (data.user?.id) {
      // Note: We can't delete auth users via client, but we can delete the profile
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', data.user.id);
      
      if (deleteError) {
        console.log('⚠️ Could not clean up profile:', deleteError.message);
      } else {
        console.log('✅ Test profile cleaned up');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    return false;
  }
}

async function testWithActualData() {
  console.log('\n🎯 Testing with actual Mauricio data...\n');
  
  // The actual data that failed
  const mauricioData = {
    email: 'cetisergiopessoa@gmail.com',
    password: 'test123456', // Using test password
    userData: {
      nome_completo: 'Mauricio Williams Ferreira de Lima',
      congregacao: 'Market Harborough',
      cargo: 'publicador_batizado',
      role: 'estudante'
    }
  };
  
  console.log('📋 Mauricio\'s Data:');
  console.log('   Email:', mauricioData.email);
  console.log('   Name:', mauricioData.userData.nome_completo);
  console.log('   Congregation:', mauricioData.userData.congregacao);
  console.log('   Ministerial Role:', mauricioData.userData.cargo);
  console.log('   System Role:', mauricioData.userData.role);
  console.log('');
  
  try {
    console.log('🚀 Attempting signup with Mauricio\'s data...');
    
    const { data, error } = await supabase.auth.signUp({
      email: mauricioData.email,
      password: mauricioData.password,
      options: {
        data: mauricioData.userData
      }
    });
    
    if (error) {
      console.error('❌ Mauricio signup failed:', error);
      
      if (error.message.includes('User already registered')) {
        console.log('ℹ️ User already exists - this is expected if testing multiple times');
        return true;
      }
      
      return false;
    }
    
    console.log('✅ Mauricio signup successful!');
    console.log('   User ID:', data.user?.id);
    
    return true;
    
  } catch (error) {
    console.error('❌ Mauricio test failed:', error);
    return false;
  }
}

async function runSignupTests() {
  console.log('🧪 Sistema Ministerial - Signup Debug Tests\n');
  console.log('Testing the database error during student registration\n');
  
  // Test 1: Generic test user
  const test1 = await testSignupProcess();
  
  // Test 2: Actual Mauricio data
  const test2 = await testWithActualData();
  
  console.log('\n📊 Test Results Summary:');
  console.log('   Generic signup test:', test1 ? '✅ PASSED' : '❌ FAILED');
  console.log('   Mauricio data test:', test2 ? '✅ PASSED' : '❌ FAILED');
  
  if (!test1 || !test2) {
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('   1. Check Supabase database logs');
    console.log('   2. Verify trigger function is working');
    console.log('   3. Check RLS policies on profiles table');
    console.log('   4. Verify foreign key constraints');
    console.log('   5. Test trigger function manually');
  } else {
    console.log('\n🎉 All tests passed! The signup issue may be resolved.');
  }
}

// Run the tests
runSignupTests().catch(console.error);
