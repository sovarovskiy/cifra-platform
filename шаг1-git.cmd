@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Шаг 1 - Git

echo.
echo ========================================
echo   ШАГ 1: Настройка Git и коммит
echo ========================================
echo.

set /p GIT_NAME="Ваше имя (латиницей, например Sergey): "
set /p GIT_EMAIL="Ваш email (sovarovsky@gmail.com): "

git config user.name "%GIT_NAME%"
git config user.email "%GIT_EMAIL%"

echo.
echo [OK] Имя и email сохранены только для этого проекта
echo.

if not exist .git (
  git init
  git branch -M main
  echo [OK] Git инициализирован
)

git add -A
git status

echo.
git commit -m "PWA: Analiticheskaya platforma Cifra"
if errorlevel 1 (
  echo.
  echo ОШИБКА коммита. Если пишет "nothing to commit" - возможно уже сделано.
  echo Если другая ошибка - скопируйте текст и пришлите.
  pause
  exit /b 1
)

echo.
echo ========================================
echo   ШАГ 1 ГОТОВ
echo ========================================
echo   Теперь запустите: шаг2-github.cmd
echo.
pause
