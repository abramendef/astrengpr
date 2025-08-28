@echo off
echo.
echo ========================================
echo    🚀 INICIAR ASTREN LOCAL PARA PRUEBAS
echo ========================================
echo.
echo Este script inicia Astren localmente para probar
echo la optimización antes de subir a producción.
echo.

REM Cambiar al directorio backend
cd /d "%~dp0..\backend"

REM Verificar que existe el entorno virtual
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Error: No se encontró el entorno virtual
    echo 💡 Ejecuta primero: python -m venv venv
    echo 💡 Luego: venv\Scripts\activate
    echo 💡 Y finalmente: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Activar entorno virtual
echo ✅ Activando entorno virtual...
call "venv\Scripts\activate.bat"

REM Verificar dependencias
echo ✅ Verificando dependencias...
pip install -r requirements.txt >nul 2>&1

REM Configurar variables de entorno para pruebas locales
echo ✅ Configurando variables de entorno para pruebas...
set FLASK_ENV=development
set FLASK_DEBUG=True
set PORT=5000

REM Iniciar Flask
echo.
echo 🚀 Iniciando Flask en modo desarrollo...
echo 📍 URL: http://localhost:5000
echo 🔑 Base de datos: Aiven (producción)
echo.
echo 💡 IMPORTANTE: Este es solo para PRUEBAS
echo 💡 NO uses esta instancia para usuarios reales
echo.
echo ⚠️  Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar Flask
python app.py

pause
