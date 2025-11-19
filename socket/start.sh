#!/bin/bash

echo "🚀 Starting Socket Server for SketchBridge"
echo ""

cd "$(dirname "$0")"

check_postgres() {
    echo "🔍 Checking PostgreSQL..."
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL is not installed"
        echo "   Install with: brew install postgresql"
        exit 1
    fi
    
    if ! pg_isready &> /dev/null; then
        echo "❌ PostgreSQL is not running"
        echo ""
        echo "👉 Start PostgreSQL with:"
        echo "   brew services start postgresql"
        exit 1
    fi
    
    echo "✅ PostgreSQL is running"
}

check_database() {
    echo "🔍 Checking database..."
    if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw sketch_bridge_db; then
        echo "✅ Database 'sketch_bridge_db' exists"
    else
        echo "📦 Creating database 'sketch_bridge_db'..."
        createdb sketch_bridge_db 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ Database created"
        else
            echo "❌ Failed to create database"
            echo "   Try manually: createdb sketch_bridge_db"
            exit 1
        fi
    fi
}

setup_env() {
    echo "🔍 Checking .env file..."
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
        echo "✅ .env file created"
        echo ""
        echo "⚠️  Please update .env with your database credentials if needed"
    else
        echo "✅ .env file exists"
    fi
}

install_deps() {
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
        echo "✅ Dependencies installed"
    else
        echo "✅ Dependencies already installed"
    fi
}

run_migrations() {
    echo "🔍 Checking database tables..."
    TABLE_COUNT=$(psql -d sketch_bridge_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('canvases', 'canvas_objects', 'active_sessions');" 2>/dev/null | tr -d '[:space:]')
    
    if [ "$TABLE_COUNT" != "3" ]; then
        echo "🗄️  Running database migrations..."
        npx knex migrate:latest --knexfile knexfile.ts
        if [ $? -eq 0 ]; then
            echo "✅ Migrations completed"
        else
            echo "❌ Migration failed"
            exit 1
        fi
    else
        echo "✅ All database tables exist"
    fi
}

echo "🔧 Setting up Socket Server..."
echo ""

check_postgres
check_database
setup_env
install_deps
run_migrations

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting Socket Server..."
echo ""
echo "The server will run on http://localhost:3001"
echo "Press Ctrl+C to stop"
echo ""
echo "───────────────────────────────────────────"
echo ""

npm run dev

