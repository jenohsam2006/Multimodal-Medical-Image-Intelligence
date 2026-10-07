@echo off
title MedVision AI Launcher
echo ======================================================================
echo           Starting MedVision AI (Backend + Frontend)
echo ======================================================================
echo.
echo 1. Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "MedVision Backend (FastAPI)" cmd /k "%~dp0run_backend.bat"

echo 2. Launching Vite React Frontend on http://127.0.0.1:5173 ...
start "MedVision Frontend (React + Vite)" cmd /k "%~dp0run_frontend.bat"

echo.
echo ======================================================================
echo Both servers launched in separate windows!
echo - Web Application:  http://127.0.0.1:5173
echo - Swagger API Docs: http://127.0.0.1:8000/docs
echo ======================================================================
echo You can keep this window open or close it.
pause
