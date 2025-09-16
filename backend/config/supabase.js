const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' }); // Load from backend .env file

// For backend, we should use service role key instead of anon key for full access
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) são obrigatórios');
}

console.log('Supabase config:', { supabaseUrl, supabaseKey: supabaseKey.substring(0, 10) + '...' });

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };