// Test script to verify frontend Supabase configuration
console.log('🔍 Testing frontend Supabase configuration...');

// Test if environment variables are accessible
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// Check if the URL is correctly formatted
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (supabaseUrl) {
  if (supabaseUrl.endsWith('.supabase.co')) {
    console.log('✅ Supabase URL is correctly formatted');
  } else if (supabaseUrl.endsWith('.supabase.com')) {
    console.log('❌ Supabase URL has incorrect domain (.com instead of .co)');
  } else {
    console.log('⚠️ Supabase URL has unexpected format');
  }
  
  // Test URL resolution
  console.log('Testing URL resolution...');
  fetch(supabaseUrl, { method: 'HEAD' })
    .then(response => {
      console.log('✅ URL resolves successfully:', response.status);
    })
    .catch(error => {
      console.log('❌ URL resolution failed:', error.message);
    });
} else {
  console.log('❌ VITE_SUPABASE_URL is not defined');
}

// Test Supabase client creation
try {
  import('./src/lib/supabase.ts').then(({ supabase }) => {
    console.log('✅ Supabase client created successfully');
    
    // Test a simple query
    supabase.from('profiles').select('count').limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.log('❌ Supabase query failed:', error.message);
        } else {
          console.log('✅ Supabase query successful');
        }
      })
      .catch(error => {
        console.log('❌ Supabase query error:', error.message);
      });
  });
} catch (error) {
  console.log('❌ Failed to create Supabase client:', error.message);
}