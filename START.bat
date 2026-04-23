@echo off
echo 🚀 Launching School Management System (Full-Stack)...
echo.

:: Start Django Backend
start "Backend - Django" cmd /k "python manage.py runserver"

:: Start Vite Frontend
start "Frontend - Vite" cmd /k "npm run dev"

echo ✅ Both servers are starting...
pause
