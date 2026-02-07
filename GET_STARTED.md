# 🎯 GET STARTED - 3 SIMPLE STEPS

## Step 1: Run Setup (One Command)

Open terminal in project folder and run:

```bash
setup-and-start.bat
```

This will:
- ✅ Check all prerequisites (Node.js, Docker)
- ✅ Install all dependencies
- ✅ Start all services
- ✅ Show your IP address for WiFi access

**That's it!** Everything is now running.

---

## Step 2: Access the Platform

### On Your Computer
Open browser and visit:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001/api/v1/health

### On Your Phone (Same WiFi)
Open browser and visit:
- **Frontend**: http://YOUR_IP:3000

Replace `YOUR_IP` with the IP shown in the setup script.

Example: http://192.168.1.100:3000

---

## Step 3: Push to GitHub

1. Create a new repository on GitHub
2. Run this command:
```bash
setup-git.bat
```
3. Enter your repository URL when asked
4. Done! Your code is on GitHub

---

## That's All! 🎉

You now have:
- ✅ Backend API running on port 3001
- ✅ Frontend app running on port 3000
- ✅ PostgreSQL database running
- ✅ Redis cache running
- ✅ Access from any device on your WiFi
- ✅ Code backed up on GitHub

---

## What to Do Next?

### Learn the System
- Read [INDEX.md](./INDEX.md) - Documentation navigation
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- Read [API_SPECIFICATION.md](./API_SPECIFICATION.md) - API docs

### Start Developing
- Add test data to database
- Implement API integrations
- Customize the frontend
- Deploy to production

### Get Help
- Check [QUICKSTART.md](./QUICKSTART.md) for detailed instructions
- Check [LOCAL_SETUP.md](./LOCAL_SETUP.md) for troubleshooting
- Check [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for verification

---

## Common Issues

### "Port already in use"
Another app is using port 3000 or 3001. Close it or change ports.

### "Docker not running"
Open Docker Desktop and wait for it to start (green icon).

### "Can't connect from phone"
1. Make sure phone is on same WiFi
2. Add firewall rule (see LOCAL_SETUP.md)
3. Try disabling VPN

### "npm install failed"
Check your internet connection and try again.

---

## Stop Services

Close the terminal windows that opened, then run:
```bash
docker-compose down
```

---

## File Structure

```
OnTrip/
├── setup-and-start.bat    ← Run this first
├── setup-git.bat          ← Run this to push to GitHub
├── QUICKSTART.md          ← Detailed instructions
├── LOCAL_SETUP.md         ← Troubleshooting guide
├── backend/               ← API server
├── frontend/              ← Web app
└── docker-compose.yml     ← Database config
```

---

**Questions?** Read the docs in INDEX.md

**Ready to build?** Start coding! 🚀
