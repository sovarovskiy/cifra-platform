@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Экспорт банка вопросов теста в JSON

echo.
echo  Экспорт data\test-questions.json (~200 вопросов) для правок вручную.
echo  В приложении банк подключается из scripts\generate-test-questions.mjs.
echo.

call npm install
if errorlevel 1 (
  echo ОШИБКА: npm install
  pause
  exit /b 1
)

node scripts/write-test-questions-json.mjs
if errorlevel 1 (
  echo ОШИБКА генерации
  pause
  exit /b 1
)

echo.
echo [OK] data\test-questions.json
echo.
pause
