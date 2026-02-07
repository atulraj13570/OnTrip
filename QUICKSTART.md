# 🚀 QUICK START - GET RUNNING IN 10 MINUTES

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ (`node --version`)
- ✅ Docker Desktop (running)
- ✅ Git (`git --version`)

## Step 1: Install Dependencies (3 minutes)

Open terminal in project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

## Step 2: Start Services (1 minute)

**Option A: Automated (Recommended)**
```bash
start-local.bat
```

**Option B: Manual**
```bash
# Terminal 1: Start databases
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

## Step 3: Access the Platform

### From Your Computer
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1/health

### From Phone/Tablet (Same WiFi)
1. Find your IP address (shown in startup script)
2. Open browser on phone
3. Visit: http://YOUR_IP:3000

Example: http://192.168.1.100:3000

## Step 4: Test It Works

**Test backend:**
```bash
curl http://localhost:3001/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Test frontend:**
Open http://localhost:3000 in browser - you should see the OnTrip homepage.

## Step 5: Push to GitHub

1. Create a new repository on GitHub (don't initialize with README)
2. Run the setup script:
```bash
setup-git.bat
```
3. Enter your repository URL when prompted
4. Done! Your code is now on GitHub

## Troubleshooting

### "Port already in use"
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
cd frontend
npm run dev -- -p 3001
```

### "Docker not running"
1. Open Docker Desktop
2. Wait for it to start (green icon)
3. Run `docker ps` to verify

### "Can't connect from phone"
1. Check both devices on same WiFi
2. Add firewall rules:
```bash
# Run as Administrator
netsh advfirewall firewall add rule name="OnTrip" dir=in action=allow protocol=TCP localport=3000-3001
```

### "Database connection failed"
```bash
# Restart Docker services
docker-compose restart postgres redis

# Check logs
docker-compose logs postgres
```

## What's Running?

After startup, you have:
- ✅ PostgreSQL database (port 5432)
- ✅ Redis cache (port 6379)
- ✅ Backend API (port 3001)
- ✅ Frontend app (port 3000)

## Stop Services

Press `Ctrl+C` in each terminal, then:
```bash
docker-compose down
```

## Next Steps

1. **Read the docs**: See INDEX.md for full documentation
2. **Add test data**: See backend/sql/seed.sql (coming soon)
3. **Configure APIs**: Add API keys to backend/.env
4. **Deploy**: See DEPLOYMENT.md for production setup

## Need Help?

- **Documentation**: See INDEX.md
- **API Reference**: See API_SPECIFICATION.md
- **Architecture**: See ARCHITECTURE.md
- **Local Setup**: See LOCAL_SETUP.md

---

**You're ready to build! 🎉**
