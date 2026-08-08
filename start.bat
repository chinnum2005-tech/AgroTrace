@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

title AgroTrace AI - Platform Startup
color 0A

echo.
echo ==================================================================
echo    AGROTRACE AI - PLATFORM AUTOMATED STARTUP
echo ==================================================================
echo.

echo [1/5] Verifying Environment Configuration...
if not exist ".env" if exist ".env.example" copy /y .env.example .env >nul
if not exist "apps\backend\.env" if exist "apps\backend\.env.example" copy /y apps\backend\.env.example apps\backend\.env >nul
if not exist "apps\ml-inference\.env" if exist "apps\ml-inference\.env.example" copy /y apps\ml-inference\.env.example apps\ml-inference\.env >nul
if not exist "apps\web\.env" if exist "apps\web\.env.example" copy /y apps\web\.env.example apps\web\.env >nul
echo [OK] Environment files verified.
echo.

echo [2/5] Checking System Prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please install Node.js v18 or above from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do echo [OK] Node.js detected: %%v

set PYTHON_OK=0
where python >nul 2>nul
if not errorlevel 1 (
    set PYTHON_OK=1
    for /f "tokens=*" %%v in ('python --version 2^>nul') do echo [OK] Python detected: %%v
)
echo.

echo [3/5] Checking Database Client Prisma...
if exist "packages\prisma" (
    cd packages\prisma
    call npx.cmd prisma generate >nul 2>nul
    cd ..\..
    echo [OK] Database client ready.
)
echo.

echo [4/5] Checking Blockchain Node...
netstat -ano -p tcp | findstr "LISTENING" | findstr ":8545" >nul
if errorlevel 1 (
    echo [INFO] Starting Hardhat Local Blockchain Node...
    start "AgroTrace - Hardhat Blockchain" cmd /k "cd /d "%~dp0blockchain" && echo Starting Hardhat node on http://localhost:8545 ... && npx.cmd hardhat node"
    ping 127.0.0.1 -n 6 >nul
) else (
    echo [INFO] Hardhat Node is already active on port 8545.
)

if exist "blockchain\scripts\deploy.js" (
    echo [INFO] Deploying Smart Contracts to local Hardhat node...
    cd blockchain
    call npx.cmd hardhat run scripts/deploy.js --network localhost
    cd ..
)
echo.

echo [5/5] Launching Platform Services...

netstat -ano -p tcp | findstr "LISTENING" | findstr ":3001" >nul
if errorlevel 1 (
    echo [INFO] Starting Backend API Server on Port 3001...
    start "AgroTrace - Backend API" cmd /k "cd /d "%~dp0apps\backend" && echo Starting backend on http://localhost:3001 ... && npm.cmd run dev"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo [INFO] Backend API is already running on port 3001.
)

netstat -ano -p tcp | findstr "LISTENING" | findstr ":5173" >nul
if errorlevel 1 (
    echo [INFO] Starting Web Frontend on Port 5173...
    start "AgroTrace - Web Frontend" cmd /k "cd /d "%~dp0apps\web" && echo Starting frontend on http://localhost:5173 ... && npm.cmd run dev"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo [INFO] Web Frontend is already running on port 5173.
)

if "%PYTHON_OK%"=="1" (
    if exist "apps\ml-inference\main.py" (
        netstat -ano -p tcp | findstr "LISTENING" | findstr ":8000" >nul
        if errorlevel 1 (
            echo [INFO] Starting AI Inference Service on Port 8000...
            start "AgroTrace - AI Service" cmd /k "cd /d "%~dp0apps\ml-inference" && echo Starting AI service on http://localhost:8000 ... && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
        ) else (
            echo [INFO] AI Inference Service is already running on port 8000.
        )
    )
)

echo.
echo ==================================================================
echo    ALL AGROTRACE SERVICES ARE ACTIVE AND RUNNING!
echo ==================================================================
echo.
echo  Access URLs:
echo    - Web Frontend:     http://localhost:5173
echo    - Backend API:      http://localhost:3001
echo    - AI ML Service:    http://localhost:8000
echo    - Hardhat Node:     http://localhost:8545
echo.
echo  Instructions:
echo    - Keep the service terminal windows open while using the app.
echo    - To stop a service, press Ctrl+C in its respective window.
echo.
pause