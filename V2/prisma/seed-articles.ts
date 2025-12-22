import 'dotenv/config'; // Load environment variables from .env file
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { getAllSources } from '../lib/news/rss-sources';
import { parseMultipleFeeds } from '../lib/news/rss-parser';

// Prisma 7 requires an adapter for database connections
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Target number of articles to fetch
const TARGET_ARTICLES = 500;

async function seedArticles() {
  console.log('🌱 Seeding articles from RSS feeds...');
  console.log(`📰 Target: ${TARGET_ARTICLES} articles\n`);

  // First, ensure we have sources in the database
  const dbSources = await prisma.source.findMany();
  
  if (dbSources.length === 0) {
    console.error('❌ No sources found in database. Please run seed-sources first.');
    process.exit(1);
  }

  console.log(`✅ Found ${dbSources.length} sources in database`);

  // Create a map of source names to source IDs
  const sourceMap = new Map(
    dbSources.map(source => [source.name.toLowerCase(), source.id])
  );

  // Fetch articles from RSS feeds
  console.log('\n📡 Fetching articles from RSS feeds...');
  const rssSources = getAllSources();
  const { articles: fetchedArticles, errors } = await parseMultipleFeeds(rssSources);

  if (errors.length > 0) {
    console.log('\n⚠️  Some feeds failed:');
    errors.forEach(err => console.log(`   - ${err.sourceName}: ${err.error}`));
  }

  console.log(`\n📥 Fetched ${fetchedArticles.length} articles from RSS feeds`);

  // Limit to target number, taking most recent articles
  const articlesToSeed = fetchedArticles.slice(0, TARGET_ARTICLES);
  console.log(`🎯 Processing ${articlesToSeed.length} articles for seeding\n`);

  let created = 0;
  let skipped = 0;
  let errors_count = 0;

  for (const article of articlesToSeed) {
    try {
      // Find the source ID from our database
      const sourceId = sourceMap.get(article.source.name.toLowerCase());
      
      if (!sourceId) {
        console.error(`⚠️  Source not found in database: ${article.source.name}`);
        errors_count++;
        continue;
      }

      // Check if article already exists by URL (deduplication)
      const existing = await prisma.article.findUnique({
        where: { url: article.url }
      });

      if (existing) {
        skipped++;
        if (skipped <= 5) {
          console.log(`⏭️  Skipping: ${article.title.substring(0, 60)}...`);
        }
        continue;
      }

      // Create new article
      await prisma.article.create({
        data: {
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt,
          sourceId,
          keywords: [] // Empty for now, can be populated later
        }
      });

      created++;
      if (created <= 10 || created % 50 === 0) {
        console.log(`✅ [${created}] ${article.source.name}: ${article.title.substring(0, 60)}...`);
      }
    } catch (error) {
      errors_count++;
      if (errors_count <= 5) {
        console.error(`❌ Error creating article "${article.title.substring(0, 40)}...":`, error);
      }
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped, ${errors_count} errors`);
}

async function main() {
  try {
    await seedArticles();
  } catch (error) {
    console.error('❌ Error seeding articles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
