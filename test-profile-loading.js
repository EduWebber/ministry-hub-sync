// Script para testar o carregamento de perfil corrigido
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileLoading() {
  console.log('🔍 Testando carregamento de perfil corrigido...\n');

  try {
    // 1. Autenticar
    console.log('1️⃣ Autenticando...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: 'senha123'
    });

    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message);
      return;
    }

    console.log('✅ Autenticação OK');
    console.log('   User ID:', authData.user?.id);
    console.log('   Email:', authData.user?.email);
    console.log('   Metadata:', authData.user?.user_metadata);

    // 2. Testar carregamento de perfil (simulando o código corrigido)
    console.log('\n2️⃣ Testando carregamento de perfil...');
    
    // Método 1: Usando ID do usuário autenticado
    const userId = authData.user?.id;
    console.log('   Buscando perfil com ID:', userId);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao carregar perfil (método 1):', profileError.message);
      
      // Método 2: Tentar com user_id (se existir)
      console.log('   Tentando método alternativo com user_id...');
      const { data: altProfileData, error: altProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (altProfileError) {
        console.error('❌ Erro ao carregar perfil (método 2):', altProfileError.message);
      } else {
        console.log('✅ Perfil carregado com sucesso (método 2):', altProfileData);
      }
    } else {
      console.log('✅ Perfil carregado com sucesso (método 1):', profileData);
    }
    
    // 3. Testar carregamento de estudantes
    console.log('\n3️⃣ Testando carregamento de estudantes...');
    
    const { data: estudantesData, error: estudantesError } = await supabase
      .from('estudantes')
      .select('id, profile_id, genero, ativo, created_at')
      .eq('profile_id', userId)
      .eq('ativo', true);
    
    if (estudantesError) {
      console.error('❌ Erro ao carregar estudantes:', estudantesError.message);
    } else {
      console.log('✅ Estudantes carregados com sucesso');
      console.log('   Total de estudantes ativos:', estudantesData.length);
      if (estudantesData.length > 0) {
        console.log('   Exemplo:', estudantesData[0]);
      }
    }
    
    // 4. Fazer logout
    console.log('\n4️⃣ Fazendo logout...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
  
  console.log('\n✅ Teste de carregamento de perfil concluído!');
}

// Executar o teste
testProfileLoading();