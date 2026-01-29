# Unbiased V2 API Reference

## Overview

The Unbiased V2 API provides endpoints for retrieving and managing news articles from multiple sources across the political spectrum. The API is built with Next.js 16, TypeScript, Prisma ORM, and PostgreSQL.

**Base URL:** `http://localhost:3000` (development)

**Version:** V2

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [GET /api/articles](#get-apiarticles)
   - [POST /api/articles](#post-apiarticles)
3. [Data Models](#data-models)
4. [Database Schema](#database-schema)
5. [RSS Sources](#rss-sources)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## Endpoints

### GET /api/articles

Retrieves articles from the database with filtering and pagination support.

#### URL

```
GET /api/articles
```

#### Query Parameters

| Parameter | Type   | Required | Default | Constraints | Description |
|-----------|--------|----------|---------|-------------|-------------|
| `source`  | string | No       | -       | Case-insensitive | Filter articles by source name (e.g., "The Guardian", "Fox News") |
| `limit`   | number | No       | 50      | Min: 1, Max: 100 | Maximum number of articles to return per page |
| `page`    | number | No       | 1       | Min: 1 | Page number for pagination (1-indexed) |

#### Response Schema

```typescript
{
  articles: ParsedArticle[];
  count: number;           // Number of articles returned in current page
  totalCount: number;      // Total number of articles matching query
  page: number;            // Current page number
  totalPages: number;      // Total number of pages available
  sources: string[];       // List of unique source names in results
  usedMockData: boolean;   // Always false for database queries
  errors: string[];        // Any errors encountered
  timestamp: string;       // ISO 8601 timestamp of response
}
```

#### ParsedArticle Schema

```typescript
interface ParsedArticle {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: Date;        // ISO 8601 timestamp
  source: {
    name: string;
    biasRating: 'left' | 'lean-left' | 'center' | 'lean-right' | 'right';
  };
}
```

#### Sorting

Articles are returned sorted by `publishedAt` in descending order (newest first).

#### Example Requests

##### Get all articles (default pagination)

```bash
curl http://localhost:3000/api/articles
```

##### Get articles from a specific source

```bash
curl "http://localhost:3000/api/articles?source=The%20Guardian"
```

##### Get articles with custom limit and page

```bash
curl "http://localhost:3000/api/articles?limit=20&page=2"
```

##### Filter by source with pagination

```bash
curl "http://localhost:3000/api/articles?source=BBC%20News&limit=10&page=1"
```

#### Example Response

```json
{
  "articles": [
    {
      "title": "Global Climate Summit Reaches Historic Agreement",
      "description": "World leaders have agreed to unprecedented climate action measures at the annual summit...",
      "url": "https://www.theguardian.com/environment/2024/12/climate-summit-agreement",
      "imageUrl": "https://example.com/images/climate-summit.jpg",
      "publishedAt": "2024-12-18T10:00:00.000Z",
      "source": {
        "name": "The Guardian",
        "biasRating": "left"
      }
    },
    {
      "title": "Economic Indicators Show Mixed Signals for Markets",
      "description": "Latest economic data presents a complex picture for investors...",
      "url": "https://www.wsj.com/economy/markets-mixed-signals-2024",
      "imageUrl": "https://example.com/images/economy.jpg",
      "publishedAt": "2024-12-18T09:30:00.000Z",
      "source": {
        "name": "Wall Street Journal",
        "biasRating": "lean-right"
      }
    }
  ],
  "count": 2,
  "totalCount": 247,
  "page": 1,
  "totalPages": 13,
  "sources": [
    "The Guardian",
    "Wall Street Journal"
  ],
  "usedMockData": false,
  "errors": [],
  "timestamp": "2024-12-18T12:00:00.000Z"
}
```

#### HTTP Status Codes

- **200 OK** - Request successful
- **500 Internal Server Error** - Database query failed or unexpected error

---

### POST /api/articles

Fetches articles from RSS feeds and populates the database. This endpoint triggers an update process that:
1. Fetches articles from all configured RSS sources
2. Filters articles to only include those from yesterday onwards
3. Upserts sources and articles into the database
4. Returns statistics about the operation

#### URL

```
POST /api/articles
```

#### Request Body

No request body required.

#### Time Range

Articles are fetched from the beginning of the previous day (00:00:00 in server timezone) to the current time.

#### De-duplication

- Articles are identified by their `url` field (unique constraint in database)
- If an article with the same URL already exists, it will be updated with the latest data
- Sources are identified by their `domain` field (unique constraint)

#### Response Schema

```typescript
{
  success: boolean;         // Indicates if operation completed successfully
  sourcesCreated: number;   // Number of new sources added to database
  sourcesUpdated: number;   // Number of existing sources updated
  articlesCreated: number;  // Number of new articles added to database
  articlesUpdated: number;  // Number of existing articles updated (by URL)
  articlesSkipped: number;  // Number of articles that couldn't be processed
  errors: string[];         // Array of error messages from RSS feed parsing
  timestamp: string;        // ISO 8601 timestamp of when operation completed
}
```

#### Example Request

```bash
curl -X POST http://localhost:3000/api/articles
```

#### Example Response (Success)

```json
{
  "success": true,
  "sourcesCreated": 0,
  "sourcesUpdated": 15,
  "articlesCreated": 247,
  "articlesUpdated": 12,
  "articlesSkipped": 0,
  "errors": [],
  "timestamp": "2024-12-18T22:00:00.000Z"
}
```

#### Example Response (With Errors)

```json
{
  "success": true,
  "sourcesCreated": 0,
  "sourcesUpdated": 13,
  "articlesCreated": 198,
  "articlesUpdated": 8,
  "articlesSkipped": 5,
  "errors": [
    "Breitbart: Failed to fetch RSS feed - connection timeout",
    "The Daily Wire: Invalid RSS format"
  ],
  "timestamp": "2024-12-18T22:00:00.000Z"
}
```

#### Use Cases

1. **Manual article refresh** - Call this endpoint to update articles on-demand
2. **Scheduled updates** - Set up a cron job or scheduled task to call this endpoint periodically (recommended: every 30-60 minutes)
3. **Initial data population** - Call once after deployment to populate the database with recent articles

#### Error Handling

- Individual RSS feed failures do not stop the entire process
- Errors are logged in the `errors` array in the response
- The endpoint returns `200 OK` even if some feeds fail, as long as the overall process completes
- Returns `500 Internal Server Error` only if the entire operation fails (e.g., database connection failure)

#### HTTP Status Codes

- **200 OK** - Update process completed (even if some feeds failed)
- **500 Internal Server Error** - Entire update process failed

---

## Data Models

### ParsedArticle

Articles returned by the GET endpoint are transformed into this simplified format:

```typescript
interface ParsedArticle {
  title: string;                    // Article headline
  description: string | null;       // Article summary or excerpt
  url: string;                      // Full URL to original article
  imageUrl: string | null;          // URL to article's featured image
  publishedAt: Date;                // When article was published (ISO 8601)
  source: {
    name: string;                   // Human-readable source name
    biasRating: BiasRating;         // Political bias classification
  };
}
```

### BiasRating

```typescript
type BiasRating = 
  | 'left'         // Strongly left-leaning
  | 'lean-left'    // Moderately left-leaning
  | 'center'       // Politically neutral/balanced
  | 'lean-right'   // Moderately right-leaning
  | 'right';       // Strongly right-leaning
```

---

## Database Schema

### Source Model

Represents a news source/publication.

```typescript
model Source {
  id          String    @id @default(uuid())
  name        String                            // Display name (e.g., "The Guardian")
  domain      String    @unique                 // Unique domain identifier
  rssUrl      String?                           // RSS feed URL
  biasRating  String                            // "left", "lean-left", "center", "lean-right", "right"
  reliability String                            // "very-high", "high", "mixed", "low"
  articles    Article[]                         // Relation to articles
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Indexes:**
- `domain` (unique)

### Article Model

Represents a news article.

```typescript
model Article {
  id          String    @id @default(uuid())
  title       String                            // Article headline
  description String?                           // Article summary/excerpt
  url         String    @unique                 // Article URL (used for de-duplication)
  imageUrl    String?                           // Featured image URL
  publishedAt DateTime                          // Publication timestamp
  fetchedAt   DateTime  @default(now())        // When article was fetched into DB
  sourceId    String                            // Foreign key to Source
  source      Source    @relation(fields: [sourceId], references: [id])
  clusterId   String?                           // Foreign key to Cluster (optional)
  cluster     Cluster?  @relation(fields: [clusterId], references: [id])
  keywords    String[]                          // Array of extracted keywords
  
  @@index([publishedAt])
  @@index([sourceId])
  @@index([clusterId])
}
```

**Indexes:**
- `url` (unique)
- `publishedAt`
- `sourceId`
- `clusterId`

### Cluster Model

Represents a story cluster grouping related articles.

```typescript
model Cluster {
  id          String    @id @default(uuid())
  topic       String                            // Main topic/subject
  mainEntity  String                            // Primary subject/entity
  firstSeenAt DateTime                          // When cluster was first created
  articles    Article[]                         // Related articles
  
  @@index([firstSeenAt])
}
```

**Indexes:**
- `firstSeenAt`

---

## RSS Sources

The API fetches articles from 15 RSS feeds across the political spectrum:

### Left

| Source | Domain | RSS URL |
|--------|--------|---------|
| The Guardian | theguardian.com | https://www.theguardian.com/world/rss |
| NBC News | nbcnews.com | https://www.nbcnews.com/rss/nbcnews/public/news |
| Huffington Post | huffpost.com | https://www.huffpost.com/section/front-page/feed |

### Lean-Left

| Source | Domain | RSS URL |
|--------|--------|---------|
| NPR | npr.org | https://feeds.npr.org/1001/rss.xml |
| The New York Times | nytimes.com | https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml |
| Washington Post | washingtonpost.com | https://feeds.washingtonpost.com/rss/world |

### Center

| Source | Domain | RSS URL |
|--------|--------|---------|
| BBC News | bbc.co.uk | https://feeds.bbci.co.uk/news/rss.xml |
| Bloomberg | bloomberg.com | https://feeds.bloomberg.com/politics/news.rss |
| Axios | axios.com | https://api.axios.com/feed/ |

### Lean-Right

| Source | Domain | RSS URL |
|--------|--------|---------|
| Wall Street Journal | wsj.com | https://feeds.a.dj.com/rss/RSSWorldNews.xml |
| The Hill | thehill.com | https://thehill.com/feed/ |
| The Washington Times | washingtontimes.com | https://www.washingtontimes.com/rss/headlines/news/ |

### Right

| Source | Domain | RSS URL |
|--------|--------|---------|
| Fox News | foxnews.com | https://moxie.foxnews.com/google-publisher/latest.xml |
| Breitbart | breitbart.com | https://www.breitbart.com/feed/ |
| The Daily Wire | dailywire.com | https://www.dailywire.com/feeds/rss.xml |

---

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message summary",
  "message": "Detailed error message"
}
```

### Common Errors

#### 500 Internal Server Error (GET)

**Cause:** Database query failed

```json
{
  "error": "Database query failed",
  "message": "Connection to database lost"
}
```

#### 500 Internal Server Error (POST)

**Cause:** Article update process failed

```json
{
  "error": "Failed to update articles",
  "message": "Database connection error"
}
```

### Partial Failures (POST)

The POST endpoint is designed to be resilient. If individual RSS feeds fail, the process continues with other feeds. Failed feeds are reported in the `errors` array:

```json
{
  "success": true,
  "sourcesCreated": 0,
  "sourcesUpdated": 13,
  "articlesCreated": 180,
  "articlesUpdated": 5,
  "articlesSkipped": 3,
  "errors": [
    "Fox News: HTTP 503 Service Unavailable",
    "The Daily Wire: Timeout after 30s"
  ],
  "timestamp": "2024-12-18T22:00:00.000Z"
}
```

---

## Examples

### Example 1: Getting Recent Articles

Get the 10 most recent articles from all sources:

```bash
curl "http://localhost:3000/api/articles?limit=10"
```

**Response:**

```json
{
  "articles": [
    {
      "title": "Breaking: Major Policy Announcement",
      "description": "Government announces new policy changes...",
      "url": "https://www.bbc.com/news/article-123",
      "imageUrl": "https://example.com/img.jpg",
      "publishedAt": "2024-12-18T15:30:00.000Z",
      "source": {
        "name": "BBC News",
        "biasRating": "center"
      }
    }
    // ... 9 more articles
  ],
  "count": 10,
  "totalCount": 1247,
  "page": 1,
  "totalPages": 125,
  "sources": ["BBC News", "The Guardian", "Fox News"],
  "usedMockData": false,
  "errors": [],
  "timestamp": "2024-12-18T16:00:00.000Z"
}
```

### Example 2: Filtering by Source

Get articles from Fox News only:

```bash
curl "http://localhost:3000/api/articles?source=Fox%20News&limit=5"
```

**Response:**

```json
{
  "articles": [
    {
      "title": "Fox News Article Title",
      "description": "Article description...",
      "url": "https://www.foxnews.com/politics/article-xyz",
      "imageUrl": "https://example.com/fox.jpg",
      "publishedAt": "2024-12-18T14:00:00.000Z",
      "source": {
        "name": "Fox News",
        "biasRating": "right"
      }
    }
    // ... 4 more articles
  ],
  "count": 5,
  "totalCount": 87,
  "page": 1,
  "totalPages": 18,
  "sources": ["Fox News"],
  "usedMockData": false,
  "errors": [],
  "timestamp": "2024-12-18T16:00:00.000Z"
}
```

### Example 3: Pagination

Navigate through articles with pagination:

```bash
# Get page 1 (first 20 articles)
curl "http://localhost:3000/api/articles?limit=20&page=1"

# Get page 2 (next 20 articles)
curl "http://localhost:3000/api/articles?limit=20&page=2"

# Get page 3 (next 20 articles)
curl "http://localhost:3000/api/articles?limit=20&page=3"
```

### Example 4: Updating Articles from RSS Feeds

Trigger a manual update of articles:

```bash
curl -X POST http://localhost:3000/api/articles
```

**Response:**

```json
{
  "success": true,
  "sourcesCreated": 0,
  "sourcesUpdated": 15,
  "articlesCreated": 234,
  "articlesUpdated": 18,
  "articlesSkipped": 2,
  "errors": [],
  "timestamp": "2024-12-18T16:00:00.000Z"
}
```

### Example 5: Scheduled Updates with Cron

Set up a cron job to update articles every hour:

```bash
# Edit crontab
crontab -e

# Add this line to run every hour at :00
0 * * * * curl -X POST http://localhost:3000/api/articles > /dev/null 2>&1
```

Or using a Node.js script:

```javascript
// update-articles.js
const fetch = require('node-fetch');

async function updateArticles() {
  try {
    const response = await fetch('http://localhost:3000/api/articles', {
      method: 'POST'
    });
    const data = await response.json();
    console.log(`Updated: ${data.articlesCreated} created, ${data.articlesUpdated} updated`);
  } catch (error) {
    console.error('Update failed:', error);
  }
}

updateArticles();
```

### Example 6: Building a Simple Client

JavaScript/TypeScript example using the API:

```typescript
// api-client.ts
interface GetArticlesParams {
  source?: string;
  limit?: number;
  page?: number;
}

class UnbiasedAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async getArticles(params: GetArticlesParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.source) queryParams.append('source', params.source);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.page) queryParams.append('page', params.page.toString());

    const url = `${this.baseUrl}/api/articles?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }

  async updateArticles() {
    const response = await fetch(`${this.baseUrl}/api/articles`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
}

// Usage
const client = new UnbiasedAPIClient();

// Get articles
const articles = await client.getArticles({ limit: 10 });
console.log(`Found ${articles.count} articles`);

// Update articles
const updateResult = await client.updateArticles();
console.log(`Created ${updateResult.articlesCreated} new articles`);
```

---

## Rate Limiting

Currently, the API does not implement rate limiting. In production, consider implementing rate limiting to prevent abuse.

---

## Versioning

This is version 2 (V2) of the Unbiased API. The API version is indicated in the URL path structure and codebase organization.

---

## Support

For issues, questions, or contributions, please refer to the project's GitHub repository.

---

## Changelog

### V2 (Current)
- Database-backed article storage with PostgreSQL and Prisma
- Pagination support for GET endpoint
- Improved error handling with detailed error messages
- RSS feed-based article updates via POST endpoint
- De-duplication by article URL
- Support for 15 RSS sources across political spectrum
- Article clustering support (schema in place, clustering logic in development)

---

## Future Enhancements

Planned features for future releases:

- [ ] Article clustering API endpoint
- [ ] Filtering by date range
- [ ] Filtering by bias rating
- [ ] Keyword search across articles
- [ ] Caching layer for improved performance
- [ ] Rate limiting and authentication
- [ ] WebSocket support for real-time updates
- [ ] Article sentiment analysis
- [ ] Source reliability scoring
- [ ] Article fact-checking integration
