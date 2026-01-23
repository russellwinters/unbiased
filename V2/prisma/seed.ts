import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from 'dotenv';
import { getAllSources, parseMultipleFeeds, ParsedArticle, RSSSource, getReliability, extractDomain, extractKeywords } from '@/lib/news';

config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  const rssSources = getAllSources() as RSSSource[];
  console.log(`📰 Found ${rssSources.length} RSS sources`);

  console.log('📡 Fetching articles from RSS feeds...');
  const { articles, errors } = await parseMultipleFeeds(rssSources);

  if (errors.length > 0) {
    console.log(`⚠️  Encountered ${errors.length} errors while fetching feeds:`);
  }

  console.log(`📄 Fetched ${articles.length} total articles`);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const recentArticles = (articles as ParsedArticle[]).filter(article =>
    article.publishedAt >= oneDayAgo
  );

  console.log(`🕒 Filtered to ${recentArticles.length} articles from the past 24 hours`);

  const articlesToSeed = recentArticles.slice(0, 500);
  console.log(`📊 Limiting to ${articlesToSeed.length} articles for seeding`);

  console.log('💾 Creating/updating sources...');
  const sourceMap = new Map<string, string>(); // sourceName -> sourceId

  for (const rssSource of rssSources) {
    const domain = extractDomain(rssSource.url);

    const source = await prisma.source.upsert({
      where: { domain },
      update: {
        name: rssSource.name,
        rssUrl: rssSource.url,
        biasRating: rssSource.biasRating,
        reliability: getReliability(rssSource.biasRating),
      },
      create: {
        name: rssSource.name,
        domain,
        rssUrl: rssSource.url,
        biasRating: rssSource.biasRating,
        reliability: getReliability(rssSource.biasRating),
      },
    });

    sourceMap.set(rssSource.name, source.id);
  }

  console.log(`✅ Created/updated ${sourceMap.size} sources`);

  console.log('📝 Creating articles...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const article of articlesToSeed) {
    const sourceId = sourceMap.get(article.source.name);

    if (!sourceId) {
      console.log(`⚠️  Skipping article - source not found: ${article.source.name}`);
      skippedCount++;
      continue;
    }

    try {
      await prisma.article.upsert({
        where: { url: article.url },
        update: {
          title: article.title,
          description: article.description,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt,
          keywords: extractKeywords(article.title, article.description),
        },
        create: {
          title: article.title,
          description: article.description,
          url: article.url,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt,
          sourceId,
          keywords: extractKeywords(article.title, article.description),
        },
      });

      createdCount++;
    } catch (error) {
      console.error(`❌ Error creating article "${article.title}":`, error);
      skippedCount++;
    }
  }

  console.log(`✅ Created/updated ${createdCount} articles`);
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped ${skippedCount} articles`);
  }

  console.log('\n🎉 Seed completed!');
  console.log(`   Sources: ${sourceMap.size}`);
  console.log(`   Articles: ${createdCount}`);
  console.log(`   Time: ${new Date().toLocaleString()}`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
