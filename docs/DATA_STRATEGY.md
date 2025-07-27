# Data Strategy Documentation

## Overview

The Customer Support AI Agent Admin Portal uses a **single source of truth** for data management. All data is sourced from static JSON files located in `/public/mocks/` directory and accessed through the API client.

## Data Sources

### Primary Data Source
- **Static JSON Files**: Located in `/public/mocks/`
  - `chats.json` - Chat conversations data
  - `users.json` - User profiles and agent information
  - `organizations.json` - Organization details
  - `engagements.json` - Customer engagement history
  - `documents.json` - Document metadata
  - `faqs.json` - FAQ content
  - `health.json` - System health status

### Data Access Pattern
1. **API Client**: All data access goes through `src/lib/api-client.ts`
2. **React Query Hooks**: Data fetching via `src/hooks/useApiQuery.ts`
3. **Component Integration**: Components use hooks to access data

## Data Flow

```
JSON Files → API Client → React Query Hooks → Components
```

## Error Handling

When JSON files fail to load:
- React Query will retry the request (up to 2 times for network errors)
- Components will display loading states during fetch attempts
- On complete failure, components will show appropriate error states
- No fallback to mock data objects

## Migration Notes

### Deprecated Patterns
- ❌ Direct import of mock data objects from `src/lib/mock-data.ts`
- ❌ Fallback mechanisms in `useApiQuery.ts` hooks
- ❌ Mixed data sources (JSON + object fallbacks)

### Current Best Practices
- ✅ Use `useChats()`, `useUsers()`, etc. hooks for data access
- ✅ Handle loading and error states in components
- ✅ Rely solely on JSON files for development data
- ✅ Use proper TypeScript interfaces for type safety

## Configuration

The application detects JSON file usage and displays "Static Mock Active" badge in development mode when using static JSON files.

## Troubleshooting

### Data Not Appearing
1. Check if JSON files exist in `/public/mocks/`
2. Verify JSON file format matches interface definitions
3. Check browser network tab for 404 errors on JSON files
4. Ensure React Query hooks are used instead of direct imports

### Type Errors
1. Verify interfaces in `src/lib/mock-data.ts` match JSON structure
2. Check that components handle empty arrays gracefully
3. Ensure proper error boundary implementation

## Future Considerations

This static JSON strategy is designed for development and testing. For production:
- Replace API client endpoints with real backend URLs
- Implement proper authentication and authorization
- Add data validation and error handling for network failures
- Consider implementing data caching strategies