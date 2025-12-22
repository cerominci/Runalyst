#!/bin/bash

# Script to fix Docker I/O errors on macOS
# Run this script if you encounter "input/output error" during Docker builds

echo "🔧 Docker I/O Error Fix Script"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Step 1: Clean build cache
echo "Step 1: Cleaning Docker build cache..."
if docker builder prune -a -f 2>/dev/null; then
    echo "✅ Build cache cleaned"
else
    echo "⚠️  Build cache clean failed (this may indicate Docker corruption)"
    echo "   You may need to reset Docker Desktop (see instructions below)"
fi
echo ""

# Step 2: Clean system (optional, more aggressive)
read -p "Do you want to clean all unused Docker resources? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning all unused Docker resources..."
    docker system prune -a -f
    echo "✅ System cleaned"
else
    echo "⏭️  Skipping system clean"
fi
echo ""

# Step 3: Check disk space
echo "Step 2: Checking disk space..."
df -h | grep -E "Filesystem|/$"
echo ""

# Step 4: Stop existing containers
echo "Step 3: Stopping existing containers..."
docker compose down
echo "✅ Containers stopped"
echo ""

# Step 5: Rebuild with no cache
echo "Step 4: Rebuilding with no cache..."
echo "This may take a while..."
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "You can now start the container with:"
    echo "  docker compose up -d"
else
    echo ""
    echo "❌ Build failed. Try the following:"
    echo "  1. Restart Docker Desktop completely"
    echo "  2. Check if you have enough disk space"
    echo "  3. Try resetting Docker Desktop (Settings → Troubleshoot → Reset)"
fi

