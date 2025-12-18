# API Documentation

## GET /api/articles

Fetches and parses articles from configured RSS feeds. Falls back to mock data if RSS feeds cannot be accessed (e.g., in restricted network environments).

### Endpoint

```
GET /api/articles
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `source` | string | No | - | Filter articles by source name (e.g., "The Guardian", "Fox News") |
| `limit` | number | No | 50 | Maximum number of articles to return |
| `mock` | boolean | No | false | Force use of mock data instead of fetching RSS feeds |

### Response Schema

```typescript
{
  articles: ParsedArticle[];
  count: number;
  sources: string[];
  usedMockData: boolean;
  timestamp: string;
}
```

#### ParsedArticle Schema

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

### Configured RSS Sources

| Source | URL | Bias Rating |
|--------|-----|-------------|
| The Guardian | https://www.theguardian.com/world/rss | left |
| NBC News | https://www.nbcnews.com/rss/nbcnews/public/news | left |
| Huffington Post | https://www.huffpost.com/section/front-page/feed | left |
| NPR | https://feeds.npr.org/1001/rss.xml | lean-left |
| The New York Times | https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml | lean-left |
| Washington Post | https://feeds.washingtonpost.com/rss/world | lean-left |
| BBC News | https://feeds.bbci.co.uk/news/rss.xml | center |
| Bloomberg | https://feeds.bloomberg.com/politics/news.rss | center |
| Axios | https://api.axios.com/feed/ | center |
| Wall Street Journal | https://feeds.a.dj.com/rss/RSSWorldNews.xml | lean-right |
| The Hill | https://thehill.com/feed/ | lean-right |
| The Washington Times | https://www.washingtontimes.com/rss/headlines/news/ | lean-right |
| Fox News | https://moxie.foxnews.com/google-publisher/latest.xml | right |
| Breitbart | https://www.breitbart.com/feed/ | right |
| The Daily Wire | https://www.dailywire.com/feeds/rss.xml | right |

### Example Requests

#### Get all articles (limited to 10)

```bash
curl "http://localhost:3000/api/articles?limit=10"
```

#### Get articles from a specific source

```bash
curl "http://localhost:3000/api/articles?source=The%20Guardian&limit=5"
```

#### Force use of mock data

```bash
curl "http://localhost:3000/api/articles?mock=true&limit=5"
```

### Example Response

```json
{
  "articles": [
    {
      "title": "Global Climate Summit Reaches Historic Agreement",
      "description": "World leaders have agreed to unprecedented climate action measures...",
      "url": "https://www.theguardian.com/environment/2024/12/climate-summit-agreement",
      "imageUrl": "https://via.placeholder.com/800x400/4CAF50/FFFFFF?text=Climate+Summit",
      "publishedAt": "2024-12-18T10:00:00.000Z",
      "source": {
        "name": "The Guardian",
        "biasRating": "lean-left"
      }
    },
    {
      "title": "Economic Indicators Show Mixed Signals for Markets",
      "description": "Latest economic data presents a complex picture...",
      "url": "https://www.wsj.com/economy/markets-mixed-signals-2024",
      "imageUrl": "https://via.placeholder.com/800x400/2196F3/FFFFFF?text=Economy",
      "publishedAt": "2024-12-18T09:30:00.000Z",
      "source": {
        "name": "Wall Street Journal",
        "biasRating": "lean-right"
      }
    }
  ],
  "count": 2,
  "sources": [
    "The Guardian",
    "NBC News",
    "Huffington Post",
    "NPR",
    "The New York Times",
    "Washington Post",
    "BBC News",
    "Bloomberg",
    "Axios",
    "Wall Street Journal",
    "The Hill",
    "The Washington Times",
    "Fox News",
    "Breitbart",
    "The Daily Wire"
  ],
  "usedMockData": true,
  "timestamp": "2024-12-18T12:00:00.000Z"
}
```

### Error Responses

#### 400 Bad Request

Returned when an invalid source filter is provided.

```json
{
  "error": "No valid sources found"
}
```

#### 500 Internal Server Error

Returned when an unexpected error occurs.

```json
{
  "error": "Failed to fetch articles",
  "message": "Error details..."
}
```

## Notes

### Mock Data Fallback

The API automatically falls back to mock data when:
- RSS feeds cannot be accessed due to network restrictions
- No articles are returned from RSS feeds
- The `mock=true` query parameter is provided

The `usedMockData` field in the response indicates whether mock data was used.

### Network Restrictions

Some deployment environments (like sandboxes or containers) may have network restrictions that prevent external HTTP requests. In these cases, the API will automatically use mock data to demonstrate functionality.

### Future Enhancements

- Caching layer for RSS feed results
- Database storage for parsed articles
- Additional filters (date range, keywords, bias rating)
- Pagination support
- Article clustering for multi-perspective views
