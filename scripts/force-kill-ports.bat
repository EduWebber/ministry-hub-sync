@echo off
echo 🔧 Forçando finalização de processos...

REM Finalizar todos os processos Node.js primeiro
echo Finalizando processos Node.js...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM nodemon.exe /T >nul 2>&1
taskkill /F /IM npm.exe /T >nul 2>&1

REM Aguardar
timeout /t 3 >nul

REM Usar netstat para encontrar e matar processos por porta
echo Verificando e finalizando processos nas portas 3000 e 8080...

REM Porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 2^>nul') do (
    if not "%%a"=="0" (
        echo Finalizando PID %%a na porta 3000...
        taskkill /PID %%a /F /T >nul 2>&1
    )
)

REM Porta 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 2^>nul') do (
    if not "%%a"=="0" (
        echo Finalizando PID %%a na porta 8080...
        taskkill /PID %%a /F /T >nul 2>&1
    )
)

REM Limpeza final
echo Limpeza final...
taskkill /F /IM vite.exe /T >nul 2>&1
taskkill /F /IM concurrently.exe /T >nul 2>&1

echo ✅ Processos finalizados com força!
timeout /t 2 >nul