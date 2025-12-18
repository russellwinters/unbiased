# Unbiased V1 - Original Implementation

This directory contains the original implementation of the Unbiased news aggregator application. This code is preserved for historical reference and potential migration needs.

**Status:** Legacy / Archived (Read-only reference)

## Overview

V1 was the initial proof-of-concept implementation of Unbiased, a news aggregation platform designed to help users identify media bias and consume news from diverse perspectives.

For comprehensive technical documentation, see [V1_OVERVIEW.md](./V1_OVERVIEW.md).

## Technology Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React 18, React Router v6
- **Build Tool:** Create React App
- **Authentication:** JWT
- **News API:** NewsAPI.org

## Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- npm 9+
- MongoDB (local or MongoDB Atlas)
- NewsAPI key (from https://newsapi.org)

### Installation

1. Navigate to the V1 directory:
   ```bash
   cd V1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   
   Create a `.env` file in the V1 directory with the following:
   ```env
   MONGODB_URI=mongodb://localhost:27017/unbiased
   NEWS_API_KEY=your_newsapi_key_here
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

4. Start MongoDB (if running locally):
   ```bash
   mongod
   ```

### Running the Application

#### Development Mode (Full Stack)

Run both backend and frontend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:3000

#### Backend Only

```bash
npm run server
```

#### Frontend Only

```bash
npm run client
```

#### Production Build

```bash
# Build frontend for production
cd client
npm run build

# Start production server
cd ..
npm start
```

## Project Structure

```
V1/
├── client/              # React frontend
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   └── package.json     # Frontend dependencies
├── helpers/             # Backend utility functions
├── models/              # Mongoose database models
├── routes/              # Express API routes
├── server.js            # Backend entry point
├── package.json         # Backend dependencies
├── V1_OVERVIEW.md       # Complete technical documentation
└── README.md            # This file
```

## Available Scripts

From the V1 directory:

- `npm run dev` - Run both backend and frontend in development mode
- `npm run server` - Run backend only with nodemon (auto-reload)
- `npm run client` - Run frontend only
- `npm start` - Run backend in production mode

## Features

### Core Functionality
- News article aggregation from multiple sources
- Bias indicators for news sources
- Multi-perspective news presentation
- Source-based filtering
- User authentication (JWT)

### News Sources

V1 aggregates from sources across the political spectrum:
- **Left:** CNN, MSNBC, HuffPost, etc.
- **Center:** BBC, Reuters, AP, NPR
- **Right:** Fox News, Daily Caller, Breitbart, etc.

See [V1_OVERVIEW.md](./V1_OVERVIEW.md) for the complete source list.

## API Endpoints

- `GET /api/articles` - Fetch articles (with filtering options)
- `POST /api/articles/update` - Trigger article refresh
- `GET /api/sources` - Get news source information
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

See [V1_OVERVIEW.md](./V1_OVERVIEW.md) for complete API documentation.

## Known Limitations

V1 has several known limitations that are addressed in V2:
- Limited story clustering capabilities
- No semantic similarity analysis
- Basic bias analysis (source-level only)
- Scalability constraints
- Dated architecture patterns

## Migration to V2

This codebase is preserved as V1 for reference. Active development continues in the V2 directory with a modern architecture:

- **V2 Tech Stack:** Next.js 14, TypeScript, PostgreSQL, Prisma
- **V2 Features:** Advanced story clustering, AI-powered analysis, improved UX
- **See:** [../V2/README.md](../V2/README.md) (when V2 is initialized)

## Security Updates

V1 has been updated with the latest security patches:
- All critical vulnerabilities resolved
- Dependencies updated to latest secure versions
- Node.js requirement: 18+ (LTS)

See [SECURITY_UPDATE_SUMMARY.md](../SECURITY_UPDATE_SUMMARY.md) for details.

## Contributing

This is a legacy codebase preserved for reference. New development should target V2.

## License

See root [LICENSE](../LICENSE) file.

## Additional Resources

- [V1_OVERVIEW.md](./V1_OVERVIEW.md) - Complete technical documentation
- [../work_plan.md](../work_plan.md) - Migration work plan
- [../SECURITY_ASSESSMENT.md](../SECURITY_ASSESSMENT.md) - Security analysis
- [../README.md](../README.md) - Repository overview

---

**Note:** This is the original V1 implementation. For the modern, actively developed version, see the V2 directory.
