@echo off
REM Script para iniciar Astren Backend y Frontend en ventanas separadas

REM Iniciar Backend (Python 3.13)
start "Astren Backend" cmd /k "cd backend && py -3.13 main_app.py"

REM Iniciar Frontend (HTTP Server)
start "Astren Frontend" cmd /k "cd frontend && python -m http.server 5500"

REM Mensaje final
echo.
echo =============================================
echo  Servidores de Astren iniciados correctamente
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5500
echo =============================================
pause 