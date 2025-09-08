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

rem Aiven DB env vars
set FLASK_ENV=development
set FLASK_DEBUG=True
set MYSQL_HOST=astrengpr-astrendb.l.aivencloud.com
set MYSQL_USER=avnadmin
set MYSQL_PASSWORD=YOUR_AIVEN_PASSWORD_HERE
set MYSQL_DATABASE=astrengpr
set MYSQL_PORT=18019

echo Starting Backend (Aiven DB) with %PY%
"%PY%" app.py

endlocal

