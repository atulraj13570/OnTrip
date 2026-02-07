# Vercel Deployment Guide for OnTrip

## 🚀 Quick Deploy (Frontend Only)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with GitHub
3. **Import Project**:
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `atulraj13570/OnTrip`
   - Click "Import"

4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. **Environment Variables**:
   - Add: `NEXT_PUBLIC_API_URL` = `http://localhost:3001/api/v1` (temporary)
   - (Update this after backend deployment)

6. **Deploy**: Click "Deploy"

Your frontend will be live at: `https://ontrip-[random].vercel.app`

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd "c:\Users\HP\Source code\OnTrip"
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ontrip
# - In which directory is your code? frontend
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## 🔧 Full Stack Deployment (Frontend + Backend)

### Step 1: Deploy Backend API

**Option A: Deploy Backend to Vercel (Serverless)**

1. Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

2. Deploy backend:
```bash
cd backend
vercel --prod
```

3. Note the backend URL: `https://ontrip-backend-[random].vercel.app`

**Option B: Deploy Backend to Railway/Render (Recommended for PostgreSQL)**

Since Vercel is serverless and doesn't support long-running PostgreSQL connections well:

1. **Railway.app** (Free tier):
   - Go to https://railway.app
   - Connect GitHub repo
   - Select `backend` folder
   - Add PostgreSQL service
   - Deploy

2. **Render.com** (Free tier):
   - Go to https://render.com
   - New Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Add PostgreSQL database

### Step 2: Setup Database

**Option A: Vercel Postgres (Paid)**
- Add Vercel Postgres in dashboard
- Copy connection string

**Option B: Neon.tech (Free tier)**
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Run schema: `psql [connection-string] < backend/sql/init.sql`

**Option C: Supabase (Free tier)**
1. Go to https://supabase.com
2. Create project
3. Copy connection string
4. Run schema in SQL editor

### Step 3: Update Frontend Environment

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to your backend URL
3. Redeploy frontend

---

## 📋 Environment Variables Checklist

### Frontend (Vercel Dashboard)
- ✅ `NEXT_PUBLIC_API_URL` - Your backend API URL

### Backend (Railway/Render Dashboard)
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `REDIS_URL` - Redis connection string (optional for MVP)
- ✅ `NODE_ENV` - `production`
- ✅ `API_PORT` - `3001` (or auto-assigned)
- ✅ `JWT_SECRET` - Random secure string

---

## 🎯 Recommended Deployment Strategy

### For MVP (Fastest):
1. **Frontend**: Vercel (free)
2. **Backend**: Railway.app (free)
3. **Database**: Neon.tech PostgreSQL (free)
4. **Redis**: Upstash (free)

### For Production:
1. **Frontend**: Vercel (Pro)
2. **Backend**: AWS ECS or Railway (Pro)
3. **Database**: AWS RDS PostgreSQL
4. **Redis**: AWS ElastiCache or Upstash

---

## 🔍 Verify Deployment

After deployment:

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit `https://your-backend-url/api/v1/health`
3. **Test Search**: Try searching for a destination
4. **Check Logs**: Vercel Dashboard → Deployments → View Logs

---

## 🐛 Common Issues

### Issue: "API not responding"
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is deployed and healthy
- Check CORS settings in backend

### Issue: "Database connection failed"
- Verify `DATABASE_URL` in backend environment
- Check database is accessible from backend host
- Run schema initialization script

### Issue: "Build failed"
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Check build logs in Vercel dashboard

---

## 📱 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `ontrip.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

---

## 🚀 Quick Commands

```bash
# Deploy frontend to production
cd frontend
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm ontrip
```

---

## 📊 Post-Deployment Checklist

- [ ] Frontend loads successfully
- [ ] Backend health check responds
- [ ] Database schema initialized
- [ ] Environment variables set
- [ ] Search functionality works
- [ ] Package detail pages load
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)
- [ ] Analytics setup (optional)

---

**Your OnTrip platform is now live! 🎉**

Frontend: `https://ontrip-[random].vercel.app`
Backend: `https://your-backend-url.railway.app`
