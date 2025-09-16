import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usando variáveis de ambiente com fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEstudantesData() {
  console.log('🔍 Verificando dados da tabela estudantes...');
  
  try {
    // 1. Contar total de estudantes
    const { count: totalEstudantes, error: countError } = await supabase
      .from('estudantes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar estudantes:', countError);
      return;
    }
    
    console.log(`📊 Total de estudantes: ${totalEstudantes}`);
    
    // 2. Verificar estudantes ativos
    const { count: activeEstudantes, error: activeError } = await supabase
      .from('estudantes')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);
    
    if (activeError) {
      console.error('❌ Erro ao contar estudantes ativos:', activeError);
      return;
    }
    
    console.log(`✅ Estudantes ativos: ${activeEstudantes}`);
    
    // 3. Verificar estrutura de dados
    const { data: sampleData, error: sampleError } = await supabase
      .from('estudantes')
      .select('*')
      .limit(3);
    
    if (sampleError) {
      console.error('❌ Erro ao obter amostra de dados:', sampleError);
      return;
    }
    
    console.log('\n📝 Amostra de dados:');
    sampleData.forEach((estudante, index) => {
      console.log(`  ${index + 1}. ID: ${estudante.id}, Gênero: ${estudante.genero}, Ativo: ${estudante.ativo}`);
    });
    
    // 4. Verificar relacionamentos
    console.log('\n🔗 Verificando relacionamentos...');
    
    const { data: relacionamentos, error: relError } = await supabase
      .from('estudantes')
      .select('id, profile_id, genero, perfil:profiles(nome_completo)')
      .limit(3);
    
    if (relError) {
      console.log('⚠️ Erro ao verificar relacionamentos:', relError.message);
    } else {
      console.log('✅ Relacionamentos funcionando:');
      relacionamentos.forEach(rel => {
        console.log(`  - ${rel.id}: ${rel.perfil?.nome_completo || 'Sem perfil'} (${rel.genero})`);
      });
    }
    
    console.log('\n✅ Verificação de estudantes concluída!');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  checkEstudantesData();
}

export default checkEstudantesData;