@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Импорт PDF для JTBD

echo.
echo  Копирование PDF из папки «JTBD в картинках» на рабочий стол...
echo.

node scripts/import-jtbd-pdfs.mjs
if errorlevel 1 (
  echo.
  echo ОШИБКА. Проверьте, что папка существует:
  echo   %%USERPROFILE%%\OneDrive\Рабочий стол\JTBD в картинках
  pause
  exit /b 1
)

echo.
echo [OK] PDF скопированы в public\jtbd\pdfs\
echo Теперь можно деплоить на Vercel.
echo.
pause
