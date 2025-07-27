# Data Strategy Documentation

## Overview

The Customer Support AI Agent Admin Portal uses a **single source of truth** for all its data. In development, every UI fetches data over HTTP from static JSON files in the `/public/mocks/` directory. There are **no in‑code fallback objects**—if a JSON file fails to load, the UI shows a proper error state.

## Data Sources

### Static JSON Mocks (Development)

Files under **`public/mocks/`**:

- `chats.json`           — Chat conversation records  
- `users.json`           — User profiles and agent info  
- `organizations.json`   — Organization details (including `members: [...]`)  
- `engagements.json`     — Customer engagement history logs  
- `documents.json`       — Document metadata for Content Management  
- `faqs.json`            — FAQ entries for AI knowledge  
- `resources.json`       — Shareable resources list  
- `scraperJobs.json`     — URL scraper job definitions  
- `domains.json`         — Whitelisted domain lists for widget security  
- `health.json`          — System health endpoints  

> **Note:** you may add more files here (e.g. `settings.json`) as new features require.

### Production (Future)

- Replace mock URLs with real API base URLs via your environment config.  
- All endpoints should mirror the same shape as these JSON mocks.

## Data Access Pattern

1. **API Client** (`src/lib/api-client.ts`)  
   - Chooses `/mocks/*.json` in development or real endpoints in production.  
2. **React Query Hooks** (`src/hooks/useApiQuery.ts`)  
   - Expose `useChats()`, `useUsers()`, `useOrganizations()`, `useEngagements()`, `useDocuments()`, `useFAQs()`, `useResources()`, `useScraperJobs()`, `useDomains()`, `useHealth()`…  
3. **Component Integration**  
   - Components call these hooks, handle `isLoading` / `isError` and render data accordingly.

