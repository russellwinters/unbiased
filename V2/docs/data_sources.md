# Data Sources Planning Document

**Version:** 1.0  
**Last Updated:** December 18, 2024  
**Status:** Initial Planning

---

## Executive Summary

This document outlines the strategy for sourcing news content and bias ratings for the Unbiased news aggregator. We evaluate four news API providers and three bias rating sources, providing a recommended approach for implementation.

### Recommended Approach

**🎯 Primary Strategy: RSS Feed Aggregation + Manual Bias Ratings**

1. **News Source:** RSS feeds from curated news sources
   - Use OPML collection (https://github.com/spians/awesome-RSS-feeds)
   - Direct RSS feeds from major news outlets
   - **Why:** Free, reliable, no API limits, real-time updates

2. **Bias Ratings:** AllSides Media Bias Ratings (hardcoded)
   - Scrape or manually maintain bias ratings from AllSides
   - Update quarterly or as ratings change
   - **Why:** Most trusted, transparent methodology, community vetted

3. **Fallback/Enhancement:** NewsAPI.org for search and discovery
   - Use for specific story search when clustering articles
   - Supplement RSS with hard-to-find sources
   - **Why:** 100 free requests/day, good for search functionality

---

## Part 1: News API Options

### Option 1: NewsAPI.org

**Website:** https://newsapi.org/

#### Overview
- Most popular news API with 150,000+ registered developers
- Covers 150+ countries and 80,000+ sources
- Real-time and historical news data

#### Pricing
- **Free Tier:** 100 requests/day, limited to 1 month of historical data
- **Developer:** $449/month - 250k requests/month
- **Business:** Custom pricing

#### API Response Format
```json
{
  "status": "ok",
  "totalResults": 38,
  "articles": [
    {
      "source": {
        "id": "the-new-york-times",
        "name": "The New York Times"
      },
      "author": "Jane Doe",
      "title": "Breaking News Story Here",
      "description": "Brief description of the article content...",
      "url": "https://www.nytimes.com/2024/12/18/article-slug.html",
      "urlToImage": "https://static01.nyt.com/images/article-image.jpg",
      "publishedAt": "2024-12-18T14:30:00Z",
      "content": "Full article content up to 200 characters..."
    }
  ]
}
```

#### Integration Example
```typescript
// GET request to /v2/top-headlines
const response = await fetch(
  'https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY'
);

// Or search everything
const searchResponse = await fetch(
  'https://newsapi.org/v2/everything?q=climate&apiKey=YOUR_API_KEY'
);
```

#### Pros
- ✅ Simple REST API
- ✅ Good documentation
- ✅ Source filtering by category and country
- ✅ Search functionality

#### Cons
- ❌ Limited free tier (100 requests/day)
- ❌ Expensive for production use
- ❌ No bias ratings included
- ❌ Content may be truncated

---

### Option 2: MediaStack

**Website:** https://mediastack.com/

#### Overview
- Real-time news API with global coverage
- 75,000+ news sources worldwide
- Historical news data available

#### Pricing
- **Free Tier:** 500 requests/month, HTTP only
- **Basic:** $9.99/month - 10k requests/month
- **Professional:** $49.99/month - 100k requests/month
- **Business:** $199.99/month - 500k requests/month

#### API Response Format
```json
{
  "pagination": {
    "limit": 25,
    "offset": 0,
    "count": 25,
    "total": 10000
  },
  "data": [
    {
      "author": "John Smith",
      "title": "Example News Article Title",
      "description": "Brief summary of the article...",
      "url": "https://example.com/article",
      "source": "Example News",
      "image": "https://example.com/image.jpg",
      "category": "general",
      "language": "en",
      "country": "us",
      "published_at": "2024-12-18T14:30:00+00:00"
    }
  ]
}
```

#### Integration Example
```typescript
// GET request to /v1/news
const response = await fetch(
  'http://api.mediastack.com/v1/news?access_key=YOUR_API_KEY&countries=us'
);

// Filter by category
const businessNews = await fetch(
  'http://api.mediastack.com/v1/news?access_key=YOUR_API_KEY&categories=business'
);
```

#### Pros
- ✅ Affordable pricing tiers
- ✅ Good free tier for testing
- ✅ Includes categories and language filtering
- ✅ Historical data access

#### Cons
- ❌ Free tier is HTTP only (not HTTPS)
- ❌ Limited to 500 requests/month on free tier
- ❌ No bias ratings included
- ❌ Less popular than NewsAPI

---

### Option 3: The Guardian API

**Website:** https://open-platform.theguardian.com/

#### Overview
- Official API from The Guardian newspaper
- Access to all Guardian content
- Completely free with registration

#### Pricing
- **Free:** Unlimited requests (rate limited to 12 requests/second)
- Requires API key registration
- Non-commercial and commercial use allowed

#### API Response Format
```json
{
  "response": {
    "status": "ok",
    "userTier": "developer",
    "total": 2345678,
    "startIndex": 1,
    "pageSize": 10,
    "currentPage": 1,
    "pages": 234568,
    "results": [
      {
        "id": "politics/2024/dec/18/article-slug",
        "type": "article",
        "sectionId": "politics",
        "sectionName": "Politics",
        "webPublicationDate": "2024-12-18T14:30:00Z",
        "webTitle": "Article Headline Here",
        "webUrl": "https://www.theguardian.com/politics/2024/dec/18/article-slug",
        "apiUrl": "https://content.guardianapis.com/politics/2024/dec/18/article-slug",
        "fields": {
          "headline": "Article Headline",
          "standfirst": "Brief summary...",
          "body": "<p>Full HTML article content...</p>",
          "thumbnail": "https://media.guim.co.uk/image.jpg"
        },
        "tags": [
          {
            "id": "politics/us-politics",
            "type": "keyword",
            "webTitle": "US politics"
          }
        ]
      }
    ]
  }
}
```

#### Integration Example
```typescript
// GET request to /search
const response = await fetch(
  'https://content.guardianapis.com/search?api-key=YOUR_API_KEY&q=climate'
);

// Get article with fields
const articleResponse = await fetch(
  'https://content.guardianapis.com/politics/2024/dec/18/article-slug?api-key=YOUR_API_KEY&show-fields=headline,body,thumbnail'
);
```

#### Pros
- ✅ Completely free
- ✅ High rate limits (12 req/sec)
- ✅ Full article content available
- ✅ Excellent documentation
- ✅ Rich metadata and tagging

#### Cons
- ❌ Only one source (The Guardian)
- ❌ Limited perspective (center-left bias per AllSides)
- ❌ No multi-source aggregation
- ❌ Requires supplemental sources

---

### Option 4: News Data IO

**Website:** https://newsdata.io/

#### Overview
- Real-time news API with global coverage
- 50,000+ sources worldwide
- Advanced filtering and categorization

#### Pricing
- **Free Tier:** 200 credits/day (~200 articles)
- **Basic:** $99/month - 50k credits/month
- **Plus:** $299/month - 200k credits/month
- **Pro:** $699/month - 500k credits/month

#### API Response Format
```json
{
  "status": "success",
  "totalResults": 25432,
  "results": [
    {
      "article_id": "abc123def456",
      "title": "Breaking News Story Title",
      "link": "https://example.com/article",
      "keywords": ["politics", "economy"],
      "creator": ["Jane Doe"],
      "video_url": null,
      "description": "Article description text...",
      "content": "Full article content text...",
      "pubDate": "2024-12-18 14:30:00",
      "image_url": "https://example.com/image.jpg",
      "source_id": "example_news",
      "source_priority": 12345,
      "country": ["us"],
      "category": ["politics"],
      "language": "en",
      "ai_tag": "ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS",
      "sentiment": "neutral",
      "sentiment_stats": {
        "positive": 0.3,
        "neutral": 0.5,
        "negative": 0.2
      }
    }
  ],
  "nextPage": "1234567890"
}
```

#### Integration Example
```typescript
// GET request to /news
const response = await fetch(
  'https://newsdata.io/api/1/news?apikey=YOUR_API_KEY&country=us&language=en'
);

// Search by keyword
const searchResponse = await fetch(
  'https://newsdata.io/api/1/news?apikey=YOUR_API_KEY&q=climate&language=en'
);

// Filter by category
const businessNews = await fetch(
  'https://newsdata.io/api/1/news?apikey=YOUR_API_KEY&category=business'
);
```

#### Pros
- ✅ Good free tier (200 articles/day)
- ✅ Full article content included
- ✅ Sentiment analysis available
- ✅ Multiple filtering options

#### Cons
- ❌ Higher paid tier pricing
- ❌ No bias ratings included
- ❌ AI features require expensive plans
- ❌ Less established than NewsAPI

---

### Option 5: RSS Feed Aggregation (Recommended)

**Sources:**
- OPML Collection: https://github.com/spians/awesome-RSS-feeds
- Individual news outlet RSS feeds

#### Overview
- Direct RSS feeds from news outlets
- No API limits or costs
- Real-time updates
- Full control over sources

#### RSS Feed Format (Standard RSS 2.0)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Example News Site</title>
    <link>https://example.com</link>
    <description>Latest news from Example</description>
    <item>
      <title>Breaking News Story</title>
      <link>https://example.com/article</link>
      <description>Article description...</description>
      <pubDate>Wed, 18 Dec 2024 14:30:00 GMT</pubDate>
      <author>reporter@example.com (Jane Doe)</author>
      <guid>https://example.com/article</guid>
      <category>Politics</category>
      <enclosure url="https://example.com/image.jpg" type="image/jpeg"/>
    </item>
  </channel>
</rss>
```

#### Parsed Data Structure (Our API)
```typescript
interface ParsedArticle {
  title: string;
  url: string;
  description: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  sourceId: string;
  keywords: string[];
}
```

#### Example RSS Feeds by Bias
```typescript
const rssSources = {
  left: [
    { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
    { name: "MSNBC", url: "https://www.msnbc.com/feeds/latest" },
    { name: "Huffington Post", url: "https://www.huffpost.com/section/front-page/feed" }
  ],
  leanLeft: [
    { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
    { name: "The New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
    { name: "Washington Post", url: "https://feeds.washingtonpost.com/rss/world" }
  ],
  center: [
    { name: "BBC News", url: "http://feeds.bbci.co.uk/news/rss.xml" },
    { name: "Reuters", url: "https://www.reutersagency.com/feed/" },
    { name: "Associated Press", url: "https://apnews.com/hub/world-news" }
  ],
  leanRight: [
    { name: "Wall Street Journal", url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml" },
    { name: "The Hill", url: "https://thehill.com/feed/" },
    { name: "USA Today", url: "http://rssfeeds.usatoday.com/usatoday-NewsTopStories" }
  ],
  right: [
    { name: "Fox News", url: "https://moxie.foxnews.com/google-publisher/latest.xml" },
    { name: "Breitbart", url: "https://www.breitbart.com/feed/" },
    { name: "The Daily Wire", url: "https://www.dailywire.com/feeds/rss.xml" }
  ]
};
```

#### Integration Example
```typescript
import Parser from 'rss-parser';

const parser = new Parser();

async function fetchRssFeed(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);
    
    return feed.items.map(item => ({
      title: item.title || '',
      url: item.link || '',
      description: item.contentSnippet || item.description || null,
      imageUrl: item.enclosure?.url || null,
      publishedAt: new Date(item.pubDate || Date.now()),
      keywords: item.categories || []
    }));
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    return [];
  }
}
```

#### Pros
- ✅ **Free and unlimited**
- ✅ Real-time updates
- ✅ No API rate limits
- ✅ Full article metadata
- ✅ Complete control over sources
- ✅ No external dependencies
- ✅ Works with any news outlet with RSS

#### Cons
- ❌ Requires RSS parser library
- ❌ Need to maintain source list
- ❌ No standardized format across sources
- ❌ Need to handle feed failures gracefully

---

## Part 2: Bias Rating Sources

### Option 1: AllSides Media Bias Ratings (Recommended)

**Website:** https://www.allsides.com/media-bias/media-bias-ratings

#### Overview
- Most trusted and transparent bias rating system
- 1,400+ rated sources
- Community feedback incorporated
- Regular rating updates

#### Rating Scale
- **Left:** Far left perspective
- **Lean Left:** Left-leaning but closer to center
- **Center:** Balanced or mixed
- **Lean Right:** Right-leaning but closer to center
- **Right:** Far right perspective

#### Methodology
- Editorial review by diverse team
- Community feedback (30,000+ ratings)
- Third-party academic studies
- Blind bias surveys
- Transparent rating change process

#### Implementation Approach: **Hardcoded with Quarterly Updates**

```typescript
// lib/bias/allsides-ratings.ts
interface BiasRating {
  source: string;
  domain: string;
  bias: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';
  reliability: 'high' | 'mixed' | 'low';
  lastUpdated: string;
  allSidesUrl: string;
}

export const biasRatings: BiasRating[] = [
  {
    source: "The New York Times",
    domain: "nytimes.com",
    bias: "lean-left",
    reliability: "high",
    lastUpdated: "2024-12-01",
    allSidesUrl: "https://www.allsides.com/news-source/new-york-times-media-bias"
  },
  {
    source: "Wall Street Journal",
    domain: "wsj.com",
    bias: "lean-right",
    reliability: "high",
    lastUpdated: "2024-12-01",
    allSidesUrl: "https://www.allsides.com/news-source/wall-street-journal-media-bias"
  },
  {
    source: "BBC News",
    domain: "bbc.com",
    bias: "center",
    reliability: "high",
    lastUpdated: "2024-12-01",
    allSidesUrl: "https://www.allsides.com/news-source/bbc-news-media-bias"
  },
  {
    source: "Fox News",
    domain: "foxnews.com",
    bias: "right",
    reliability: "mixed",
    lastUpdated: "2024-12-01",
    allSidesUrl: "https://www.allsides.com/news-source/fox-news-media-bias"
  },
  {
    source: "NPR",
    domain: "npr.org",
    bias: "lean-left",
    reliability: "high",
    lastUpdated: "2024-12-01",
    allSidesUrl: "https://www.allsides.com/news-source/npr-media-bias"
  }
  // ... more sources
];

export function getBiasRating(domain: string): BiasRating | null {
  return biasRatings.find(rating => 
    domain.includes(rating.domain) || rating.domain.includes(domain)
  ) || null;
}
```

#### Maintenance Strategy
1. Review AllSides ratings quarterly
2. Check for updated ratings or new sources
3. Update the `biasRatings` array
4. Run tests to ensure all active sources have ratings
5. Document changes in Git commit messages

#### Pros
- ✅ **Most trusted source**
- ✅ Transparent methodology
- ✅ Community vetted
- ✅ Simple to implement (hardcoded)
- ✅ No API costs or rate limits
- ✅ Reliable and stable

#### Cons
- ❌ Requires manual updates
- ❌ No programmatic API
- ❌ Updates needed quarterly
- ❌ Initial data entry effort

---

### Option 2: Ad Fontes Media Bias Chart

**Website:** https://adfontesmedia.com/

#### Overview
- Interactive Media Bias Chart
- Rates sources on bias (left-right) and reliability (high-low)
- 2-dimensional rating system
- Professional analyst team

#### Rating System
- **X-axis:** Political bias (-42 to +42)
  - Negative = Left
  - Zero = Center
  - Positive = Right
- **Y-axis:** Reliability (0 to 64)
  - High = 56-64 (Original Fact Reporting)
  - Mixed = 32-55 (Opinion or Analysis)
  - Low = 0-31 (Unfair or Misleading)

#### Sample Ratings
```typescript
const adFontesRatings = [
  { source: "AP News", bias: 0.0, reliability: 62 },
  { source: "Reuters", bias: -1.4, reliability: 60 },
  { source: "Wall Street Journal", bias: 5.2, reliability: 58 },
  { source: "NPR", bias: -6.7, reliability: 56 },
  { source: "Fox News", bias: 18.3, reliability: 42 },
  { source: "MSNBC", bias: -16.8, reliability: 44 }
];
```

#### Implementation Approach: **Hardcoded from Chart**

```typescript
interface AdFontesRating {
  source: string;
  biasScore: number; // -42 (left) to +42 (right)
  reliabilityScore: number; // 0 (low) to 64 (high)
  category: string; // e.g., "Original Fact Reporting"
}

// Map Ad Fontes to our simpler 5-point scale
function mapToAllSidesScale(biasScore: number): string {
  if (biasScore <= -15) return 'left';
  if (biasScore <= -5) return 'lean-left';
  if (biasScore <= 5) return 'center';
  if (biasScore <= 15) return 'lean-right';
  return 'right';
}
```

#### Pros
- ✅ Detailed numerical ratings
- ✅ 2-dimensional analysis (bias + reliability)
- ✅ Professional analysts
- ✅ Visual chart available

#### Cons
- ❌ Requires subscription for API access
- ❌ Fewer sources than AllSides
- ❌ More complex rating system
- ❌ Less community involvement

---

### Option 3: Media Bias/Fact Check

**Website:** https://mediabiasfactcheck.com/

#### Overview
- Comprehensive database of media sources
- Detailed analysis of each source
- Factual reporting ratings
- Credibility scores

#### Rating Categories
**Bias:**
- Extreme Left
- Left
- Left-Center
- Least Biased (Center)
- Right-Center
- Right
- Extreme Right

**Factual Reporting:**
- Very High
- High
- Mostly Factual
- Mixed
- Low
- Very Low

#### Sample Data Structure
```typescript
interface MBFCRating {
  source: string;
  bias: string; // "LEFT", "LEFT-CENTER", "LEAST BIASED", "RIGHT-CENTER", "RIGHT"
  factual: string; // "VERY HIGH", "HIGH", "MIXED", "LOW", "VERY LOW"
  credibility: string; // "HIGH CREDIBILITY", "MEDIUM CREDIBILITY", "LOW CREDIBILITY"
  notes: string;
}

const mbfcRatings = [
  {
    source: "BBC News",
    bias: "LEAST BIASED",
    factual: "HIGH",
    credibility: "HIGH CREDIBILITY",
    notes: "Minimal bias, uses loaded words minimally"
  },
  {
    source: "New York Times",
    bias: "LEFT-CENTER",
    factual: "HIGH",
    credibility: "HIGH CREDIBILITY",
    notes: "Strong editorial bias left, factual reporting reliable"
  }
];
```

#### Implementation Approach: **Web Scraping or Manual Entry**

```typescript
// Scraping approach (if legal and allowed by ToS)
async function scrapeMediaBiasFactCheck(sourceName: string) {
  const url = `https://mediabiasfactcheck.com/${sourceName}/`;
  // Use cheerio or puppeteer to extract ratings
  // Parse the page for bias rating, factual reporting, etc.
}

// Or manual hardcoded approach
const mbfcDatabase = {
  'nytimes.com': {
    bias: 'LEFT-CENTER',
    factual: 'HIGH',
    credibility: 'HIGH'
  }
  // ... more sources
};
```

#### Pros
- ✅ Very detailed source analysis
- ✅ Large database
- ✅ Includes credibility scores
- ✅ Detailed methodology explanations

#### Cons
- ❌ No official API
- ❌ Requires web scraping or manual entry
- ❌ More granular than needed
- ❌ Slower to update than AllSides

---

## Part 3: Recommended Implementation Strategy

### Phase 1: MVP (Minimum Viable Product)

#### Data Collection
```typescript
// 1. RSS Feed Parser
import Parser from 'rss-parser';
import { prisma } from '@/lib/db';

async function aggregateNews() {
  const parser = new Parser();
  
  for (const source of rssSources.all) {
    const feed = await parser.parseURL(source.rssUrl);
    
    for (const item of feed.items) {
      await prisma.article.create({
        data: {
          title: item.title,
          url: item.link,
          description: item.contentSnippet,
          publishedAt: new Date(item.pubDate),
          source: {
            connect: { domain: source.domain }
          }
        }
      });
    }
  }
}
```

#### Bias Ratings
```typescript
// 2. Seed database with AllSides ratings
import { allSidesRatings } from './bias/allsides-ratings';

async function seedBiasRatings() {
  for (const rating of allSidesRatings) {
    await prisma.source.upsert({
      where: { domain: rating.domain },
      update: {
        biasRating: rating.bias,
        reliability: rating.reliability
      },
      create: {
        name: rating.source,
        domain: rating.domain,
        biasRating: rating.bias,
        reliability: rating.reliability
      }
    });
  }
}
```

### Phase 2: Enhanced Features

1. **NewsAPI Integration** (for search)
   - Use 100 free daily requests for story search
   - Supplement RSS feeds with search results
   - Find related articles across sources

2. **Scheduled Updates**
   - Cron job to fetch RSS feeds every 15 minutes
   - Update bias ratings quarterly
   - Clean up old articles (>30 days)

3. **Bias Rating UI**
   - Visual indicators (color-coded badges)
   - Link to AllSides source page
   - Tooltip with rating explanation

### Phase 3: Advanced Features

1. **Story Clustering**
   - Use OpenAI embeddings to find similar articles
   - Group articles about same event
   - Show multi-perspective coverage

2. **Source Diversity Metrics**
   - Calculate user's reading balance
   - Suggest opposing viewpoints
   - Visualize bias exposure

---

## Part 4: Implementation Checklist

### Database Setup
- [ ] Update Prisma schema with bias fields
- [ ] Create seed script for sources
- [ ] Add RSS URL field to Source model
- [ ] Test database migrations

### RSS Feed Parser
- [ ] Install `rss-parser` package
- [ ] Create RSS fetching service
- [ ] Handle feed errors gracefully
- [ ] Test with multiple feed formats
- [ ] Schedule periodic updates

### Bias Rating System
- [ ] Create AllSides ratings database
- [ ] Write function to match domains to ratings
- [ ] Add bias badge component
- [ ] Create rating legend/explanation page
- [ ] Document update process

### API Endpoints
- [ ] Create `/api/articles` endpoint
- [ ] Add bias filtering
- [ ] Implement pagination
- [ ] Add source filtering
- [ ] Test response times

### UI Components
- [ ] Article card with bias badge
- [ ] Source filter sidebar
- [ ] Bias distribution chart
- [ ] Multi-perspective story view

### Testing
- [ ] Unit tests for RSS parser
- [ ] Integration tests for API
- [ ] E2E tests for article browsing
- [ ] Load testing with large datasets

### Documentation
- [ ] API documentation
- [ ] Bias rating methodology
- [ ] Source selection criteria
- [ ] User guide

---

## Part 5: Cost Analysis

### Option Comparison

| Solution | Cost (Monthly) | Articles/Month | Bias Ratings | Pros | Cons |
|----------|---------------|----------------|--------------|------|------|
| **RSS + AllSides** (Recommended) | **$0** | **Unlimited** | **Manual/Hardcoded** | Free, unlimited, full control | Manual rating updates |
| NewsAPI Free | $0 | 3,000 | None | Good for search | Limited requests |
| NewsAPI Developer | $449 | 250,000 | None | High volume | Expensive, no bias data |
| MediaStack Basic | $9.99 | 10,000 | None | Affordable | HTTP only on free tier |
| Guardian API | $0 | Unlimited | None | Free, reliable | Single source only |
| News Data IO | $99 | 50,000 | None | Sentiment analysis | Higher cost |

### Recommended Budget Allocation

**Phase 1 (MVP):** $0/month
- RSS feeds (free)
- AllSides ratings (manual)
- Basic clustering

**Phase 2 (Growth):** $0-50/month
- Optional: NewsAPI free tier for search
- Optional: OpenAI API for embeddings ($10-50/month)

**Phase 3 (Scale):** $100-500/month
- Optional: Paid NewsAPI for advanced search
- OpenAI API for clustering ($50-200/month)
- Hosting and database ($50-300/month)

---

## Part 6: Risk Assessment

### Technical Risks

1. **RSS Feed Reliability**
   - Risk: Feeds may go down or change format
   - Mitigation: Error handling, fallback sources, monitoring

2. **Bias Rating Maintenance**
   - Risk: Ratings become outdated
   - Mitigation: Quarterly review process, version tracking

3. **API Rate Limits** (if using paid APIs)
   - Risk: Exceeding free tier limits
   - Mitigation: Caching, request throttling

### Legal & Ethical Risks

1. **Content Licensing**
   - Risk: Copyright issues with aggregated content
   - Mitigation: Link to original articles, respect robots.txt, use excerpts only

2. **Bias Rating Accuracy**
   - Risk: Disputed bias classifications
   - Mitigation: Use trusted sources (AllSides), allow user feedback, be transparent about methodology

3. **Source Representation**
   - Risk: Accusation of bias in source selection
   - Mitigation: Include diverse sources, document selection criteria, allow user source suggestions

---

## Part 7: Next Steps

### Immediate Actions (Week 1)
1. ✅ Create this planning document
2. ⏳ Finalize RSS source list (30-50 sources across spectrum)
3. ⏳ Set up Prisma schema for sources and bias ratings
4. ⏳ Create AllSides rating database (top 100 sources)

### Short-term Goals (Week 2-4)
1. ⏳ Implement RSS parser service
2. ⏳ Create database seed script
3. ⏳ Build basic article listing UI
4. ⏳ Add bias badge components
5. ⏳ Deploy MVP

### Medium-term Goals (Month 2-3)
1. ⏳ Integrate NewsAPI for search
2. ⏳ Implement story clustering
3. ⏳ Add source filtering
4. ⏳ Create multi-perspective views

### Long-term Goals (Month 4+)
1. ⏳ Advanced semantic clustering with OpenAI
2. ⏳ User preference learning
3. ⏳ Mobile app
4. ⏳ Browser extension

---

## Appendices

### Appendix A: Complete Source List

See `sources.json` for complete list of RSS feeds organized by bias rating.

### Appendix B: Bias Rating Methodology

Detailed explanation of AllSides methodology and how we adapt it for our platform.

### Appendix C: API Response Examples

Full example responses from each evaluated API for testing and development.

### Appendix D: Database Schema

```prisma
model Source {
  id          String    @id @default(uuid())
  name        String
  domain      String    @unique
  rssUrl      String?
  biasRating  String    // "left", "lean-left", "center", "lean-right", "right"
  reliability String    // "very-high", "high", "mixed", "low"
  articles    Article[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

---

## Document History

- **v1.0** (2024-12-18): Initial planning document created
  - Evaluated 4 news API options + RSS feeds
  - Evaluated 3 bias rating sources
  - Recommended RSS + AllSides approach
  - Created implementation roadmap

---

**Questions or Feedback?**

This is a living document. As we learn more about what works and what doesn't, we'll update this plan. Please add comments or open issues for any suggestions or concerns.
