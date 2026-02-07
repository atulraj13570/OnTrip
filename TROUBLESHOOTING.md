# TROUBLESHOOTING - NOT RUNNING

## Issue: Docker not found

**Solution:** Install Docker Desktop from https://www.docker.com/products/docker-desktop/

## Alternative: Run WITHOUT Docker

If you don't have Docker, you can run without it:

### Step 1: Install PostgreSQL locally
Download from: https://www.postgresql.org/download/windows/

### Step 2: Install Redis locally
Download from: https://github.com/microsoftarchive/redis/releases

### Step 3: Update backend/.env

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/ontrip
REDIS_URL=redis://localhost:6379/0
```

### Step 4: Create database

```bash
psql -U postgres
CREATE DATABASE ontrip;
\q
```

### Step 5: Run schema

```bash
cd backend
psql -U postgres -d ontrip -f sql/init.sql
```

### Step 6: Start backend

```bash
npm install
npm run dev
```

### Step 7: Start frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

### Step 8: Open browser

```
http://localhost:3000
```

---

## Common Errors

**"Cannot find module"**
```bash
npm install
```

**"Port already in use"**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**"Database connection failed"**
- Check PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists

---

## What's the actual error?

Tell me the exact error message you're seeing and I'll fix it.
