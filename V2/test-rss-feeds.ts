/**
 * Test script to investigate RSS feed parsing issues
 * This script tests each problematic RSS feed individually to identify issues
 */

import Parser from 'rss-parser';
import { rssSources } from './lib/news/rss-sources';

interface CustomFeed {
  [key: string]: unknown;
}

interface CustomItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  'content:encoded'?: string;
  description?: string;
  'media:content'?: unknown;
  enclosure?: {
    url?: string;
  };
  [key: string]: unknown;
}

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['content:encoded', 'content:encoded']
    ]
  }
});

// Sources mentioned in TODO
const problematicSources = [
  'msnbc',
  'reuters',
  'associated-press',
  'usa-today'
];

// Working sources for comparison
const workingSources = [
  'bbc-news',
  'the-guardian',
  'fox-news'
];

async function testFeed(sourceKey: string) {
  const source = rssSources[sourceKey];
  
  if (!source) {
    console.log(`\n❌ Source "${sourceKey}" not found in rssSources`);
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${source.name}`);
  console.log(`URL: ${source.url}`);
  console.log(`Bias Rating: ${source.biasRating}`);
  console.log(`${'='.repeat(80)}`);

  try {
    console.log('Attempting to fetch feed...');
    const startTime = Date.now();
    const feed = await parser.parseURL(source.url);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Feed fetched successfully in ${duration}ms`);
    console.log(`\nFeed Info:`);
    console.log(`  - Title: ${feed.title || 'N/A'}`);
    console.log(`  - Description: ${feed.description || 'N/A'}`);
    console.log(`  - Items count: ${feed.items?.length || 0}`);
    
    if (feed.items && feed.items.length > 0) {
      console.log(`\nFirst Item Sample:`);
      const item = feed.items[0];
      console.log(`  - Title: ${item.title || 'N/A'}`);
      console.log(`  - Link: ${item.link || 'N/A'}`);
      console.log(`  - PubDate: ${item.pubDate || 'N/A'}`);
      console.log(`  - Description: ${item.description ? item.description.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`  - ContentSnippet: ${item.contentSnippet ? item.contentSnippet.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`  - Image (media:content): ${item['media:content'] ? 'Present' : 'N/A'}`);
      console.log(`  - Image (enclosure): ${item.enclosure?.url ? 'Present' : 'N/A'}`);
      
      // Show available keys
      console.log(`  - Available keys: ${Object.keys(item).join(', ')}`);
    }
    
    return {
      success: true,
      duration,
      itemCount: feed.items?.length || 0,
      feedTitle: feed.title
    };
  } catch (error) {
    console.log(`❌ Error fetching feed`);
    console.log(`Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.log(`Error message: ${error instanceof Error ? error.message : String(error)}`);
    
    if (error instanceof Error && error.stack) {
      console.log(`Stack trace: ${error.stack}`);
    }
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.log(`\n🔍 Analysis: DNS resolution failed - URL may be incorrect or network issue`);
      } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        console.log(`\n🔍 Analysis: Request timed out - server may be slow or blocking requests`);
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log(`\n🔍 Analysis: Access forbidden - server may require special headers or blocking automated requests`);
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log(`\n🔍 Analysis: Feed URL not found - URL may have changed`);
      } else if (error.message.includes('parse') || error.message.includes('XML')) {
        console.log(`\n🔍 Analysis: Feed parsing error - invalid XML/RSS format`);
      } else if (error.message.includes('redirect') || error.message.includes('301') || error.message.includes('302')) {
        console.log(`\n🔍 Analysis: Redirect issue - feed may have moved`);
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error
    };
  }
}

async function main() {
  console.log('RSS Feed Investigation Script');
  console.log('==============================\n');
  console.log('This script tests RSS feeds to identify parsing issues.');
  console.log(`Testing ${problematicSources.length} problematic sources and ${workingSources.length} working sources for comparison.\n`);

  const results: Record<string, any> = {
    problematic: {},
    working: {}
  };

  // Test problematic sources
  console.log('\n\n📋 TESTING PROBLEMATIC SOURCES (mentioned in TODO)');
  console.log('='.repeat(80));
  
  for (const sourceKey of problematicSources) {
    const result = await testFeed(sourceKey);
    results.problematic[sourceKey] = result;
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test working sources for comparison
  console.log('\n\n✨ TESTING WORKING SOURCES (for comparison)');
  console.log('='.repeat(80));
  
  for (const sourceKey of workingSources) {
    const result = await testFeed(sourceKey);
    results.working[sourceKey] = result;
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n\n📊 SUMMARY');
  console.log('='.repeat(80));
  
  console.log('\nProblematic Sources:');
  for (const [key, result] of Object.entries(results.problematic)) {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${result.success ? `${result.itemCount} items` : result.error}`);
  }
  
  console.log('\nWorking Sources (comparison):');
  for (const [key, result] of Object.entries(results.working)) {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${status} ${key}: ${result.success ? `${result.itemCount} items` : result.error}`);
  }

  // Statistics
  const problematicSuccess = Object.values(results.problematic).filter((r: any) => r.success).length;
  const workingSuccess = Object.values(results.working).filter((r: any) => r.success).length;
  
  console.log('\nStatistics:');
  console.log(`  Problematic sources working: ${problematicSuccess}/${problematicSources.length}`);
  console.log(`  Working sources still working: ${workingSuccess}/${workingSources.length}`);
}

main().catch(console.error);
