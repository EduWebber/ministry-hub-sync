import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usando variáveis de ambiente com fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesStructure() {
  console.log('🔍 Verificando estrutura da tabela profiles...');
  
  try {
    // 1. Obter informações da tabela
    console.log('\n📋 Informações básicas da tabela...');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Erro ao acessar tabela profiles:', sampleError);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log('✅ Tabela profiles acessível');
      console.log('📊 Colunas disponíveis:', Object.keys(sampleData[0]));
    } else {
      console.log('⚠️ Tabela profiles vazia ou inacessível');
      return;
    }
    
    // 2. Verificar colunas essenciais
    console.log('\n🔍 Verificando colunas essenciais...');
    
    const requiredColumns = ['id', 'nome_completo', 'congregacao', 'cargo', 'role'];
    const availableColumns = Object.keys(sampleData[0]);
    
    requiredColumns.forEach(column => {
      if (availableColumns.includes(column)) {
        console.log(`✅ Coluna ${column}: Presente`);
      } else {
        console.log(`❌ Coluna ${column}: Ausente`);
      }
    });
    
    // 3. Verificar valores de cargo
    console.log('\n🏷️ Verificando valores de cargo...');
    
    const { data: cargos, error: cargosError } = await supabase
      .from('profiles')
      .select('cargo')
      .neq('cargo', null)
      .limit(10);
    
    if (cargosError) {
      console.log('⚠️ Erro ao verificar cargos:', cargosError.message);
    } else {
      const uniqueCargos = [...new Set(cargos.map(p => p.cargo))];
      console.log('📊 Cargos encontrados:', uniqueCargos.join(', '));
    }
    
    // 4. Verificar valores de role
    console.log('\n🎭 Verificando valores de role...');
    
    const { data: roles, error: rolesError } = await supabase
      .from('profiles')
      .select('role')
      .neq('role', null)
      .limit(10);
    
    if (rolesError) {
      console.log('⚠️ Erro ao verificar roles:', rolesError.message);
    } else {
      const uniqueRoles = [...new Set(roles.map(p => p.role))];
      console.log('📊 Roles encontrados:', uniqueRoles.join(', '));
    }
    
    // 5. Verificar relacionamento com auth.users
    console.log('\n🔐 Verificando relacionamento com auth.users...');
    
    // Esta verificação pode falhar se não tivermos permissões adequadas
    try {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.log('ℹ️ Não foi possível verificar contagem de perfis:', countError.message);
      } else {
        console.log(`📊 Total de perfis: ${count}`);
      }
    } catch (relationError) {
      console.log('ℹ️ Verificação de relacionamento limitada:', relationError.message);
    }
    
    console.log('\n✅ Verificação da estrutura de profiles concluída!');
    
  } catch (error) {
    console.error('❌ Erro inesperado na verificação:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  checkProfilesStructure();
}

export default checkProfilesStructure;