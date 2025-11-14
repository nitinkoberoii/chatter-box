# PowerShell script to start ChatterBox frontend
# Run this script from the ChatterBox root directory

Write-Host "🚀 Starting ChatterBox Frontend..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host ""
Write-Host "🎉 Starting React development server..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "The app will open in your browser at http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
npm start
