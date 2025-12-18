# News Module - RSS Feed POC

This module provides RSS feed parsing functionality for aggregating news articles from multiple sources.

## Features

- **RSS Feed Parsing**: Parses RSS feeds from 5 major news sources
- **Concurrent Fetching**: Fetches multiple RSS feeds in parallel for better performance
- **Graceful Fallback**: Automatically uses mock data when RSS feeds cannot be accessed
- **Type-Safe**: Full TypeScript support with defined interfaces
- **Bias Awareness**: Each source includes bias rating metadata

## Configured Sources

The following news sources are configured with their respective RSS feeds:

| Source | Bias Rating | RSS Feed URL |
|--------|-------------|--------------|
| The Guardian | lean-left | https://www.theguardian.com/world/rss |
| The New York Times | lean-left | https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml |
| Reuters | center | https://www.reutersagency.com/feed/ |
| Wall Street Journal | lean-right | https://feeds.a.dj.com/rss/RSSWorldNews.xml |
| Fox News | right | https://moxie.foxnews.com/google-publisher/latest.xml |

## Module Structure

```
lib/news/
├── index.ts          # Main exports
├── rss-sources.ts    # RSS source configuration
├── rss-parser.ts     # RSS parsing utilities
├── mock-data.ts      # Mock data for testing/fallback
└── README.md         # This file
```

## Usage

### Get All Sources

```typescript
import { getAllSources } from '@/lib/news';

const sources = getAllSources();
// Returns array of all configured RSS sources
```

### Parse RSS Feeds

```typescript
import { parseRSSFeed, parseMultipleFeeds, getAllSources } from '@/lib/news';

// Parse a single feed
const guardian = getSourceByKey('the-guardian');
if (guardian) {
  const articles = await parseRSSFeed(guardian);
}

// Parse multiple feeds concurrently
const sources = getAllSources();
const allArticles = await parseMultipleFeeds(sources);
```

### Use Mock Data

```typescript
import { getMockArticles, getMockArticlesBySource } from '@/lib/news';

// Get all mock articles
const articles = getMockArticles(10); // Limited to 10

// Get mock articles from a specific source
const foxNews = getMockArticlesBySource('Fox News', 5);
```

## Data Types

### ParsedArticle

```typescript
interface ParsedArticle {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: Date;
  source: {
    name: string;
    biasRating: string;
  };
}
```

### RSSSource

```typescript
interface RSSSource {
  name: string;
  url: string;
  biasRating: string;
}
```

## API Integration

The `/api/articles` endpoint uses this module to fetch and return articles. See [API Documentation](../../docs/API.md) for endpoint details.

## Error Handling

The module includes robust error handling:

- **Network Errors**: Caught and logged, with graceful degradation
- **Parsing Errors**: Individual feed failures don't prevent other feeds from being processed
- **Empty Results**: Automatically falls back to mock data when no articles are fetched

## Future Enhancements

- [ ] Caching layer to reduce external requests
- [ ] Database persistence for fetched articles
- [ ] Support for additional RSS sources
- [ ] Article deduplication
- [ ] Content extraction improvements
- [ ] Support for Atom feeds
- [ ] Rate limiting and request throttling
