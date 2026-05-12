#!/bin/bash

# CipherChat Docker Startup Script

echo "🐳 CipherChat - Docker Startup"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Menu
echo "Choose option:"
echo "1. Production (docker-compose.yml)"
echo "2. Development (docker-compose.dev.yml)"
echo "3. Build only"
echo "4. Down (stop all containers)"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Starting production environment..."
        docker-compose up --build
        ;;
    2)
        echo "🔧 Starting development environment..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    3)
        echo "🔨 Building Docker images..."
        docker-compose build
        echo "✅ Build complete!"
        echo ""
        echo "Run 'docker-compose up' to start containers"
        ;;
    4)
        echo "🛑 Stopping containers..."
        docker-compose down
        echo "✅ Containers stopped!"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
