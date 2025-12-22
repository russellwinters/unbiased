import 'dotenv/config'; // Load environment variables from .env file
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Prisma 7 requires an adapter for database connections
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runSeedScript(scriptName: string, allowFailure = false) {
  console.log(`\n🚀 Running ${scriptName}...`);
  const scriptPath = join(__dirname, scriptName);
  
  try {
    execSync(`npx tsx ${scriptPath}`, {
      stdio: 'inherit',
      cwd: join(__dirname, '..')
    });
    console.log(`✅ ${scriptName} completed successfully\n`);
    return true;
  } catch (error) {
    if (allowFailure) {
      console.warn(`⚠️  ${scriptName} failed, but continuing...\n`);
      return false;
    } else {
      console.error(`❌ Error running ${scriptName}:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log('🌱 Starting database seed process...\n');
  console.log('═'.repeat(50));

  try {
    // First, seed sources
    await runSeedScript('seed-sources.ts');

    // Then, try to seed articles from RSS feeds
    console.log('\n📡 Attempting to fetch articles from RSS feeds...');
    const rssSuccess = await runSeedScript('seed-articles.ts', true);
    
    // If RSS seeding failed, use mock articles
    if (!rssSuccess) {
      console.log('\n⚠️  RSS feeds unavailable. Using mock articles for testing...');
      await runSeedScript('seed-mock-articles.ts');
    }

    console.log('═'.repeat(50));
    console.log('\n✨ Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Seed process failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
