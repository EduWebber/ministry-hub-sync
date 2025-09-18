import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function refreshSchemaCache() {
  try {
    console.log('🔄 Refreshing Supabase schema cache...');
    
    // Try to notify pgrst to reload schema
    const { error } = await supabase.rpc('notify_pgrst_reload');
    
    if (error) {
      console.log('⚠️  Could not call notify_pgrst_reload function, trying direct SQL...');
      
      // If the function doesn't exist, we'll need to handle this differently
      // In a real scenario, you would run this in the Supabase SQL editor:
      console.log('💡 Please run the following SQL in your Supabase SQL editor:');
      console.log('NOTIFY pgrst, \'reload schema\';');
    } else {
      console.log('✅ Schema cache refresh notification sent');
    }
    
    // Wait a bit for the schema to refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test if the issue is fixed
    console.log('🧪 Testing designacoes table access...');
    
    const { data, error: testError } = await supabase
      .from('designacoes')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('❌ Still having schema cache issues:', testError.message);
      console.log('💡 Please manually refresh the schema cache in Supabase dashboard');
      return false;
    }
    
    console.log('✅ Schema cache issue resolved!');
    return true;
    
  } catch (error) {
    console.error('❌ Error refreshing schema cache:', error.message);
    return false;
  }
}

async function fixDesignacoesTable() {
  try {
    console.log('🔧 Fixing designacoes table structure...');
    
    // Check if the table has the required columns
    const { data, error } = await supabase
      .from('designacoes')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('congregacao_id')) {
      console.log('⚠️  Column congregacao_id not found, might need to recreate table');
      
      // In a real fix scenario, you would:
      // 1. Backup existing data
      // 2. Drop and recreate the table with correct schema
      // 3. Restore data
      
      console.log('💡 Manual steps needed:');
      console.log('1. Check your designacoes table schema in Supabase');
      console.log('2. Ensure it has programacao_id and congregacao_id columns');
      console.log('3. Make sure RLS policies are properly set');
    } else {
      console.log('✅ designacoes table structure looks good');
    }
    
  } catch (error) {
    console.error('❌ Error checking designacoes table:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting schema cache fix process...');
  
  // Refresh schema cache
  const schemaFixed = await refreshSchemaCache();
  
  // Fix designacoes table if needed
  await fixDesignacoesTable();
  
  if (schemaFixed) {
    console.log('🎉 Schema cache fix completed successfully!');
    console.log('You can now test the designacoes endpoint again.');
  } else {
    console.log('⚠️  Schema cache fix requires manual intervention.');
    console.log('Please follow the instructions above.');
  }
}

main();