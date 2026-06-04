@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт: обучение на нескольких объектах

echo.
echo  Копируем PDF и MP4 (рабочий стол или папка «База данных»)...
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/import-pozharka-article.mjs multi-objects-training "Как выстроить систему обучения для нескольких объектов" bazadata
if errorlevel 1 (
  node scripts/import-pozharka-article.mjs multi-objects-training "Как выстроить систему обучения для нескольких объектов" desktop
)
if errorlevel 1 (
  echo.
  echo ОШИБКА. Положите файлы на рабочий стол или в «База данных»:
  echo   Как выстроить систему обучения для нескольких объектов.pdf
  echo   Как выстроить систему обучения для нескольких объектов.mp4
  pause
  exit /b 1
)

echo.
echo [OK] public\pozharka\multi-objects-training\
echo [OK] data\pozharka-multi-objects-training.json
echo.
echo  Закоммитьте файлы в git, затем задеплойте.
echo.
pause
