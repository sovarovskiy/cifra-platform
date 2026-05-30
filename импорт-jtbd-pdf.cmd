@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт JTBD: PDF и картинки

echo.
echo  1. Копируем PDF с рабочего стола
echo  2. Конвертируем каждую страницу в PNG для приложения
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/import-jtbd-pdfs.mjs
if errorlevel 1 (
  echo.
  echo ОШИБКА. Проверьте папку:
  echo   %%USERPROFILE%%\OneDrive\Рабочий стол\JTBD в картинках
  pause
  exit /b 1
)

echo.
echo [OK] PDF в public\jtbd\pdfs\
echo [OK] Картинки в public\jtbd\images\
echo [OK] Список страниц в data\jtbd-images.json
echo.
echo Дальше: git add -A ^&^& git commit ^&^& git push
echo.
pause
