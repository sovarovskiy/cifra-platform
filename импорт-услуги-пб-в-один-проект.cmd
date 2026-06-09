@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт: услуги ПБ в один проект

echo.
echo  Копируем PDF и MP4 с рабочего стола...
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/import-pozharka-article.mjs fire-services-bundle "Как собрать несколько услуг пожарной безопасности в один проект" desktop
if errorlevel 1 (
  echo.
  echo ОШИБКА. Положите на рабочий стол:
  echo   Как собрать несколько услуг пожарной безопасности в один проект.pdf
  echo   Как собрать несколько услуг пожарной безопасности в один проект.mp4
  pause
  exit /b 1
)

echo.
echo [OK] public\pozharka\fire-services-bundle\
echo [OK] data\pozharka-fire-services-bundle.json
echo.
echo  Закоммитьте файлы в git, затем задеплойте.
echo.
pause
