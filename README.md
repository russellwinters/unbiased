# Unbiased - Multi-Perspective News Aggregator

A news aggregation platform that provides multi-perspective coverage of current events, helping readers break out of information bubbles by presenting how different sources across the political spectrum cover the same stories.

> **⚠️ V1 Deprecation Notice**  
> The original V1 implementation (Node.js/Express/MongoDB) has been archived and is no longer under active development. It remains in the repository for reference purposes only. All current development is focused on V2.  
>
> **V1 Documentation:** [V1/README.md](V1/README.md) | [V1/V1_OVERVIEW.md](V1/V1_OVERVIEW.md)

---

## 🎯 Overview

In an era of polarized media and echo chambers, **Unbiased** helps readers:

- **See multiple perspectives** - View how different news sources cover the same story
- **Understand bias** - Transparent bias ratings for every news source
- **Break the bubble** - Discover coverage you might not find in your usual news feed
- **Stay informed** - Get comprehensive coverage of current events from across the spectrum

This isn't about eliminating bias (that's impossible) — it's about making bias transparent and helping readers see the full picture.

## 💡 Project Ethos

News sources have bias. That's not inherently bad — it's human. What matters is:

1. **Transparency** - Clearly labeling where sources fall on the political spectrum
2. **Diversity** - Aggregating from sources across the entire spectrum (left, center, right)
3. **Context** - Showing how the *same story* is covered differently by different sources
4. **Education** - Helping readers identify their own information bubbles

Unbiased doesn't tell you what to think. It gives you the tools to see how different sources frame the same events, so you can think more critically about the news you consume.

## 🛠 Tech Stack (V2)

V2 is a complete rewrite using modern web technologies:

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** SCSS/Sass
- **State Management:** TanStack Query (React Query)
- **News Aggregation:** RSS Parser
- **Development:** ESLint, Docker Compose (local DB)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **Docker** and **Docker Compose** (for local PostgreSQL database)

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/russellwinters/unbiased.git
   cd unbiased/V2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

4. **Start the PostgreSQL database**

   ```bash
   docker compose up -d
   ```

   This starts a containerized PostgreSQL database. To stop it later:

   ```bash
   docker compose down
   ```

5. **Initialize the database**

   ```bash
   npm run db:generate  # Generate Prisma Client
   npm run db:migrate   # Apply database schema migrations
   ```

6. **Seed the database** (optional but recommended)

   ```bash
   npm run db:seed
   ```

   This will:
   - Add news sources with bias ratings
   - Fetch recent articles from RSS feeds (past 24 hours)
   - Populate the database with up to 500 articles

7. **Start the development server**

   ```bash
   npm run dev
   ```

8. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ Key Features

### Current Features (V2)

- ✅ Modern Next.js 16 App Router architecture
- ✅ PostgreSQL database with Prisma ORM
- ✅ Type-safe development with TypeScript
- ✅ RSS feed aggregation from multiple sources
- ✅ Source-level bias indicators
- ✅ Article database with source relationships
- ✅ Responsive UI with SCSS styling
- ✅ Server-side rendering and API routes

### Planned Features

- 🔄 Story clustering (grouping related articles)
- 🔄 Multi-perspective story views
- 🔄 Advanced search and filtering
- 🔄 Topic-based browsing

## 📁 Project Structure

```
unbiased/
├── V1/                      # Legacy application (archived)
├── V2/                      # Current development version
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API routes (articles, sources)
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Home page
│   │   └── globals.scss   # Global styles
│   ├── components/        # React components
│   ├── lib/               # Business logic
│   │   ├── db/           # Database utilities
│   │   └── news/         # News aggregation
│   ├── prisma/           # Database schema & migrations
│   │   ├── schema.prisma # Prisma database schema
│   │   └── seed.ts       # Database seeding script
│   ├── public/           # Static assets
│   └── package.json      # Dependencies
├── docs/                  # Additional documentation
└── README.md             # This file
```

## 🗄 Database Schema

The V2 database is built on three core models:

### **Source**

News sources with bias ratings and reliability scores.

- Fields: `name`, `domain`, `rssUrl`, `biasRating`, `reliability`
- Bias Ratings: `left`, `lean-left`, `center`, `lean-right`, `right`
- Reliability: `very-high`, `high`, `mixed`, `low`

### **Article**

Individual news articles from sources.

- Fields: `title`, `description`, `url`, `imageUrl`, `publishedAt`, `source`, `keywords`
- Relationships: Belongs to a `Source`, optionally belongs to a `Cluster`

### **Cluster**

**Idea formed. Not technically implemented, underway, or planned.**

Groups of related articles covering the same story.

- Fields: `topic`, `mainEntity`, `firstSeenAt`
- Relationships: Has many `Articles`

See [V2/prisma/schema.prisma](V2/prisma/schema.prisma) for complete schema details.

## 🛠 Development

### Available Scripts

**Development:**

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database:**

- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Create and apply migrations
- `npm run db:push` - Push schema changes (skip migration files)
- `npm run db:studio` - Open Prisma Studio (database GUI at <http://localhost:5555>)
- `npm run db:reset` - Reset database and reapply all migrations
- `npm run db:seed` - Seed database with sources and articles

### API Endpoints

**`GET /api/articles`**  
Fetch articles from the database with optional filtering.

Query parameters:

- `source` - Filter by source name (case-insensitive)
- `limit` - Maximum number of articles to return per page (default: 50)
- `page` - Page number for pagination (1-indexed, default: 1)

**`POST /api/articles`**  
Fetch new articles from RSS feeds and store them in the database.

For detailed API documentation, see [docs/reference/API_REFERENCE.md](docs/reference/API_REFERENCE.md).

### Monorepo Commands

Run commands from the root directory:

```bash
# Run V2 in development
npm run dev:v2

# Build V2
npm run build:v2

# Or navigate to V2 directory
cd V2
npm run dev
```

## 📚 Documentation

### V2 Documentation

- [V2/README.md](V2/README.md) - Detailed V2 setup and architecture
- [docs/reference/API_REFERENCE.md](docs/reference/API_REFERENCE.md) - Complete API reference

### V1 (Legacy)

- [V1/README.md](V1/README.md) - V1 setup guide
- [V1/V1_OVERVIEW.md](V1/V1_OVERVIEW.md) - Complete V1 technical documentation

### Development Documentation

- [work_plan.md](work_plan.md) - Migration and development work plan

## 🔒 Security

- All dependencies kept up-to-date via Dependabot
- Security vulnerabilities addressed promptly
- Environment variables for sensitive data
- Type-safe database queries with Prisma

## 🗺 Roadmap

### ✅ Completed

- Phase 1: Repository preparation & documentation
- Phase 2: Branch migration (master → main)
- Phase 3: V1 directory structure & preservation
- Phase 4: V2 Next.js initialization with Prisma

### 🔄 Current: Phase 5 - Core Features

- RSS feed aggregation ✅
- Database seeding ✅
- Article browsing UI (in progress)
- Source filtering (in progress)

### 📋 Upcoming: Phase 6 - Multi-Perspective Views

- Story clustering implementation
- Multi-perspective story display
- Source bias visualization
- Search and filtering

### 🏁 Future: Phase 7 - Production

- Performance optimization
- Caching layer
- SEO optimization
- Production deployment to Vercel

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! To contribute:

1. Open an issue to discuss your idea
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or suggestions, please [open an issue](https://github.com/russellwinters/unbiased/issues) on GitHub.

---

**Current Status:** V2 Phase 5 - Core features under active development  
**Last Updated:** January 2025
