@echo off
echo 🚀 Iniciando Astren - Servidor Local con Base de Datos en la Nube
echo ================================================================

cd backend

echo ✅ Activando entorno virtual...
call venv\Scripts\activate

echo ✅ Iniciando servidor Flask...
echo 🌐 El servidor estará disponible en: http://localhost:8000
echo 🛑 Presiona Ctrl+C para detener el servidor
echo ================================================================

python app.py

pause

