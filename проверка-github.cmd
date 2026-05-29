@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Проверка GitHub

echo.
echo ===== ПРОВЕРКА: есть ли код на GitHub? =====
echo.

if not exist .git (
  echo [X] Git не настроен. Сначала запустите шаг1-git.cmd
  goto end
)
echo [OK] Папка .git есть
echo.

echo --- Последний коммит ---
git log -1 --oneline 2>nul
if errorlevel 1 echo [X] Коммитов нет - запустите шаг1-git.cmd
echo.

echo --- Куда привязан GitHub (remote) ---
git remote -v
echo.
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo [X] Репозиторий на GitHub НЕ подключен
  echo     Код только на вашем компьютере - Vercel его не видит
) else (
  echo [OK] Remote origin настроен
)
echo.

where gh >nul 2>&1
if not errorlevel 1 (
  echo --- Проверка через gh ---
  gh auth status
  echo.
  gh repo list --limit 5
)

echo.
echo ===== ЧТО ДЕЛАТЬ =====
echo.
echo Откройте в браузере (подставьте ВАШ логин GitHub):
echo   https://github.com/ВАШ_ЛОГИН?tab=repositories
echo.
echo Есть ли там cifra-platform?
echo   НЕТ - запустите шаг2-github.cmd или zapas-github.cmd
echo   ДА  - в Vercel: Adjust GitHub Permissions
echo.

:end
pause
