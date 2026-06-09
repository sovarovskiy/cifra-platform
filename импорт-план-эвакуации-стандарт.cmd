@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт: план эвакуации — стандарт

echo.
echo  Копируем PDF и MP4 с рабочего стола...
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/import-pozharka-article.mjs evac-plan-standard "Почему одного стандартного плана эвакуации часто недостаточно" desktop
if errorlevel 1 (
  echo.
  echo ОШИБКА. Положите на рабочий стол:
  echo   Почему одного стандартного плана эвакуации часто недостаточно.pdf
  echo   Почему одного стандартного плана эвакуации часто недостаточно.mp4
  pause
  exit /b 1
)

echo.
echo [OK] public\pozharka\evac-plan-standard\
echo [OK] data\pozharka-evac-plan-standard.json
echo.
pause
