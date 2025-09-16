@echo off
echo 🚀 Iniciando Sistema Ministerial (Limpeza + Start)

REM Limpar portas primeiro
echo 🔧 Limpando processos anteriores...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM nodemon.exe >nul 2>&1

REM Aguardar um pouco
timeout /t 2 >nul

REM Verificar se as portas estão livres
echo 🔍 Verificando portas...
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo ⚠️ Porta 3000 ainda em uso
) else (
    echo ✅ Porta 3000 livre
)

netstat -ano | findstr :8080 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo ⚠️ Porta 8080 ainda em uso
) else (
    echo ✅ Porta 8080 livre
)

REM Iniciar sistema
echo 🎯 Iniciando sistema...
npm run dev:all