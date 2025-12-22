import 'dotenv/config'; // Load environment variables from .env file
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Prisma 7 requires an adapter for database connections
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mock articles data for testing
const mockArticles = [
  // Left sources
  { title: "Climate Summit Reaches Historic Agreement", source: "The Guardian", publishedAt: new Date('2024-12-20T10:00:00Z') },
  { title: "New Healthcare Bill Passes Senate", source: "NBC News", publishedAt: new Date('2024-12-20T11:00:00Z') },
  { title: "Education Reform Gains Bipartisan Support", source: "Huffington Post", publishedAt: new Date('2024-12-20T12:00:00Z') },
  { title: "Tech Giants Face New Regulations", source: "The Guardian", publishedAt: new Date('2024-12-21T09:00:00Z') },
  { title: "Immigration Policy Reform Proposed", source: "NBC News", publishedAt: new Date('2024-12-21T10:00:00Z') },
  
  // Lean-left sources
  { title: "Economic Recovery Shows Promising Signs", source: "NPR", publishedAt: new Date('2024-12-20T13:00:00Z') },
  { title: "Supreme Court Weighs Major Case", source: "The New York Times", publishedAt: new Date('2024-12-20T14:00:00Z') },
  { title: "Infrastructure Bill Implementation Begins", source: "Washington Post", publishedAt: new Date('2024-12-20T15:00:00Z') },
  { title: "Labor Market Remains Strong", source: "NPR", publishedAt: new Date('2024-12-21T11:00:00Z') },
  { title: "Foreign Policy Shift Announced", source: "The New York Times", publishedAt: new Date('2024-12-21T12:00:00Z') },
  
  // Center sources
  { title: "Markets React to Fed Decision", source: "BBC News", publishedAt: new Date('2024-12-20T16:00:00Z') },
  { title: "Energy Prices Stabilize", source: "Bloomberg", publishedAt: new Date('2024-12-20T17:00:00Z') },
  { title: "International Trade Deal Signed", source: "Axios", publishedAt: new Date('2024-12-20T18:00:00Z') },
  { title: "Global Markets Show Mixed Results", source: "BBC News", publishedAt: new Date('2024-12-21T13:00:00Z') },
  { title: "Cryptocurrency Regulation Debate", source: "Bloomberg", publishedAt: new Date('2024-12-21T14:00:00Z') },
  
  // Lean-right sources
  { title: "Tax Reform Proposal Unveiled", source: "Wall Street Journal", publishedAt: new Date('2024-12-20T19:00:00Z') },
  { title: "Defense Budget Negotiations Continue", source: "The Hill", publishedAt: new Date('2024-12-20T20:00:00Z') },
  { title: "Border Security Measures Debated", source: "The Washington Times", publishedAt: new Date('2024-12-20T21:00:00Z') },
  { title: "Business Leaders Call for Policy Changes", source: "Wall Street Journal", publishedAt: new Date('2024-12-21T15:00:00Z') },
  { title: "Congressional Hearing on Energy Policy", source: "The Hill", publishedAt: new Date('2024-12-21T16:00:00Z') },
  
  // Right sources
  { title: "Conservative Policy Agenda Advances", source: "Fox News", publishedAt: new Date('2024-12-20T22:00:00Z') },
  { title: "Second Amendment Rights Under Review", source: "Breitbart", publishedAt: new Date('2024-12-20T23:00:00Z') },
  { title: "Government Overreach Concerns Raised", source: "The Daily Wire", publishedAt: new Date('2024-12-21T00:00:00Z') },
  { title: "Traditional Values Movement Grows", source: "Fox News", publishedAt: new Date('2024-12-21T17:00:00Z') },
  { title: "Election Integrity Debate Heats Up", source: "Breitbart", publishedAt: new Date('2024-12-21T18:00:00Z') },
];

async function seedMockArticles() {
  console.log('🌱 Seeding mock articles for testing...');
  console.log(`📰 Target: ${mockArticles.length} articles\n`);

  // First, ensure we have sources in the database
  const dbSources = await prisma.source.findMany();
  
  if (dbSources.length === 0) {
    console.error('❌ No sources found in database. Please run seed-sources first.');
    process.exit(1);
  }

  console.log(`✅ Found ${dbSources.length} sources in database\n`);

  // Create a map of source names to source IDs
  const sourceMap = new Map(
    dbSources.map(source => [source.name.toLowerCase(), source.id])
  );

  let created = 0;
  let skipped = 0;
  let errors_count = 0;

  for (const mockArticle of mockArticles) {
    try {
      // Find the source ID from our database
      const sourceId = sourceMap.get(mockArticle.source.toLowerCase());
      
      if (!sourceId) {
        console.error(`⚠️  Source not found in database: ${mockArticle.source}`);
        errors_count++;
        continue;
      }

      // Create a unique URL for each article
      const url = `https://example.com/article/${mockArticle.source.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}-${created}`;

      // Create new article
      await prisma.article.create({
        data: {
          title: mockArticle.title,
          description: `This is a mock article about: ${mockArticle.title}`,
          url,
          imageUrl: null,
          publishedAt: mockArticle.publishedAt,
          sourceId,
          keywords: []
        }
      });

      created++;
      console.log(`✅ [${created}] ${mockArticle.source}: ${mockArticle.title}`);
    } catch (error) {
      errors_count++;
      if (errors_count <= 5) {
        console.error(`❌ Error creating article "${mockArticle.title}":`, error);
      }
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped, ${errors_count} errors`);
}

async function main() {
  try {
    await seedMockArticles();
  } catch (error) {
    console.error('❌ Error seeding mock articles:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
