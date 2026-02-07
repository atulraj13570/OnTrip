@echo off
setlocal enabledelayedexpansion

echo ========================================
echo OnTrip Platform - Complete Setup
echo ========================================
echo.

REM Check if dependencies are installed
echo Checking dependencies...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js installed

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found. Please install Docker Desktop from https://docker.com
    pause
    exit /b 1
)
echo [OK] Docker installed

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Docker is running

echo.
echo ========================================
echo Step 1: Installing Dependencies
echo ========================================
echo.

REM Check if node_modules exists
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Backend installation failed
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Backend dependencies installed
) else (
    echo [SKIP] Backend dependencies already installed
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Frontend installation failed
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Frontend dependencies installed
) else (
    echo [SKIP] Frontend dependencies already installed
)

echo.
echo ========================================
echo Step 2: Starting Services
echo ========================================
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Your local IP: %IP%
echo.

REM Start Docker services
echo Starting PostgreSQL and Redis...
docker-compose up -d postgres redis
if errorlevel 1 (
    echo [ERROR] Failed to start Docker services
    pause
    exit /b 1
)

echo Waiting for databases to be ready...
timeout /t 10 /nobreak >nul

REM Start backend
echo Starting Backend API...
cd backend
start "OnTrip Backend" cmd /k "npm run dev"
cd ..
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting Frontend...
cd frontend
start "OnTrip Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo SUCCESS! All Services Started
echo ========================================
echo.
echo Access from this computer:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001/api/v1/health
echo.
echo Access from phone/tablet (same WiFi):
echo   Frontend: http://%IP%:3000
echo   Backend:  http://%IP%:3001/api/v1/health
echo.
echo Services are running in separate windows.
echo Close those windows to stop services.
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Open http://localhost:3000 in your browser
echo 2. Test backend: curl http://localhost:3000/api/v1/health
echo 3. Read QUICKSTART.md for more information
echo 4. Run setup-git.bat to push to GitHub
echo.
pause
