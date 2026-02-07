# ACCESS FROM OTHER DEVICES

## Step 1: Find Your Computer's IP Address

Run this command:

```bash
ipconfig
```

Look for **"IPv4 Address"** under your WiFi adapter.

Example output:
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
```

Your IP is: **192.168.1.100** (yours will be different)

## Step 2: Access from Phone/Tablet

Make sure your phone is on the **same WiFi network**.

Open browser on your phone and visit:

**Frontend:**
```
http://192.168.1.100:3000
```

**Backend API:**
```
http://192.168.1.100:3001/api/v1/health
```

Replace `192.168.1.100` with YOUR actual IP address from Step 1.

## Step 3: If It Doesn't Work

### Allow Firewall Access

Run as Administrator:

```bash
netsh advfirewall firewall add rule name="OnTrip" dir=in action=allow protocol=TCP localport=3000-3001
```

### Verify Services Are Running

```bash
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

Both should show "LISTENING"

## Quick Test

From your phone's browser, try:
```
http://YOUR_IP:3001/api/v1/health
```

You should see:
```json
{"status":"ok","database":"connected"}
```

---

**That's it! Your platform is now accessible from any device on your WiFi.** 📱
