@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт ОГЗ на главную

echo.
echo  Копируем ОГЗ.pdf с рабочего стола и делаем PNG для главной страницы...
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/import-home-ogz.mjs
if errorlevel 1 (
  echo.
  echo ОШИБКА. Положите файл на рабочий стол:
  echo   ОГЗ.pdf
  pause
  exit /b 1
)

echo.
echo [OK] public\home-ogz\
echo [OK] data\home-ogz.json
echo.
echo  Закоммитьте PNG и PDF в git, затем задеплойте.
echo.
pause
