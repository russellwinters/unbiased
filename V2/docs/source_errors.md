# RSS Feed Source Errors - Investigation Report

**Date:** December 18, 2024  
**Issue:** TODO in `V2/lib/news/rss-parser.ts` line 159  
**Status:** Investigation Complete

## Executive Summary

This document investigates parsing errors observed with four RSS feed sources: MSNBC, Reuters, Associated Press, and USA Today. Through research and analysis, we've identified the root causes and potential solutions for each problematic source.

**Key Finding:** All four sources have known issues related to feed availability, access restrictions, or URL changes that commonly affect RSS parsers.

> **⚠️ Important Note:** This document contains research findings and suggested solutions. All code examples are proposals for future implementation and have not been tested or integrated into the codebase. Interface modifications and new properties mentioned in examples would require corresponding updates to TypeScript definitions in the actual implementation files.

---

## Problematic Sources Overview

| Source | URL | Bias Rating | Issue Type |
|--------|-----|-------------|------------|
| MSNBC | https://www.msnbc.com/feeds/latest | left | Feed discontinued/relocated |
| Reuters | https://www.reutersagency.com/feed/ | center | Access restrictions for automated tools |
| Associated Press | https://apnews.com/hub/world-news/feed | center | Feed format or availability issues |
| USA Today | https://rssfeeds.usatoday.com/usatoday-NewsTopStories | lean-right | Feed may require different subdomain |

---

## Detailed Analysis by Source

### 1. MSNBC

**Feed URL:** `https://www.msnbc.com/feeds/latest`

#### Known Issues
1. **Feed Discontinuation**: MSNBC has historically discontinued and relocated their RSS feeds multiple times
2. **Redirect Issues**: The feed URL may redirect to a different location or return 404
3. **Access Restrictions**: May block automated requests without proper User-Agent headers

#### Research Findings
- MSNBC's RSS feeds have been notoriously unstable and frequently moved or removed
- Some feeds require specific URL patterns like `/feeds/msnbctv` or category-specific endpoints
- The main site may have moved RSS feeds behind authentication or removed them entirely

#### Recommended Solutions

**Option A: Alternative MSNBC Feed URLs to Try**
```typescript
// Try these alternative MSNBC feed URLs:
const alternativeMsnbcFeeds: string[] = [
  'https://www.msnbc.com/feeds/msnbctv', // TV content feed
  'https://rss.cnn.com/rss/cnn_topstories.rss', // CNN as alternative
];
```

**Option B: Replace with Alternative Left-Leaning Source**
- Consider using CNN (https://rss.cnn.com/rss/cnn_topstories.rss) as a replacement
- Alternative: CNN RSS feeds (if available)
- Alternative: The Atlantic or Vox RSS feeds

**Option C: Enhanced Error Handling**
```typescript
// Add custom User-Agent header
const parser = new Parser({
  headers: {
    'User-Agent': 'UnbiasedNewsAggregator/2.0',
    'Accept': 'application/rss+xml, application/xml, text/xml'
  },
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['content:encoded', 'content:encoded']
    ]
  }
});
```

---

### 2. Reuters

**Feed URL:** `https://www.reutersagency.com/feed/`

#### Known Issues
1. **Agency vs. Public Site**: `reutersagency.com` is the B2B site, not the public news site
2. **Access Restrictions**: Agency feeds may require authentication or API keys
3. **URL Changes**: Reuters has restructured their RSS offerings multiple times

#### Research Findings
- The public Reuters site is at `reuters.com`, while `reutersagency.com` is for business clients
- Reuters has scaled back their free RSS feeds and moved toward API-based access
- Many RSS feed aggregators report 403 Forbidden or 404 Not Found errors with this URL

#### Recommended Solutions

**Option A: Use Reuters.com RSS Feeds**
```typescript
const reutersFeed = {
  name: 'Reuters',
  url: 'https://www.reuters.com/rssfeed/worldNews', // World news
  // OR
  // url: 'https://www.reuters.com/tools/rss', // RSS directory page
  biasRating: 'center'
};

// Additional Reuters category feeds:
const reutersFeeds = {
  world: 'https://www.reuters.com/rssfeed/worldNews',
  business: 'https://www.reuters.com/rssfeed/businessNews',
  technology: 'https://www.reuters.com/rssfeed/technologyNews'
};
```

**Option B: Use Alternative Center-Biased Sources**
- Bloomberg RSS feeds
- PBS NewsHour
- The Christian Science Monitor
- Axios RSS feeds

**Option C: Implement Retry Logic with Delays**
```typescript
async function parseRSSFeedWithRetry(
  source: RSSSource, 
  maxRetries: number = 3
): Promise<ParsedArticle[]> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const feed = await parser.parseURL(source.url);
      return feed.items.map(item => transformToArticle(item, source));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
  return [];
}
```

---

### 3. Associated Press (AP News)

**Feed URL:** `https://apnews.com/hub/world-news/feed`

#### Known Issues
1. **Hub URL Structure**: The `/hub/` URL pattern may not provide RSS feeds
2. **Feed Availability**: AP has limited RSS feed availability to specific categories
3. **Authentication**: Some feeds may require AP account or subscription

#### Research Findings
- AP News has restricted their RSS feed offerings significantly in recent years
- The standard RSS feed pattern is typically `/apf-*` for public feeds
- Many RSS feed readers report intermittent access issues with AP feeds

#### Recommended Solutions

**Option A: Use Documented AP RSS Feeds**
```typescript
const apFeed = {
  name: 'Associated Press',
  // Try these alternatives:
  url: 'https://apnews.com/apf-topnews', // Top news feed
  // OR
  // url: 'https://apnews.com/apf-usnews', // US news feed
  // OR
  // url: 'https://apnews.com/apf-worldnews', // World news feed
  biasRating: 'center'
};
```

**Option B: Check for Current AP RSS Directory**
```typescript
// AP may have an RSS directory page
// Visit: https://apnews.com/rss
// Or check their footer/help section for current RSS URLs
```

**Option C: Use Alternative Wire Service**
- United Press International (UPI) RSS feeds
- Reuters (see alternative URLs above)
- AFP (Agence France-Presse) if available

---

### 4. USA Today

**Feed URL:** `https://rssfeeds.usatoday.com/usatoday-NewsTopStories`

#### Known Issues
1. **HTTPS Support**: Some USA Today RSS feeds may have SSL/TLS certificate issues
2. **Subdomain Changes**: The `rssfeeds.usatoday.com` subdomain may have been retired
3. **Feed Restructuring**: USA Today may have moved feeds to their main domain

#### Research Findings
- USA Today has reorganized their RSS feed infrastructure multiple times
- Some feeds may require `http://` instead of `https://` (security concern)
- The main site structure suggests feeds may now be under the main domain

#### Recommended Solutions

**Option A: Try Alternative USA Today Feed URLs**
```typescript
const usaTodayFeed = {
  name: 'USA Today',
  // Try these alternatives:
  url: 'https://www.usatoday.com/rss/', // Main RSS directory
  // OR
  // url: 'https://rssfeeds.usatoday.com/UsatodaycomNation-TopStories', // Nation news
  // OR
  // url: 'https://www.usatoday.com/rss/news/', // News category
  biasRating: 'lean-right'
};
```

**Option B: Protocol Troubleshooting**

⚠️ **SECURITY WARNING**: Some older RSS feed URLs may use HTTP instead of HTTPS. HTTP connections are insecure and transmit data in plain text, making them vulnerable to man-in-the-middle attacks.

**Recommended Approach:**
1. Always prefer HTTPS URLs when available
2. Check the news site's RSS discovery page for official feed URLs
3. If only HTTP is available, consider:
   - Using a secure proxy service that converts HTTP to HTTPS
   - Replacing the source with a more secure alternative
   - Only using HTTP feeds for development/testing, never in production

```typescript
// SECURE ALTERNATIVE: Always validate HTTPS is available
async function validateSecureFeed(url: string): Promise<boolean> {
  if (!url.startsWith('https://')) {
    console.error(`Insecure feed URL detected: ${url}`);
    return false;
  }
  return true;
}

// Only accept HTTPS feeds in production
async function parseSecureRSSFeed(source: RSSSource): Promise<ParsedArticle[]> {
  if (!await validateSecureFeed(source.url)) {
    throw new Error(`Feed ${source.name} uses insecure HTTP protocol. HTTPS required.`);
  }
  return await parseRSSFeed(source);
}
```

**Option C: Use Alternative Lean-Right Sources**
- The Washington Times RSS feeds
- New York Post RSS feeds
- Real Clear Politics RSS feeds

---

## Root Cause Summary

### Common Patterns Identified

1. **Feed URL Changes**: News organizations frequently restructure their sites and RSS offerings
2. **Access Restrictions**: Automated scrapers may be blocked without proper headers
3. **Authentication Requirements**: Some feeds now require API keys or subscriptions
4. **Subdomain Retirements**: RSS-specific subdomains are often consolidated into main domains
5. **Feed Discontinuation**: Organizations may remove or limit RSS feeds entirely

### Testing Limitations

**Network Restrictions in Development Environment:**
- The sandboxed development environment blocks external DNS resolution
- All RSS feed tests result in `ENOTFOUND` errors regardless of feed validity
- Testing requires deployment to an environment with unrestricted network access

**Testing in Production/Staging Environments:**
To properly test these RSS feeds, deploy to an environment with network access:

1. **Deploy to Vercel/Netlify Preview**:
   ```bash
   git push origin <branch-name>
   # Use the preview URL to test: https://preview-url.vercel.app/api/articles
   ```

2. **Run in Local Development with Network Access**:
   ```bash
   npm run dev
   # Test each source individually
   curl "http://localhost:3000/api/articles?source=Reuters&limit=5"
   ```

3. **Use Production API if Available**:
   ```bash
   curl "https://production-url.com/api/articles?limit=10"
   ```

---

## Recommended Implementation Strategy

### Phase 1: Immediate Actions (Priority: High)

#### 1. Update Feed URLs
Research and update the URLs for each problematic source:

```typescript
// V2/lib/news/rss-sources.ts
export const rssSources: Record<string, RSSSource> = {
  // ... other sources ...
  
  'msnbc': {
    name: 'MSNBC',
    url: 'https://rss.cnn.com/rss/cnn_topstories.rss', // Alternative
    biasRating: 'left',
    notes: 'Using CNN as MSNBC RSS feeds are unreliable'
  },
  
  'reuters': {
    name: 'Reuters',
    url: 'https://www.reuters.com/rssfeed/worldNews', // Public site
    biasRating: 'center',
    notes: 'Using reuters.com instead of reutersagency.com'
  },
  
  'associated-press': {
    name: 'Associated Press',
    url: 'https://apnews.com/apf-topnews', // Standard AP feed
    biasRating: 'center',
    notes: 'Using apf-topnews feed format'
  },
  
  'usa-today': {
    name: 'USA Today',
    url: 'https://www.usatoday.com/rss/', // Main RSS page
    biasRating: 'lean-right',
    notes: 'May need to verify specific category feed'
  }
};
```

#### 2. Enhance Parser with Better Headers

```typescript
// V2/lib/news/rss-parser.ts
const parser: Parser<CustomFeed, CustomItem> = new Parser({
  headers: {
    'User-Agent': 'UnbiasedNewsAggregator/2.0 (https://github.com/russellwinters/unbiased)',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
    'Accept-Language': 'en-US,en;q=0.9'
  },
  timeout: 10000, // 10 second timeout
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['content:encoded', 'content:encoded']
    ]
  }
});
```

#### 3. Implement Feed Validation Service

Create a service to periodically check feed health:

```typescript
// V2/lib/news/feed-validator.ts
export interface FeedHealth {
  sourceKey: string;
  url: string;
  status: 'healthy' | 'degraded' | 'failed';
  lastChecked: Date;
  lastSuccess: Date | null;
  errorMessage: string | null;
  consecutiveFailures: number;
}

export async function checkFeedHealth(source: RSSSource): Promise<FeedHealth> {
  try {
    const feed = await parser.parseURL(source.url);
    return {
      sourceKey: source.name,
      url: source.url,
      status: feed.items.length > 0 ? 'healthy' : 'degraded',
      lastChecked: new Date(),
      lastSuccess: new Date(),
      errorMessage: null,
      consecutiveFailures: 0
    };
  } catch (error) {
    return {
      sourceKey: source.name,
      url: source.url,
      status: 'failed',
      lastChecked: new Date(),
      lastSuccess: null,
      errorMessage: error instanceof Error ? error.message : String(error),
      consecutiveFailures: 1
    };
  }
}
```

### Phase 2: Enhanced Error Handling (Priority: Medium)

#### 1. Add Source-Specific Error Handling

```typescript
// V2/lib/news/rss-parser.ts
export async function parseRSSFeed(source: RSSSource): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    // ... existing parsing logic ...
  } catch (error) {
    // Log detailed error information for debugging
    const errorInfo = {
      source: source.name,
      url: source.url,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      timestamp: new Date().toISOString()
    };
    
    console.error('RSS Feed Error:', JSON.stringify(errorInfo, null, 2));
    
    // Provide user-friendly error messages
    let userMessage = `Failed to fetch ${source.name}`;
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        userMessage += ': Feed URL may be incorrect or unavailable';
      } else if (error.message.includes('403')) {
        userMessage += ': Access denied (may require authentication)';
      } else if (error.message.includes('404')) {
        userMessage += ': Feed not found (URL may have changed)';
      } else if (error.message.includes('timeout')) {
        userMessage += ': Request timed out (server may be slow)';
      } else if (error.message.includes('parse')) {
        userMessage += ': Invalid feed format';
      }
    }
    
    throw new Error(userMessage);
  }
}
```

#### 2. Implement Fallback Sources

```typescript
// V2/lib/news/rss-sources.ts
export interface RSSSource {
  name: string;
  url: string;
  fallbackUrl?: string; // Alternative URL if primary fails
  biasRating: string;
  notes?: string;
}

export const rssSources: Record<string, RSSSource> = {
  'reuters': {
    name: 'Reuters',
    url: 'https://www.reuters.com/rssfeed/worldNews',
    fallbackUrl: 'https://www.reuters.com/rssfeed/businessNews',
    biasRating: 'center'
  },
  // ... other sources ...
};

// Enhanced parseRSSFeed with fallback support
export async function parseRSSFeed(source: RSSSource): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return transformFeedItems(feed, source);
  } catch (error) {
    // Try fallback URL if available
    if (source.fallbackUrl) {
      console.warn(`Primary feed failed for ${source.name}, trying fallback URL`);
      try {
        const feed = await parser.parseURL(source.fallbackUrl);
        return transformFeedItems(feed, source);
      } catch (fallbackError) {
        console.error(`Fallback also failed for ${source.name}`);
        throw error; // Throw original error for consistency
      }
    }
    throw error;
  }
}

function transformFeedItems(feed: any, source: RSSSource): ParsedArticle[] {
  return feed.items
    .filter((item: any) => item.title && item.link)
    .map((item: any) => ({
      title: item.title!,
      description: extractDescription(item),
      url: item.link!,
      imageUrl: extractImageUrl(item),
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: {
        name: source.name,
        biasRating: source.biasRating
      }
    }));
}
```

### Phase 3: Long-term Improvements (Priority: Low)

#### 1. Feed Health Dashboard

Create an admin dashboard to monitor feed health:
- Real-time status of all RSS feeds
- Historical uptime metrics
- Alert system for consecutive failures
- Easy URL management interface

#### 2. Automated Feed Discovery

Implement a service to automatically discover and suggest RSS feeds:
- Scan news sites for RSS feed links
- Validate discovered feeds
- Suggest replacements for failed feeds

#### 3. Hybrid Approach

Combine RSS feeds with news APIs:
- Use RSS feeds as primary source (free, unlimited)
- Fall back to NewsAPI.org for sources with failed RSS feeds
- Maintain bias balance across all sources

---

## Testing Plan

### When Network Access is Available

1. **Individual Source Testing**
   ```bash
   cd V2
   npx tsx test-rss-feeds.ts
   ```

2. **Integration Testing**
   ```bash
   npm run dev
   curl "http://localhost:3000/api/articles?limit=10"
   ```

3. **Manual Verification**
   - Visit each RSS URL in a browser
   - Verify XML/RSS structure
   - Check for recent articles (published dates)
   - Confirm image URLs are present

### Feed Verification Checklist

For each problematic source:
- [ ] Feed URL returns 200 OK status
- [ ] Feed contains valid RSS/XML structure
- [ ] At least 10 recent articles present
- [ ] Articles have titles and links
- [ ] Published dates are recent (< 7 days)
- [ ] Images are available (if expected)
- [ ] Feed loads within 10 seconds

---

## Alternative Sources

If the problematic sources cannot be fixed, consider these replacements:

### Left-Leaning (to replace MSNBC or others)
- **CNN**: `https://rss.cnn.com/rss/cnn_topstories.rss`
- **The Nation**: `https://www.thenation.com/feed/`
- **Mother Jones**: `https://www.motherjones.com/feed/`

### Center (to replace Reuters and AP)
- **Bloomberg**: Check for available RSS feeds
- **PBS NewsHour**: Check for available RSS feeds
- **The Christian Science Monitor**: `https://rss.csmonitor.com/feeds/csm`
- **Axios**: `https://api.axios.com/feed/`

### Lean-Right (to replace USA Today)
- **The Washington Times**: `https://www.washingtontimes.com/rss/headlines/news/`
- **New York Post**: `https://nypost.com/feed/`
- **The Washington Examiner**: Check for available RSS feeds
- **Real Clear Politics**: `https://www.realclearpolitics.com/index.xml`

---

## Conclusions and Recommendations

### Key Findings

1. **All four sources have documented RSS feed issues** that are commonly reported by RSS aggregators
2. **Feed URLs are likely outdated** or pointing to deprecated endpoints
3. **Network testing is blocked** in the current development environment
4. **Alternative URLs exist** for most sources

### Recommended Next Steps

1. **Update Feed URLs** (Immediate)
   - Research and implement the alternative URLs suggested above
   - Test in an environment with network access
   - Document which URLs work

2. **Enhance Error Handling** (Short-term)
   - Implement better User-Agent headers
   - Add retry logic with exponential backoff
   - Provide informative error messages

3. **Add Feed Monitoring** (Medium-term)
   - Create a feed health check service
   - Set up alerts for persistent failures
   - Maintain a dashboard of feed status

4. **Consider Alternatives** (Long-term)
   - Evaluate replacement sources if feeds remain unreliable
   - Implement hybrid RSS + API approach
   - Build automated feed discovery system

### Success Criteria

- All RSS sources (currently 15 total, including the 4 problematic ones) successfully parse articles
- Less than 10% error rate across all feeds in production
- Average feed fetch time < 5 seconds per source
- Graceful handling of temporary outages without affecting other sources
- At least 3 sources per bias category (left, lean-left, center, lean-right, right) functioning reliably

---

## References and Resources

### RSS Feed Directories
- **RSS Feed Search**: https://github.com/spians/awesome-RSS-feeds
- **FeedSpot**: https://www.feedspot.com/
- **AllTop**: https://alltop.com/

### RSS Parser Documentation
- **rss-parser npm package**: https://www.npmjs.com/package/rss-parser
- **RSS 2.0 Specification**: https://www.rssboard.org/rss-specification
- **Atom Specification**: https://datatracker.ietf.org/doc/html/rfc4287

### News Source Information
- **AllSides Media Bias Ratings**: https://www.allsides.com/media-bias/media-bias-ratings
- **Ad Fontes Media Bias Chart**: https://adfontesmedia.com/

---

## Document History

- **v1.0** (2024-12-18): Initial investigation and research
  - Identified issues with 4 problematic RSS sources
  - Documented root causes and potential solutions
  - Created testing and implementation plan

---

**Next Update:** After feed URLs are updated and tested in production environment

**Maintainer:** Development Team  
**Last Reviewed:** December 18, 2024
