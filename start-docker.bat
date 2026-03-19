@echo off
REM ============================================
REM FarmConnect - Docker Compose Startup
REM ============================================
REM This script starts all services using Docker
REM ============================================

title FarmConnect - Docker Compose
color 0E

echo.
echo ============================================
echo    FARMCONNECT DOCKER STARTUP
echo ============================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker detected
docker --version
echo.

REM Check if docker-compose is available
where docker-compose >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set COMPOSE_CMD=docker-compose
) else (
    set COMPOSE_CMD=docker compose
)

echo [OK] Using: %COMPOSE_CMD%
echo.

echo ============================================
echo    STARTING ALL SERVICES WITH DOCKER
echo ============================================
echo.
echo This will start:
echo   ✓ PostgreSQL Database
echo   ✓ Backend API (Node.js)
echo   ✓ AI Service (Python)
echo   ✓ Web Frontend (React)
echo.
pause

echo.
echo Building and starting containers...
echo.

%COMPOSE_CMD% up --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo    ALL SERVICES STOPPED
    echo ============================================
    echo.
) else (
    echo.
    echo ============================================
    echo    ERROR: Some services failed to start
    echo ============================================
    echo.
)

pause
