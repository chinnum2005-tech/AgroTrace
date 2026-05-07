@echo off
REM ============================================
REM FarmConnect - Complete Platform Startup
REM ============================================

title FarmConnect Platform Startup
color 0A

echo.
echo ============================================
echo    FARMCONNECT PLATFORM STARTUP
echo ============================================
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

REM Create log directory
if not exist "logs" mkdir logs

echo ============================================
echo    WARMING UP NEON DATABASE
echo ============================================
echo.
echo [DB] Pinging Neon cloud database (may take 5-10s on first run)...
cd apps\backend
npx prisma db push --skip-generate >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Database is online and ready!
) else (
    echo [WARN] Could not reach database. Services will start anyway.
    echo        First request may be slow while Neon wakes up.
)
cd ..\..
echo.

echo ============================================
echo    STARTING SERVICES
echo ============================================
echo.

REM Terminal 1: Backend API
echo [1/3] Starting Backend API on http://localhost:3001 ...
start "FarmConnect - Backend API" cmd /k "cd apps\backend && npm run dev"
timeout /t 4 /nobreak >nul

REM Terminal 2: Web Frontend
echo [2/3] Starting Web Frontend on http://localhost:5173 ...
start "FarmConnect - Web Frontend" cmd /k "cd apps\web && npm run dev"
timeout /t 3 /nobreak >nul

REM Terminal 3: AI Service (Optional - only if Python is installed)
echo [3/3] Checking AI Service...
if exist "services\ai-service\main.py" (
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo       Starting AI Service on http://localhost:8000 ...
        start "FarmConnect - AI Service" cmd /k "cd services\ai-service && python main.py"
        timeout /t 2 /nobreak >nul
    ) else (
        echo       [SKIP] Python not found - AI Service skipped
    )
) else (
    echo       [SKIP] AI Service not found
)

echo.
echo ============================================
echo    ALL SERVICES STARTED!
echo ============================================
echo.
echo   Web App  -^>  http://localhost:5173
echo   Backend  -^>  http://localhost:3001
echo   Health   -^>  http://localhost:3001/health
echo   AI       -^>  http://localhost:8000  (if started)
echo.
echo ============================================
echo   LOGIN CREDENTIALS
echo ============================================
echo.
echo   Admin       : admin@farmconnect.in       / admin123
echo   Farmer      : farmer@farmconnect.in      / farmer123
echo   Distributor : distributor@farmconnect.in / dist123
echo   Consumer    : consumer@farmconnect.in    / consumer123
echo.
echo ============================================
echo.
echo   Platform is ready!
echo   Open http://localhost:5173 in your browser.
echo.
echo   To stop: close the individual service windows.
echo.
pause
