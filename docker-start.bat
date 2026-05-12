@echo off
chcp 65001 >nul
REM CipherChat Docker Startup Script for Windows

echo.
echo [DOCKER] CipherChat - Docker Startup
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed.
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running!
    echo.
    echo Please:
    echo 1. Open Docker Desktop
    echo 2. Wait until it says "Docker Desktop is running"
    echo 3. Run this script again
    echo.
    echo For troubleshooting, read: DOCKER-TROUBLESHOOT.md
    pause
    exit /b 1
)

echo [OK] Docker and Docker Compose are installed
echo.

:menu
echo Choose option:
echo 1. Production (docker-compose.yml)
echo 2. Development (docker-compose.dev.yml)
echo 3. Build only
echo 4. Down (stop all containers)
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo [INFO] Starting production environment...
    docker-compose up --build
    pause
) else if "%choice%"=="2" (
    echo.
    echo [INFO] Starting development environment...
    docker-compose -f docker-compose.dev.yml up --build
    pause
) else if "%choice%"=="3" (
    echo.
    echo [INFO] Building Docker images...
    docker-compose build
    echo.
    echo [OK] Build complete!
    echo.
    echo Run 'docker-compose up' to start containers
    pause
) else if "%choice%"=="4" (
    echo.
    echo [INFO] Stopping containers...
    docker-compose down
    echo [OK] Containers stopped!
    pause
) else (
    echo [ERROR] Invalid choice
    goto menu
)
)

pause
