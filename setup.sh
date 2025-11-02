#!/bin/bash

echo "🚀 Finanças+ Setup Script"
echo "========================="
echo ""

# Fix npm cache
echo "Step 1: Fixing npm cache permissions..."
sudo chown -R 2121835035:1252520259 "/Users/ctw02526/.npm"
echo "✅ npm cache fixed"
echo ""

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Step 2: Installing Docker Desktop..."
    brew install --cask docker
    echo "✅ Docker installed"
    echo ""
    echo "⚠️  Please start Docker Desktop from Applications and wait for it to start"
    echo "   Then press any key to continue..."
    read -n 1
else
    echo "Step 2: Docker already installed ✅"
fi

# Install backend dependencies
echo ""
echo "Step 3: Installing backend dependencies..."
cd server
npm install
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Start PostgreSQL
echo "Step 4: Starting PostgreSQL database..."
docker compose up -d
echo "⏳ Waiting for database to initialize (10 seconds)..."
sleep 10
echo "✅ Database started"
echo ""

# Check database
echo "Step 5: Verifying database..."
docker compose logs postgres | tail -5
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. In one terminal: cd server && npm run dev"
echo "2. In another terminal: npm run dev"
echo "3. Open http://localhost:8081/"
echo ""
echo "To stop database: docker compose down"
