@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Шаг 2 - GitHub

echo.
echo ========================================
echo   ШАГ 2: Отправка на GitHub
echo ========================================
echo.

where gh >nul 2>&1
if errorlevel 1 (
  echo [!] Программа gh не установлена.
  echo.
  echo Скачайте и установите:
  echo https://cli.github.com/
  echo.
  echo После установки ЗАКРОЙТЕ это окно, откройте cmd заново
  echo и снова запустите шаг2-github.cmd
  echo.
  echo ИЛИ используйте ЗАПАСНОЙ ВАРИАНТ в файле ШАГИ.txt
  pause
  exit /b 1
)

echo Сейчас откроется вход в GitHub.
echo.
echo   Выбирайте:
echo   - GitHub.com
echo   - HTTPS
echo   - Yes (git credentials)
echo   - Login with a web browser
echo.
pause

gh auth login
if errorlevel 1 (
  echo.
  echo Вход не завершён. Повторите: gh auth login
  pause
  exit /b 1
)

echo.
gh auth status
echo.

set /p GH_USER="Ваш логин на GitHub (латиницей, из адреса github.com/ЛОГИН): "

echo.
echo Создаём репозиторий cifra-platform ...
echo.

gh repo view %GH_USER%/cifra-platform >nul 2>&1
if errorlevel 1 (
  gh repo create cifra-platform --public --source=. --remote=origin --push
) else (
  echo Репозиторий уже есть, отправляем код...
  git remote remove origin 2>nul
  git remote add origin https://github.com/%GH_USER%/cifra-platform.git
  git push -u origin main
)

if errorlevel 1 (
  echo.
  echo ОШИБКА. Попробуйте ЗАПАСНОЙ ВАРИАНТ в ШАГИ.txt
  pause
  exit /b 1
)

echo.
echo ========================================
echo   ШАГ 2 ГОТОВ
echo ========================================
echo   Репозиторий: https://github.com/%GH_USER%/cifra-platform
echo.
echo   Дальше: ШАГ 3 в файле ШАГИ.txt (Vercel)
echo.
pause
