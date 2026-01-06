import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

// Create a PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

// Create the Prisma client with the adapter
const prisma = new PrismaClient({ adapter });

// We'll use dynamic imports since this is run in a Node context
type BiasRating = 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';

interface ParsedArticle {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: Date;
  source: {
    name: string;
    biasRating: BiasRating;
  };
}

interface RSSSource {
  name: string;
  url: string;
  biasRating: BiasRating;
}

// Map bias ratings to reliability ratings (simplified approach)
function getReliability(biasRating: string): string {
  // In a real-world scenario, you would have more sophisticated reliability data
  // For now, we'll assign default values based on general source types
  const reliabilityMap: Record<string, string> = {
    'left': 'high',
    'lean-left': 'high',
    'center': 'very-high',
    'lean-right': 'high',
    'right': 'high',
  };
  return reliabilityMap[biasRating] || 'mixed';
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return 'unknown.com';
  }
}

// Extract keywords from title and description
function extractKeywords(title: string, description: string | null): string[] {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  // Remove common words and extract meaningful words
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'it',
    'its', 'what', 'which', 'who', 'when', 'where', 'why', 'how'
  ]);
  
  // Extract words (3+ characters)
  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  const uniqueWords = [...new Set(words)]
    .filter(word => !commonWords.has(word))
    .slice(0, 10); // Limit to 10 keywords
  
  return uniqueWords;
}

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Import the news module functions dynamically
  const newsModule = await import('../lib/news/index');
  const { getAllSources, parseMultipleFeeds } = newsModule;
  
  // Get all configured RSS sources
  const rssSources = getAllSources() as RSSSource[];
  console.log(`📰 Found ${rssSources.length} RSS sources`);
  
  // Parse feeds from all sources
  console.log('📡 Fetching articles from RSS feeds...');
  const { articles, errors } = await parseMultipleFeeds(rssSources);
  
  if (errors.length > 0) {
    console.log(`⚠️  Encountered ${errors.length} errors while fetching feeds:`);
    errors.forEach(error => {
      console.log(`   - ${error.sourceName}: ${error.error}`);
    });
  }
  
  console.log(`📄 Fetched ${articles.length} total articles`);
  
  // Filter articles from the past day
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const recentArticles = (articles as ParsedArticle[]).filter(article => 
    article.publishedAt >= oneDayAgo
  );
  
  console.log(`🕒 Filtered to ${recentArticles.length} articles from the past 24 hours`);
  
  // Limit to 500 articles
  const articlesToSeed = recentArticles.slice(0, 500);
  console.log(`📊 Limiting to ${articlesToSeed.length} articles for seeding`);
  
  // Create or update sources
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
  
  // Create articles
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
  
  // Summary
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
