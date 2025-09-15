@echo off
echo Limpando cache e reiniciando sistema...

echo 1. Parando processos...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul

echo 2. Limpando cache do npm...
npm cache clean --force

echo 3. Removendo node_modules...
if exist node_modules rmdir /s /q node_modules
if exist backend\node_modules rmdir /s /q backend\node_modules

echo 4. Limpando cache do Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite

echo 5. Reinstalando dependencias...
npm install

echo 6. Instalando dependencias do backend...
cd backend
npm install
cd ..

echo 7. Iniciando sistema limpo...
npm run dev:all

pause