import { createClient } from '@supabase/supabase-js';

// Use the same Supabase configuration as in the .env file but with correct domain
const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

console.log('🔧 Testing Supabase configuration...');
console.log('URL:', SUPABASE_URL);
console.log('Project ID:', SUPABASE_URL.split('.')[0].replace('https://', ''));

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  try {
    console.log('\n🔍 Testing authentication...');
    
    // Test sign in with the user from the error message
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: 'senha123'  // Based on the CYPRESS_INSTRUCTOR_PASSWORD in .env
    });

    if (error) {
      console.error('❌ Auth error:', error.message);
      console.error('   Status:', error.status);
      console.error('   Code:', error.code);
      return;
    }

    console.log('✅ Authentication successful!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    
    // Sign out after test
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testAuth();