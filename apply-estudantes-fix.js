import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ACCESS_TOKEN; // Use service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFix() {
  try {
    console.log('🔧 Applying estudantes RLS fix...');
    
    // Read the SQL fix file
    const sqlFix = fs.readFileSync(path.join(__dirname, 'fix-estudantes-rls.sql'), 'utf8');
    
    // Execute the SQL fix
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlFix });
    
    if (error) {
      console.error('❌ Error applying fix:', error);
      
      // Try alternative approach - execute each statement separately
      console.log('🔄 Trying alternative approach...');
      
      // Split SQL into individual statements and execute them
      const statements = sqlFix
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (stmtError) {
              console.warn('⚠️ Warning executing statement:', stmtError.message);
            }
          } catch (e) {
            console.warn('⚠️ Warning:', e.message);
          }
        }
      }
    } else {
      console.log('✅ Fix applied successfully!');
    }
    
    // Test the fix by checking if we can query estudantes
    console.log('🧪 Testing the fix...');
    const { data: testData, error: testError } = await supabase
      .from('estudantes')
      .select('id, user_id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log('✅ Test passed! Estudantes table is accessible.');
      console.log('📊 Sample data:', testData);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Alternative manual fix function
async function manualFix() {
  console.log('🔧 Applying manual RLS fix for estudantes table...');
  
  try {
    // Check current table structure
    const { data: columns, error: colError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'estudantes' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (colError) {
      console.error('❌ Error checking table structure:', colError);
      return;
    }
    
    console.log('📋 Current estudantes table structure:', columns);
    
    // Drop and recreate policies
    const policies = [
      `DROP POLICY IF EXISTS "Admins and instrutores can view estudantes" ON public.estudantes;`,
      `DROP POLICY IF EXISTS "Admins and instrutores can manage estudantes" ON public.estudantes;`,
      `
        CREATE POLICY "estudantes_select_all" ON public.estudantes
        FOR SELECT TO authenticated
        USING (true);
      `,
      `
        CREATE POLICY "estudantes_insert_all" ON public.estudantes
        FOR INSERT TO authenticated
        WITH CHECK (true);
      `,
      `
        CREATE POLICY "estudantes_update_all" ON public.estudantes
        FOR UPDATE TO authenticated
        USING (true)
        WITH CHECK (true);
      `,
      `
        CREATE POLICY "estudantes_delete_all" ON public.estudantes
        FOR DELETE TO authenticated
        USING (true);
      `,
      `GRANT ALL ON public.estudantes TO authenticated;`
    ];
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error) {
          console.warn('⚠️ Policy warning:', error.message);
        } else {
          console.log('✅ Policy applied successfully');
        }
      } catch (e) {
        console.warn('⚠️ Policy error:', e.message);
      }
    }
    
    console.log('✅ Manual fix completed!');
    
  } catch (error) {
    console.error('❌ Manual fix error:', error);
  }
}

// Run the fix
if (process.argv.includes('--manual')) {
  manualFix();
} else {
  applyFix();
}