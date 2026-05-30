@echo off
chcp 65001 >nul
cd /d "%~dp0"
title JSON для Vercel

if not exist .env.local (
  echo Нет файла .env.local
  echo Сначала: node scripts/setup-google-env.mjs
  pause
  exit /b 1
)

powershell -NoProfile -Command ^
  "$line = Get-Content '.env.local' -Raw | Select-String '(?m)^GOOGLE_SERVICE_ACCOUNT_JSON=(.+)$' | ForEach-Object { $_.Matches.Groups[1].Value }; if (-not $line) { Write-Error 'GOOGLE_SERVICE_ACCOUNT_JSON не найден'; exit 1 }; Set-Clipboard -Value $line; Write-Host 'JSON скопирован в буфер обмена.'; Write-Host ''; Write-Host 'Vercel -^> Project -^> Settings -^> Environment Variables'; Write-Host 'Name: GOOGLE_SERVICE_ACCOUNT_JSON'; Write-Host 'Value: вставьте Ctrl+V'; Write-Host 'Environments: Production, Preview, Development';"

pause
