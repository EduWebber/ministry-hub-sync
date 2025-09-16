@echo off
echo Reiniciando desenvolvimento com cache limpo...

REM Parar todos os processos Node
taskkill /F /IM node.exe 2>nul

REM Backup e substituir vite.config.ts
if exist vite.config.ts.backup del vite.config.ts.backup
if exist vite.config.ts ren vite.config.ts vite.config.ts.backup
if exist vite.config.ts.new ren vite.config.ts.new vite.config.ts

REM Limpar cache do navegador (instruções)
echo.
echo ========================================
echo IMPORTANTE: No navegador, pressione:
echo Ctrl + Shift + R (Hard Reload)
echo ou
echo F12 > Network > Disable Cache
echo ========================================
echo.

REM Iniciar desenvolvimento
echo Iniciando servidores...
npm run dev:all

pause