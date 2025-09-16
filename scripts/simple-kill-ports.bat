@echo off
echo 🔧 Limpando portas 3000 e 8080...

REM Matar processos na porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        taskkill /PID %%a /F 2>nul
    )
)

REM Matar processos na porta 8080  
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    if not "%%a"=="0" (
        taskkill /PID %%a /F 2>nul
    )
)

echo ✅ Portas limpas!