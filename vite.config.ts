import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ag-grid-vendor': ['ag-grid-community', 'ag-grid-react'],
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority'],
          
          // App chunks
          'auth': ['src/contexts/AuthContext.tsx', 'src/utils/auth-recovery.ts'],
          'dashboard': ['src/pages/InstrutorDashboard.tsx', 'src/pages/Dashboard.tsx'],
          'estudantes': ['src/pages/EstudantesPage.tsx', 'src/hooks/useSpreadsheetImport.ts'],
          'programas': ['src/pages/ProgramasPage.tsx', 'src/pages/Programas.tsx'],
          'designacoes': ['src/pages/DesignacoesPage.tsx', 'src/pages/Designacoes.tsx']
        }
      }
    },
    chunkSizeWarningLimit: 500,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  }
}));