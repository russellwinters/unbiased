# Unbiased - News Aggregator

A news aggregation platform that provides multi-perspective coverage with bias analysis, helping readers understand different viewpoints on current events.

## 📂 Repository Structure

This repository is organized as a monorepo containing two versions of Unbiased:

```
unbiased/
├── V1/              # Original implementation (preserved for reference)
├── V2/              # Modern rewrite (coming in Phase 4)
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

- **Status:** Planned (Phase 4 of work plan)
- **Tech Stack:** Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS
- **Documentation:** See [V2/README.md](V2/README.md) (when Phase 4 is complete)

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

### Running V2 (When Available)

V2 will be initialized in Phase 4 of the work plan.

```bash
# Navigate to V2
cd V2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run in development mode
npm run dev
```

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

### V2 Features (Planned)
- Advanced story clustering with AI
- Semantic similarity analysis using embeddings
- Article-level bias analysis (optional)
- Modern, responsive UI with Tailwind CSS
- PostgreSQL database with Prisma ORM
- Improved search and filtering
- Topic-based browsing

## 🛠 Development

This is a monorepo using npm workspaces. You can run commands for either version from the root:

```bash
# Install all dependencies (both V1 and V2)
npm install

# Run V1 in development mode
npm run dev:v1

# Run V2 in development mode (when available)
npm run dev:v2

# Build V1
npm run build:v1

# Build V2 (when available)
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

# Or when V2 is ready:
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

### Upcoming Phases

- ⏳ **Phase 4:** Initialize V2 Directory with Next.js
  - Create modern Next.js 14 application
  - Set up Prisma and database schema
  - Initialize shadcn/ui component library
  - Create basic landing page

- ⏳ **Phase 5:** Update Root Documentation
  - Architecture documentation
  - Migration guides

- ⏳ **Phase 6:** Final Validation & Deployment
  - Test both versions
  - Deploy V2 to production

## 📚 Documentation

- [work_plan.md](work_plan.md) - Comprehensive reinitialization work plan
- [V1/README.md](V1/README.md) - V1 setup and usage guide
- [V1/V1_OVERVIEW.md](V1/V1_OVERVIEW.md) - Complete V1 technical documentation
- [PHASE_1_COMPLETION_REPORT.md](PHASE_1_COMPLETION_REPORT.md) - Phase 1 completion summary
- [SECURITY_ASSESSMENT.md](SECURITY_ASSESSMENT.md) - Security analysis and updates
- [SECURITY_UPDATE_SUMMARY.md](SECURITY_UPDATE_SUMMARY.md) - Dependency update summary

## 🔒 Security

V1 has been updated with the latest security patches:
- All critical vulnerabilities resolved
- Dependencies updated to latest secure versions
- Dependabot configured for automated security updates
- Node.js requirement: 18+ (LTS)

See [SECURITY_UPDATE_SUMMARY.md](SECURITY_UPDATE_SUMMARY.md) for complete details.

## 🗺 Roadmap

### Phase 4-6: V2 Foundation (Coming Soon)
- [x] Phase 1: Documentation and security
- [x] Phase 2: Branch migration
- [x] Phase 3: V1 directory structure
- [ ] Phase 4: Initialize Next.js project
- [ ] Phase 5: Update documentation
- [ ] Phase 6: Final validation

### V2 Development Milestones (After Phase 6)
1. **Weeks 1-2:** Foundation
   - Database setup and schema
   - RSS feed parser implementation
   - Basic article listing UI

2. **Weeks 3-4:** Bias Analysis
   - Source bias ratings
   - Multi-perspective views
   - Story clustering
   - Search functionality

3. **Weeks 5-6:** AI Enhancement
   - OpenAI embeddings integration
   - Semantic clustering
   - Article-level bias analysis

4. **Weeks 7-8:** Polish
   - Performance optimization
   - Caching layer
   - SEO optimization
   - Production deployment

## 🤝 Contributing

This is a personal project. For questions or suggestions, please open an issue.

## 📄 License

MIT License - See LICENSE file for details

## 📞 Contact

For questions about this project, please open an issue on GitHub.

---

**Current Status:** Phase 3 Complete - V1 directory structure created, ready for Phase 4 (V2 initialization)

**Last Updated:** December 17, 2024
