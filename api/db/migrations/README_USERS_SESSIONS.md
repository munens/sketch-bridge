# Users-Sessions Many-to-Many Relationship

## Overview

This document describes the many-to-many relationship between `users` and `sessions` tables.

## Database Schema

### Tables

1. **users** (Primary Table)
   - `id` (UUID, PK)
   - `name` (VARCHAR)
   - `email` (VARCHAR, UNIQUE)
   - `createdAt` (TIMESTAMP)
   - `updatedAt` (TIMESTAMP)
   - `deletedAt` (TIMESTAMP, nullable)

2. **sessions** (Primary Table)
   - `id` (UUID, PK)
   - `name` (VARCHAR, nullable)
   - `center_latitude` (DECIMAL)
   - `center_longitude` (DECIMAL)
   - `bbox_min_latitude` (DECIMAL)
   - `bbox_max_latitude` (DECIMAL)
   - `bbox_min_longitude` (DECIMAL)
   - `bbox_max_longitude` (DECIMAL)
   - `createdAt` (TIMESTAMP)
   - `updatedAt` (TIMESTAMP)
   - `deletedAt` (TIMESTAMP, nullable)

3. **users_sessions** (Junction Table)
   - `id` (UUID, PK)
   - `userId` (UUID, FK → users.id)
   - `sessionId` (UUID, FK → sessions.id)
   - `createdAt` (TIMESTAMP)
   - `updatedAt` (TIMESTAMP)
   - `deletedAt` (TIMESTAMP, nullable)
   - **UNIQUE** constraint on (`userId`, `sessionId`)

### Foreign Keys

- `users_sessions.userId` → `users.id` (CASCADE on DELETE and UPDATE)
- `users_sessions.sessionId` → `sessions.id` (CASCADE on DELETE and UPDATE)

### Indexes

- `idx_users_email` on `users(email)`
- `idx_sessions_center` on `sessions(center_latitude, center_longitude)`
- `idx_sessions_name` on `sessions(name)`
- `idx_users_sessions_userId` on `users_sessions(userId)`
- `idx_users_sessions_sessionId` on `users_sessions(sessionId)`
- `idx_users_sessions_composite` on `users_sessions(userId, sessionId)`

## Migration Order

Migrations must be run in this order:

1. `20221203190939_create_users.ts` - Creates `users` table
2. `20230623231334_create_sessions.ts` - Creates `sessions` table
3. `20231116_create_users_sessions.ts` - Creates junction table with foreign keys

## Running Migrations

```bash
cd api
npm run knex migrate:latest
```

To rollback:
```bash
npm run knex migrate:rollback
```

## Usage Examples

### Add a User to a Session

```typescript
import { addUserToSession } from './user-session/repository';
import { getDatabase } from './database-config';

const db = getDatabase();
await addUserToSession(db, userId, sessionId);
```

### Get All Sessions for a User

```typescript
import { getUserSessions } from './user-session/repository';

const sessions = await getUserSessions(db, userId);
```

### Get All Users in a Session

```typescript
import { getSessionUsers } from './user-session/repository';

const users = await getSessionUsers(db, sessionId);
```

### Check if User is in Session

```typescript
import { isUserInSession } from './user-session/repository';

const isMember = await isUserInSession(db, userId, sessionId);
```

### Remove User from Session (Soft Delete)

```typescript
import { removeUserFromSession } from './user-session/repository';

await removeUserFromSession(db, userId, sessionId);
```

### Get Sessions with User Counts

```typescript
import { getSessionsWithUserCounts } from './user-session/repository';

const sessionsWithCounts = await getSessionsWithUserCounts(db);
// Returns: [{ ...sessionData, userCount: 5 }, ...]
```

## TypeScript Models

All TypeScript interfaces are available in:
- `src/model/user-session/user-session.ts`
- `src/model/user-session/session.ts`

Example:
```typescript
import { UserSession, Session } from './model/user-session';
```

## Relationship Behavior

- **CASCADE DELETE**: If a user or session is deleted, all related entries in `users_sessions` are automatically deleted
- **UNIQUE CONSTRAINT**: A user cannot join the same session twice
- **SOFT DELETES**: Use `deletedAt` for soft deletion (recommended)

## Notes

- All IDs use UUID v4 for universal uniqueness
- Timestamps are stored with timezone support
- Geographic coordinates use DECIMAL(10,8) for latitude and DECIMAL(11,8) for longitude
- All queries respect soft deletes (filter by `deletedAt IS NULL`)

