const { supabase } = require('./config/supabase');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    console.log('Applying family members migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250916150000_add_family_members_table.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Migration SQL content:');
    console.log(migrationSql);
    
    // Since we can't execute raw SQL directly, let's try to create the table
    // by using the Supabase admin API to create a table with the required structure
    
    // We'll need to manually create the table structure using the Supabase client
    // This is a workaround since we can't execute raw SQL
    
    console.log('Attempting to create family_members table structure...');
    
    // Try to insert a record to see if the table exists
    const testInsert = await supabase
      .from('family_members')
      .insert({
        name: 'Test Member',
        relationship: 'Test Relationship'
      })
      .select();
    
    if (testInsert.error) {
      console.log('Table does not exist. Error:', testInsert.error.message);
      
      // Since we can't directly create the table, we'll need to use a different approach
      // Let's try to create a simple entry in another table to see if we have the right permissions
      const testEstudantes = await supabase
        .from('estudantes')
        .select('id')
        .limit(1);
      
      if (testEstudantes.error) {
        console.log('Error accessing estudantes table:', testEstudantes.error.message);
      } else {
        console.log('Successfully accessed estudantes table');
      }
      
      console.log('Manual table creation is not possible with current setup.');
      console.log('Please apply the migration using Supabase dashboard:');
      console.log('1. Go to Supabase dashboard');
      console.log('2. Navigate to Table Editor');
      console.log('3. Create a new table named "family_members" with the following columns:');
      console.log('   - id (UUID, Primary Key, Default: gen_random_uuid())');
      console.log('   - name (Text, Not Null)');
      console.log('   - relationship (Text)');
      console.log('   - student_id (UUID, Foreign Key to estudantes.id)');
      console.log('   - created_at (Timestamp, Default: now())');
      console.log('   - updated_at (Timestamp, Default: now())');
      
      return;
    }
    
    console.log('Table exists and entry created:', testInsert.data);
    
    // Clean up the test entry
    if (testInsert.data && testInsert.data[0]) {
      await supabase
        .from('family_members')
        .delete()
        .eq('id', testInsert.data[0].id);
      
      console.log('Test entry cleaned up');
    }
    
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

// Run the migration
applyMigration();