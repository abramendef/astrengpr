@echo off
echo.
echo ========================================
echo    🧪 PRUEBA COMPLETA DE ENDPOINTS
echo ========================================
echo.

REM Iniciar backend en segundo plano
echo 🚀 Iniciando backend en segundo plano...
start "Astren Backend" cmd /k "cd backend && python app.py"

REM Esperar a que el backend se inicie
echo ⏳ Esperando 8 segundos para que el backend se inicie...
timeout /t 8 /nobreak >nul

REM Probar endpoints
echo.
echo 🧪 Probando endpoints...
echo.

echo 1️⃣ Probando /debug/health:
curl -s http://localhost:8000/debug/health
echo.
echo.

echo 2️⃣ Probando GET /usuarios:
curl -s http://localhost:8000/usuarios
echo.
echo.

echo ✅ Pruebas completadas
echo.
echo 💡 El backend sigue corriendo en la ventana "Astren Backend"
echo 💡 Puedes cerrar esa ventana cuando termines de probar
echo.
pause


