// Script para testar dados reais do Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealData() {
  console.log('🔍 Testando dados reais do Supabase...\n');

  try {
    // 1. Testar conexão básica
    console.log('1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return;
    }
    console.log('✅ Conexão OK\n');

    // 2. Verificar tabelas existentes
    console.log('2️⃣ Verificando dados nas tabelas...');
    
    // Profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    console.log('📊 Profiles encontrados:', profiles?.length || 0);
    if (profiles?.length > 0) {
      console.log('   Exemplo:', profiles[0]);
    }
    if (profilesError) console.log('   Erro:', profilesError.message);
    
    // Estudantes
    const { data: estudantes, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(5);
    
    console.log('\n📚 Estudantes encontrados:', estudantes?.length || 0);
    if (estudantes?.length > 0) {
      console.log('   Exemplo:', estudantes[0]);
    }
    if (estudantesError) console.log('   Erro:', estudantesError.message);
    
    // Programações
    const { data: programacoes, error: programacoesError } = await supabase
      .from('programacoes')
      .select('*')
      .limit(5);
    
    console.log('\n📅 Programações encontradas:', programacoes?.length || 0);
    if (programacoes?.length > 0) {
      console.log('   Exemplo:', programacoes[0]);
    }
    if (programacoesError) console.log('   Erro:', programacoesError.message);
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o teste
testRealData();

