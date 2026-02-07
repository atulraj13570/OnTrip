@echo off
echo ========================================
echo OnTrip Platform - Local Network Setup
echo ========================================
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo Your local IP address: %IP%
echo.
echo Starting services...
echo.

REM Start Docker services
echo [1/3] Starting PostgreSQL and Redis...
docker-compose up -d postgres redis
timeout /t 5 /nobreak >nul

REM Start backend
echo [2/3] Starting Backend API...
cd backend
start cmd /k "npm run dev"
cd ..
timeout /t 3 /nobreak >nul

REM Start frontend
echo [3/3] Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Services Started!
echo ========================================
echo.
echo Access from this computer:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001/api/v1/health
echo.
echo Access from other devices on WiFi:
echo   Frontend: http://%IP%:3000
echo   Backend:  http://%IP%:3001/api/v1/health
echo.
echo Press Ctrl+C in each window to stop services
echo ========================================
