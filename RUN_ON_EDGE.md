# RUN ON EDGE LOCALHOST - TERMINAL COMMANDS

Copy and paste these commands in order.

## Step 1: Start Docker Services

```bash
cd "c:\Users\HP\Source code\OnTrip"
docker-compose up -d postgres redis
```

Wait 10 seconds for databases to start.

## Step 2: Install Backend Dependencies (First Time Only)

```bash
cd backend
npm install
```

## Step 3: Start Backend

```bash
npm run dev
```

Keep this terminal open. Backend runs on port 3001.

## Step 4: Install Frontend Dependencies (New Terminal)

Open a NEW terminal window:

```bash
cd "c:\Users\HP\Source code\OnTrip\frontend"
npm install
```

## Step 5: Start Frontend

```bash
npm run dev
```

Keep this terminal open. Frontend runs on port 3000.

## Step 6: Open in Edge Browser

Open Microsoft Edge and visit:

```
http://localhost:3000
```

## Step 7: Test Backend API

In Edge, open a new tab and visit:

```
http://localhost:3001/api/v1/health
```

You should see: `{"status":"ok","database":"connected"}`

---

## Access from Phone (Same WiFi)

### Find Your IP:

```bash
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

### Open on Phone:

```
http://YOUR_IP:3000
```

Replace YOUR_IP with your actual IP address.

---

## Stop Services

Press `Ctrl+C` in both terminal windows, then:

```bash
cd "c:\Users\HP\Source code\OnTrip"
docker-compose down
```

---

## Quick Restart (After First Setup)

Terminal 1:
```bash
cd "c:\Users\HP\Source code\OnTrip"
docker-compose up -d postgres redis
cd backend
npm run dev
```

Terminal 2:
```bash
cd "c:\Users\HP\Source code\OnTrip\frontend"
npm run dev
```

Then open Edge: http://localhost:3000

---

## Troubleshooting

**"Port already in use":**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**"Docker not running":**
- Open Docker Desktop
- Wait for green icon
- Run `docker ps` to verify

**"npm install failed":**
- Check internet connection
- Delete `node_modules` folder
- Run `npm install` again

---

**That's it! Your platform is running on Edge localhost.** 🚀
