#!/bin/bash

# Database initialization script for Unbiased V2
# This script sets up the database with migrations and seed data

set -e  # Exit on error

echo "🚀 Initializing Unbiased V2 Database..."
echo "════════════════════════════════════════"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables from .env file
if [ -f .env ]; then
    # Use set -a to automatically export all variables
    set -a
    source .env
    set +a
    echo -e "${GREEN}✅ Loaded .env file${NC}"
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create a .env file (copy from .env.example)"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set it in your .env file"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL is configured${NC}\n"

# Check if dotenv is available (critical for Prisma config)
if ! node -e "require('dotenv')" 2>/dev/null; then
    echo -e "${RED}❌ Error: Required dependencies not found${NC}"
    echo "Please run 'npm install' from the repository root first"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies available${NC}\n"

# Check if Docker is running (if using local setup)
if command -v docker &> /dev/null && docker ps &> /dev/null; then
    echo -e "${GREEN}✅ Docker is running${NC}"
    
    # Check if postgres container is running
    if docker ps | grep -q unbiased-postgres; then
        echo -e "${GREEN}✅ PostgreSQL container is running${NC}\n"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL container is not running${NC}"
        echo -e "${YELLOW}   Run 'docker compose up -d' to start it${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found or not running${NC}"
    echo -e "${YELLOW}   Make sure your DATABASE_URL points to a running PostgreSQL instance${NC}\n"
fi

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}\n"

# Step 2: Run migrations
echo "🗄️  Step 2: Running database migrations..."
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations completed${NC}\n"

# Step 3: Seed database
echo "🌱 Step 3: Seeding database..."
npx tsx prisma/seed.ts
echo -e "${GREEN}✅ Database seeded${NC}\n"

# Done!
echo "════════════════════════════════════════"
echo -e "${GREEN}✨ Database initialization complete!${NC}\n"
echo "📊 To view your data, run: npx prisma studio"
echo "🔍 To check database: npx prisma db pull"
