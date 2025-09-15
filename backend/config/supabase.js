const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração para desenvolvimento/teste
const isDevelopment = process.env.DEV_MODE === 'true' || process.env.NODE_ENV === 'development';

let supabase;

if (isDevelopment) {
  // Em desenvolvimento, usar URLs padrão para evitar erros
  console.log('⚠️  Modo de desenvolvimento ativado - usando Supabase mock');
  supabase = createClient(
    process.env.SUPABASE_URL || 'https://mock-development.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key'
  );
} else {
  // Em produção, usar URLs reais
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios em produção');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = { supabase, isDevelopment };
