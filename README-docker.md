# Expo Docker Development Guide

Complete guide for running your Expo app in Docker with development workflow.

---

## 🚀 Initial Setup

### 1. Start the Container

```bash
# Build and start the container
docker compose up --build

# Or run in detached mode (background)
docker compose up -d --build
```

### 2. Access the Expo Dev Tools

Once running, open your browser:
- **Dev Tools**: http://localhost:19000
- **Metro Bundler**: http://localhost:8081

---

## 📱 Running the App

### Connect Your Device/Simulator

**Option 1: Expo Go App (Recommended for Development)**
```bash
# The container is already running with tunnel mode
# 1. Install Expo Go on your phone
# 2. Scan the QR code from http://localhost:19000
# 3. App will load on your device
```

**Option 2: Change Connection Mode**

Edit `Dockerfile` and change the CMD line:
```dockerfile
# For LAN connection (same WiFi)
CMD ["npx", "expo", "start", "--host", "lan"]

# For tunnel (works anywhere)
CMD ["npx", "expo", "start", "--host", "tunnel"]

# For localhost only
CMD ["npx", "expo", "start"]
```

Then rebuild:
```bash
docker compose up --build
```

---

## 📦 Installing Libraries

### Method 1: Using docker-compose exec (Recommended)

```bash
# Install a new package
docker compose exec expo npm install <package-name>

# Example: Install React Navigation
docker compose exec expo npm install @react-navigation/native

# Install Expo packages
docker compose exec expo npx expo install expo-camera expo-location

# Install dev dependencies
docker compose exec expo npm install --save-dev @types/react
```

### Method 2: Using docker exec

```bash
# If you know the container name
docker exec -it expo-app npm install <package-name>
```

### Method 3: Interactive Shell

```bash
# Enter the container
docker compose exec expo sh

# Now you're inside - install whatever you need
npm install axios
npx expo install expo-av
exit
```

### ⚠️ Important After Installing

After installing new packages, your `package.json` and `package-lock.json` are updated on your host machine (thanks to volume mounting). 

**For a clean rebuild:**
```bash
# Stop the container
docker compose down

# Rebuild with new dependencies
docker compose up --build
```

---

## 🔧 Common Commands

### Container Management

```bash
# View logs
docker compose logs -f expo

# Stop container
docker compose down

# Restart container
docker compose restart

# Stop and remove volumes
docker compose down -v
```

### Expo Commands Inside Container

```bash
# Clear Expo cache
docker compose exec expo npx expo start --clear

# Run TypeScript check
docker compose exec expo npx tsc --noEmit

# Run linter
docker compose exec expo npm run lint

# Install pods (if using iOS)
docker compose exec expo npx pod-install
```

### Package Management

```bash
# Update all packages
docker compose exec expo npm update

# Check for outdated packages
docker compose exec expo npm outdated

# Remove a package
docker compose exec expo npm uninstall <package-name>

# Clean install (rebuilds from lock file)
docker compose exec expo npm ci
```

---

## 🐛 Troubleshooting

### Issue: Metro bundler not accessible

```bash
# Check if ports are available
lsof -i :19000
lsof -i :8081

# Kill conflicting processes
kill -9 <PID>

# Restart container
docker-compose restart
```

### Issue: Changes not reflecting

```bash
# Clear Expo cache
docker compose exec expo npx expo start --clear

# Or restart with clean cache
docker compose down
docker compose up --build
```

### Issue: "Cannot connect to Metro"

```bash
# Check container is running
docker compose ps

# Check logs for errors
docker compose logs expo

# Ensure REACT_NATIVE_PACKAGER_HOSTNAME is correct
# Edit docker-compose.yml if needed
```

### Issue: Package installation fails

```bash
# Clear npm cache
docker compose exec expo npm cache clean --force

# Remove node_modules and reinstall
docker compose down -v
docker compose up --build
```

### Issue: "Module not found" after installing package

```bash
# Restart Metro bundler
docker compose restart

# Or clear cache and restart
docker compose exec expo npx expo start --clear
```

### Issue: Docker I/O Error ("input/output error" during build)

This error typically occurs on macOS with Docker Desktop. Try these solutions in order:

**Quick Fix:**
```bash
# Run the automated fix script
./scripts/fix-docker-io-error.sh
```

**Manual Steps:**

1. **Restart Docker Desktop** (most common fix)
   - Quit Docker Desktop completely (not just close window)
   - Restart Docker Desktop
   - Wait for it to fully start

2. **Clean Docker cache:**
```bash
# Clean build cache
docker builder prune -a -f

# Clean all unused resources (optional)
docker system prune -a -f
```

3. **Rebuild with no cache:**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

4. **Check disk space:**
```bash
df -h
# Ensure you have at least 10GB free space
```

5. **If still failing, reset Docker Desktop:**
   - Docker Desktop → Settings → Troubleshoot
   - Click "Clean / Purge data" or "Reset to factory defaults"
   - Restart Docker Desktop

### Issue: Docker Database Corruption Error ("metadata_v2.db: input/output error")

If you see this error when running `docker builder prune`:
```
ERROR: rpc error: code = Internal desc = write /var/lib/docker/buildkit/containerd-overlayfs/metadata_v2.db: input/output error
```

This indicates Docker Desktop's internal database is corrupted. **You must reset Docker Desktop:**

**View reset instructions:**
```bash
./scripts/reset-docker-desktop.sh
```

**Quick Reset Steps:**

1. **Quit Docker Desktop completely**
   - Docker menu → Quit Docker Desktop (don't just close the window)

2. **Reset via Docker Desktop GUI:**
   - Open Docker Desktop
   - Go to: **Settings → Troubleshoot**
   - Click **"Clean / Purge data"** or **"Reset to factory defaults"**
   - Confirm the reset
   - Restart Docker Desktop

3. **After reset, rebuild your project:**
```bash
docker compose build --no-cache
docker compose up -d
```

**⚠️ Warning:** Resetting will remove all containers, images, volumes, and networks. You'll need to rebuild everything.

**Alternative: Manual Reset (if GUI doesn't work):**
```bash
# Quit Docker Desktop first, then:
rm -rf ~/Library/Containers/com.docker.docker/Data
# Then restart Docker Desktop
```

---

## 📝 Development Workflow

### Typical Daily Workflow

```bash
# 1. Start your day
docker compose up -d

# 2. Install new packages as needed
docker compose exec expo npm install <package>

# 3. Check logs if issues arise
docker compose logs -f expo

# 4. End of day
docker compose down
```

### Adding New Dependencies

```bash
# 1. Install the package
docker compose exec expo npm install react-native-reanimated

# 2. If it's an Expo package, use expo install
docker compose exec expo npx expo install expo-camera

# 3. Clear cache if needed
docker compose exec expo npx expo start --clear

# 4. (Optional) Rebuild for clean slate
docker compose down
docker compose up --build
```

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start container | `docker compose up -d` |
| View logs | `docker compose logs -f expo` |
| Install package | `docker compose exec expo npm install <pkg>` |
| Enter container | `docker compose exec expo sh` |
| Clear cache | `docker compose exec expo npx expo start --clear` |
| Stop container | `docker compose down` |
| Rebuild | `docker compose up --build` |

---

## 🔐 Environment Variables

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development
```

These will be automatically available in your container.

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [React Native Documentation](https://reactnative.dev/)

---

## 💡 Pro Tips

1. **Use `npm ci` in production**: It's faster and more reliable
2. **Mount node_modules as volume**: Prevents host/container conflicts
3. **Use `.dockerignore`**: Keeps builds fast and clean
4. **Clear cache often**: Expo can be finicky with caching
5. **Check logs first**: Most issues show up in `docker-compose logs`

---

Happy coding! 🚀