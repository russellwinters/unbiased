# Database Setup Guide

This guide explains how to set up and manage the PostgreSQL database for the Unbiased V2 application.

## Quick Start

1. **Start the database:**
   ```bash
   docker compose up -d
   ```

2. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

3. **Apply migrations (if needed):**
   ```bash
   npm run db:migrate
   ```

4. **Verify the setup:**
   ```bash
   docker compose ps
   ```

## Database Configuration

The database is configured using Docker Compose with the following settings:

- **Database:** PostgreSQL 16 (Alpine Linux)
- **Container Name:** unbiased-postgres
- **Port:** 5432 (mapped to host)
- **Database Name:** unbiased
- **Username:** unbiased
- **Password:** unbiased_dev_password (for local development only)

### Environment Variables

The database connection is configured via the `DATABASE_URL` environment variable in `.env`:

```env
DATABASE_URL="postgresql://unbiased:unbiased_dev_password@localhost:5432/unbiased"
```

## Database Commands

All database commands are available as npm scripts:

### Generation & Migration

- **`npm run db:generate`** - Generate Prisma Client
  - Run this after any schema changes
  - Required before running the application

- **`npm run db:migrate`** - Create and apply migrations
  - Creates a new migration file
  - Applies pending migrations to the database
  - Generates Prisma Client automatically

- **`npm run db:push`** - Push schema changes without migrations
  - Useful for rapid prototyping
  - Skips creating migration files
  - Use `db:migrate` for production-ready changes

### Database Management

- **`npm run db:studio`** - Open Prisma Studio
  - Web-based GUI for viewing and editing data
  - Opens at http://localhost:5555

- **`npm run db:reset`** - Reset the database
  - **WARNING:** Drops all data
  - Reapplies all migrations from scratch
  - Useful for development/testing

## Docker Commands

### Start/Stop Database

```bash
# Start database (in background)
docker compose up -d

# Stop database
docker compose down

# Stop and remove volumes (deletes all data)
docker compose down -v
```

### View Logs

```bash
# View database logs
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f postgres
```

### Database Shell Access

```bash
# Connect to PostgreSQL shell
docker compose exec postgres psql -U unbiased -d unbiased

# Run a SQL command
docker compose exec postgres psql -U unbiased -d unbiased -c "SELECT * FROM \"Source\";"
```

## Database Schema

The database includes three main tables:

### Source
Stores news sources with bias ratings:
- `id` (UUID) - Primary key
- `name` - Source display name
- `domain` - Unique domain identifier
- `rssUrl` - RSS feed URL (optional)
- `biasRating` - Political bias rating
- `reliability` - Source reliability rating
- `createdAt`, `updatedAt` - Timestamps

### Article
Stores individual news articles:
- `id` (UUID) - Primary key
- `title` - Article headline
- `description` - Article summary
- `url` - Unique article URL
- `imageUrl` - Article image (optional)
- `publishedAt` - Publication timestamp
- `fetchedAt` - Fetch timestamp
- `sourceId` - Foreign key to Source
- `clusterId` - Foreign key to Cluster (optional)
- `keywords` - Array of keywords

### Cluster
Groups related articles covering the same story:
- `id` (UUID) - Primary key
- `topic` - Cluster topic/title
- `mainEntity` - Primary subject
- `firstSeenAt` - First appearance timestamp

## Troubleshooting

### Port 5432 Already in Use

If you have another PostgreSQL instance running:

```bash
# Stop other PostgreSQL services
sudo systemctl stop postgresql

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 on host

# Update DATABASE_URL accordingly
DATABASE_URL="postgresql://unbiased:unbiased_dev_password@localhost:5433/unbiased"
```

### Connection Refused

Ensure the database is running and healthy:

```bash
docker compose ps
docker compose logs postgres
```

Wait for the healthcheck to pass (may take 10-15 seconds on first start).

### Migration Conflicts

If you encounter migration conflicts:

```bash
# Reset and reapply all migrations
npm run db:reset

# Or manually resolve in prisma/migrations/
```

### Prisma Client Out of Sync

After schema changes, regenerate the client:

```bash
npm run db:generate
```

## Production Deployment

For production, use a managed PostgreSQL service:

- **Supabase** - Free tier with generous limits
- **Neon** - Serverless PostgreSQL
- **Railway** - Simple deployment platform
- **AWS RDS** - Enterprise-grade solution

Update the `DATABASE_URL` environment variable with your production connection string.

## Data Persistence

Database data is stored in a Docker volume named `v2_postgres_data`. This ensures data persists across container restarts.

To completely remove all data:

```bash
docker compose down -v
```

## Best Practices

1. **Always use migrations** - Use `npm run db:migrate` instead of `db:push` for schema changes
2. **Commit migrations** - Include migration files in version control
3. **Test migrations** - Test migrations in development before applying to production
4. **Backup data** - Regularly backup production databases
5. **Environment-specific configs** - Use different credentials for dev/staging/prod

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
