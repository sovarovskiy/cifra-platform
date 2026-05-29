@echo off
cd /d "%~dp0"
title Cifra Platform
echo.
echo  Аналитическая платформа Цифра
echo  http://localhost:3002
echo.
if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo ERROR: npm install failed
    pause
    exit /b 1
  )
)
call npm.cmd run dev
pause
