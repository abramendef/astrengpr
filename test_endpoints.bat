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
    echo 💡 Inicia el backend primero con: start_astren_nube.bat
    echo.
    echo ¿Quieres iniciar el backend ahora? (S/N)
    set /p choice=
    if /i "%choice%"=="S" (
        echo 🚀 Iniciando backend...
        start_astren_nube.bat
        echo ⏳ Esperando 10 segundos para que el backend se inicie...
        timeout /t 10 /nobreak >nul
    ) else (
        pause
        exit /b 1
    )
)

echo ✅ Backend detectado en localhost:8000
echo.

REM Ejecutar script de prueba
echo 🧪 Ejecutando pruebas de endpoints...
python scripts\test_endpoints_simple.py

echo.
echo 💡 Para probar también en producción, ejecuta:
echo    python scripts\test_endpoints.py
echo.
pause


