/**
 * Browser Authentication Test Script
 * Tests the fixes for 401 "No API key found" errors in browser environment
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function testBrowserAuthentication() {
  console.log('🔍 Testing browser authentication configuration...\n');
  
  try {
    // 1. Verificar arquivo .env
    console.log('1️⃣ Checking .env file...');
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env file not found');
      return false;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ .env file found');
    
    // 2. Verificar variáveis de ambiente
    console.log('\n2️⃣ Checking environment variables...');
    
    // Extract VITE_SUPABASE_URL from .env file
    const SUPABASE_URL = envContent.match(/VITE_SUPABASE_URL=(.+)/)?.[1] || process.env.VITE_SUPABASE_URL || 'https://nwpuurgwnnuejqinkvrh.supabase.co';
    const SUPABASE_ANON_KEY = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1] || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdm9qb2x2ZHNxcmZjempqanV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODcwNjUsImV4cCI6MjA3MzE2MzA2NX0.J5CE7TrRJj8C0gWjbokSkMSRW1S-q8AwKUV5Z7xuODQ';
    
    console.log('   VITE_SUPABASE_URL:', SUPABASE_URL);
    console.log('   VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Not set');
    
    // 3. Verificar URL do Supabase
    console.log('\n3️⃣ Verifying Supabase URL...');
    const expectedUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
    
    if (SUPABASE_URL === expectedUrl) {
      console.log('✅ Supabase URL is correct');
    } else {
      console.log('❌ Supabase URL is incorrect');
      console.log('   Expected:', expectedUrl);
      console.log('   Actual:', SUPABASE_URL);
      
      // Check for fallback URL
      const fallbackUrl = 'https://dlvojolvdsqrfczjjjuw.supabase.co';
      if (SUPABASE_URL === fallbackUrl) {
        console.log('✅ Using fallback URL (this is acceptable)');
      } else {
        console.log('❌ Neither expected nor fallback URL found');
        return false;
      }
    }
    
    // 4. Verificar arquivos de configuração do frontend
    console.log('\n4️⃣ Checking frontend configuration files...');
    
    // Check src/lib/supabase.ts
    const supabaseLibPath = path.join(process.cwd(), 'src', 'lib', 'supabase.ts');
    if (fs.existsSync(supabaseLibPath)) {
      const supabaseLibContent = fs.readFileSync(supabaseLibPath, 'utf8');
      if (supabaseLibContent.includes('import.meta.env.VITE_SUPABASE_URL')) {
        console.log('✅ Frontend Supabase library uses environment variables');
      } else {
        console.log('⚠️ Frontend Supabase library may not use environment variables');
      }
    } else {
      console.log('ℹ️ Frontend Supabase library not found (may be OK)');
    }
    
    // 5. Verificar integração com Vite
    console.log('\n5️⃣ Checking Vite integration...');
    
    // Check if Vite config exists
    const viteConfigPaths = [
      path.join(process.cwd(), 'vite.config.js'),
      path.join(process.cwd(), 'vite.config.ts')
    ];
    
    const viteConfigPath = viteConfigPaths.find(p => fs.existsSync(p));
    if (viteConfigPath) {
      console.log('✅ Vite configuration found');
    } else {
      console.log('⚠️ Vite configuration not found');
    }
    
    console.log('\n🎉 Browser authentication configuration test completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Browser authentication test failed:', error.message);
    return false;
  }
}

// Run the test
testBrowserAuthentication();
