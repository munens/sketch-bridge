# Deployment Guide for Sketch Bridge

This guide will walk you through deploying your Sketch Bridge application to Railway with PostgreSQL database.

## Architecture Overview

Your application consists of:
- **Frontend (app/)**: React + Vite application
- **Backend (socket/)**: Node.js + Express + Socket.IO server
- **Common (common/)**: Shared TypeScript types and models
- **Database**: PostgreSQL (RDBMS)

## Prerequisites

1. A Railway account (sign up at https://railway.app)
2. GitHub repository with your code
3. OpenAI API key (if using AI features)

## Understanding the Common Folder Solution

The `common` folder contains shared TypeScript types used by both frontend and backend. During deployment:

1. **Build Phase**: The `common` folder is compiled to JavaScript in `common/dist/`
2. **Frontend Build**: Runs `prebuild` script which builds `common` first, then builds the frontend
3. **Backend Build**: Runs `prebuild` script which builds `common` first, then builds the backend
4. Both services reference the compiled `common/dist/` folder

This ensures type safety during development while providing proper JavaScript modules in production.

## Step-by-Step Railway Deployment

### Part 1: Initial Setup

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Login to Railway**
   - Go to https://railway.app
   - Sign in with GitHub
   - Click "New Project"

### Part 2: Database Setup

1. **Create PostgreSQL Database**
   - In your new Railway project, click "+ New"
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway will automatically provision a PostgreSQL database

2. **Note Database Variables**
   Railway automatically creates these environment variables:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - `DATABASE_URL` (complete connection string)

### Part 3: Backend Deployment

1. **Add Backend Service**
   - Click "+ New" in your Railway project
   - Select "GitHub Repo"
   - Choose your `sketch-bridge` repository
   - Railway will detect it's a Node.js project

2. **Configure Backend Service**
   - Click on the service to open settings
   - Go to "Settings" tab
   - Set **Root Directory**: `socket`
   - Set **Build Command**: (Railway will use nixpacks.toml automatically)
   - Set **Start Command**: `npm run start:prod`

3. **Set Backend Environment Variables**
   - Go to "Variables" tab
   - Add the following variables:

   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   LOG_LEVEL=info

   # Database Configuration (copy from PostgreSQL service)
   DATABASE_HOST=${{Postgres.PGHOST}}
   DATABASE_PORT=${{Postgres.PGPORT}}
   DATABASE_NAME=${{Postgres.PGDATABASE}}
   DATABASE_USER=${{Postgres.PGUSER}}
   DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
   DATABASE_SSL=true

   # CORS (will update after frontend is deployed)
   CORS_ORIGIN=*

   # OpenAI API Key (if using AI features)
   OPENAI_API_KEY=your-openai-api-key
   ```

   **Note**: The `${{Postgres.PGHOST}}` syntax references variables from your PostgreSQL service.

4. **Run Database Migrations**
   - After the backend is deployed, go to the backend service
   - Click on the "Deployments" tab
   - Find the latest deployment and click on it
   - Click on "View Logs"
   - In the service settings, add a new variable:
     ```
     RAILWAY_RUN_MIGRATIONS=true
     ```
   - Or manually run migrations from Railway's service shell:
     ```bash
     npm run migrate:prod
     ```

5. **Generate Domain**
   - Go to "Settings" tab
   - Scroll to "Networking"
   - Click "Generate Domain"
   - Copy the domain (e.g., `your-backend-app.railway.app`)

### Part 4: Frontend Deployment

1. **Add Frontend Service**
   - Click "+ New" in your Railway project
   - Select "GitHub Repo"
   - Choose your `sketch-bridge` repository again
   - Railway will create a second service

2. **Configure Frontend Service**
   - Click on the new service to open settings
   - Go to "Settings" tab
   - Set **Root Directory**: `app`
   - Set **Build Command**: (Railway will use nixpacks.toml automatically)
   - Set **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

3. **Set Frontend Environment Variables**
   - Go to "Variables" tab
   - Add the following variables (use your backend domain from step 3.5):

   ```env
   # Backend API Configuration
   VITE_API_URL=https://your-backend-app.railway.app
   VITE_SOCKET_URL=https://your-backend-app.railway.app

   # Google Maps API (if using)
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

4. **Generate Domain**
   - Go to "Settings" tab
   - Scroll to "Networking"
   - Click "Generate Domain"
   - Copy the domain (e.g., `your-frontend-app.railway.app`)

### Part 5: Update CORS Configuration

1. **Update Backend CORS_ORIGIN**
   - Go back to your backend service
   - Go to "Variables" tab
   - Update `CORS_ORIGIN` to your frontend domain:
     ```env
     CORS_ORIGIN=https://your-frontend-app.railway.app
     ```
   - The backend will automatically redeploy

### Part 6: Verify Deployment

1. **Check Backend**
   - Open your backend URL: `https://your-backend-app.railway.app`
   - You should see a response from your API

2. **Check Frontend**
   - Open your frontend URL: `https://your-frontend-app.railway.app`
   - Your application should load and connect to the backend

3. **Check Database Connection**
   - Go to the PostgreSQL service in Railway
   - Click on "Data" tab to view your database tables
   - You should see the tables created by your migrations

## Database Management

### Running Migrations

**From Railway Service Shell:**
1. Go to your backend service in Railway
2. Click on the "..." menu
3. Select "Open Shell"
4. Run migration command:
   ```bash
   npm run migrate:prod
   ```

**From Local Machine:**
1. Set up environment variables locally with Railway database credentials
2. Run:
   ```bash
   cd socket
   npm run migrate:prod
   ```

### Rolling Back Migrations

```bash
cd socket
npm run migrate:rollback
```

### Viewing Database Data

**Option 1: Railway Dashboard**
- Go to PostgreSQL service
- Click "Data" tab
- Browse tables and data

**Option 2: Database Client**
- Use the `DATABASE_URL` from Railway
- Connect with tools like:
  - pgAdmin
  - DBeaver
  - TablePlus
  - psql CLI

**Option 3: Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Connect to database
railway connect Postgres
```

## Environment Variables Reference

### Backend (`socket/`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `production` |
| `LOG_LEVEL` | Logging level | `info` |
| `DATABASE_HOST` | PostgreSQL host | From Railway |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_NAME` | Database name | `railway` |
| `DATABASE_USER` | Database user | From Railway |
| `DATABASE_PASSWORD` | Database password | From Railway |
| `DATABASE_SSL` | Enable SSL for DB | `true` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://your-frontend.railway.app` |
| `OPENAI_API_KEY` | OpenAI API key | Your API key |

### Frontend (`app/`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.railway.app` |
| `VITE_SOCKET_URL` | Socket.IO URL | `https://your-backend.railway.app` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps key | Your API key |

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@sketch-bridge/common'"

**Cause**: The `common` folder wasn't built before the service was built.

**Solution**:
- Ensure `nixpacks.toml` is present in both `app/` and `socket/` directories
- Check that the build commands in `nixpacks.toml` include building `common`
- Redeploy the service

#### 2. Database Connection Failed

**Cause**: Incorrect database credentials or SSL configuration.

**Solution**:
- Verify all database environment variables are set correctly
- Ensure `DATABASE_SSL=true` for Railway PostgreSQL
- Check that the PostgreSQL service is running

#### 3. CORS Errors

**Cause**: Backend CORS_ORIGIN doesn't match frontend domain.

**Solution**:
- Update `CORS_ORIGIN` in backend to match your frontend domain
- Ensure there's no trailing slash in the domain

#### 4. "404 Not Found" for API Calls

**Cause**: Frontend is pointing to wrong backend URL.

**Solution**:
- Check `VITE_API_URL` and `VITE_SOCKET_URL` in frontend variables
- Ensure backend service is running and accessible

#### 5. Build Fails with TypeScript Errors

**Cause**: TypeScript compilation errors or missing type definitions.

**Solution**:
- Fix TypeScript errors locally first
- Ensure `common` builds successfully: `cd common && npm run build`
- Check that all dependencies are installed

### Viewing Logs

**Railway Dashboard:**
1. Go to your service
2. Click "Deployments" tab
3. Click on the latest deployment
4. View build logs and runtime logs

**Railway CLI:**
```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs
```

## Monitoring and Maintenance

### Health Checks

Add health check endpoints to your backend:

```typescript
// In your Express app
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

### Database Backups

Railway automatically backs up your PostgreSQL database. To manually backup:

1. Use Railway CLI:
   ```bash
   railway connect Postgres
   pg_dump -h localhost -U postgres > backup.sql
   ```

2. Or use the Railway dashboard to export data

### Scaling

Railway allows you to:
- **Vertical Scaling**: Upgrade to higher tier plans for more resources
- **Horizontal Scaling**: Use Railway's autoscaling features (available on paid plans)

Go to "Settings" → "Resources" to adjust resource allocation.

## Cost Optimization

1. **Development Environment**: Use Railway's free tier for development
2. **Production Environment**: Upgrade to paid plan with:
   - Proper resource limits
   - Custom domains
   - Better performance

3. **Database Optimization**:
   - Clean up old data regularly
   - Monitor connection pool usage
   - Use database indexes for frequently queried fields

## Custom Domains

To use your own domain (e.g., `sketch-bridge.com`):

1. Go to service settings
2. Navigate to "Networking"
3. Click "Add Custom Domain"
4. Follow Railway's instructions to update DNS records
5. Railway automatically provisions SSL certificates

## CI/CD

Railway automatically deploys when you push to your connected GitHub branch.

**To change deployment branch:**
1. Go to service settings
2. Navigate to "Source"
3. Select different branch

**To disable auto-deploy:**
1. Go to service settings
2. Navigate to "Source"
3. Toggle "Auto Deploy" off

## Alternative: Deploy All Services Together

If you prefer a single deployment:

1. Create a `railway.yaml` in project root:

```yaml
services:
  backend:
    root: socket
    buildCommand: cd ../common && npm install && npm run build && cd ../socket && npm install && npm run build
    startCommand: npm run start:prod
    variables:
      PORT: 3001
      NODE_ENV: production
  
  frontend:
    root: app
    buildCommand: cd ../common && npm install && npm run build && cd ../app && npm install && npm run build
    startCommand: npm run preview -- --host 0.0.0.0 --port $PORT
  
  database:
    plugin: postgresql
```

2. Deploy using Railway CLI:
   ```bash
   railway up
   ```

## Support

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Knex.js Documentation**: https://knexjs.org
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

## Next Steps

After successful deployment:

1. ✅ Set up monitoring and alerts
2. ✅ Configure custom domain
3. ✅ Set up automated backups
4. ✅ Implement proper error tracking (e.g., Sentry)
5. ✅ Set up CI/CD pipeline for testing before deployment
6. ✅ Document API endpoints for your team
7. ✅ Set up staging environment

---

**Happy Deploying! 🚀**

