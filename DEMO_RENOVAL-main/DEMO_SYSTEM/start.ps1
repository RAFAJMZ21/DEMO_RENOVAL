# RENOVAL SYS - Iniciador automático
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   RENOVAL SYS - Iniciando proyecto" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

Write-Host "[1/2] Iniciando Backend (puerto 8000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$backendPath`" && .\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000" -WindowStyle Normal

Write-Host "[2/2] Iniciando Frontend (puerto 5173)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$frontendPath`" && npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Proyecto iniciado!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "Swagger:  http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login: admin@renoval.com / admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")