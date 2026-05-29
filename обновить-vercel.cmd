@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Обновление Цифра на Vercel

echo.
echo  === Отправка кода на GitHub (Vercel подхватит сам) ===
echo.

git status --short
if errorlevel 1 (
  echo ОШИБКА: Git не найден. Установите Git: https://git-scm.com
  pause
  exit /b 1
)

git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -m "Исправлены кнопки мастера: btn-wizard, скругление, Назад"
  if errorlevel 1 (
    echo ОШИБКА: коммит не создан
    pause
    exit /b 1
  )
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
echo  Дождитесь статуса Ready (1-3 мин), затем откройте сайт /login
echo.
pause
