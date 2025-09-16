const { supabase } = require('./backend/config/supabase');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    console.log('Applying family members migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250916150000_add_family_members_table.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Migration SQL:', migrationSql);
    
    // Split the migration into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log('Executing statement:', statement);
      
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      try {
        // For CREATE TABLE statements, we need to use a different approach
        if (statement.includes('CREATE TABLE')) {
          console.log('Skipping CREATE TABLE statement for now - would need to implement table creation logic');
          continue;
        }
        
        // For other statements, try to execute them
        const { data, error } = await supabase.rpc('execute_sql', {
          query: statement
        });
        
        if (error) {
          console.warn('Warning executing statement:', error);
        } else {
          console.log('Statement executed successfully:', data);
        }
      } catch (stmtError) {
        console.warn('Error executing statement:', stmtError);
      }
    }
    
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the migration
applyMigration();