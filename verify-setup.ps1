# ChatterBox Setup Verification Script
# Run this before starting the application to check prerequisites

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ChatterBox Setup Verification Tool      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Python
Write-Host "🔍 Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python (\d+)\.(\d+)") {
        $major = [int]$Matches[1]
        $minor = [int]$Matches[2]
        if ($major -ge 3 -and $minor -ge 8) {
            Write-Host "   ✅ Python $pythonVersion found" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ Python 3.8+ required (found $pythonVersion)" -ForegroundColor Red
            $allGood = $false
        }
    }
}
catch {
    Write-Host "   ❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    $allGood = $false
}

# Check pip
Write-Host "🔍 Checking pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "   ✅ $pipVersion" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ pip not found" -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match "v(\d+)\.") {
        $major = [int]$Matches[1]
        if ($major -ge 16) {
            Write-Host "   ✅ Node.js $nodeVersion found" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ Node.js 16+ required (found $nodeVersion)" -ForegroundColor Red
            $allGood = $false
        }
    }
}
catch {
    Write-Host "   ❌ Node.js not found. Please install Node.js 16+" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "🔍 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "   ✅ npm $npmVersion found" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check ports
Write-Host "🔍 Checking if ports are available..." -ForegroundColor Yellow

$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "   ⚠️  Port 5000 is already in use" -ForegroundColor Yellow
}
else {
    Write-Host "   ✅ Port 5000 is available" -ForegroundColor Green
}

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "   ⚠️  Port 3000 is already in use" -ForegroundColor Yellow
}
else {
    Write-Host "   ✅ Port 3000 is available" -ForegroundColor Green
}

# Check project structure
Write-Host "🔍 Checking project structure..." -ForegroundColor Yellow

$requiredDirs = @(
    "backend",
    "frontend",
    "frontend\src",
    "frontend\public"
)

$requiredFiles = @(
    "backend\server.py",
    "backend\user_manager.py",
    "backend\file_transfer.py",
    "backend\voice_chat.py",
    "backend\requirements.txt",
    "frontend\package.json",
    "frontend\src\App.js"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir exists" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ $dir missing" -ForegroundColor Red
        $allGood = $false
    }
}

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file exists" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ $file missing" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✨ All checks passed! You're ready to start ChatterBox." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run .\start-backend.ps1 in one terminal" -ForegroundColor White
    Write-Host "  2. Run .\start-frontend.ps1 in another terminal" -ForegroundColor White
    Write-Host "  3. Open http://localhost:3000 in your browser" -ForegroundColor White
}
else {
    Write-Host "❌ Some checks failed. Please fix the issues above." -ForegroundColor Red
}

Write-Host ""
