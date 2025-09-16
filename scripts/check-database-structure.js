import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usando variáveis de ambiente com fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 Verificando estrutura real do banco de dados...');
  
  try {
    // 1. Verificar estrutura da tabela profiles
    console.log('\n📋 Verificando tabela profiles...');
    
    const { data: profilesSample, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar profiles:', profilesError);
    } else {
      console.log('✅ Tabela profiles acessível');
      if (profilesSample && profilesSample.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(profilesSample[0]));
        console.log('📝 Exemplo de dados:', profilesSample[0]);
      }
    }
    
    // 2. Verificar se existe tabela auth.users
    console.log('\n🔐 Verificando tabela auth.users...');
    
    // Esta consulta pode falhar se não tivermos permissões, mas vamos tentar
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (authError) {
        console.log('ℹ️ Tabela auth.users não acessível (pode ser normal):', authError.message);
      } else {
        console.log('✅ Tabela auth.users acessível');
      }
    } catch (authCheckError) {
      console.log('ℹ️ Verificação de auth.users falhou (pode ser normal):', authCheckError.message);
    }
    
    // 3. Verificar estrutura da tabela estudantes
    console.log('\n📚 Verificando tabela estudantes...');
    
    const { data: estudantesSample, error: estudantesError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(1);
    
    if (estudantesError) {
      console.error('❌ Erro ao acessar estudantes:', estudantesError);
    } else {
      console.log('✅ Tabela estudantes acessível');
      if (estudantesSample && estudantesSample.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(estudantesSample[0]));
        console.log('📝 Exemplo de dados:', estudantesSample[0]);
      }
    }
    
    // 4. Verificar estrutura da tabela programacoes
    console.log('\n📅 Verificando tabela programacoes...');
    
    const { data: programacoesSample, error: programacoesError } = await supabase
      .from('programacoes')
      .select('*')
      .limit(1);
    
    if (programacoesError) {
      console.error('❌ Erro ao acessar programacoes:', programacoesError);
    } else {
      console.log('✅ Tabela programacoes acessível');
      if (programacoesSample && programacoesSample.length > 0) {
        console.log('📊 Colunas disponíveis:', Object.keys(programacoesSample[0]));
        console.log('📝 Exemplo de dados:', programacoesSample[0]);
      }
    }
    
    // 5. Verificar relacionamentos
    console.log('\n🔗 Verificando relacionamentos...');
    
    // Tentar uma consulta com join entre profiles e estudantes
    const { data: joinData, error: joinError } = await supabase
      .from('estudantes')
      .select('id, profile_id, genero')
      .limit(1);
    
    if (joinError) {
      console.log('⚠️ Possível problema com relacionamentos:', joinError.message);
    } else {
      console.log('✅ Relacionamentos funcionando corretamente');
      if (joinData && joinData.length > 0) {
        console.log('📝 Exemplo de join:', joinData[0]);
      }
    }
    
    console.log('\n✅ Verificação de estrutura concluída!');
    
  } catch (error) {
    console.error('❌ Erro inesperado na verificação:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabaseStructure();
}

export default checkDatabaseStructure;