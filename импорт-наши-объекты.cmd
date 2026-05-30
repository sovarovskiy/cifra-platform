@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт «Наши объекты»

echo.
echo  Копируем PDF с рабочего стола и делаем PNG для приложения...
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/import-our-objects.mjs
if errorlevel 1 (
  echo.
  echo ОШИБКА. Положите файл на рабочий стол:
  echo   Наши объекты.pdf
  pause
  exit /b 1
)

echo.
echo [OK] public\our-objects\
echo [OK] data\our-objects.json
echo.
pause
