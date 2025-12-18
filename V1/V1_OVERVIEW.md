# Unbiased V1 - Application Overview

**Document Version:** 1.0  
**Created:** December 17, 2024  
**Purpose:** Historical documentation of the original Unbiased application

---

## Executive Summary

Unbiased V1 is a news aggregation platform designed to help users identify media bias and consume news from diverse political perspectives. The application aggregates articles from multiple news sources across the political spectrum, categorizes them by topic (Politics, Business, Science, Sports), and labels each source with bias indicators (left-leaning, minimal, right-leaning).

**Current Status:** Functional but requires security updates and modernization  
**Deployment Target:** Heroku  
**Primary Purpose:** Proof of concept for bias-aware news aggregation

---

## Technology Stack

### Backend

- **Runtime:** Node.js v10.16.3 (⚠️ End of Life - April 2020)
- **Framework:** Express.js 4.17.1
- **Database:** MongoDB with Mongoose ODM (5.7.12)
- **API Integration:** NewsAPI (via Axios 0.19.0)
- **Authentication:** JWT (jsonwebtoken 8.5.1)
- **Additional Libraries:**
  - `cors` 2.8.5 - CORS middleware
  - `dotenv` 8.2.0 - Environment variable management
  - `mongoose-unique-validator` 2.0.3 - Unique field validation

### Frontend

- **Framework:** React 16.12.0
- **Build Tool:** Create React App 3.2.0
- **Routing:** React Router DOM 5.1.2
- **HTTP Client:** Axios 0.19.0
- **Styling:** Custom CSS (in `src/styles/`)

### Development Tools

- **Process Manager:** Nodemon 2.0.1
- **Concurrent Execution:** Concurrently 5.0.0
- **Package Manager:** npm 6.13.1

---

## Project Structure

```
unbiased/
├── client/                    # React frontend application
│   ├── public/               # Static assets
│   │   ├── favicon.ico
│   │   ├── index.html        # HTML entry point
│   │   ├── manifest.json     # PWA manifest
│   │   └── robots.txt
│   ├── src/                  # React source code
│   │   ├── assets/          # Images and static resources
│   │   ├── components/      # React components
│   │   │   ├── Header.js    # Navigation header
│   │   │   ├── Home.js      # Landing page
│   │   │   ├── newsPages/   # News category pages
│   │   │   │   ├── businessNews.js
│   │   │   │   ├── politicsNews.js
│   │   │   │   ├── scienceNews.js
│   │   │   │   ├── sportsNews.js
│   │   │   │   └── searchNews.js
│   │   │   └── profilePages/ # User profile components
│   │   │       └── ProfilePage.js
│   │   ├── styles/          # CSS stylesheets
│   │   ├── App.js           # Main application component
│   │   ├── index.js         # React entry point
│   │   └── serviceWorker.js # PWA service worker
│   ├── package.json         # Frontend dependencies
│   └── README.md            # Create React App documentation
│
├── helpers/                  # Backend utility functions
│   ├── api-mongo/           # News API to MongoDB integration
│   │   ├── business.js      # Business news fetcher
│   │   ├── politics.js      # Politics news fetcher
│   │   ├── science.js       # Science news fetcher
│   │   └── sports.js        # Sports news fetcher
│   └── helper.js            # Scheduled article updates
│
├── models/                   # Mongoose data models
│   ├── BookmarkModel.js     # User bookmarks
│   ├── UserModel.js         # User accounts
│   ├── businessModel.js     # Business articles
│   ├── politicsModel.js     # Politics articles
│   ├── scienceModel.js      # Science articles
│   └── sportsModel.js       # Sports articles
│
├── routes/                   # Express API routes
│   ├── businessRoute.js     # Business endpoints
│   ├── politicsRoute.js     # Politics endpoints
│   ├── scienceRoute.js      # Science endpoints
│   ├── sportsRoute.js       # Sports endpoints
│   ├── searchRoute.js       # Search endpoints
│   ├── login.js             # Authentication
│   └── registration.js      # User registration
│
├── .env                      # Environment variables (not in git)
├── .gitignore               # Git ignore rules
├── package.json             # Backend dependencies
├── server.js                # Express server entry point
└── work_plan.md             # V2 migration work plan
```

---

## Core Features

### 1. Multi-Source News Aggregation

The application fetches news articles from multiple sources using the NewsAPI service and stores them in MongoDB. Articles are categorized into four main topics:

- **Politics** - Political news and government affairs
- **Business** - Business, economics, and market news
- **Science** - Scientific discoveries and technology news
- **Sports** - Sports news and events

### 2. Bias Classification

Each article is labeled with a bias indicator based on the source:

- **Left-leaning** - Sources like Politico, The Washington Post, The New York Times
- **Minimal bias** - Sources like ABC News, Reuters, USA Today
- **Right-leaning** - Sources like Fox News, The Wall Street Journal, National Review, The Hill

### 3. Automated Updates

The system automatically fetches new articles twice daily at scheduled times (1:00 PM and 4:00 PM) using a time-based trigger in the `helper.js` module.

### 4. Search Functionality

Users can search across all articles to find specific topics or keywords.

### 5. User Accounts (Planned/Partial)

The application includes models and routes for user registration, login, and bookmarking, though the full implementation status is unclear from the codebase.

---

## Data Models

### Article Models

Each category (Politics, Business, Science, Sports) has its own Mongoose model with the following schema:

```javascript
{
  source: {
    id: String,
    name: String
  },
  author: String,
  title: String,
  bias: String,              // "left-leaning", "minimal", "right-leaning"
  description: String,
  url: String,               // Unique identifier
  imageURL: String,
  imageType: String,         // "wide-image"
  publishedAt: Date
}
```

### User Model

```javascript
{
  username: String,          // Unique, required
  email: String,             // Unique, required
  password: String,          // Hashed password
  // Additional fields may exist
}
```

### Bookmark Model

Allows users to save articles for later reading.

---

## News Sources by Bias

### Left-Leaning Sources
- Politico
- The Washington Post
- The New York Times

### Minimal Bias Sources
- ABC News
- Reuters
- USA Today

### Right-Leaning Sources
- Fox News
- The Wall Street Journal
- National Review
- The Hill

---

## API Endpoints

### News Retrieval
- `GET /politics` - Fetch politics articles
- `GET /business` - Fetch business articles
- `GET /science` - Fetch science articles
- `GET /sports` - Fetch sports articles
- `GET /search` - Search articles (with query parameters)

### User Management
- `POST /register` - Register new user
- `POST /login` - Authenticate user

---

## Configuration

### Environment Variables

The application requires the following environment variables in a `.env` file:

```env
CAP_KEY=<NewsAPI API Key>
DB_KEY=<MongoDB Connection String>
MONGODB_URI=<MongoDB URI for production>
PORT=5000
NODE_ENV=development|production
```

### API Integration

The application uses NewsAPI (newsapi.org) to fetch articles. API calls are structured as:

```
https://newsapi.org/v2/everything?
  language=en&
  sources=<source-list>&
  q=<topic>&
  pageSize=<count>&
  apiKey=<key>
```

---

## Build and Deployment

### Local Development

**Prerequisites:**
- Node.js 10.16.3 (or compatible version)
- npm 6.13.1
- MongoDB instance (local or MongoDB Atlas)
- NewsAPI API key

**Setup:**

1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client && npm install && cd ..
   ```
4. Create `.env` file with required variables
5. Start development servers:
   ```bash
   npm run dev
   ```

This runs both the Express server (port 5000) and React development server (port 3000) concurrently.

**Available Scripts:**

```bash
npm start          # Start production server
npm run server     # Start backend with nodemon
npm run client     # Start frontend only
npm run dev        # Start both servers concurrently
```

### Production Deployment (Heroku)

The `package.json` includes a `heroku-postbuild` script that:
1. Installs client dependencies
2. Builds the React app for production
3. Serves static files from `client/build/`

The Express server serves the React build in production mode.

---

## Security Assessment & Vulnerabilities

### Critical Security Issues ⚠️

#### 1. Outdated Node.js Version
- **Current:** Node.js v10.16.3 (Released: April 2019)
- **Status:** End of Life (April 2020)
- **Risk:** No security patches for 4+ years
- **Impact:** HIGH - Exposed to known Node.js vulnerabilities

#### 2. Dependency Vulnerabilities

**Root Package Dependencies:**
- **Total Vulnerabilities:** 43
  - Critical: 4
  - High: 22
  - Moderate: 12
  - Low: 5

**Client Dependencies:**
- **Total Vulnerabilities:** 221
  - Critical: 21
  - High: 62
  - Moderate: 126
  - Low: 12

#### 3. Specific Critical Vulnerabilities

**Backend (Root):**
- `axios@0.19.0` - Multiple SSRF and denial of service vulnerabilities
- `jsonwebtoken@8.5.1` - Potential security issues with token validation
- `minimist@>=1.2.3` - Prototype pollution vulnerability
- `mongoose@5.7.12` - Outdated with known issues
- Transitive dependencies: `ansi-regex`, `y18n`, `yargs-parser`, `undefsafe`

**Frontend (Client):**
- `react-scripts@3.2.0` - 221 vulnerabilities in build toolchain
- `axios@0.19.0` - Same vulnerabilities as backend
- Transitive dependencies: Babel, webpack, jest, and related tools with known vulnerabilities

---

## Security Recommendations

### Immediate Actions Required

1. **Update Node.js Version**
   - Migrate to Node.js 18.x LTS or 20.x LTS
   - Update package.json engines field
   - Test compatibility with updated runtime

2. **Update Critical Dependencies**
   
   **Backend:**
   ```bash
   npm install axios@latest
   npm install jsonwebtoken@latest
   npm install mongoose@latest
   npm install express@latest
   npm audit fix
   ```

   **Frontend:**
   ```bash
   cd client
   npm install react@latest react-dom@latest
   npm install react-scripts@latest
   npm audit fix --force
   ```

3. **Environment Security**
   - Ensure `.env` is in `.gitignore` (appears to be configured)
   - Rotate API keys and MongoDB credentials
   - Use environment-specific configurations
   - Enable MongoDB authentication and use secure connection strings

4. **Authentication Security**
   - Review JWT implementation for best practices
   - Implement token expiration and refresh mechanisms
   - Use secure password hashing (bcrypt with appropriate salt rounds)
   - Add rate limiting to login/registration endpoints

5. **API Security**
   - Implement rate limiting on all endpoints
   - Add request validation and sanitization
   - Implement proper CORS configuration (currently wide open)
   - Add helmet.js for security headers

### Medium-Term Improvements

1. **Dependency Management**
   - Set up Dependabot for automated security updates
   - Establish a regular dependency update schedule
   - Use `npm audit` in CI/CD pipeline
   - Consider using `npm ci` for deterministic builds

2. **Code Quality**
   - Add linting (ESLint) with security rules
   - Implement input validation on all user inputs
   - Add comprehensive error handling
   - Remove unused dependencies

3. **Testing**
   - Add security-focused tests
   - Test authentication and authorization flows
   - Add API endpoint testing
   - Implement integration tests

---

## Known Limitations

### Technical Limitations

1. **No Article Deduplication** - Same story from different sources stored separately
2. **No Story Clustering** - Cannot group related articles about the same event
3. **Fixed Update Schedule** - Articles only updated twice daily at specific times
4. **No Caching Layer** - All requests hit MongoDB directly
5. **Limited Search** - Basic keyword search without advanced features
6. **No Pagination** - May have performance issues with large result sets
7. **No Rate Limiting** - NewsAPI and MongoDB calls not throttled

### Architecture Limitations

1. **Tightly Coupled Components** - Hard to test or modify individual pieces
2. **No Separation of Concerns** - Business logic mixed with routes and models
3. **No API Versioning** - Breaking changes would affect all clients
4. **Monolithic Structure** - Single server handles all responsibilities
5. **No Background Jobs** - Article updates run in main server process
6. **No Error Recovery** - Failed API calls or database operations not retried

### User Experience Limitations

1. **No Real-Time Updates** - Users must refresh to see new content
2. **Basic UI** - Minimal styling and interactivity
3. **No Mobile Optimization** - Responsive design may be limited
4. **No User Preferences** - Cannot customize source selection or bias filters
5. **Limited Article Context** - No related articles or background information

---

## Future Migration Path (V2)

The V2 version addresses these limitations with:

- **Modern Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL
- **Story Clustering:** AI-powered semantic similarity using embeddings
- **Better Architecture:** Separation of concerns, background jobs, caching
- **Enhanced Security:** Modern authentication, rate limiting, input validation
- **Improved UX:** Real-time updates, advanced search, personalization
- **Scalability:** Designed for production deployment and growth

See `work_plan.md` for detailed V2 migration strategy.

---

## Backup and Preservation Notes

### Why Preserve V1?

1. **Historical Reference** - Original implementation and design decisions
2. **Feature Reference** - Working news aggregation and bias labeling logic
3. **Migration Support** - May need to reference during V2 development
4. **Rollback Option** - Fallback if V2 development encounters issues
5. **Learning Resource** - Shows evolution of the project

### Preservation Strategy

As outlined in `work_plan.md`, V1 will be:
- Moved to a `V1/` directory in the repository
- Kept in a functional state (can be run for reference)
- Documented thoroughly (this document)
- Not actively maintained or deployed
- Used as reference during V2 development

---

## How to Run V1 (For Reference)

⚠️ **Warning:** V1 has significant security vulnerabilities and should only be run in isolated development environments.

**Quick Start:**

```bash
# Ensure you have Node.js 10.x-14.x installed
# Later versions may have compatibility issues

# Install dependencies
npm install
cd client && npm install && cd ..

# Create .env file with:
# CAP_KEY=your_newsapi_key
# DB_KEY=your_mongodb_connection_string

# Run development servers
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**For Reference Only - Not Recommended for Production Use**

---

## Conclusion

Unbiased V1 successfully demonstrates the core concept of bias-aware news aggregation. While functional as a proof of concept, it requires significant security updates and architectural improvements before production deployment. The V2 rewrite addresses these concerns with modern technologies and best practices.

This document serves as a historical record and reference for understanding the original implementation during the migration to V2.

---

**Document Status:** ✅ Complete  
**Next Steps:** Proceed with Phase 2 of work_plan.md (Branch Migration)
