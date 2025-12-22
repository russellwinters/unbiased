import { PrismaClient } from '@prisma/client';
import { rssSources } from '../lib/news/rss-sources';

const prisma = new PrismaClient();

// Reliability ratings based on media bias fact check and similar sources
const reliabilityRatings: Record<string, string> = {
  // Left
  'the-guardian': 'high',
  'nbc-news': 'high',
  'huffington-post': 'mixed',
  
  // Lean-left
  'npr': 'very-high',
  'the-new-york-times': 'high',
  'washington-post': 'high',
  
  // Center
  'bbc-news': 'very-high',
  'bloomberg': 'high',
  'axios': 'high',
  
  // Lean-right
  'wall-street-journal': 'high',
  'the-hill': 'high',
  'washington-times': 'mixed',
  
  // Right
  'fox-news': 'mixed',
  'breitbart': 'low',
  'the-daily-wire': 'mixed'
};

// Extract domain from RSS URL or source name
function extractDomain(sourceKey: string, url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    // If URL parsing fails, derive from source key
    return sourceKey.replace(/-/g, '') + '.com';
  }
}

async function seedSources() {
  console.log('🌱 Seeding sources...');
  
  let created = 0;
  let skipped = 0;

  for (const [key, source] of Object.entries(rssSources)) {
    const domain = extractDomain(key, source.url);
    const reliability = reliabilityRatings[key] || 'mixed';

    try {
      // Check if source already exists by domain (deduplication)
      const existing = await prisma.source.findUnique({
        where: { domain }
      });

      if (existing) {
        console.log(`⏭️  Skipping ${source.name} (already exists)`);
        skipped++;
        continue;
      }

      // Create new source
      await prisma.source.create({
        data: {
          name: source.name,
          domain,
          rssUrl: source.url,
          biasRating: source.biasRating,
          reliability
        }
      });

      console.log(`✅ Created source: ${source.name} (${source.biasRating}, ${reliability})`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating source ${source.name}:`, error);
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);
}

async function main() {
  try {
    await seedSources();
  } catch (error) {
    console.error('❌ Error seeding sources:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
