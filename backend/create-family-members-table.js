const { supabase } = require('./config/supabase');

async function createFamilyMembersTable() {
  try {
    console.log('Creating family_members table...');
    
    // Since we can't execute raw SQL directly, we'll try to create the table structure
    // by inserting and then deleting a test record
    
    // First, let's try to insert a record (this will fail if table doesn't exist)
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        name: 'Test Member',
        relationship: 'Test Relationship'
      })
      .select();
    
    if (error) {
      console.log('Table does not exist. Error:', error.message);
      
      // Since we can't create the table directly with the Supabase client,
      // we'll need to use the migration approach or Supabase dashboard
      console.log('Please apply the migration using Supabase dashboard or CLI');
      console.log('Migration file: supabase/migrations/20250916150000_add_family_members_table.sql');
      
      return;
    }
    
    console.log('Table exists and entry created:', data);
    
    // Clean up the test entry
    if (data && data[0]) {
      await supabase
        .from('family_members')
        .delete()
        .eq('id', data[0].id);
      
      console.log('Test entry cleaned up');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createFamilyMembersTable();