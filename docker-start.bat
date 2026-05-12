@echo off
REM CipherChat Docker Startup Script for Windows

echo.
echo 🐳 CipherChat - Docker Startup
echo ==============================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop.
    pause
    exit /b 1
)

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed
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
    echo 🚀 Starting production environment...
    docker-compose up --build
) else if "%choice%"=="2" (
    echo.
    echo 🔧 Starting development environment...
    docker-compose -f docker-compose.dev.yml up --build
) else if "%choice%"=="3" (
    echo.
    echo 🔨 Building Docker images...
    docker-compose build
    echo.
    echo ✅ Build complete!
    echo.
    echo Run 'docker-compose up' to start containers
) else if "%choice%"=="4" (
    echo.
    echo 🛑 Stopping containers...
    docker-compose down
    echo ✅ Containers stopped!
) else (
    echo ❌ Invalid choice
    goto menu
)

pause
