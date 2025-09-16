import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL(query) {
  try {
    // Try using the exec_sql RPC function directly
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: query
    });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies...');
  
  // First, try to drop existing problematic policies
  const dropPolicies = [
    'DROP POLICY IF EXISTS "Users can view own profile" ON profiles',
    'DROP POLICY IF EXISTS "Users can update own profile" ON profiles',
    'DROP POLICY IF EXISTS "Enable read access for all users" ON profiles',
    'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles',
    'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles',
    'DROP POLICY IF EXISTS "profiles_select_policy" ON profiles',
    'DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles',
    'DROP POLICY IF EXISTS "profiles_update_policy" ON profiles'
  ];

  for (const query of dropPolicies) {
    try {
      console.log(`Executing: ${query}`);
      const { error } = await executeSQL(query);
      if (error) {
        console.log(`Warning: ${error.message}`);
      } else {
        console.log('✅ Policy dropped successfully');
      }
    } catch (err) {
      console.log(`Warning: ${err.message}`);
    }
  }

  // Create new simple policies
  const createPolicies = [
    'CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true)',
    'CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true)',
    'CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true)'
  ];

  for (const query of createPolicies) {
    try {
      console.log(`Executing: ${query}`);
      const { error } = await executeSQL(query);
      if (error) {
        console.log(`Warning: ${error.message}`);
      } else {
        console.log('✅ Policy created successfully');
      }
    } catch (err) {
      console.log(`Warning: ${err.message}`);
    }
  }

  // Enable RLS on profiles table
  try {
    console.log('Enabling RLS on profiles table...');
    const { error } = await executeSQL('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY');
    if (error) {
      console.log(`Warning: ${error.message}`);
    } else {
      console.log('✅ RLS enabled successfully');
    }
  } catch (err) {
    console.log(`Warning: ${err.message}`);
  }

  console.log('\n✅ RLS policies fix attempt completed!');
  console.log('\n📋 If you still see errors, manually run the SQL from fix-rls-policies.sql in your Supabase dashboard');
}

fixRLSPolicies();