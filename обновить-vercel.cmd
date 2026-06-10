@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Обновление Цифра на Vercel

echo.
echo  === 1. Проверка git ===
echo.

git status --short
if errorlevel 1 (
  echo ОШИБКА: Git не найден. Установите Git: https://git-scm.com
  pause
  exit /b 1
)

git check-ignore -v .env.local >nul 2>&1
if errorlevel 1 (
  echo ВНИМАНИЕ: .env.local не в .gitignore!
  pause
  exit /b 1
)

echo.
echo  === 2. Сборка (проверка перед push) ===
echo.

call npm install
if errorlevel 1 goto :fail

call npm run build
if errorlevel 1 goto :fail

echo.
echo  === 3. Коммит и push на GitHub ===
echo.

git add -A
git reset HEAD .env.local 2>nul
git reset HEAD "cifra-platform-*.json" 2>nul

git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Новый логотип: PWA-иконки, шапка, вход, установка на телефон"
  if errorlevel 1 goto :fail
  echo [OK] Коммит создан
) else (
  echo [--] Нет новых изменений для коммита
)

echo.
echo  Отправка на GitHub...
git push origin main
if errorlevel 1 (
  echo.
  echo ОШИБКА push. Проверьте:
  echo   - интернет
  echo   - git remote: git remote -v
  echo   - вход GitHub: gh auth login
  echo.
  pause
  exit /b 1
)

echo.
echo  [OK] Код на GitHub.
echo.
echo  Vercel: https://vercel.com -^> проект cifra-platform -^> Deployments
echo  Дождитесь статуса Ready (1-3 мин), затем на телефоне закройте PWA и откройте снова.
echo.
pause
exit /b 0

:fail
echo.
echo ОШИБКА на одном из шагов.
pause
exit /b 1
