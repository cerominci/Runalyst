#!/bin/bash

# Script to reset Docker Desktop when encountering I/O errors
# Use this when docker builder prune fails with metadata_v2.db errors

echo "🔄 Docker Desktop Reset Guide"
echo "=============================="
echo ""
echo "The error you're seeing indicates Docker Desktop's internal database is corrupted."
echo ""
echo "To fix this, you need to reset Docker Desktop:"
echo ""
echo "METHOD 1: Using Docker Desktop GUI (Recommended)"
echo "------------------------------------------------"
echo "1. Quit Docker Desktop completely (Docker menu → Quit Docker Desktop)"
echo "2. Open Docker Desktop"
echo "3. Go to: Settings → Troubleshoot"
echo "4. Click 'Clean / Purge data' or 'Reset to factory defaults'"
echo "5. Confirm the reset"
echo "6. Restart Docker Desktop"
echo ""
echo "METHOD 2: Manual Reset (Advanced)"
echo "----------------------------------"
echo "1. Quit Docker Desktop completely"
echo "2. Remove Docker data directory:"
echo "   rm -rf ~/Library/Containers/com.docker.docker/Data"
echo "3. Restart Docker Desktop"
echo ""
echo "METHOD 3: Complete Uninstall/Reinstall"
echo "---------------------------------------"
echo "1. Uninstall Docker Desktop from Applications"
echo "2. Remove all Docker data:"
echo "   rm -rf ~/Library/Containers/com.docker.docker"
echo "   rm -rf ~/.docker"
echo "3. Reinstall Docker Desktop from docker.com"
echo ""
echo "⚠️  WARNING: Resetting Docker Desktop will:"
echo "   - Remove all containers, images, volumes, and networks"
echo "   - Clear all Docker settings"
echo "   - Require you to rebuild your images"
echo ""
echo "After resetting, you can rebuild your project with:"
echo "  docker compose build --no-cache"
echo "  docker compose up -d"
echo ""






