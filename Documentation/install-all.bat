@echo off
REM ============================================
REM FarmConnect - Complete Installation Script
REM ============================================
REM This script installs all dependencies for FarmConnect
REM ============================================

title FarmConnect - Complete Installation
color 09

echo.
echo ============================================
echo    FARMCONNECT COMPLETE INSTALLATION
echo ============================================
echo.
echo This will install dependencies for:
echo   - Root workspace
echo   - Backend API (apps/backend)
echo   - Web Frontend (apps/web)
echo   - Blockchain Service (services/blockchain)
echo   - Prisma Database (packages/prisma)
echo.
echo This may take several minutes...
echo.
pause

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [OK] Node.js detected: 
node --version
echo.

echo ============================================
echo    INSTALLING DEPENDENCIES
echo ============================================
echo.

REM Install root dependencies
echo [1/5] Installing root dependencies...
if exist "package.json" (
    call npm install
    echo [OK] Root dependencies installed
) else (
    echo [SKIP] No root package.json found
)
echo.

REM Install backend dependencies
echo [2/5] Installing Backend API dependencies...
cd apps\backend
if exist "package.json" (
    call npm install
    echo [OK] Backend dependencies installed
) else (
    echo [ERROR] Backend package.json not found!
)
cd ..\..
echo.

REM Install web dependencies
echo [3/5] Installing Web Frontend dependencies...
cd apps\web
if exist "package.json" (
    call npm install
    echo [OK] Web dependencies installed
) else (
    echo [ERROR] Web package.json not found!
)
cd ..\..
echo.

REM Install blockchain dependencies
echo [4/5] Installing Blockchain Service dependencies...
cd services\blockchain
if exist "package.json" (
    call npm install
    echo [OK] Blockchain dependencies installed
) else (
    echo [SKIP] Blockchain service not found
)
cd ..\..
echo.

REM Install Prisma dependencies
echo [5/5] Installing Prisma Database dependencies...
cd packages\prisma
if exist "package.json" (
    call npm install
    echo [OK] Prisma dependencies installed
) else (
    echo [ERROR] Prisma package.json not found!
)
cd ..\..
echo.

echo ============================================
echo    INSTALLATION COMPLETE!
echo ============================================
echo.
echo Next Steps:
echo   1. Configure environment variables:
echo      - Copy .env.example to .env
echo      - Update database connection string
echo      - Update JWT secret
echo.
echo   2. Run database migrations:
echo      cd packages\prisma
echo      npx prisma migrate dev
echo.
echo   3. Seed the database:
echo      Run seed-database.bat
echo.
echo   4. Start the platform:
echo      Run start.bat
echo.
echo ============================================
echo.
pause
