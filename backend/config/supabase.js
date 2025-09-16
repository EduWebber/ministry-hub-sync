const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// For backend, we should use service role key instead of anon key for full access
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) são obrigatórios');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };