@echo off
echo Verificando consistencia do layout nas paginas principais...
echo.

echo === PAGINAS PRINCIPAIS ===
echo /bem-vindo - BemVindo.tsx
findstr /n "SidebarLayout" src\pages\BemVindo.tsx
echo.

echo /dashboard - InstrutorDashboard.tsx  
findstr /n "SidebarLayout" src\pages\InstrutorDashboard.tsx
echo.

echo /estudantes - EstudantesPage.tsx
findstr /n "SidebarLayout" src\pages\EstudantesPage.tsx
echo.

echo /programas - ProgramasPage.tsx
findstr /n "SidebarLayout" src\pages\ProgramasPage.tsx
echo.

echo /designacoes - DesignacoesPage.tsx
findstr /n "SidebarLayout" src\pages\DesignacoesPage.tsx
echo.

echo /relatorios - RelatoriosPage.tsx
findstr /n "SidebarLayout" src\pages\RelatoriosPage.tsx
echo.

echo === VERIFICANDO LAYOUT UNIFICADO ===
if exist src\components\layout\UnifiedLayout.tsx (
    echo ✅ UnifiedLayout.tsx existe
) else (
    echo ❌ UnifiedLayout.tsx NAO encontrado
)

if exist src\components\layout\SidebarLayout.tsx (
    echo ✅ SidebarLayout.tsx existe
) else (
    echo ❌ SidebarLayout.tsx NAO encontrado
)

echo.
echo === ROTAS NO APP.TSX ===
findstr /n "bem-vindo\|dashboard\|estudantes\|programas\|designacoes\|relatorios" src\App.tsx

pause