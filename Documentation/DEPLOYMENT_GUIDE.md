# 🚀 Deployment Guide - FarmConnect

This guide covers deploying FarmConnect to **Render**, **Vercel**, and other platforms with Neon database.

---

## ✅ Pre-requisites

1. **Neon Database**: You already have this configured! ✅
   - Connection string: `postgresql://neondb_owner:npg_mgoIEf6Mea7t@ep-weathered-darkness-adnv3wse-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

2. **Git Repository**: Push your code to GitHub/GitLab

---

## 🎯 Option 1: Deploy to Render (Recommended)

### Step 1: Create Render Account
- Go to https://render.com
- Sign up with GitHub

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: FarmConnect
   - **Region**: Oregon (closest to you)
   - **Branch**: main
   - **Root Directory**: (leave blank)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run render:build`
   - **Start Command**: `npm run start`

### Step 3: Add Environment Variables
In Render dashboard, add these:

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_mgoIEf6Mea7t@ep-weathered-darkness-adnv3wse-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secret-production-key-change-this
BACKEND_PORT=10000
CORS_ORIGIN=*
AI_SERVICE_URL=http://localhost:8000
```

### Step 4: Deploy!
- Click **"Create Web Service"**
- Render will build and deploy automatically
- Initial deployment takes ~5-10 minutes

### Step 5: Health Check
Visit: `https://your-app-name.onrender.com/health`

---

## 🎯 Option 2: Deploy to Vercel

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Link Project
```bash
vercel link
```

### Step 4: Add Secrets
```bash
# Add your Neon database URL
vercel secrets add neon-database-url "postgresql://neondb_owner:npg_mgoIEf6Mea7t@ep-weathered-darkness-adnv3wse-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Add JWT secret
vercel secrets add jwt-secret "your-production-jwt-secret-here"
```

### Step 5: Deploy
```bash
vercel --prod
```

---

## 🎯 Option 3: Deploy to Railway

### Step 1: Create Railway Account
- Go to https://railway.app
- Sign in with GitHub

### Step 2: New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository

### Step 3: Configure
Railway auto-detects Node.js apps. Just add environment variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_mgoIEf6Mea7t@ep-weathered-darkness-adnv3wse-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
JWT_SECRET=your-production-secret
PORT=3001
```

### Step 4: Deploy
Railway deploys automatically after configuration.

---

## 🎯 Option 4: Deploy to Fly.io

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login
```bash
fly auth login
```

### Step 3: Launch
```bash
fly launch --name farmconnect
```

### Step 4: Set Secrets
```bash
fly secrets set DATABASE_URL="postgresql://neondb_owner:npg_mgoIEf6Mea7t@ep-weathered-darkness-adnv3wse-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
fly secrets set JWT_SECRET="your-production-secret"
fly secrets set NODE_ENV="production"
```

### Step 5: Deploy
```bash
fly deploy
```

---

## 🔧 Manual Deployment (Any Platform)

If your platform doesn't auto-detect the setup:

### Build Command:
```bash
npm install
npm run build
npm run db:generate
npm run db:migrate
```

### Start Command:
```bash
npm run start
```

### Required Environment Variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_mgoIEf6Mea7t@ep-weathered-darkness-adnv3wse-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=<generate-strong-secret>
BACKEND_PORT=3001
CORS_ORIGIN=*
```

---

## 📊 Production Checklist

Before going live:

- [ ] Update `JWT_SECRET` with a strong random value
- [ ] Set proper `CORS_ORIGIN` (not `*`)
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set up monitoring/alerting
- [ ] Configure backup strategy for Neon
- [ ] Test all API endpoints
- [ ] Review security headers
- [ ] Set rate limiting appropriately
- [ ] Enable logging

---

## 🔍 Troubleshooting

### Error: "Missing script: start"
✅ Fixed! Root package.json now has start script

### Error: "Cannot find module '@prisma/client'"
```bash
npm run db:generate
```

### Error: "Database connection failed"
- Check DATABASE_URL is correct
- Ensure `?sslmode=require` is included
- Verify Neon project is active

### Error: "Port already in use"
- Some platforms assign random ports
- Use `process.env.PORT` instead of hardcoded values

---

## 📈 Monitoring Your Deployment

### Render
- Dashboard shows logs and metrics
- Auto-deploy on git push
- Health checks enabled

### Vercel
- Analytics in dashboard
- Serverless function logs
- Automatic SSL

### General
- Check application logs regularly
- Monitor database connections in Neon dashboard
- Set up alerts for errors

---

## 🔄 CI/CD Setup

Most platforms auto-deploy on push to main branch:

1. Push code: `git push origin main`
2. Platform detects changes
3. Runs build command
4. Runs migrations
5. Deploys new version
6. Zero downtime! ✨

---

## 💡 Tips

1. **Use `.env.production`** for production-specific configs
2. **Never commit secrets** - use platform's secret management
3. **Enable auto-migrations** carefully - test first!
4. **Monitor Neon usage** - serverless scales automatically
5. **Set up staging environment** before production

---

## 🆘 Need Help?

- **Render Support**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Prisma Deploy**: https://pris.ly/d/deploy

---

**Your FarmConnect is ready for production!** 🚀

Choose your preferred platform and deploy! The configuration files (`render.yaml`, `vercel.json`) are already set up for you.
