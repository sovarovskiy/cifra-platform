# Публикация «Цифра» на GitHub + подсказка по Vercel
# Запуск: publish.cmd в корне проекта

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "=== Аналитическая платформа Цифра — публикация ===" -ForegroundColor Cyan
Write-Host ""

# 1. Git
if (-not (Test-Path ".git")) {
    git init
    git branch -M main
    Write-Host "[OK] Git инициализирован" -ForegroundColor Green
}
else {
    Write-Host "[OK] Git уже есть" -ForegroundColor Green
}

git add -A
$status = git status --porcelain
if ($status) {
    git commit -m "PWA: Аналитическая платформа Цифра"
    Write-Host "[OK] Коммит создан" -ForegroundColor Green
}
else {
    Write-Host "[--] Нет изменений для коммита" -ForegroundColor Yellow
}

# 2. GitHub CLI
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
    Write-Host ""
    Write-Host "[!] GitHub CLI (gh) не установлен." -ForegroundColor Yellow
    Write-Host "    Установите: https://cli.github.com/" -ForegroundColor Gray
    Write-Host "    Затем: gh auth login" -ForegroundColor Gray
    Write-Host ""
    Write-Host "    Или вручную:" -ForegroundColor Gray
    Write-Host "    git remote add origin https://github.com/USER/REPO.git" -ForegroundColor White
    Write-Host "    git push -u origin main" -ForegroundColor White
    exit 0
}

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[!] Войдите в GitHub: gh auth login" -ForegroundColor Yellow
    exit 1
}

$repoName = "cifra-platform"
Write-Host ""
Write-Host "Создать репозиторий github.com/ВАШ_ЛОГИН/$repoName ?" -ForegroundColor White
Write-Host "Y/n: " -NoNewline
$confirm = Read-Host
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Host "Отменено. Добавьте remote вручную." -ForegroundColor Yellow
    exit 0
}

gh repo view $repoName 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    gh repo create $repoName --public --source=. --remote=origin --push
    Write-Host "[OK] Репозиторий создан, код отправлен" -ForegroundColor Green
}
else {
    git push -u origin main 2>$null
    if ($LASTEXITCODE -ne 0) {
        git push origin main
    }
    Write-Host "[OK] Код отправлен в существующий репозиторий" -ForegroundColor Green
}

$url = gh repo view --json url -q .url 2>$null
if ($url) {
    Write-Host ""
    Write-Host "Репозиторий: $url" -ForegroundColor Cyan
}

# 3. Vercel
Write-Host ""
Write-Host "--- Деплой в интернет (Vercel) ---" -ForegroundColor Cyan
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercel) {
    Write-Host "Запустить vercel deploy? Y/n: " -NoNewline
    $vd = Read-Host
    if ($vd -ne "n" -and $vd -ne "N") {
        Write-Host "В Vercel задайте: ADMIN_EMAIL, SESSION_SECRET" -ForegroundColor Yellow
        vercel --prod
    }
}
else {
    Write-Host "Vercel CLI:" -ForegroundColor Gray
    Write-Host "  npm i -g vercel" -ForegroundColor Gray
    Write-Host "  vercel login" -ForegroundColor Gray
    Write-Host "  vercel" -ForegroundColor Gray
    Write-Host "Или: vercel.com -> Import Git Repository -> $repoName" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Готово." -ForegroundColor Green
Write-Host ""
