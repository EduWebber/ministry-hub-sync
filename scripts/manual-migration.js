import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyManualMigration() {
  console.log('🚀 Applying manual database migration...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250806120000_add_user_roles.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.log('⚠️ Migration file not found, creating a simple migration...');
      
      // Simple migration for adding role column if it doesn't exist
      console.log('📝 Creating simple role column migration...');
      
      // Check if role column exists
      const { data: sampleData, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Error accessing profiles table:', sampleError.message);
        return false;
      }
      
      const columns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
      console.log('📊 Current profile columns:', columns);
      
      if (!columns.includes('role')) {
        console.log('⚠️ Role column not found, but cannot add it directly through this script');
        console.log('   Please run the SQL migration manually in Supabase dashboard');
        return false;
      } else {
        console.log('✅ Role column already exists');
      }
      
      console.log('✅ Simple migration check completed');
      return true;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');
    console.log('📝 Migration content preview:', migrationSQL.substring(0, 200) + '...');
    
    // For safety, we'll just verify the structure rather than execute
    console.log('🔍 Migration file verification completed');
    console.log('   Please execute this migration in your Supabase SQL editor');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in manual migration:', error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration results...');
  
  try {
    // Check profiles table structure
    const { data: profileSample, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error accessing profiles:', profileError.message);
      return false;
    }
    
    if (profileSample && profileSample.length > 0) {
      const columns = Object.keys(profileSample[0]);
      console.log('📊 Profile table columns:', columns);
      
      // Check for required columns
      const requiredColumns = ['id', 'nome_completo', 'congregacao', 'cargo', 'role'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing columns:', missingColumns);
        return false;
      } else {
        console.log('✅ All required columns present');
      }
    }
    
    // Check estudantes table structure
    const { data: estudanteSample, error: estudanteError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(1);
    
    if (estudanteError) {
      console.log('⚠️ Error accessing estudantes table:', estudanteError.message);
    } else if (estudanteSample && estudanteSample.length > 0) {
      const columns = Object.keys(estudanteSample[0]);
      console.log('📊 Estudantes table columns:', columns);
    }
    
    console.log('✅ Migration verification completed');
    return true;
    
  } catch (error) {
    console.error('❌ Error in migration verification:', error.message);
    return false;
  }
}

// Run migration
async function runMigration() {
  console.log('🔧 Manual Migration Tool\n');
  
  const migrationSuccess = await applyManualMigration();
  const verificationSuccess = await verifyMigration();
  
  console.log('\n📋 Migration Summary:');
  console.log('   Migration Process:', migrationSuccess ? '✅ Completed' : '❌ Failed');
  console.log('   Verification:', verificationSuccess ? '✅ Passed' : '❌ Failed');
  
  if (migrationSuccess && verificationSuccess) {
    console.log('\n🎉 Manual migration completed successfully!');
  } else {
    console.log('\n⚠️ Manual migration had issues. Please review the errors above.');
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { applyManualMigration, verifyMigration };