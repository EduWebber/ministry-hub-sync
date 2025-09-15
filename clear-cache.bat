@echo off
echo Limpando cache do sistema...

REM Parar processos Node.js
taskkill /F /IM node.exe 2>nul

REM Limpar cache do npm
npm cache clean --force

REM Remover node_modules e reinstalar
if exist node_modules rmdir /s /q node_modules
if exist backend\node_modules rmdir /s /q backend\node_modules

REM Reinstalar dependências
npm install
cd backend
npm install
cd ..

echo Cache limpo! Execute: npm run dev:all
pause