@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт: пожарные документы после ремонта

echo.
echo  Копируем PDF и MP4 с рабочего стола...
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/import-pozharka-article.mjs fire-docs-after-repair "Как обновлять пожарные документы в организации после ремонта" desktop
if errorlevel 1 (
  echo.
  echo ОШИБКА. Положите на рабочий стол:
  echo   Как обновлять пожарные документы в организации после ремонта.pdf
  echo   Как обновлять пожарные документы в организации после ремонта.mp4
  pause
  exit /b 1
)

echo.
echo [OK] public\pozharka\fire-docs-after-repair\
echo [OK] data\pozharka-fire-docs-after-repair.json
echo [OK] data\pozharka-fire-docs-after-repair-article.json
echo.
echo  Закоммитьте файлы в git, затем задеплойте.
echo.
pause
