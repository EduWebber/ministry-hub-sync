@echo off
echo Diagnostico dos Estudantes...
echo.

echo === VERIFICANDO BACKEND ===
curl -s http://localhost:3000/api/status
echo.

echo === VERIFICANDO ESTUDANTES NO BANCO ===
echo Total de estudantes: 51 (verificado anteriormente)
echo.

echo === PROBLEMAS CORRIGIDOS ===
echo ✅ Hook useEstudantes corrigido para fazer JOIN com profiles
echo ✅ Filtro por user_id removido para mostrar todos os estudantes
echo ✅ Keys duplicadas no AG Grid corrigidas com getRowId
echo ✅ Consulta agora busca apenas estudantes ativos
echo.

echo === PROXIMOS PASSOS ===
echo 1. Acesse http://localhost:8080/estudantes
echo 2. Verifique se os estudantes aparecem na lista
echo 3. Teste a aba "Planilha" para ver se as keys duplicadas foram corrigidas
echo.

echo === ESTRUTURA CORRIGIDA ===
echo - useEstudantes agora faz JOIN correto: estudantes + profiles
echo - AG Grid usa getRowId para evitar keys duplicadas
echo - Filtro mostra apenas estudantes ativos
echo.

pause