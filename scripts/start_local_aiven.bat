@echo off
echo.
echo ========================================
echo    🚀 ASTREN LOCAL CON BASE DE DATOS AIVEN
echo ========================================
echo.
echo Este script inicia Astren localmente pero conectado
echo a la base de datos de Aiven (la misma que usas en la web).
echo.
echo 💡 PERFECTO para probar la optimización antes de subir
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

REM Configurar variables de entorno para usar Aiven
echo ✅ Configurando conexión a Aiven...
set FLASK_ENV=development
set FLASK_DEBUG=True
set PORT=5000

REM Cargar configuración de Aiven
echo ✅ Cargando configuración de Aiven...
set MYSQL_HOST=astrengpr-astrendb.l.aivencloud.com
set MYSQL_USER=avnadmin
set MYSQL_PASSWORD=YOUR_AIVEN_PASSWORD_HERE
set MYSQL_DATABASE=astrengpr
set MYSQL_PORT=18019

REM Iniciar Flask
echo.
echo 🚀 Iniciando Flask en modo desarrollo...
echo 📍 URL: http://localhost:5000
echo 🔑 Base de datos: AIVEN (producción)
echo 🌐 Puerto: 5000
echo.
echo 💡 IMPORTANTE: 
echo 💡 - Base de datos: Aiven (igual que en la web)
echo 💡 - Servidor: Local (para pruebas)
echo 💡 - Índices: Ya optimizados
echo.
echo ⚠️  Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar Flask
python app.py

pause
