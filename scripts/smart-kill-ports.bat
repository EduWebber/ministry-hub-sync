@echo off
echo 🔧 Limpando portas específicas (3000 e 8080)...

setlocal enabledelayedexpansion

REM Obter PID do processo atual para não matá-lo
set CURRENT_PID=%1
if "%CURRENT_PID%"=="" set CURRENT_PID=0

REM Porta 3000 (Backend)
echo Verificando porta 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING 2^>nul') do (
    if not "%%a"=="0" if not "%%a"=="%CURRENT_PID%" (
        echo Matando processo %%a na porta 3000...
        taskkill /PID %%a /F /T >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Processo %%a finalizado com sucesso
        )
    )
)

REM Porta 8080 (Frontend)
echo Verificando porta 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING 2^>nul') do (
    if not "%%a"=="0" if not "%%a"=="%CURRENT_PID%" (
        echo Matando processo %%a na porta 8080...
        taskkill /PID %%a /F /T >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Processo %%a finalizado com sucesso
        )
    )
)

REM Limpeza específica de processos órfãos (não o npm atual)
echo Limpeza de processos órfãos...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq vite.exe" /FO CSV /NH 2^>nul') do (
    set PID=%%a
    set PID=!PID:"=!
    if not "!PID!"=="%CURRENT_PID%" (
        taskkill /PID !PID! /F >nul 2>&1
    )
)

echo ✅ Portas limpas com segurança!
timeout /t 1 >nul