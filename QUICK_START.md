# Quick Start Guide - Railway Deployment

This is a condensed version of the deployment guide. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository
- OpenAI API key (optional, for AI features)

## 5-Minute Deployment

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Create Railway Project
1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose your repository

### 3. Add PostgreSQL Database
1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway provisions it automatically

### 4. Deploy Backend
1. Click "+ New" → "GitHub Repo" → Select `sketch-bridge`
2. **Configure**:
   - Root Directory: `socket`
   - Build Command: (auto from nixpacks.toml)
   - Start Command: `npm run start:prod`

3. **Environment Variables** (from Variables tab):
```env
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
DATABASE_HOST=${{Postgres.PGHOST}}
DATABASE_PORT=${{Postgres.PGPORT}}
DATABASE_NAME=${{Postgres.PGDATABASE}}
DATABASE_USER=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
DATABASE_SSL=true
CORS_ORIGIN=*
OPENAI_API_KEY=your-key-here
```

4. Generate domain, copy it (e.g., `backend.railway.app`)

### 5. Deploy Frontend
1. Click "+ New" → "GitHub Repo" → Select `sketch-bridge` (again)
2. **Configure**:
   - Root Directory: `app`
   - Build Command: (auto from nixpacks.toml)
   - Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
```env
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

4. Generate domain, copy it (e.g., `frontend.railway.app`)

### 6. Update CORS
1. Go back to backend service
2. Update `CORS_ORIGIN` to: `https://your-frontend.railway.app`

### 7. Run Migrations
From Railway backend service shell:
```bash
npm run migrate:prod
```

### 8. Test
- Backend: `https://your-backend.railway.app`
- Frontend: `https://your-frontend.railway.app`

## How the Common Folder Works

**Problem**: Both frontend and backend need shared TypeScript types, but Railway deploys them separately.

**Solution**: 
1. `common` folder compiles to `common/dist/` (JavaScript)
2. `prebuild` scripts in both services build `common` first
3. Both services reference the compiled `common/dist/`

**Build Flow**:
```
1. Build common:    common/model/*.ts  →  common/dist/model/*.js
2. Build backend:   socket/src/*.ts    →  socket/dist/*.js (imports from common/dist)
3. Build frontend:  app/src/*.tsx      →  app/dist/*.js (imports from common/dist)
```

This maintains type safety in development while providing proper JavaScript in production.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Railway Project                  │
├─────────────────┬─────────────────┬─────────────┤
│   PostgreSQL    │    Backend      │   Frontend  │
│   (Database)    │   (Socket.IO)   │   (React)   │
│                 │                 │             │
│   Port: 5432    │   Port: 3001    │   Port: $X  │
│                 │                 │             │
│   Tables:       │   Endpoints:    │   UI:       │
│   - canvases    │   - /health     │   - Canvas  │
│   - objects     │   - Socket.IO   │   - Tools   │
│   - sessions    │   - REST API    │   - AI      │
└─────────────────┴─────────────────┴─────────────┘
         ▲                 ▲                ▲
         │                 │                │
         └─────── common/dist/ types ───────┘
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module '@sketch-bridge/common'" | Redeploy - `nixpacks.toml` builds common first |
| Database connection failed | Check `DATABASE_SSL=true` and credentials |
| CORS errors | Update `CORS_ORIGIN` in backend to match frontend URL |
| 404 on API calls | Verify `VITE_API_URL` in frontend variables |
| Build fails | Run `cd common && npm run build` locally to test |

## View Logs
Railway Dashboard → Service → Deployments → Click deployment → View Logs

## Database Management

**View Data**: PostgreSQL service → "Data" tab

**Run Migrations**: Backend service → "..." menu → "Open Shell" → `npm run migrate:prod`

**Connect Locally**:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and connect
railway login
railway link
railway connect Postgres
```

## Next Steps
- [ ] Set up custom domain
- [ ] Configure monitoring/alerts  
- [ ] Set up staging environment
- [ ] Add error tracking (Sentry)
- [ ] Enable automatic backups

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

