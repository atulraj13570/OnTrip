# Deploy Full Stack on Single Vercel Project

## 🚀 One-Click Deploy

### Step 1: Go to Vercel
1. Visit: https://vercel.com/new
2. Login with GitHub
3. Import: `atulraj13570/OnTrip`

### Step 2: Configure Project
- **Project Name**: `ontrip`
- **Framework**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Install Command**: `npm install`

### Step 3: Environment Variables
Add these in Vercel dashboard:

```
DATABASE_URL=postgresql://user:pass@host:5432/ontrip
NODE_ENV=production
JWT_SECRET=your-random-secret-key
NEXT_PUBLIC_API_URL=/api/v1
```

### Step 4: Deploy
Click "Deploy" - Done in 3 minutes!

---

## 📦 Database Setup

### Option 1: Neon.tech (Free)
1. Go to https://neon.tech
2. Create project: "ontrip"
3. Copy connection string
4. Add to Vercel env: `DATABASE_URL`
5. Run schema:
```bash
psql "your-connection-string" < backend/sql/init.sql
```

### Option 2: Vercel Postgres
1. In Vercel dashboard → Storage → Create Database
2. Select Postgres
3. Connection string auto-added to env
4. Run schema in Vercel Postgres dashboard

---

## ✅ How It Works

- **Frontend**: Next.js pages served from `/`
- **Backend API**: Next.js API routes at `/api/v1/*`
- **Single deployment**: Both in one Vercel project
- **No CORS issues**: Same origin

---

## 🔗 Your Live URL

After deployment:
- **Website**: https://ontrip.vercel.app
- **API**: https://ontrip.vercel.app/api/v1/health
- **Search**: https://ontrip.vercel.app/search

---

## 🐛 Troubleshooting

### Build fails
- Check Node.js version is 18+
- Verify both frontend and backend package.json exist

### Database connection fails
- Verify `DATABASE_URL` in environment variables
- Check database allows connections from Vercel IPs

### API not working
- Check `/api/v1/health` endpoint
- Verify `NEXT_PUBLIC_API_URL=/api/v1`

---

## 📋 Deployment Checklist

- [ ] Project imported to Vercel
- [ ] Environment variables added
- [ ] Database created (Neon/Vercel Postgres)
- [ ] Database schema initialized
- [ ] Deployment successful
- [ ] Frontend loads at root URL
- [ ] API responds at /api/v1/health
- [ ] Search functionality works

---

**Your full-stack app is live on one URL! 🎉**
