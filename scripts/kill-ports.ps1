Write-Host "🔧 Limpando portas 3000 e 8080..." -ForegroundColor Yellow

# Função para matar processos em uma porta específica
function Kill-ProcessOnPort {
    param([int]$Port)
    
    Write-Host "Verificando porta $Port..." -ForegroundColor Cyan
    
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        
        foreach ($pid in $processes) {
            if ($pid -and $pid -ne 0) {
                Write-Host "Matando processo PID $pid na porta $Port..." -ForegroundColor Red
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "✅ Processo $pid finalizado com sucesso" -ForegroundColor Green
                } catch {
                    Write-Host "⚠️ Não foi possível finalizar processo $pid" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        Write-Host "Nenhum processo encontrado na porta $Port" -ForegroundColor Gray
    }
}

# Matar processos Node.js primeiro
Write-Host "Finalizando processos Node.js..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "nodemon" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force

# Aguardar um pouco
Start-Sleep -Seconds 2

# Matar processos nas portas específicas
Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 8080

Write-Host "✅ Portas limpas!" -ForegroundColor Green
Start-Sleep -Seconds 1