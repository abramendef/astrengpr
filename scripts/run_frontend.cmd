@echo off
setlocal ENABLEDELAYEDEXPANSION

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\"
set "FRONTEND_DIR=%ROOT_DIR%frontend"

set "PY=python"
if exist "%ROOT_DIR%.venv\Scripts\python.exe" set "PY=%ROOT_DIR%.venv\Scripts\python.exe"

cd /d "%FRONTEND_DIR%"
echo Starting Frontend on http://localhost:5500
"%PY%" -m http.server 5500

endlocal

