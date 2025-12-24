# Database Setup Documentation

## Overview

This document describes the database initialization setup for Unbiased V2, including Docker Compose configuration, database migrations, and seed scripts with deduplication.

## Architecture

### Prisma 7 Configuration

Unbiased V2 uses Prisma 7, which has a different architecture than previous versions:

- **prisma.config.ts**: Configuration file that specifies database URL and migration paths
- **schema.prisma**: Database schema definition (no longer contains datasource URL)
- **Database Adapter**: Prisma 7 requires a database adapter (@prisma/adapter-pg) for PostgreSQL connections

### Database Schema

The database includes three main models:

1. **Source**: News sources with bias ratings and reliability scores
2. **Article**: Individual news articles with deduplication by URL
3. **Cluster**: Groups of related articles (for future story clustering feature)

## Docker Setup

### docker-compose.yml

Provides a local PostgreSQL 16 instance:
- Container name: `unbiased-postgres`
- Port: 5432
- Database: unbiased
- User: unbiased
- Password: unbiased_dev_password
- Persistent volume: `postgres_data`

### Commands

```bash
# Start database
docker compose up -d

# Stop database
docker compose down

# Stop and remove data
docker compose down -v

# View logs
docker compose logs -f postgres
```

## Seed Scripts

### 1. seed-sources.ts

Seeds news sources into the database with:
- Bias ratings (left, lean-left, center, lean-right, right)
- Reliability ratings (very-high, high, mixed, low)
- RSS feed URLs
- **Deduplication by domain**: Skips sources that already exist

Reliability ratings are based on Media Bias Fact Check and similar sources.

### 2. seed-articles.ts

Fetches articles from RSS feeds and seeds them:
- Fetches from all configured RSS sources
- Targets 100-500 recent articles
- **Deduplication by URL**: Skips articles that already exist
- Links articles to their sources
- Handles network errors gracefully

**Note**: This script requires network access to RSS feeds and may fail in restricted environments.

### 3. seed-mock-articles.ts

Seeds mock articles for testing:
- Creates 25 sample articles across all bias categories
- Useful when RSS feeds are blocked (CI, sandboxed environments)
- **Deduplication by URL**: Uses unique URLs per article
- Covers all 15 configured sources

### 4. seed.ts

Orchestrates the complete seeding process:
1. Seeds sources
2. Seeds articles from RSS feeds

## Database Initialization

### Quick Start

```bash
# Complete setup (Docker + migrations + seeds)
npm run db:init
```

This runs the `scripts/init-db.sh` script which:
1. Checks environment configuration
2. Generates Prisma Client
3. Runs migrations
4. Seeds sources and articles

### Manual Setup

```bash
# 1. Start Docker database
docker compose up -d

# 2. Copy environment variables
cp .env.example .env

# 3. Generate Prisma Client
npx prisma generate

# 4. Run migrations
npx prisma migrate deploy

# 5. Seed sources
npm run db:seed:sources

# 6. Seed articles (real RSS feeds)
npm run db:seed:articles

# OR: Seed mock articles (for testing)
npm run db:seed:mock
```

## Deduplication

### Sources
- **Key**: Domain (extracted from RSS URL)
- **Behavior**: Skips insertion if domain already exists
- **Why**: Prevents duplicate sources when re-running seed script

### Articles
- **Key**: URL (article URL from RSS feed)
- **Behavior**: Skips insertion if URL already exists
- **Why**: Prevents duplicate articles when fetching updates

## npm Scripts

```bash
# Database initialization
npm run db:init          # Complete setup with Docker check

# Migrations
npm run db:migrate       # Run migrations in dev mode

# Seeding
npm run db:seed          # Seed sources + articles
npm run db:seed:sources  # Seed sources only
npm run db:seed:articles # Seed articles from RSS feeds
npm run db:seed:mock     # Seed mock articles (25 samples)

# Management
npm run db:studio        # Open Prisma Studio GUI
npm run db:reset         # Reset database (drop, migrate, seed)
```

## Troubleshooting

### "Connection refused" error
- Ensure Docker is running: `docker ps`
- Check PostgreSQL container status: `docker compose ps`
- Verify DATABASE_URL in .env file

### "client password must be a string" error
- Ensure .env file exists and contains DATABASE_URL
- Verify dotenv is loaded at the top of seed scripts

### "RSS feeds blocked" or network errors
- Use mock seeding instead: `npm run db:seed:mock`
- RSS feeds may be blocked in CI/restricted environments

### Prisma Client errors
- Regenerate client: `npx prisma generate`
- Check prisma.config.ts configuration
- Ensure @prisma/adapter-pg is installed

## Environment Variables

Required in `.env` file:

```env
DATABASE_URL="postgresql://unbiased:unbiased_dev_password@localhost:5432/unbiased"
```

The Docker Compose setup uses these default credentials. For production, use a strong password and secure connection.

## Migrations

Migrations are stored in `prisma/migrations/` and include:

- `20251222194024_init/`: Initial schema creation (Source, Article, Cluster models)

To create new migrations:

```bash
# After modifying schema.prisma
npx prisma migrate dev --name descriptive_name
```

## Production Deployment

For production:

1. Use a managed PostgreSQL service (e.g., Neon, Supabase, RDS)
2. Update DATABASE_URL with production credentials
3. Run migrations: `npx prisma migrate deploy`
4. Seed sources: `npm run db:seed:sources`
5. Schedule RSS fetching with a cron job or serverless function

## Testing the Setup

Verify database setup:

```bash
# Check record counts
npx tsx -e "
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  const sources = await prisma.source.count();
  const articles = await prisma.article.count();
  console.log('Sources:', sources);
  console.log('Articles:', articles);
  await prisma.\$disconnect();
})();
"

# Expected output:
# Sources: 15
# Articles: 25 (if using mock) or 100-500 (if using RSS)
```
