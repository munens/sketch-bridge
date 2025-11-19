# Sketch Bridge Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Railway Platform                          │
│                    (Production Environment)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────────┐    ┌──────────────┐
│  PostgreSQL  │      │     Backend      │    │   Frontend   │
│   Database   │◄─────│   (Socket.IO)    │◄───│   (React)    │
│              │      │                  │    │              │
│ Port: 5432   │      │  Port: $PORT     │    │ Port: $PORT  │
│              │      │  (Dynamic)       │    │ (Dynamic)    │
└──────────────┘      └──────────────────┘    └──────────────┘
       │                       │                       │
       │              ┌────────┴────────┐              │
       │              ▼                 ▼              │
       │     ┌─────────────┐   ┌─────────────┐        │
       │     │   Express   │   │ Socket.IO   │        │
       │     │  REST API   │   │  WebSocket  │        │
       │     └─────────────┘   └─────────────┘        │
       │              │                 │              │
       └──────────────┴─────────────────┴──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   common/dist/   │
                    │  Shared Types    │
                    └──────────────────┘
```

## Development vs Production

### Development Environment

```
Local Machine
│
├── app/                         (Dev Server: localhost:5173)
│   └── Imports: common/model/*.ts (TypeScript source)
│
├── socket/                      (Dev Server: localhost:3001)
│   └── Imports: common/model/*.ts (TypeScript source)
│
├── common/
│   └── model/*.ts              (TypeScript source)
│
└── PostgreSQL                   (localhost:5432)
```

**Characteristics:**
- Direct TypeScript imports
- Hot module replacement
- Fast iteration
- Local database

### Production Environment (Railway)

```
Railway Cloud
│
├── Frontend Service
│   └── app/dist/               (Static files)
│       └── Imports: ../common/dist/*.js
│
├── Backend Service
│   └── socket/dist/            (Node.js app)
│       └── Imports: ../common/dist/*.js
│
├── Common Module
│   └── common/dist/            (Compiled JavaScript)
│       └── model/*.js + *.d.ts
│
└── PostgreSQL Service          (Railway managed)
```

**Characteristics:**
- Compiled JavaScript
- Optimized bundles
- Production builds
- Managed database with SSL

## Build Pipeline

### Development Build

```
┌─────────────┐
│   Source    │
│  (*.ts)     │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   tsx/vite  │
│  On-the-fly │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Browser   │
│  /Node.js   │
└─────────────┘
```

### Production Build

```
Step 1: Build Common
┌──────────────────┐
│ common/model/*.ts│
└────────┬─────────┘
         │ tsc
         ▼
┌──────────────────┐
│ common/dist/*.js │
│ common/dist/*.d.ts│
└────────┬─────────┘
         │
         │
Step 2: Build Backend       Step 3: Build Frontend
         │                           │
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│  socket/src/*.ts │        │   app/src/*.tsx  │
└────────┬─────────┘        └────────┬─────────┘
         │ tsc                       │ vite build
         │ imports common/dist       │ imports common/dist
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│ socket/dist/*.js │        │   app/dist/*.*   │
└──────────────────┘        └──────────────────┘
```

## Data Flow

### User Interaction Flow

```
┌──────────┐
│  User 1  │
└─────┬────┘
      │ Draw on canvas
      ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ WebSocket: canvas:update
       ▼
┌──────────────┐
│   Backend    │
│  Socket.IO   │
└──────┬───────┘
       │ Save to DB
       ▼
┌──────────────┐
│  PostgreSQL  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │
│  Broadcast   │
└──────┬───────┘
       │ WebSocket: canvas:update
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│  User 1  │   │  User 2  │   │  User 3  │
└──────────┘   └──────────┘   └──────────┘
```

### AI Analysis Flow

```
┌──────────┐
│   User   │
└─────┬────┘
      │ Request AI analysis
      ▼
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ WebSocket: ai:analyze
       ▼
┌──────────────┐
│   Backend    │
│  AI Service  │
└──────┬───────┘
       │ HTTP: OpenAI API
       ▼
┌──────────────┐
│  OpenAI API  │
└──────┬───────┘
       │ Component suggestions
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ Save to DB
       ▼
┌──────────────┐
│  PostgreSQL  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │
└──────┬───────┘
       │ WebSocket: ai:result
       ▼
┌──────────────┐
│   Frontend   │
│  Display UI  │
└──────────────┘
```

## Database Schema

```
┌──────────────────────────────────────────┐
│              canvases                     │
├──────────────────────────────────────────┤
│ id (UUID) PK                             │
│ name (VARCHAR)                           │
│ created_by (VARCHAR)                     │
│ created_at (TIMESTAMP)                   │
│ updated_at (TIMESTAMP)                   │
└──────────────┬───────────────────────────┘
               │
               │ 1:N
               ▼
┌──────────────────────────────────────────┐
│          canvas_objects                   │
├──────────────────────────────────────────┤
│ id (UUID) PK                             │
│ canvas_id (UUID) FK → canvases.id       │
│ object_type (VARCHAR)                    │
│ properties (JSONB)                       │
│ image_data (TEXT)                        │
│ position_x (FLOAT)                       │
│ position_y (FLOAT)                       │
│ created_at (TIMESTAMP)                   │
│ updated_at (TIMESTAMP)                   │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│          active_sessions                  │
├──────────────────────────────────────────┤
│ id (UUID) PK                             │
│ canvas_id (UUID) FK → canvases.id       │
│ user_id (VARCHAR)                        │
│ session_data (JSONB)                     │
│ last_active (TIMESTAMP)                  │
│ created_at (TIMESTAMP)                   │
└──────────────────────────────────────────┘
```

## Module Dependencies

### Backend Modules

```
┌──────────────────┐
│  SocketApplication│
└────────┬─────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    ▼         ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Database│ │Express │ │Socket.IO│ │Modules │
└────────┘ └────────┘ └────────┘ └───┬────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              ┌──────────┐      ┌──────────┐     ┌──────────┐
              │AIModule  │      │SessionMod│     │CanvasMod │
              └──────────┘      └──────────┘     └────┬─────┘
                   │                  │                │
                   ▼                  ▼                ▼
              ┌──────────┐      ┌──────────┐     ┌──────────┐
              │AIService │      │SessionSvc│     │CanvasSvc │
              └────┬─────┘      └────┬─────┘     └────┬─────┘
                   │                  │                │
                   ▼                  ▼                ▼
              ┌──────────┐      ┌──────────┐     ┌──────────┐
              │   N/A    │      │SessionRep│     │CanvasRep │
              └──────────┘      └──────────┘     └────┬─────┘
                                                       │
                                                       ▼
                                                 ┌──────────┐
                                                 │  Knex.js │
                                                 └────┬─────┘
                                                      │
                                                      ▼
                                                 ┌──────────┐
                                                 │PostgreSQL│
                                                 └──────────┘
```

### Frontend Components

```
┌──────────────────┐
│      main.tsx    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  React Router    │
└────────┬─────────┘
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Start  │ │Canvas  │ │ Other  │
│ Page   │ │ Page   │ │ Pages  │
└────────┘ └───┬────┘ └────────┘
               │
    ┌──────────┼──────────┬──────────────┐
    ▼          ▼          ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Canvas   │ │Canvas   │ │  Canvas │ │ Canvas  │
│Context  │ │Renderer │ │ Toolbar │ │ Panels  │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
     │
     ├─ useSocket (WebSocket connection)
     ├─ useViewport (Canvas state)
     └─ useDrawingTool (Drawing logic)
```

## Network Architecture

```
                  Internet
                     │
                     ▼
┌────────────────────────────────────────────────┐
│          Railway Edge Network (CDN)            │
└────────┬───────────────────────────┬───────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐        ┌──────────────────┐
│  Frontend Domain │        │  Backend Domain  │
│  (Static Files)  │        │  (API + WS)      │
└──────────────────┘        └────────┬─────────┘
         │                           │
         │                           ▼
         │                  ┌──────────────────┐
         │                  │   Express Server │
         │                  ├──────────────────┤
         │                  │ REST Endpoints   │
         │                  └────────┬─────────┘
         │                           │
         └───────────┐      ┌────────┘
                     ▼      ▼
              ┌──────────────────┐
              │   Socket.IO      │
              │   (WebSocket)    │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              │   (Private)      │
              └──────────────────┘
```

## Security Layers

```
┌────────────────────────────────────────┐
│          User's Browser                 │
└──────────────┬─────────────────────────┘
               │ HTTPS/WSS
               ▼
┌────────────────────────────────────────┐
│       Railway Edge (SSL/TLS)           │
└──────────────┬─────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌─────────────┐ ┌─────────────┐
│  Frontend   │ │   Backend   │
│   Service   │ │   Service   │
└─────────────┘ └──────┬──────┘
                       │
                       │ CORS
                       │ Validation
                       │
                       ▼
                ┌─────────────┐
                │  PostgreSQL │
                │  (SSL/TLS)  │
                └─────────────┘

Security Measures:
✓ HTTPS/WSS encryption
✓ CORS protection
✓ SSL database connections
✓ Environment variable secrets
✓ Input validation
✓ Error message sanitization
```

## Deployment Process

```
┌──────────────┐
│   Local Dev  │
│   git push   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   GitHub     │
│  Repository  │
└──────┬───────┘
       │ Webhook
       ▼
┌──────────────────────────────────┐
│         Railway Platform          │
├──────────────────────────────────┤
│  1. Detect changes               │
│  2. Clone repository             │
│  3. Run nixpacks build           │
│     a. Build common              │
│     b. Build service             │
│  4. Create container image       │
│  5. Deploy to edge network       │
│  6. Health check                 │
│  7. Route traffic                │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│      Live Application             │
│   https://your-app.railway.app   │
└──────────────────────────────────┘
```

## Scaling Strategy

### Horizontal Scaling (Railway Pro)

```
                Load Balancer
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Backend 1      Backend 2      Backend 3
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
                 PostgreSQL
              (Single Instance)
```

### Vertical Scaling

```
Standard:          Pro:              Enterprise:
CPU: 0.5         CPU: 2             CPU: 8+
RAM: 512MB       RAM: 4GB           RAM: 32GB+
```

## Monitoring & Logging

```
┌──────────────┐
│ Application  │
└──────┬───────┘
       │
       ├─ Winston Logger
       │       │
       │       ├─ Console (stdout/stderr)
       │       └─ File (logs/*.log)
       │
       └─ Railway Metrics
               │
               ├─ CPU Usage
               ├─ Memory Usage
               ├─ Network Traffic
               ├─ Response Times
               └─ Error Rates
                       │
                       ▼
               ┌──────────────┐
               │   Railway    │
               │  Dashboard   │
               └──────────────┘
```

---

For deployment instructions, see:
- [QUICK_START.md](./QUICK_START.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [RAILWAY_SETUP_SUMMARY.md](./RAILWAY_SETUP_SUMMARY.md)

