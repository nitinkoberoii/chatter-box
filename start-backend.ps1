# PowerShell script to start ChatterBox backend server
# Run this script from the ChatterBox root directory

Write-Host "🚀 Starting ChatterBox Backend Server..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend"

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "✅ Activating virtual environment..." -ForegroundColor Green
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install flask flask-socketio flask-cors python-socketio bcrypt --quiet

# Start the server
Write-Host "" 
Write-Host "🎉 Starting server..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
python server.py
