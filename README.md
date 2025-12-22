# Unbiased - News Aggregator

A news aggregation platform that provides multi-perspective coverage with bias analysis, helping readers understand different viewpoints on current events.

## 📂 Repository Structure

This repository is organized as a monorepo containing two versions of Unbiased:

```
unbiased/
├── V1/              # Original implementation (preserved for reference)
├── V2/              # Modern rewrite (Phase 4 complete)
├── README.md        # This file
├── work_plan.md     # Migration work plan
└── package.json     # Monorepo workspace configuration
```

### V1 (Legacy)

The original Unbiased application, preserved for historical reference and potential migration needs.

- **Status:** Archived, read-only reference
- **Purpose:** Reference implementation, historical context
- **Tech Stack:** Node.js, Express, MongoDB, React 18, React Router v6
- **Documentation:** See [V1/README.md](V1/README.md) and [V1/V1_OVERVIEW.md](V1/V1_OVERVIEW.md)

### V2 (Current Development)

Complete rewrite using modern technologies and improved architecture based on extensive research and planning.

- **Status:** Active Development (Phase 4 Complete)
- **Tech Stack:** Next.js 16, TypeScript, Prisma, PostgreSQL, SCSS/Sass
- **Documentation:** See [V2/README.md](V2/README.md)

## 🚀 Quick Start

### Running V1 (Legacy)

```bash
# Navigate to V1
cd V1

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, NewsAPI key, etc.

# Run in development mode (backend + frontend)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

For detailed V1 setup instructions, see [V1/README.md](V1/README.md).

### Running V2

V2 has been initialized and is ready for development.

```bash
# Navigate to V2
cd V2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and other configuration

# Set up database
npx prisma generate
npx prisma migrate dev --name init

# Run in development mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎯 Project Goals

1. **Multi-Source Aggregation:** Collect news from diverse sources across the political spectrum
2. **Bias Transparency:** Provide clear, transparent bias ratings for sources
3. **Multi-Perspective Views:** Show how different sources cover the same story
4. **Story Clustering:** Group related articles using semantic similarity
5. **User Education:** Help readers identify their information bubbles

## ✨ Key Features

### V1 Features (Implemented)
- News aggregation from multiple sources
- Source-level bias indicators
- Multi-perspective news presentation
- Source-based filtering
- User authentication

### V2 Features (In Development)
- Modern Next.js 16 App Router architecture
- PostgreSQL database with Prisma ORM
- Type-safe development with TypeScript
- Responsive UI with SCSS/Sass styling
- Server-side rendering and API routes
- Planned: Advanced story clustering with AI
- Planned: Semantic similarity analysis using embeddings
- Planned: Article-level bias analysis (optional)
- Planned: Improved search and filtering
- Planned: Topic-based browsing

## 🛠 Development

This is a monorepo using npm workspaces. You can run commands for either version from the root:

```bash
# Install all dependencies (both V1 and V2)
npm install

# Run V1 in development mode
npm run dev:v1

# Run V2 in development mode
npm run dev:v2

# Build V1
npm run build:v1

# Build V2
npm run build:v2

# Start V1 backend only
npm run server:v1

# Start V1 frontend only
npm run client:v1
```

Or navigate to the specific version directory and run commands directly:

```bash
cd V1
npm run dev

# Or for V2:
cd V2
npm run dev
```

## 📋 Work Plan Status

This repository is undergoing a structured reinitialization process. See [work_plan.md](work_plan.md) for details.

### Completed Phases

- ✅ **Phase 1:** Repository Preparation & Documentation
  - Documented V1 application state
  - Resolved security vulnerabilities (96.6% reduction)
  - Updated dependencies to modern versions
  - Configured automated security monitoring
  
- ✅ **Phase 2:** Branch Migration (master → main)
  - Updated default branch to `main`
  - Updated all references and workflows

- ✅ **Phase 3:** Create V1 Directory Structure
  - Moved legacy application to V1/
  - Created monorepo structure
  - Set up workspace configuration
  - V1 application preserved and functional

### Current Phase

- ✅ **Phase 4:** Initialize V2 Directory with Next.js (COMPLETE)
  - Created modern Next.js 16 application
  - Set up Prisma and database schema
  - Implemented SCSS/Sass styling system (implementation choice differed from original plan)
  - Created basic landing page
  - Note: See [V2/README.md](V2/README.md) for actual tech stack; work_plan.md reflects original planning

### Upcoming Phases

- ⏳ **Phase 5:** Continue V2 Development
  - Implement RSS feed parser
  - Build news aggregation logic
  - Create article browsing UI
  - Add bias indicators and source ratings

- ⏳ **Phase 6:** Production Features
  - Story clustering implementation
  - Search and filtering
  - Performance optimization
  - Deploy V2 to production

## 📚 Documentation

### Current Work
- [work_plan.md](work_plan.md) - Comprehensive reinitialization work plan
- [V1/README.md](V1/README.md) - V1 setup and usage guide
- [V1/V1_OVERVIEW.md](V1/V1_OVERVIEW.md) - Complete V1 technical documentation

### Archived Documentation
- [archive/PHASE_1_COMPLETION_REPORT.md](archive/PHASE_1_COMPLETION_REPORT.md) - Phase 1 completion summary
- [archive/SECURITY_ASSESSMENT.md](archive/SECURITY_ASSESSMENT.md) - Security analysis and updates
- [archive/SECURITY_UPDATE_SUMMARY.md](archive/SECURITY_UPDATE_SUMMARY.md) - Dependency update summary

## 🔒 Security

V1 has been updated with the latest security patches:
- All critical vulnerabilities resolved
- Dependencies updated to latest secure versions
- Dependabot configured for automated security updates
- Node.js requirement: 18+ (LTS)

See [archive/SECURITY_UPDATE_SUMMARY.md](archive/SECURITY_UPDATE_SUMMARY.md) for complete details.

## 🗺 Roadmap

### Foundation Phases (Complete)
- [x] Phase 1: Documentation and security
- [x] Phase 2: Branch migration
- [x] Phase 3: V1 directory structure
- [x] Phase 4: Initialize Next.js project with Prisma

### V2 Development Milestones (Current)
1. **Phase 5: Core Features** (Current)
   - [ ] RSS feed parser implementation
   - [ ] Database seeding with news sources
   - [ ] Basic article listing UI
   - [ ] News aggregation logic

2. **Phase 6: Bias & Multi-Perspective**
   - [ ] Source bias ratings
   - [ ] Multi-perspective views
   - [ ] Story clustering
   - [ ] Search functionality

3. **Phase 7: AI Enhancement**
   - [ ] OpenAI embeddings integration
   - [ ] Semantic clustering
   - [ ] Article-level bias analysis

4. **Phase 8: Production Ready**
   - [ ] Performance optimization
   - [ ] Caching layer
   - [ ] SEO optimization
   - [ ] Production deployment

## 🤝 Contributing

This is a personal project. For questions or suggestions, please open an issue.

## 📄 License

MIT License - See LICENSE file for details

## 📞 Contact

For questions about this project, please open an issue on GitHub.

---

**Current Status:** Phase 4 Complete - V2 Next.js application initialized with Prisma and SCSS, ready for feature development

**Last Updated:** December 18, 2024
