# ✅ SETUP CHECKLIST

## Before You Start

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Docker Desktop installed and running
- [ ] Git installed (`git --version`)
- [ ] GitHub account created
- [ ] Text editor/IDE installed (VS Code recommended)

## Installation (10 minutes)

- [ ] Clone/download this repository
- [ ] Open terminal in project root
- [ ] Run `cd backend && npm install`
- [ ] Run `cd ../frontend && npm install`
- [ ] Verify no errors during installation

## Configuration (2 minutes)

- [ ] File `backend/.env` exists (created automatically)
- [ ] File `frontend/.env.local` exists (created automatically)
- [ ] Docker Desktop is running (green icon)

## Start Services (1 minute)

- [ ] Run `start-local.bat` from project root
- [ ] Wait for all services to start
- [ ] Note your IP address shown in console

## Verify Everything Works (3 minutes)

### Backend
- [ ] Open http://localhost:3001/api/v1/health
- [ ] Should see: `{"status":"ok","database":"connected"}`

### Frontend
- [ ] Open http://localhost:3000
- [ ] Should see OnTrip homepage
- [ ] Search form is visible

### Database
- [ ] Run `docker ps` - should see postgres and redis containers
- [ ] Both containers should be "Up"

### Network Access
- [ ] Open http://YOUR_IP:3000 on phone (same WiFi)
- [ ] Should see same homepage
- [ ] If blocked, add firewall rule (see LOCAL_SETUP.md)

## Git Setup (5 minutes)

- [ ] Create new repository on GitHub
- [ ] Copy repository URL
- [ ] Run `setup-git.bat`
- [ ] Paste repository URL when prompted
- [ ] Wait for push to complete
- [ ] Verify files on GitHub

## Post-Setup

- [ ] Read QUICKSTART.md
- [ ] Read INDEX.md for documentation navigation
- [ ] Bookmark http://localhost:3000 for easy access
- [ ] Share http://YOUR_IP:3000 with team members

## Troubleshooting

If anything fails, check:
- [ ] Docker Desktop is running
- [ ] No other services using ports 3000, 3001, 5432, 6379
- [ ] Node.js version is 18 or higher
- [ ] Internet connection is active (for npm install)

See LOCAL_SETUP.md for detailed troubleshooting.

## Next Steps

After setup is complete:
1. [ ] Read ARCHITECTURE.md to understand the system
2. [ ] Review API_SPECIFICATION.md for API details
3. [ ] Check IMPLEMENTATION_GUIDE.md for development workflow
4. [ ] Start building features!

---

**Setup complete? You're ready to develop! 🚀**

**Need help?** See LOCAL_SETUP.md or QUICKSTART.md
