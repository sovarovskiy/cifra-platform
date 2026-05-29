@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo npm install failed
    pause
    exit /b 1
  )
)
if not exist .env (
  echo Copy .env.example to .env and set ADMIN_EMAIL
  copy .env.example .env
)
echo Starting http://localhost:3002
call npm.cmd run dev
pause
