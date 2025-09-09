@echo off
echo 🚀 Iniciando Astren - Servidor Local con Base de Datos en la Nube
echo ================================================================

cd backend

echo ✅ Activando entorno virtual...
call venv\Scripts\activate

echo ✅ Verificando conexión a base de datos...
python test_connection.py

echo ✅ Iniciando servidor Flask...
echo 🌐 El servidor estará disponible en: http://localhost:5000
echo 🛑 Presiona Ctrl+C para detener el servidor
echo ================================================================

python app.py

pause

