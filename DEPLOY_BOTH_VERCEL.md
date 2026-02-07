# Deploy Both Backend & Frontend on Vercel

## 🚀 Quick Deploy (2 Projects)

You'll create **2 separate Vercel projects**:
1. **Backend API** (ontrip-backend)
2. **Frontend** (ontrip)

---

## Step 1: Deploy Backend API

### 1.1 Go to Vercel
- Visit: https://vercel.com/new
- Login with GitHub

### 1.2 Import Backend
- Click "Add New..." → "Project"
- Select: `atulraj13570/OnTrip`
- Click "Import"

### 1.3 Configure Backend
- **Project Name**: `ontrip-backend`
- **Framework Preset**: Other
- **Root Directory**: `backend` ← IMPORTANT
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 1.4 Add Environment Variables
Click "Environment Variables" and add:

```
DATABASE_URL=postgresql://user:pass@host:5432/ontrip
NODE_ENV=production
API_PORT=3001
JWT_SECRET=your-random-secret-key-here
CORS_ORIGIN=*
```

**Database Options:**
- **Neon.tech** (Free): https://neon.tech
- **Supabase** (Free): https://supabase.com
- **Vercel Postgres** (Paid): In Vercel dashboard

### 1.5 Deploy Backend
- Click "Deploy"
- Wait 2-3 minutes
- Note your backend URL: `https://ontrip-backend.vercel.app`

### 1.6 Test Backend
Visit: `https://ontrip-backend.vercel.app/api/v1/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "..."
}
```

---

## Step 2: Deploy Frontend

### 2.1 Import Frontend
- Go to: https://vercel.com/new
- Select: `atulraj13570/OnTrip` again
- Click "Import"

### 2.2 Configure Frontend
- **Project Name**: `ontrip`
- **Framework Preset**: Next.js
- **Root Directory**: `frontend` ← IMPORTANT
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2.3 Add Environment Variables
```
NEXT_PUBLIC_API_URL=https://ontrip-backend.vercel.app/api/v1
```

Replace `ontrip-backend.vercel.app` with YOUR actual backend URL from Step 1.5

### 2.4 Deploy Frontend
- Click "Deploy"
- Wait 2-3 minutes
- Your site is live: `https://ontrip.vercel.app`

---

## Step 3: Setup Database

### Option A: Neon.tech (Recommended - Free)

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project: "ontrip"
4. Copy connection string
5. Go to Vercel → ontrip-backend → Settings → Environment Variables
6. Update `DATABASE_URL` with Neon connection string
7. Redeploy backend

### Initialize Schema:
```bash
# Install psql or use Neon SQL Editor
psql "your-neon-connection-string" < backend/sql/init.sql
```

### Option B: Supabase (Free)

1. Go to https://supabase.com
2. Create project: "ontrip"
3. Go to Settings → Database → Connection String
4. Copy URI connection string
5. Update `DATABASE_URL` in Vercel backend
6. Run schema in Supabase SQL Editor

---

## 🎯 Final Configuration

### Update CORS in Backend
1. Go to Vercel → ontrip-backend → Settings → Environment Variables
2. Update `CORS_ORIGIN` to: `https://ontrip.vercel.app`
3. Redeploy backend

### Verify Everything Works
1. **Backend Health**: https://ontrip-backend.vercel.app/api/v1/health
2. **Frontend**: https://ontrip.vercel.app
3. **Test Search**: Try searching on frontend

---

## 📋 Environment Variables Summary

### Backend (ontrip-backend)
```
DATABASE_URL=postgresql://...
NODE_ENV=production
API_PORT=3001
JWT_SECRET=random-secret-key
CORS_ORIGIN=https://ontrip.vercel.app
```

### Frontend (ontrip)
```
NEXT_PUBLIC_API_URL=https://ontrip-backend.vercel.app/api/v1
```

---

## 🐛 Troubleshooting

### Backend shows 404
- Check Root Directory is set to `backend`
- Verify vercel.json exists in backend folder

### Frontend can't connect to API
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is deployed and healthy
- Check CORS settings in backend

### Database connection failed
- Verify `DATABASE_URL` is correct
- Check database is accessible from internet
- Run schema initialization script

### Build failed
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Check build logs in Vercel

---

## 🔗 Your Live URLs

After deployment:
- **Frontend**: https://ontrip.vercel.app
- **Backend API**: https://ontrip-backend.vercel.app
- **Health Check**: https://ontrip-backend.vercel.app/api/v1/health

---

## 📱 Custom Domain (Optional)

### For Frontend:
1. Vercel → ontrip → Settings → Domains
2. Add: `ontrip.com`
3. Update DNS records

### For Backend:
1. Vercel → ontrip-backend → Settings → Domains
2. Add: `api.ontrip.com`
3. Update frontend env: `NEXT_PUBLIC_API_URL=https://api.ontrip.com/api/v1`

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Database created (Neon/Supabase)
- [ ] Database schema initialized
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend health check works
- [ ] Frontend loads successfully
- [ ] API connection works
- [ ] CORS configured correctly

---

**Both services are now live on Vercel! 🎉**
