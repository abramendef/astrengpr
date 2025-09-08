@echo off
echo.
echo ========================================
echo    🧪 PRUEBA DE ENDPOINTS - ASTREN
echo ========================================
echo.

REM Verificar que el backend esté corriendo
echo 🔍 Verificando si el backend está corriendo...
curl -s http://localhost:8000/ >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: El backend no está corriendo en localhost:8000
    echo 💡 Inicia el backend primero con: start_astren.bat o start_astren_nube.bat
    pause
    exit /b 1
)

echo ✅ Backend detectado en localhost:8000
echo.

REM Ejecutar script de prueba
echo 🧪 Ejecutando pruebas de endpoints...
python scripts\test_local_endpoints.py

echo.
echo 💡 Para probar también en producción, ejecuta:
echo    python scripts\test_endpoints.py
echo.
pause


