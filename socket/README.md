# SketchBridge Socket Server

Real-time WebSocket server for canvas collaboration using Socket.IO.

## Architecture

```
src/
├── model/
│   ├── base/           # Base classes (Controller, Service, Repository, Module)
│   └── errors/         # Error classes
├── canvas/             # Canvas module (state management)
├── session/            # Session module (user presence)
├── middleware/         # Logging and utilities
├── app.ts              # Socket application
└── server.ts           # Entry point
```

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Database Migrations

```bash
npx knex migrate:make create_canvases --knexfile knexfile.ts
npx knex migrate:latest --knexfile knexfile.ts
```

