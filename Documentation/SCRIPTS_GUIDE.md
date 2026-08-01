# 🚀 FarmConnect - Quick Start Scripts

## 📁 Available BAT Files

### 1. **start.bat** - Main Startup Script ⭐ (USE THIS ONE)

**What it does:**
- Starts Backend API server (port 3001)
- Starts Web Frontend (port 5173)
- Starts AI Service (port 8000, if Python available)
- Opens 3 separate terminal windows

**How to use:**
```bash
Double-click start.bat
```

**Access points:**
- Web App: http://localhost:5173
- API: http://localhost:3001
- AI: http://localhost:8000

**When to use:** For daily development work

---

### 2. **seed-database.bat** - Database Setup

**What it does:**
- Populates database with demo data
- Creates test users (4 roles)
- Creates Green Valley Farm
- Adds crops and products
- Generates 8 supply chain events
- Includes GPS coordinates for maps

**How to use:**
```bash
Double-click seed-database.bat
```

**Demo Data Created:**
- ✅ Admin user
- ✅ Farmer user  
- ✅ Distributor user
- ✅ Consumer user
- ✅ Green Valley Farm (150.5 hectares)
- ✅ 3 crops (wheat, corn, soybeans)
- ✅ Premium Wheat Flour product
- ✅ 8 blockchain-verified supply chain events

**Test Credentials:**
```
Admin:     admin@farmconnect.in / admin123
Farmer:    farmer@farmconnect.in / farmer123
Distributor: distributor@farmconnect.in / dist123
Consumer:  consumer@farmconnect.in / consumer123
```

**When to use:** First time setup or when you need fresh demo data

---

### 3. **install-all.bat** - Complete Installation

**What it does:**
- Installs all npm dependencies
- Covers all packages in monorepo
- One command to set up everything

**How to use:**
```bash
Double-click install-all.bat
```

**Installs:**
- Root workspace dependencies
- Backend API dependencies
- Web Frontend dependencies
- Blockchain service dependencies
- Prisma database dependencies

**When to use:** Fresh clone or after deleting node_modules

---

### 4. **start-docker.bat** - Docker Alternative

**What it does:**
- Starts all services using Docker Compose
- Includes PostgreSQL container
- More isolated environment

**How to use:**
```bash
Double-click start-docker.bat
```

**Services Started:**
- PostgreSQL (database)
- Backend API
- AI Service
- Web Frontend

**When to use:** If you prefer Docker over local Node.js

---

## 🎯 Recommended Workflow

### First Time Setup:

```bash
# Step 1: Install all dependencies
install-all.bat

# Step 2: Configure environment
# Copy .env.example to .env
# Update database connection string

# Step 3: Run migrations
cd packages\prisma
npx prisma migrate dev

# Step 4: Seed database
seed-database.bat

# Step 5: Start platform
start.bat
```

### Daily Development:

```bash
# Just run:
start.bat
```

### Need Fresh Data:

```bash
# Reset database:
seed-database.bat
```

---

## 📋 What Each Script Opens

### start.bat Opens:
```
Terminal 1: FarmConnect - Backend API
  └─ apps/backend
  └─ npm run dev
  └─ http://localhost:3001

Terminal 2: FarmConnect - Web Frontend
  └─ apps/web
  └─ npm run dev
  └─ http://localhost:5173

Terminal 3: FarmConnect - AI Service (if available)
  └─ services/ai-service
  └─ python main.py
  └─ http://localhost:8000
```

---

## 🔧 Troubleshooting

### Issue: "npm is not recognized"

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart your computer
3. Try again

---

### Issue: "Port already in use"

**Solution:**
```bash
# Kill process on port 3001 or 5173
# Windows PowerShell:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

---

### Issue: Database connection error

**Solution:**
1. Ensure PostgreSQL is running
2. Check .env file has correct DATABASE_URL
3. If using Docker: `docker-compose up -d postgres`

---

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Delete and reinstall
rmdir /s /q node_modules
install-all.bat
```

---

## 💡 Pro Tips

### Tip 1: Faster Startup
If you only need web frontend:
```bash
cd apps\web
npm run dev
```

### Tip 2: View Logs
All terminals show real-time logs. Watch for errors in red.

### Tip 3: Stop Services
- Individual: Press Ctrl+C in that terminal
- All: Close all terminal windows

### Tip 4: Check What's Running
```bash
# See all Node processes
tasklist | findstr node
```

### Tip 5: Multiple Terminals OK
You can run multiple instances:
- Terminal 1: `start.bat`
- Terminal 2: Open another tab for other commands

---

## 🎨 Visual Indicators

Each script uses different colors:

- **start.bat**: Green text (color 0A) - Go!
- **seed-database.bat**: Cyan text (color 0B) - Info
- **install-all.bat**: Blue text (color 09) - Setup
- **start-docker.bat**: Yellow text (color 0E) - Docker

---

## 📊 System Requirements

### Minimum:
- Node.js 18+ installed
- 4GB RAM
- PostgreSQL or Neon database

### Recommended:
- Node.js 20+
- 8GB RAM
- SSD storage
- Docker Desktop (optional)

---

## 🐳 Docker vs Local Development

### Local (start.bat):
✅ Faster startup times  
✅ Easier debugging  
✅ Direct file access  
❌ Need local PostgreSQL  

### Docker (start-docker.bat):
✅ Isolated environment  
✅ Includes database  
✅ Consistent across team  
❌ Slower startup  
❌ More resource usage  

**Recommendation:** Use `start.bat` for daily work, `start-docker.bat` for testing production-like environment.

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start platform | `start.bat` |
| Seed database | `seed-database.bat` |
| Install deps | `install-all.bat` |
| Docker start | `start-docker.bat` |
| Run migrations | `cd packages\prisma && npx prisma migrate dev` |
| Reset everything | Delete node_modules → `install-all.bat` → `seed-database.bat` |

---

## 🆘 Getting Help

If scripts don't work:

1. Check Node.js version:
   ```bash
   node --version
   ```

2. Verify npm works:
   ```bash
   npm --version
   ```

3. Check internet connection (for installs)

4. Read error messages carefully

5. Check logs in terminal windows

---

## ✨ Success Indicators

### start.bat Successful When:
```
✓ Backend API started on http://localhost:3001
✓ Web Frontend started on http://localhost:5173
✓ Message: "Platform is ready!"
```

### seed-database.bat Successful When:
```
✓ Database seeded successfully!
✓ Shows count of created records
✓ Test credentials displayed
```

### install-all.bat Successful When:
```
✓ All 5 installations complete
✓ No ERROR messages
✓ "Installation Complete!" message
```

---

## 🎉 You're Ready!

All scripts are designed to be **idiot-proof** with:
- Clear error messages
- Helpful prompts
- Automatic checks
- User-friendly output

**Just double-click and go!** 🚀

---

**Last Updated:** March 19, 2026  
**Scripts Version:** 1.0  
**Status:** ✅ Production Ready  

🚀 **Happy Coding!** ✨
