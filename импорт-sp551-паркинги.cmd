@echo off

chcp 65001 >nul

cd /d "%~dp0"

title Импорт статьи СП 551 — паркинги и электромобили



echo.

echo  Копируем PDF и MP4 из папки «База данных» на рабочем столе...

echo.



call npm install

if errorlevel 1 (

  echo ОШИБКА: npm install

  pause

  exit /b 1

)



node scripts/import-pozharka-article.mjs sp551-parkings "Подземные паркинги и электромобили что меняет СП 551" bazadata

if errorlevel 1 (

  echo.

  echo ОШИБКА. Положите файлы в:

  echo   %%USERPROFILE%%\OneDrive\Рабочий стол\База данных\

  echo   «Подземные паркинги и электромобили что меняет СП 551.pdf»

  echo   «Подземные паркинги и электромобили что меняет СП 551.mp4»

  pause

  exit /b 1

)



echo.

echo [OK] public\pozharka\sp551-parkings\

echo [OK] data\pozharka-sp551-parkings.json

echo.

echo  Закоммитьте файлы в git, затем задеплойте.

echo.

pause

