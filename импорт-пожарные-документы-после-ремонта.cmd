@echo off

chcp 65001 >nul

cd /d "%~dp0"

title Импорт: пожарные документы после ремонта



echo.

echo  Копируем PDF и MP4 из папки «База данных» на рабочем столе...

echo.



call npm install

if errorlevel 1 (

  echo ОШИБКА: npm install

  pause

  exit /b 1

)



node scripts/import-pozharka-article.mjs fire-docs-after-repair "Как обновлять пожарные документы в организации после ремонта" bazadata

if errorlevel 1 (

  echo.

  echo ОШИБКА. Положите в папку «База данных» на рабочем столе:

  echo   Как обновлять пожарные документы в организации после ремонта.pdf

  echo   Как обновлять пожарные документы в организации после ремонта.mp4

  pause

  exit /b 1

)



echo.

echo [OK] public\pozharka\fire-docs-after-repair\

echo [OK] data\pozharka-fire-docs-after-repair.json

echo.

echo  Закоммитьте файлы в git, затем задеплойте.

echo.

pause

