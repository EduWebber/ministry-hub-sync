import React, { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext"; 
import { TutorialProvider } from "@/contexts/TutorialContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProgramProvider } from "@/contexts/ProgramContext";
import { TutorialOverlay } from "@/components/tutorial";

// Eager load critical components
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRecoveryButton from "./components/AuthRecoveryButton";
import { Button } from "@/components/ui/button";

// Lazy load heavy components
const InstrutorDashboard = lazy(() => import("./pages/InstrutorDashboard"));
const EstudantesPage = lazy(() => import("./pages/EstudantesPage"));
const ProgramasPage = lazy(() => import("./pages/ProgramasPage"));
const DesignacoesPage = lazy(() => import("./pages/DesignacoesPage"));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage"));
const RelatoriosPage = lazy(() => import("./pages/RelatoriosPage"));
const UnifiedDashboard = lazy(() => import("./components/UnifiedDashboard"));

// Lazy load secondary pages
const Demo = lazy(() => import("./pages/Demo"));
const Funcionalidades = lazy(() => import("./pages/Funcionalidades"));
const Congregacoes = lazy(() => import("./pages/Congregacoes"));
const Suporte = lazy(() => import("./pages/Suporte"));
const Sobre = lazy(() => import("./pages/Sobre"));
const Doar = lazy(() => import("./pages/Doar"));
const BemVindo = lazy(() => import("./pages/BemVindo"));
const ConfiguracaoInicial = lazy(() => import("./pages/ConfiguracaoInicial"));
const PrimeiroPrograma = lazy(() => import("./pages/PrimeiroPrograma"));
const Reunioes = lazy(() => import("./pages/Reunioes"));
const OfflineTestPage = lazy(() => import("./pages/Demo")); // Placeholder

// Dev-only lazy loads
const ProgramasTest = lazy(() => import("./pages/ProgramasTest"));
const DensityToggleTestPage = lazy(() => import("./pages/DensityToggleTest"));
const ZoomResponsivenessTestPage = lazy(() => import("./pages/ZoomResponsivenessTest"));

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Conditional debug tools loading - only in development
if (import.meta.env.DEV && import.meta.env.VITE_LOG_LEVEL !== 'error') {
  console.log('🔧 Loading debug tools for development environment...');
  
  // Load debug tools asynchronously to avoid blocking startup
  Promise.all([
    import("@/utils/forceLogout"),
    import("@/utils/supabaseHealthCheck"),
    import("@/utils/logoutDiagnostics"),
    import("@/utils/emergencyLogout"),
    import("@/utils/familyMemberDebug"),
    import("@/utils/quickSync")
  ]).then(() => {
    console.log('✅ Debug tools loaded successfully');
  }).catch(error => {
    console.warn('⚠️ Some debug tools failed to load:', error);
  });
}

// Floating navigation between key instructor pages
const FlowNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const steps = ["/dashboard", "/estudantes", "/programas", "/designacoes"] as const;
  const labels: Record<string, string> = {
    "/dashboard": "Estudantes",
    "/estudantes": "Programas",
    "/programas": "Designações",
  };

  const idx = steps.indexOf(location.pathname as typeof steps[number]);
  if (idx === -1 || idx === steps.length - 1) return null;

  const nextPath = steps[idx + 1];
  const nextLabel = labels[location.pathname] || "Próximo";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button size="lg" className="shadow-lg" onClick={() => navigate(nextPath)}>
        Continuar para {nextLabel}
      </Button>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ProgramProvider>
            <TutorialProvider>
            <TooltipProvider>
              <Sonner />
              <TutorialOverlay />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/funcionalidades" element={<Funcionalidades />} />
                    <Route path="/congregacoes" element={<Congregacoes />} />
                    <Route path="/suporte" element={<Suporte />} />
                    <Route path="/sobre" element={<Sobre />} />
                    <Route path="/doar" element={<Doar />} />

                    {/* Onboarding Routes */}
                    <Route
                      path="/bem-vindo"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <BemVindo />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/configuracao-inicial"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <ConfiguracaoInicial />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/primeiro-programa"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <PrimeiroPrograma />
                        </ProtectedRoute>
                      }
                    />

                    {/* Debug Routes - Only in development */}
                    {import.meta.env.DEV && (
                      <>
                        <Route path="/density-toggle-test" element={<DensityToggleTestPage />} />
                        <Route path="/zoom-responsiveness-test" element={<ZoomResponsivenessTestPage />} />
                        <Route path="/offline-test" element={<OfflineTestPage />} />
                        <Route
                          path="/programas-test"
                          element={
                            <ProtectedRoute allowedRoles={['instrutor']}>
                              <ProgramasTest />
                            </ProtectedRoute>
                          }
                        />
                      </>
                    )}

                    {/* Dashboard Principal */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <InstrutorDashboard />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Instrutor Routes */}
                    <Route
                      path="/estudantes"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <EstudantesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/programas"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <ProgramasPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/designacoes"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <DesignacoesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/assignments"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <AssignmentsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/relatorios"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <RelatoriosPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reunioes"
                      element={
                        <ProtectedRoute allowedRoles={['instrutor']}>
                          <Reunioes />
                        </ProtectedRoute>
                      }
                    />

                    {/* Estudante Routes */}
                    <Route
                      path="/estudante/:id"
                      element={
                        <ProtectedRoute allowedRoles={['estudante']}>
                          <UnifiedDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/estudante/:id/familia"
                      element={
                        <ProtectedRoute allowedRoles={['estudante', 'instrutor']}>
                          <FamiliaPage />
                        </ProtectedRoute>
                      }
                    />

                    {/* Removed problematic routes */}

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <FlowNav />
              </BrowserRouter>
            </TooltipProvider>

            {/* Auth Recovery Button */}
            <div className="fixed top-4 right-4 z-50">
              <AuthRecoveryButton />
            </div>

            </TutorialProvider>
          </ProgramProvider>
        </OnboardingProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;