# Force Kill Ports - PowerShell Script
Write-Host "🔧 Forçando finalização de processos nas portas 3000 e 8080..." -ForegroundColor Yellow

# Função para matar processos por porta
function Kill-ProcessByPort {
    param([int]$Port)
    
    Write-Host "Verificando porta $Port..." -ForegroundColor Cyan
    
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        
        if ($processes) {
            foreach ($pid in $processes) {
                if ($pid -and $pid -ne 0) {
                    Write-Host "Finalizando processo PID $pid na porta $Port..." -ForegroundColor Yellow
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-Host "✅ Processo $pid finalizado com sucesso" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "⚠️ Erro ao finalizar processo $pid: $($_.Exception.Message)" -ForegroundColor Red
                    }
                }
            }
        } else {
            Write-Host "✅ Nenhum processo encontrado na porta $Port" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️ Erro ao verificar porta $Port: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Finalizar processos Node.js e relacionados primeiro
Write-Host "Finalizando processos Node.js..." -ForegroundColor Cyan
Get-Process -Name "node", "nodemon", "npm" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Finalizando $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

# Aguardar um pouco
Start-Sleep -Seconds 2

# Matar processos específicos por porta
Kill-ProcessByPort -Port 3000
Kill-ProcessByPort -Port 8080

# Limpeza final
Write-Host "Limpeza final de processos órfãos..." -ForegroundColor Cyan
Get-Process -Name "vite", "concurrently" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Finalizando $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Yellow
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Limpeza de portas concluída!" -ForegroundColor Green
Start-Sleep -Seconds 1