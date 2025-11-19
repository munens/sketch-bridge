#!/bin/bash

echo "🔍 Testing Socket Server Connection..."
echo ""

echo "1️⃣  Checking if socket server is running..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Socket server is running"
    echo "   Response:"
    curl -s http://localhost:3001/health | jq . 2>/dev/null || curl -s http://localhost:3001/health
else
    echo "❌ Socket server is NOT running on port 3001"
    echo ""
    echo "👉 Start the socket server with:"
    echo "   cd socket && npm run dev"
    exit 1
fi

echo ""
echo "2️⃣  Checking if PostgreSQL is running..."
if pg_isready > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL is NOT running"
    echo ""
    echo "👉 Start PostgreSQL first"
    exit 1
fi

echo ""
echo "3️⃣  Checking database..."
if psql -lqt | cut -d \| -f 1 | grep -qw sketch_bridge_db; then
    echo "✅ Database 'sketch_bridge_db' exists"
else
    echo "❌ Database 'sketch_bridge_db' does NOT exist"
    echo ""
    echo "👉 Create it with:"
    echo "   createdb sketch_bridge_db"
    exit 1
fi

echo ""
echo "4️⃣  Checking if tables exist..."
TABLE_COUNT=$(psql -d sketch_bridge_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('canvases', 'canvas_objects', 'active_sessions');" 2>/dev/null | tr -d '[:space:]')

if [ "$TABLE_COUNT" = "3" ]; then
    echo "✅ All required tables exist"
else
    echo "⚠️  Only $TABLE_COUNT/3 tables exist"
    echo ""
    echo "👉 Run migrations:"
    echo "   cd socket && npx knex migrate:latest --knexfile knexfile.ts"
fi

echo ""
echo "5️⃣  Checking ports..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 3001 is in use (socket server)"
else
    echo "❌ Port 3001 is NOT in use"
    echo "   Socket server may not be running"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 5173 is in use (frontend app)"
else
    echo "⚠️  Port 5173 is NOT in use"
    echo "   Frontend app may not be running"
fi

echo ""
echo "6️⃣  Testing WebSocket connection..."
if command -v wscat > /dev/null 2>&1; then
    echo "Testing with wscat..."
    timeout 2 wscat -c ws://localhost:3001 --execute "test" 2>&1 | head -5
else
    echo "⚠️  wscat not installed (optional)"
    echo "   Install with: npm install -g wscat"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🚀 Your setup should be working."
echo ""
echo "If you still have issues, check the browser console:"
echo "   - Open DevTools (F12)"
echo "   - Go to Console tab"
echo "   - Look for [Socket] messages"

