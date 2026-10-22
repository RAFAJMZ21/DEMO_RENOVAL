@echo off
echo ============================================
echo   RENOVAL SYS - Iniciando proyecto
echo ============================================
echo.

echo [1/2] Iniciando Backend (puerto 8000)...
cd /d "%~dp0backend"
start "RENOVAL Backend" cmd /k ".\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo [2/2] Iniciando Frontend (puerto 5173)...
cd /d "%~dp0frontend"
start "RENOVAL Frontend" cmd /k "npm run dev"

echo.
echo ============================================
echo   Proyecto iniciado!
echo ============================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Swagger:  http://127.0.0.1:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Login: admin@renoval.com / admin123
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul