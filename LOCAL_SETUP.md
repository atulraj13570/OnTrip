# LOCAL NETWORK SETUP GUIDE

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- Docker Desktop running
- Git installed

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Start Services
```bash
# From project root
start-local.bat
```

This will:
1. Start PostgreSQL and Redis (Docker)
2. Start Backend API on port 3001
3. Start Frontend on port 3000
4. Display your local IP address

### Step 3: Access from Devices

**From this computer:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/v1/health

**From phone/tablet on same WiFi:**
- Frontend: http://YOUR_IP:3000
- Backend: http://YOUR_IP:3001/api/v1/health

Replace `YOUR_IP` with the IP shown in the startup script (e.g., 192.168.1.100)

## Manual Setup

If the script doesn't work, run manually:

```bash
# Terminal 1: Start Docker services
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

## Firewall Configuration

If devices can't connect, allow these ports in Windows Firewall:
- Port 3000 (Frontend)
- Port 3001 (Backend)

**Quick fix:**
```bash
# Run as Administrator
netsh advfirewall firewall add rule name="OnTrip Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="OnTrip Backend" dir=in action=allow protocol=TCP localport=3001
```

## Find Your IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (usually starts with 192.168.x.x)

**Alternative:**
- Open Settings → Network & Internet → WiFi → Properties
- Look for "IPv4 address"

## Testing

**Test backend:**
```bash
curl http://localhost:3001/api/v1/health
```

**Test from phone:**
Open browser and visit: `http://YOUR_IP:3001/api/v1/health`

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected"
}
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is in use: `netstat -ano | findstr :3001`
- Check Docker is running: `docker ps`
- Check .env file exists in backend/

### Frontend won't start
- Check if port 3000 is in use: `netstat -ano | findstr :3000`
- Clear Next.js cache: `cd frontend && rm -rf .next`

### Can't connect from phone
- Ensure phone is on same WiFi network
- Check Windows Firewall (see above)
- Try disabling VPN if active
- Restart router if needed

### Database connection error
- Check Docker containers: `docker-compose ps`
- Restart PostgreSQL: `docker-compose restart postgres`
- Check DATABASE_URL in backend/.env

## Stop Services

Press `Ctrl+C` in each terminal window, then:
```bash
docker-compose down
```

## Production Note

This setup is for LOCAL DEVELOPMENT ONLY. For production:
- Use proper CORS configuration (not `*`)
- Use HTTPS
- Use environment-specific secrets
- See DEPLOYMENT.md for production setup
