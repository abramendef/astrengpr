@echo off
setlocal ENABLEDELAYEDEXPANSION

rem Detect root and backend dirs
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%..\"
set "BACKEND_DIR=%ROOT_DIR%backend"

rem Choose Python interpreter (.venv in root, then backend\venv, else system)
set "PY=python"
if exist "%ROOT_DIR%.venv\Scripts\python.exe" set "PY=%ROOT_DIR%.venv\Scripts\python.exe"
if exist "%BACKEND_DIR%\venv\Scripts\python.exe" set "PY=%BACKEND_DIR%\venv\Scripts\python.exe"

cd /d "%BACKEND_DIR%"

rem Local DB env vars
set FLASK_ENV=development
set FLASK_DEBUG=True
set MYSQL_HOST=localhost
set MYSQL_USER=root
set MYSQL_PASSWORD=1234
set MYSQL_DATABASE=astren
set MYSQL_PORT=3306

echo Starting Backend (Local DB) with %PY%
"%PY%" app.py

endlocal

