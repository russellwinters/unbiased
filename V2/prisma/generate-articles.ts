/**
 * Script to generate additional mock articles for pagination testing
 * Creates 100+ articles with varied sources and dates
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

const sources = [
  { name: 'The Guardian', biasRating: 'left', domain: 'theguardian.com' },
  { name: 'The New York Times', biasRating: 'lean-left', domain: 'nytimes.com' },
  { name: 'Bloomberg', biasRating: 'center', domain: 'bloomberg.com' },
  { name: 'Wall Street Journal', biasRating: 'lean-right', domain: 'wsj.com' },
  { name: 'Fox News', biasRating: 'right', domain: 'foxnews.com' },
  { name: 'NPR', biasRating: 'lean-left', domain: 'npr.org' },
  { name: 'BBC News', biasRating: 'center', domain: 'bbc.com' },
  { name: 'Reuters', biasRating: 'center', domain: 'reuters.com' },
];

const topics = [
  'Technology', 'Politics', 'Economy', 'Climate', 'Health', 'Education',
  'Science', 'Sports', 'Entertainment', 'Business', 'International',
  'Local News', 'Culture', 'Environment', 'Transportation'
];

const templates = [
  'Breaking: Major Development in {topic}',
  '{topic} Sector Sees Unprecedented Growth',
  'New Report Highlights {topic} Challenges',
  'Experts Discuss Future of {topic}',
  '{topic} Policy Changes Announced',
  'Innovation in {topic} Transforms Industry',
  '{topic} Summit Reaches Key Agreement',
  'Study Reveals {topic} Trends',
  'Leaders Address {topic} Concerns',
  '{topic} Breakthrough Announced Today',
];

async function main() {
  console.log('🌱 Generating additional mock articles...');

  // Ensure sources exist
  for (const source of sources) {
    await prisma.source.upsert({
      where: { domain: source.domain },
      update: { name: source.name, biasRating: source.biasRating },
      create: {
        name: source.name,
        domain: source.domain,
        biasRating: source.biasRating,
        reliability: 'high',
      },
    });
  }

  console.log('✅ Sources ready');

  // Generate 120 articles
  const targetCount = 120;
  let created = 0;

  for (let i = 0; i < targetCount; i++) {
    const source = sources[i % sources.length];
    const topic = topics[i % topics.length];
    const template = templates[i % templates.length];
    const title = template.replace('{topic}', topic);
    
    // Create dates spread over the last 7 days
    const daysAgo = Math.floor(i / 20);
    const hoursAgo = (i % 20) * 1.2;
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - daysAgo);
    publishedAt.setHours(publishedAt.getHours() - Math.floor(hoursAgo));

    const sourceRecord = await prisma.source.findUnique({
      where: { domain: source.domain },
    });

    if (!sourceRecord) continue;

    const url = `https://${source.domain}/articles/${topic.toLowerCase().replace(/\s+/g, '-')}-${i}`;
    
    await prisma.article.upsert({
      where: { url },
      update: {},
      create: {
        title,
        description: `Latest developments and analysis on ${topic.toLowerCase()} from industry experts and leaders.`,
        url,
        imageUrl: `https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=${topic}`,
        publishedAt,
        sourceId: sourceRecord.id,
        keywords: [topic.toLowerCase()],
      },
    });
    created++;
  }

  const totalArticles = await prisma.article.count();
  console.log(`✅ Created ${created} new articles`);
  console.log(`📊 Total articles in database: ${totalArticles}`);
  console.log('🎉 Generation completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
