@echo off
echo 🔧 Limpando portas em uso...

REM Função para matar processos em uma porta específica
setlocal enabledelayedexpansion

REM Matar todos os processos Node.js e Vite primeiro
echo Finalizando processos Node.js e Vite...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM nodemon.exe >nul 2>&1

REM Aguardar um pouco para os processos finalizarem
timeout /t 2 >nul

REM Porta 3000 (Backend)
echo Verificando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    if not "%%a"=="0" (
        echo Matando processo %%a na porta 3000...
        taskkill /PID %%a /F /T >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Processo %%a finalizado com sucesso
        ) else (
            echo ⚠️ Tentando finalizar processo %%a com wmic...
            wmic process where ProcessId=%%a delete >nul 2>&1
        )
    )
)

REM Porta 8080 (Frontend)
echo Verificando porta 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING 2^>nul') do (
    if not "%%a"=="0" (
        echo Matando processo %%a na porta 8080...
        taskkill /PID %%a /F /T >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Processo %%a finalizado com sucesso
        ) else (
            echo ⚠️ Tentando finalizar processo %%a com wmic...
            wmic process where ProcessId=%%a delete >nul 2>&1
        )
    )
)

REM Limpeza final de processos órfãos
echo Limpeza final...
taskkill /F /IM "vite.exe" >nul 2>&1
taskkill /F /IM "npm.exe" >nul 2>&1

echo ✅ Portas limpas!
timeout /t 1 >nul