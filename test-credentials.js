// Test script to verify credentials work
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCredentials() {
  console.log('🧪 Testing credentials...');
  
  // Test admin login
  console.log('\n1. Testing admin login...');
  try {
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'amazonwebber007@gmail.com',
      password: 'admin123'
    });
    
    if (adminError) {
      console.log('❌ Admin login failed:', adminError.message);
    } else {
      console.log('✅ Admin login successful:', adminData.user?.email);
    }
  } catch (error) {
    console.log('❌ Admin login exception:', error.message);
  }
  
  // Test instructor login
  console.log('\n2. Testing instructor login...');
  try {
    const { data: instructorData, error: instructorError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: 'senha123'
    });
    
    if (instructorError) {
      console.log('❌ Instructor login failed:', instructorError.message);
    } else {
      console.log('✅ Instructor login successful:', instructorData.user?.email);
    }
  } catch (error) {
    console.log('❌ Instructor login exception:', error.message);
  }
  
  console.log('\n✅ Credential testing completed');
}

// Run the test
testCredentials();