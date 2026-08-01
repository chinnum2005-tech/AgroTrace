@echo off
REM ====================================================================
REM AgroTrace AI (FarmConnect) - Complete Automated Startup
REM ====================================================================
title AgroTrace AI - Automated Startup
color 0E

echo.
echo  ==================================================================
echo     🌾 AGROTRACE AI - PLATFORM AUTOMATED STARTUP 🌾
echo  ==================================================================
echo.

REM 1. Verify Environment Files (.env)
echo [1/6] Verifying Environment Configuration...
if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Root .env not found. Copying .env.example...
        copy .env.example .env >nul
    ) else (
        echo [WARN] Root .env and .env.example are both missing!
    )
)

if not exist "apps\backend\.env" (
    if exist "apps\backend\.env.example" (
        echo [INFO] Backend .env not found. Copying .env.example...
        copy apps\backend\.env.example apps\backend\.env >nul
    ) else (
        echo [WARN] Backend .env and .env.example are both missing!
    )
)

if not exist "apps\ml-inference\.env" (
    if exist "apps\ml-inference\.env.example" (
        echo [INFO] AI Service .env not found. Copying .env.example...
        copy apps\ml-inference\.env.example apps\ml-inference\.env >nul
    ) else (
        echo [WARN] AI Service .env and .env.example are both missing!
    )
)

if not exist "apps\web\.env" (
    if exist "apps\web\.env.example" (
        echo [INFO] Web Frontend .env not found. Copying .env.example...
        copy apps\web\.env.example apps\web\.env >nul
    ) else (
        echo [WARN] Web Frontend .env and .env.example are both missing!
    )
)
echo [OK] Environment files verified.
echo.

REM 2. Check Prerequisites (Node.js & Python)
echo [2/6] Checking System Prerequisites...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please download and install Node.js v18 or above from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detected:
node --version

where python >nul 2>nul
if errorlevel 1 (
    set PYTHON_AVAILABLE=1
    echo [WARN] Python not found in PATH. AI yield prediction service will be skipped.
) else (
    set PYTHON_AVAILABLE=0
    echo [OK] Python detected:
    python --version
)
echo.

REM 3. Install Monorepo Node Dependencies
echo [3/6] Checking Node Dependencies...
if exist "node_modules" goto dependencies_ok
echo [INFO] node_modules not found. Installing workspace dependencies...
call npm.cmd install
if errorlevel 1 (
    echo [ERROR] Dependency installation failed!
    pause
    exit /b 1
)
:dependencies_ok
echo [OK] Monorepo dependencies are already installed.
echo.

REM 4. Generate Prisma Client
echo [4/6] Generating Database Client...
if not exist "packages\prisma" (
    echo [WARN] packages\prisma directory not found!
    goto prisma_done
)
echo [INFO] Running Prisma Client generation...
cd packages\prisma & call npx.cmd prisma generate & cd ..\..
if errorlevel 1 (
    echo [ERROR] Prisma Client generation failed!
    echo [HINT] If you get an EPERM error, please close all running backend consoles and try again.
    pause
    exit /b 1
)
echo [OK] Database client generated successfully.
:prisma_done
echo.

REM 5. Install Python Dependencies
echo [5/6] Checking AI Service Python Dependencies...
if "%PYTHON_AVAILABLE%" NEQ "0" (
    echo [SKIP] AI dependencies check skipped [Python not available].
    goto python_deps_done
)
if not exist "apps\ml-inference\requirements.txt" (
    echo [WARN] apps\ml-inference\requirements.txt not found!
    goto python_deps_done
)
echo [INFO] Installing/verifying Python libraries...
python -m pip install -r apps\ml-inference\requirements.txt
if errorlevel 1 (
    echo [WARN] Python dependency installation failed. AI Service might fail to start.
) else (
    echo [OK] Python dependencies verified.
)
:python_deps_done
echo.

REM 6. Port Collision & Clean Startup
echo [6/6] Checking Port Availability...
set PORT_COLLISION=0

netstat -ano | findstr :8545 >nul
if not errorlevel 1 (
    echo [WARN] Port 8545 is already in use! Local Hardhat Node might fail to start.
    set PORT_COLLISION=1
)
netstat -ano | findstr :3001 >nul
if not errorlevel 1 (
    echo [WARN] Port 3001 is already in use! Backend API might fail to start.
    set PORT_COLLISION=1
)
netstat -ano | findstr :5173 >nul
if not errorlevel 1 (
    echo [WARN] Port 5173 is already in use! Web Frontend might fail to start.
    set PORT_COLLISION=1
)
if "%PYTHON_AVAILABLE%" EQU "0" (
    netstat -ano | findstr :8000 >nul
    if not errorlevel 1 (
        echo [WARN] Port 8000 is already in use! AI Service might fail to start.
        set PORT_COLLISION=1
    )
)

if "%PORT_COLLISION%" EQU "1" (
    echo [INFO] Please close applications using these ports, or modify .env configuration.
    echo.
) else (
    echo [OK] All service ports are available!
)
echo.

REM Create logs directory if missing
if not exist "logs" mkdir logs

echo ==================================================================
echo    STARTING ALL PLATFORM SERVICES IN SEPARATE WINDOWS
echo ==================================================================
echo.

REM 1. Hardhat Blockchain Node
echo [Service 1/4] Starting Hardhat Local Blockchain Node...
start "AgroTrace - Hardhat Node" cmd /k "cd blockchain && echo Starting Hardhat node on http://localhost:8545 ... && npx.cmd hardhat node"

echo [INFO] Waiting for Hardhat node to start on port 8545...
set ATTEMPTS=0
:wait_hardhat
netstat -ano | findstr :8545 >nul
if not errorlevel 1 goto hardhat_ready
set /a ATTEMPTS=%ATTEMPTS%+1
if %ATTEMPTS% GEQ 15 (
    echo [ERROR] Hardhat Node failed to start on port 8545 within 15 seconds!
    echo Please check the "AgroTrace - Hardhat Node" window for errors.
    pause
    exit /b 1
)
ping 127.0.0.1 -n 2 >nul
goto wait_hardhat

:hardhat_ready
echo [OK] Hardhat Node is active.
echo.

REM 2. Deploy smart contracts
echo [INFO] Deploying Smart Contracts to Local Hardhat Node...
cd blockchain & call npx.cmd hardhat run scripts/deploy.js --network localhost & cd ..
if errorlevel 1 (
    echo [WARN] Smart contract deployment failed!
    pause
)
echo.

REM 3. Backend API
echo [Service 2/4] Starting Backend API Server...
start "AgroTrace - Backend API" cmd /k "cd apps\backend && echo Starting backend on http://localhost:3001 ... && npm.cmd run dev"
ping 127.0.0.1 -n 4 >nul

REM 4. Web Frontend
echo [Service 3/4] Starting Web Frontend...
start "AgroTrace - Web Frontend" cmd /k "cd apps\web && echo Starting frontend on http://localhost:5173 ... && npm.cmd run dev"
ping 127.0.0.1 -n 4 >nul

REM 5. AI Service
if "%PYTHON_AVAILABLE%" EQU "0" (
    if exist "apps\ml-inference\main.py" (
        echo [Service 4/4] Starting AI Service...
        start "AgroTrace - AI Service" cmd /k "cd apps\ml-inference && echo Starting AI service on http://localhost:8000 ... && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
        ping 127.0.0.1 -n 3 >nul
    ) else (
        echo [SKIP] AI Service source code main.py not found.
    )
) else (
    echo [SKIP] AI Service skipped because Python is not installed.
)

echo.
echo ==================================================================
echo    ALL SERVICES LAUNCHED SUCCESSFULLY!
echo ==================================================================
echo.
echo Access URLs:
echo   - 💻 Web Frontend:  http://localhost:5173
echo   - ⚙️ Backend API:   http://localhost:3001
echo   - 🧠 AI Service:    http://localhost:8000
echo   - ⛓️ Hardhat Node:  http://localhost:8545
echo.
echo Quick Actions:
echo   - Close this console to finish the startup guide.
echo   - To stop any individual service, press Ctrl+C in its respective window.
echo.
pause