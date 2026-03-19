@echo off
REM ============================================
REM FarmConnect - Complete Platform Startup
REM ============================================
REM This script starts all services for FarmConnect
REM ============================================

title FarmConnect Platform Startup
color 0A

echo.
echo ============================================
echo    FARMCONNECT PLATFORM STARTUP
echo ============================================
echo.
echo Starting all services...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected: 
node --version
echo.

REM Check if Docker is available (optional)
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Docker is available - you can use docker-compose as alternative
    echo.
)

REM Create log directory
if not exist "logs" mkdir logs

echo ============================================
echo    STARTING SERVICES
echo ============================================
echo.

REM Terminal 1: Backend API
echo [1/4] Starting Backend API Server...
start "FarmConnect - Backend API" cmd /k "cd apps\backend && echo Starting backend on http://localhost:3001 ... && npm run dev"
timeout /t 3 /nobreak >nul

REM Terminal 2: Web Frontend
echo [2/4] Starting Web Frontend...
start "FarmConnect - Web Frontend" cmd /k "cd apps\web && echo Starting frontend on http://localhost:5173 ... && npm run dev"
timeout /t 3 /nobreak >nul

REM Terminal 3: AI Service (Optional)
echo [3/4] Starting AI Service (Optional)...
if exist "services\ai-service\main.py" (
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        start "FarmConnect - AI Service" cmd /k "cd services\ai-service && echo Starting AI service on http://localhost:8000 ... && python main.py"
        timeout /t 2 /nobreak >nul
    ) else (
        echo [SKIP] Python not found - AI Service will not start
    )
) else (
    echo [SKIP] AI Service not found
)

REM Terminal 4: Database Info
echo [4/4] Database Information...
echo.
echo PostgreSQL Database:
echo   - Host: localhost
echo   - Port: 5432
echo   - Database: agritrace
echo   - User: postgres
echo.
echo If using Docker, ensure it's running:
echo   docker-compose up -d postgres
echo.

timeout /t 2 /nobreak >nul

echo ============================================
echo    ALL SERVICES STARTED!
echo ============================================
echo.
echo Access Points:
echo   - Web Frontend:  http://localhost:5173
echo   - Backend API:   http://localhost:3001
echo   - AI Service:    http://localhost:8000 (if started)
echo.
echo Test Credentials:
echo   - Admin:     admin@agritrace.ai / admin123
echo   - Farmer:    farmer@agritrace.ai / farmer123
echo   - Distributor: distributor@agritrace.ai / dist123
echo   - Consumer:  consumer@agritrace.ai / consumer123
echo.
echo Quick Actions:
echo   - Press Ctrl+C in any terminal to stop that service
echo   - Close this window to stop all services
echo.
echo Seed Database (First Time Only):
echo   cd packages\prisma
echo   npx prisma db seed
echo.
echo ============================================
echo.
echo Platform is ready! Open http://localhost:5173 in your browser
echo.
pause
