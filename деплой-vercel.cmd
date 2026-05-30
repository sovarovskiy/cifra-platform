@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Деплой Цифра на Vercel

echo.
echo  === 1. Проверка: .env.local не должен попасть в git ===
echo.

git status --short
if errorlevel 1 (
  echo ОШИБКА: Git не найден
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
  git commit -m "Меню, JTBD, референс Google Sheets, наши объекты, UI"
  if errorlevel 1 goto :fail
  echo [OK] Коммит создан
) else (
  echo [--] Нет новых изменений для коммита
)

git push origin main
if errorlevel 1 (
  echo.
  echo ОШИБКА push. Проверьте интернет и: gh auth login
  pause
  exit /b 1
)

echo.
echo  [OK] Код на GitHub. Vercel соберёт проект автоматически.
echo.
echo  === 4. ОБЯЗАТЕЛЬНО на Vercel (если ещё не добавляли) ===
echo.
echo  Settings -^> Environment Variables:
echo    GOOGLE_SERVICE_ACCOUNT_JSON = содержимое JSON-ключа одной строкой
echo    ADMIN_EMAIL, SESSION_SECRET, ALLOWED_EMAILS (по необходимости)
echo.
echo  Запустите для копирования JSON в буфер:
echo    скопировать-json-vercel.cmd
echo.
echo  Deployments -^> дождитесь Ready -^> Ctrl+F5 на сайте
echo.
pause
exit /b 0

:fail
echo.
echo ОШИБКА на одном из шагов.
pause
exit /b 1
