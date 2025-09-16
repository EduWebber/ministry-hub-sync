import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase - usando variáveis de ambiente com fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyAdminDashboardMigration() {
  console.log('🚀 Aplicando migração do AdminDashboard...');
  
  try {
    // 1. Verificar se as tabelas existem
    console.log('🔍 Verificando estrutura das tabelas...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar tabela profiles:', profilesError);
      return;
    }
    
    console.log('✅ Tabela profiles acessível');
    
    // 2. Verificar se há usuários admin
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'admin');
    
    if (adminError) {
      console.error('❌ Erro ao buscar usuários admin:', adminError);
      return;
    }
    
    console.log(`✅ Encontrados ${adminUsers.length} usuários admin`);
    
    // 3. Se não houver admins, criar um usuário admin padrão
    if (adminUsers.length === 0) {
      console.log('⚠️ Nenhum usuário admin encontrado. Criando usuário admin padrão...');
      
      // Primeiro, verificar se o usuário admin existe na auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.getUserByEmail('amazonwebber007@gmail.com');
      
      if (authError && authError.message !== 'User not found') {
        console.error('❌ Erro ao verificar usuário admin na auth:', authError);
        return;
      }
      
      if (authUsers?.user) {
        // Usuário existe na auth, atualizar perfil para admin
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', authUsers.user.id)
          .select();
        
        if (updateError) {
          console.error('❌ Erro ao atualizar perfil para admin:', updateError);
          return;
        }
        
        console.log('✅ Usuário admin criado/atualizado:', updatedProfile[0]);
      } else {
        console.log('ℹ️ Usuário admin não encontrado na auth. Por favor, crie o usuário primeiro.');
      }
    } else {
      console.log('✅ Usuários admin já configurados');
    }
    
    console.log('✅ Migração do AdminDashboard concluída com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na migração do AdminDashboard:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  applyAdminDashboardMigration().then(() => {
    console.log('🏁 Processo de migração finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Erro fatal na migração:', error);
    process.exit(1);
  });
}

export default applyAdminDashboardMigration;