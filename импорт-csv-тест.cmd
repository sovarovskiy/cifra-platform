@echo off

chcp 65001 >nul

cd /d "%~dp0"

title Импорт CSV вопросов в проект



echo.

echo  Копирование 1.csv, 2.csv, 3.csv в data\test-import
echo  Формат: Вопрос; Правильный; Неверный 1; Неверный 2; Неверный 3

echo.



node scripts\sync-test-csv.mjs

if errorlevel 1 (

  echo.

  echo Положите файлы вручную в data\test-import\

  pause

  exit /b 1

)



echo.

echo [OK] Закоммитьте data\test-import\ для деплоя на Vercel.

echo.

pause

