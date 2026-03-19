@echo off
REM ============================================
REM FarmConnect - Database Seed Script
REM ============================================
REM This script seeds the database with demo data
REM ============================================

title FarmConnect - Database Seed
color 0B

echo.
echo ============================================
echo    FARMCONNECT DATABASE SEED
echo ============================================
echo.
echo This will populate your database with demo data including:
echo   - Test users (admin, farmer, distributor, consumer)
echo   - Green Valley Farm
echo   - Crops (wheat, corn, soybeans)
echo   - Products
echo   - Supply chain events (8 events with blockchain verification)
echo   - GPS coordinates for map visualization
echo.
pause

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)

echo.
echo [INFO] Seeding database...
echo.

cd packages\prisma

REM Run Prisma seed
npx prisma db seed

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo    DATABASE SEEDED SUCCESSFULLY!
    echo ============================================
    echo.
    echo Demo Data Created:
    echo   ✓ 4 test users
    echo   ✓ 1 farm (Green Valley Farm)
    echo   ✓ 3 crops (wheat, corn, soybeans)
    echo   ✓ 1 product (Premium Wheat Flour)
    echo   ✓ 8 supply chain events
    echo   ✓ GPS coordinates for map
    echo.
    echo Test Credentials:
    echo   - Admin:     admin@agritrace.ai / admin123
    echo   - Farmer:    farmer@agritrace.ai / farmer123
    echo   - Distributor: distributor@agritrace.ai / dist123
    echo   - Consumer:  consumer@agritrace.ai / consumer123
    echo.
    echo Next Steps:
    echo   1. Run start.bat to launch the platform
    echo   2. Login with any test credentials
    echo   3. Navigate to Product Traceability page
    echo.
) else (
    echo.
    echo ============================================
    echo    ERROR: Database seeding failed!
    echo ============================================
    echo.
    echo Please check:
    echo   1. PostgreSQL/Neon database is running
    echo   2. .env file is configured correctly
    echo   3. Database migrations have been run
    echo.
    echo To run migrations:
    echo   cd packages\prisma
    echo   npx prisma migrate dev
    echo.
)

cd ..\..
pause
