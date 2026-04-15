/**
 * Seed script to populate database with mock articles for pagination testing
 * This creates 150+ articles to test pagination functionality
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { mockArticles } from '../lib/news/mock-data';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Starting mock data seed...');

  // Create sources
  const sources = new Map();
  for (const article of mockArticles) {
    if (!sources.has(article.source.name)) {
      sources.set(article.source.name, article.source);
    }
  }

  console.log(`📊 Creating ${sources.size} sources...`);

  for (const [name, source] of sources) {
    await prisma.source.upsert({
      where: { domain: name.toLowerCase().replace(/\s+/g, '-') + '.com' },
      update: {
        name,
        biasRating: source.biasRating,
        reliability: 'high', // default value
      },
      create: {
        name,
        domain: name.toLowerCase().replace(/\s+/g, '-') + '.com',
        biasRating: source.biasRating,
        reliability: 'high',
      },
    });
  }

  console.log(`📝 Creating ${mockArticles.length} articles...`);

  let createdCount = 0;
  for (const article of mockArticles) {
    const source = await prisma.source.findFirst({
      where: { name: article.source.name },
    });

    if (!source) {
      console.error(`Source not found for: ${article.source.name}`);
      continue;
    }

    await prisma.article.upsert({
      where: { url: article.url },
      update: {
        title: article.title,
        description: article.description,
        imageUrl: article.imageUrl,
        publishedAt: article.publishedAt,
      },
      create: {
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.imageUrl,
        publishedAt: article.publishedAt,
        sourceId: source.id,
        keywords: [],
      },
    });
    createdCount++;
  }

  console.log(`✅ Created/updated ${createdCount} articles`);
  console.log('🎉 Mock data seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
