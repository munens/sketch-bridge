# Railway Setup Summary

## What We've Configured

Your Sketch Bridge application is now ready for Railway deployment! Here's what has been set up:

## ✅ Changes Made

### 1. Common Folder Build System
- **Updated** `common/package.json` - Added build scripts and configured for production
- **Updated** `common/tsconfig.json` - Configured to compile TypeScript to JavaScript
- **Result**: Common folder now builds to `common/dist/` with proper JavaScript modules

### 2. Backend (Socket) Configuration
- **Updated** `socket/package.json` - Added production build and migration scripts
- **Updated** `socket/tsconfig.json` - Configured to use compiled common modules
- **Updated** `socket/knexfile.ts` - Now supports both `DATABASE_URL` and individual credentials
- **Updated** `socket/src/database-config.ts` - Supports connection strings
- **Updated** `socket/src/server.ts` - Supports both connection methods
- **Updated** `socket/src/app.ts` - Database initialization supports both methods
- **Created** `socket/railway.json` - Railway deployment configuration
- **Created** `socket/nixpacks.toml` - Build instructions for Railway
- **Created** `socket/.railwayignore` - Optimize build by excluding unnecessary files

### 3. Frontend (App) Configuration
- **Updated** `app/package.json` - Added prebuild script to build common first
- **Created** `app/railway.json` - Railway deployment configuration
- **Created** `app/nixpacks.toml` - Build instructions for Railway
- **Created** `app/.railwayignore` - Optimize build by excluding unnecessary files

### 4. Project-Wide Updates
- **Updated** `.gitignore` - Excludes build outputs, logs, and environment files
- **Created** `DEPLOYMENT.md` - Comprehensive deployment guide (detailed)
- **Created** `QUICK_START.md` - Quick 5-minute deployment guide (condensed)
- **Created** `RAILWAY_SETUP_SUMMARY.md` - This file!

## 📦 How the Common Folder Works in Production

### Problem
Both frontend and backend need shared TypeScript types, but Railway deploys them as separate services.

### Solution
```
Development (TypeScript):
common/model/*.ts  ←  Used by both app/ and socket/ during development

Production Build (JavaScript):
common/model/*.ts  →  common/dist/model/*.js  ←  Used by both services in production
```

### Build Flow
1. **Build Common**: `cd common && npm run build` → Creates `common/dist/`
2. **Build Backend**: Backend imports from `common/dist/model/`
3. **Build Frontend**: Frontend imports from `common/dist/model/`

### Why This Works
- Railway's `nixpacks.toml` ensures common is built **before** each service
- Both services reference the same compiled JavaScript
- Type safety maintained during development
- Production uses optimized JavaScript

## 🗄️ Database: PostgreSQL (RDBMS)

### Railway PostgreSQL Features
- **Automatic Provisioning**: One-click database creation
- **Automatic Backups**: Daily backups included
- **SSL Connections**: Secure by default
- **Environment Variables**: Auto-injected into services

### Connection Methods
Your app now supports **both** connection methods:

#### Method 1: Connection String (Railway Default)
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
DATABASE_SSL=true
```

#### Method 2: Individual Credentials (Local Development)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=sketch_bridge
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_SSL=false
```

### Database Migrations
Run migrations after deployment:
```bash
# From Railway service shell
npm run migrate:prod

# Or from local machine (with Railway DB credentials)
cd socket
NODE_ENV=production npm run migrate:prod
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Railway Project                           │
│                   sketch-bridge-prod                         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│  PostgreSQL  │    │     Backend      │    │   Frontend   │
│   Database   │    │   (Socket.IO)    │    │   (React)    │
│              │    │                  │    │              │
│ Port: 5432   │◄───│  Port: $PORT     │◄───│ Port: $PORT  │
│              │    │                  │    │              │
│ Tables:      │    │ Imports from:    │    │ Imports from:│
│ - canvases   │    │ common/dist/     │    │ common/dist/ │
│ - objects    │    │                  │    │              │
│ - sessions   │    │ Tech:            │    │ Tech:        │
│              │    │ - Express        │    │ - Vite       │
│              │    │ - Socket.IO      │    │ - React      │
│              │    │ - Knex           │    │ - TailwindCSS│
└──────────────┘    └──────────────────┘    └──────────────┘
      ▲                      ▲                      ▲
      │                      │                      │
      └──────────────────────┴──────────────────────┘
            Shared types from common/dist/
```

## 📋 Environment Variables Checklist

### Backend Service
```bash
# Required
PORT=3001
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto from Railway
DATABASE_SSL=true
CORS_ORIGIN=https://your-frontend.railway.app

# Optional
OPENAI_API_KEY=sk-...
LOG_LEVEL=info
```

### Frontend Service
```bash
# Required
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app

# Optional
VITE_GOOGLE_MAPS_API_KEY=your-key
```

## 🎯 Quick Deploy Checklist

- [ ] **Step 1**: Push code to GitHub
- [ ] **Step 2**: Create Railway project
- [ ] **Step 3**: Add PostgreSQL database
- [ ] **Step 4**: Deploy backend service
  - [ ] Set root directory to `socket`
  - [ ] Configure environment variables
  - [ ] Generate domain
- [ ] **Step 5**: Deploy frontend service
  - [ ] Set root directory to `app`
  - [ ] Configure environment variables
  - [ ] Generate domain
- [ ] **Step 6**: Update backend CORS_ORIGIN with frontend URL
- [ ] **Step 7**: Run database migrations
- [ ] **Step 8**: Test both services
- [ ] **Step 9**: (Optional) Set up custom domains
- [ ] **Step 10**: (Optional) Configure monitoring

## 🔍 Verification Steps

### 1. Backend Health Check
```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### 2. Frontend Loads
Visit `https://your-frontend.railway.app` - app should load without errors

### 3. WebSocket Connection
Check browser console - should see successful Socket.IO connection

### 4. Database Connection
Check Railway PostgreSQL Data tab - should see tables created by migrations

## 📊 Migration Commands Reference

```bash
# Run all pending migrations (production)
npm run migrate:prod

# Run all pending migrations (development)
npm run migrate:dev

# Rollback last migration batch
npm run migrate:rollback

# View migration status
npx knex migrate:status --knexfile knexfile.ts
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Module not found: '@sketch-bridge/common' | Rebuild - nixpacks builds common first |
| Database connection failed | Check DATABASE_SSL=true for Railway |
| CORS errors | Update CORS_ORIGIN to match frontend URL |
| Build timeout | Check Railway logs for specific errors |
| Types not found | Run `cd common && npm run build` locally first |

## 📚 Documentation Links

- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive guide
- **Quick Start**: [QUICK_START.md](./QUICK_START.md) - 5-minute version
- **Railway Docs**: https://docs.railway.app
- **Knex Docs**: https://knexjs.org

## 🎉 What's Next?

After successful deployment:

1. **Custom Domain**: Add your own domain (e.g., sketch-bridge.com)
2. **Monitoring**: Set up error tracking with Sentry or similar
3. **Staging Environment**: Create a staging environment for testing
4. **CI/CD**: Set up automated testing before deployment
5. **Performance**: Monitor and optimize database queries
6. **Scaling**: Adjust Railway resource allocation as needed

## 💡 Tips for Success

1. **Always Build Common First**: The `prebuild` scripts ensure this happens automatically
2. **Use DATABASE_URL on Railway**: Simpler than individual credentials
3. **Enable SSL**: Required for Railway PostgreSQL
4. **Check Logs**: Railway's log viewer is your best friend for debugging
5. **Test Locally First**: Run `npm run build` in all folders before pushing
6. **Keep Dependencies Updated**: Regularly update packages for security

## 🆘 Getting Help

If you encounter issues:

1. Check the logs in Railway dashboard
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
3. Check Railway's Discord community
4. Verify all environment variables are set correctly

## 🎊 Success Criteria

Your deployment is successful when:
- ✅ Backend responds at https://your-backend.railway.app
- ✅ Frontend loads at https://your-frontend.railway.app
- ✅ WebSocket connections work (check browser console)
- ✅ Database tables exist (check Railway PostgreSQL Data tab)
- ✅ No CORS errors in browser console
- ✅ Canvas operations save to database

---

**You're all set! Follow the [QUICK_START.md](./QUICK_START.md) to deploy in 5 minutes! 🚀**

