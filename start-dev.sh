#!/bin/bash

echo "🚀 Starting SketchBridge Development Environment"
echo ""

check_postgres() {
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL is not installed"
        exit 1
    fi
    
    if ! pg_isready &> /dev/null; then
        echo "❌ PostgreSQL is not running"
        echo "Please start PostgreSQL and try again"
        exit 1
    fi
    
    echo "✅ PostgreSQL is running"
}

check_database() {
    if psql -lqt | cut -d \| -f 1 | grep -qw sketch_bridge_db; then
        echo "✅ Database 'sketch_bridge_db' exists"
    else
        echo "📦 Creating database 'sketch_bridge_db'..."
        createdb sketch_bridge_db
        echo "✅ Database created"
    fi
}

setup_socket() {
    echo ""
    echo "📦 Setting up Socket Server..."
    cd socket
    
    if [ ! -f ".env" ]; then
        echo "⚠️  .env file not found. Creating from .env.example..."
        cp .env.example .env
        echo "✅ .env file created"
    fi
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    echo "🗄️  Running database migrations..."
    npx knex migrate:latest --knexfile knexfile.ts
    
    cd ..
}

echo "🔍 Checking prerequisites..."
check_postgres
check_database
setup_socket

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Starting servers..."
echo "  - Socket Server: http://localhost:3001"
echo "  - Frontend App: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

trap 'kill 0' EXIT

(cd socket && npm run dev) &
SOCKET_PID=$!

sleep 3

(cd app && npm run dev) &
APP_PID=$!

wait

