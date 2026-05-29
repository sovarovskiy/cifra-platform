@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Запасной способ - GitHub вручную

echo.
echo ========================================
echo   ЗАПАСНОЙ СПОСОБ: GitHub через браузер
echo ========================================
echo.
echo СНАЧАЛА в браузере:
echo.
echo   1. Откройте https://github.com/new
echo   2. Repository name: cifra-platform
echo   3. Public
echo   4. НЕ ставьте галочки README, .gitignore, license
echo   5. Create repository
echo.
pause

set /p GH_USER="Введите ваш логин GitHub (из github.com/ЛОГИН): "

echo.
echo Отправляем код...

git remote remove origin 2>nul
git remote add origin https://github.com/%GH_USER%/cifra-platform.git

git branch -M main
git push -u origin main

if errorlevel 1 (
  echo.
  echo ОШИБКА push.
  echo.
  echo GitHub не принимает пароль. Нужен TOKEN:
  echo   1. https://github.com/settings/tokens
  echo   2. Generate new token - classic
  echo   3. Отметьте repo
  echo   4. Скопируйте token
  echo   5. При push: логин = %GH_USER%, пароль = ВСТАВЬТЕ TOKEN
  echo.
  pause
  exit /b 1
)

echo.
echo ========================================
echo   ГОТОВО
echo ========================================
echo   https://github.com/%GH_USER%/cifra-platform
echo.
echo   Обновите страницу Vercel и ищите cifra-platform в списке
echo.
pause
