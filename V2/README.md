# Unbiased V2 - Modern News Aggregator

V2 is a complete rewrite of Unbiased using modern web technologies and improved architecture.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** SCSS/Sass
- **Database:** PostgreSQL + Prisma ORM
- **State Management:** TanStack Query (React Query)
- **Hosting:** Vercel (planned)

## 📋 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Docker and Docker Compose (for local PostgreSQL database)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/unbiased"
   OPENAI_API_KEY="sk-..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. Start the database:
   ```bash
   docker compose up -d
   ```
   
   This starts a PostgreSQL database in Docker. To stop it later:
   ```bash
   docker compose down
   ```

4. Set up database schema:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. (Optional) Seed database with initial data:
   ```bash
   npm run db:seed
   ```
   
   This will:
   - Fetch articles from RSS feeds (past 24 hours)
   - Populate up to 500 recent articles
   - Create source records with bias ratings

6. Run development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
V2/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.scss       # Global styles
├── components/            # React components
│   ├── articles/          # Article-related components
│   └── layout/            # Layout components
├── lib/                   # Business logic and utilities
│   ├── db/               # Database utilities
│   ├── news/             # News aggregation logic
│   ├── bias/             # Bias analysis utilities
│   └── utils/            # General utilities
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database Commands:**
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Create and apply database migrations
- `npm run db:push` - Push schema changes to database (skip migration files)
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:reset` - Reset database and apply all migrations
- `npm run db:seed` - Seed database with news sources and recent articles

### API Endpoints

See [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for detailed API documentation.

**Key Endpoints:**
- `GET /api/articles` - Fetch articles from database with optional filtering
- `POST /api/articles` - Update articles from RSS feeds (fetches from past day onwards)

### Styling with SCSS

This project uses SCSS for styling. Key files:

- `app/globals.scss` - Global styles and CSS variables
- `app/page.module.scss` - Component-specific styles
- CSS variables are used for theming and can be found in `globals.scss`

## ✨ Features (Planned)

- [ ] RSS feed aggregation from multiple sources
- [ ] Source bias ratings and indicators
- [ ] Story clustering and multi-perspective views
- [ ] AI-powered semantic similarity
- [ ] Article-level bias analysis (optional)
- [ ] Search and filtering
- [ ] Topic-based browsing

## 🗄 Database Schema

### Models

- **Source** - News sources with bias ratings
- **Article** - Individual news articles
- **Cluster** - Groups of related articles covering the same story

See `prisma/schema.prisma` for complete schema details.

## 🔗 UI Component Libraries (Future Consideration)

For future UI improvements, consider these libraries:

### Tailwind CSS
- **Purpose:** Utility-first CSS framework
- **Documentation:** [https://tailwindcss.com/](https://tailwindcss.com/)
- **Benefits:** Rapid UI development, design consistency, responsive utilities

### shadcn/ui
- **Purpose:** High-quality, accessible component library
- **Documentation:** [https://ui.shadcn.com/](https://ui.shadcn.com/)
- **Benefits:** Copy-paste components, full customization, built on Radix UI
- **Installation:** `npx shadcn-ui@latest init`
- **Popular Components:**
  - Button, Card, Badge, Separator
  - Dialog, Dropdown Menu, Popover
  - Table, Tabs, Toast

**Note:** Currently using SCSS for styling. These libraries can be integrated later for enhanced UI components.

## 🏗 Architecture

This application follows modern Next.js best practices:

- **App Router** - File-based routing with React Server Components
- **Server Components** - Default for improved performance
- **API Routes** - Built-in API endpoints in `/app/api`
- **Prisma ORM** - Type-safe database queries
- **React Query** - Server state management and caching

## 🤝 Contributing

This is a personal project. For questions or suggestions, please open an issue.

## 📄 License

See root LICENSE file for details.

## 🔗 Links

- [Main Repository](https://github.com/russellwinters/unbiased)
- [V1 (Legacy)](../V1/README.md)
- [Work Plan](../work_plan.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

---

**Status:** Phase 4 Complete - Basic project setup with Next.js, TypeScript, SCSS, and Prisma

**Last Updated:** December 18, 2024
