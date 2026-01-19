# API Documentation

## Articles API

### GET /api/articles

Fetches articles from the database.

**Query Parameters:**
- `source` (optional): Filter by source name (e.g., 'The Guardian', 'Fox News')
- `limit` (optional): Maximum number of articles to return (default: 50)

**Response:**
```json
{
  "articles": [
    {
      "title": "Article Title",
      "description": "Article description...",
      "url": "https://example.com/article",
      "imageUrl": "https://example.com/image.jpg",
      "publishedAt": "2026-01-19T00:00:00.000Z",
      "source": {
        "name": "Source Name",
        "biasRating": "center"
      }
    }
  ],
  "count": 10,
  "sources": ["Source Name 1", "Source Name 2"],
  "usedMockData": false,
  "errors": [],
  "timestamp": "2026-01-19T22:00:00.000Z"
}
```

**Example:**
```bash
# Get all articles
curl http://localhost:3000/api/articles

# Get articles from a specific source
curl http://localhost:3000/api/articles?source=BBC%20News

# Get limited number of articles
curl http://localhost:3000/api/articles?limit=10
```

---

### POST /api/articles

Fetches articles from RSS feeds and populates the database. Articles are fetched from the beginning of the previous day to the current time. De-duplication is handled through the unique `url` field on articles.

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "sourcesCreated": 15,
  "sourcesUpdated": 0,
  "articlesCreated": 247,
  "articlesUpdated": 12,
  "articlesSkipped": 3,
  "errors": [
    "Source Name: Error message if any"
  ],
  "timestamp": "2026-01-19T22:00:00.000Z"
}
```

**Response Fields:**
- `success`: Boolean indicating if the operation completed successfully
- `sourcesCreated`: Number of new sources added to the database
- `sourcesUpdated`: Number of existing sources that were updated
- `articlesCreated`: Number of new articles added to the database
- `articlesUpdated`: Number of existing articles that were updated (based on URL)
- `articlesSkipped`: Number of articles that couldn't be processed
- `errors`: Array of error messages from RSS feed parsing
- `timestamp`: ISO timestamp of when the operation completed

**De-duplication:**
- Articles are identified by their URL (unique constraint in database)
- If an article with the same URL already exists, it will be updated with the latest data
- This ensures no duplicate articles in the database

**Time Range:**
- Only fetches articles published from the start of the previous day onwards
- Previous day starts at 00:00:00 in the server's timezone

**Example:**
```bash
# Trigger article update
curl -X POST http://localhost:3000/api/articles

# Example response when RSS feeds are accessible:
# {
#   "success": true,
#   "sourcesCreated": 0,
#   "sourcesUpdated": 15,
#   "articlesCreated": 247,
#   "articlesUpdated": 12,
#   "articlesSkipped": 0,
#   "errors": [],
#   "timestamp": "2026-01-19T22:00:00.000Z"
# }
```

**Use Cases:**
- Manual article refresh: Call this endpoint to update articles on-demand
- Scheduled updates: Set up a cron job or scheduled task to call this endpoint periodically
- Initial data population: Call once after deployment to populate the database with recent articles

**Error Handling:**
- Individual RSS feed failures do not stop the entire process
- Errors are logged in the `errors` array in the response
- The endpoint returns 200 OK even if some feeds fail, as long as the overall process completes
- Returns 500 Internal Server Error only if the entire operation fails
