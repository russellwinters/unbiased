# Article Filtering by Source and Bias - Implementation Plan

## 1. Feature Summary

Implement interactive filtering controls on the articles page that allow users to filter articles by:
- **Source** (by source ID for optimal performance, displayed to users by name)
- **Bias rating** (left, lean-left, center, lean-right, right)

Users can apply multiple filters simultaneously, with the filter state reflected in the URL for sharing and bookmarking. The implementation uses source IDs internally for efficient database queries while displaying human-readable source names in the UI.

## 2. Success Criteria

1. **Functional Requirements:**
   - Users can filter articles by selecting one or more sources from a list
   - Users can filter articles by selecting one or more bias ratings
   - Filters can be combined (e.g., show only "The Guardian" AND "left" bias articles)
   - Applying filters updates the article list without full page reload
   - Filter state persists in URL query parameters for sharing/bookmarking
   - Clear/reset all filters with a single action
   - Display active filter count and currently applied filters
   - Show "no results" state when filters produce empty results

2. **Performance Requirements:**
   - Filter operations should complete within 500ms
   - UI should remain responsive during filtering
   - Pagination should work correctly with filtered results

3. **UX Requirements:**
   - Filter controls are visible and easily accessible
   - Active filters are clearly indicated
   - Filter counts show number of available articles per option
   - Mobile-responsive filter UI (collapsible on small screens)

## 3. Current State Analysis

### Existing Implementation

**Frontend (`V2/app/page.tsx`):**
- Articles page displays paginated list of articles
- BiasDistribution component shows bias breakdown
- No filter UI components currently exist
- Uses `/api/articles` endpoint with pagination

**Backend (`V2/app/api/articles/route.ts`):**
- GET endpoint supports `source` query parameter (single source filter by name)
- Pagination via `page` and `limit` parameters
- Returns articles with source and bias information included
- Database queries via Prisma

**Database Schema (`V2/prisma/schema.prisma`):**
- `Source` model has `id` (UUID, indexed), `name`, `domain`, `biasRating`, `reliability`
- `Article` model has `sourceId` foreign key (indexed)
- **Performance Note:** `sourceId` is indexed, making ID-based filtering more efficient than name-based filtering
- BiasRating values: "left", "lean-left", "center", "lean-right", "right"

**Data Structure:**
- 15 news sources configured in `rss-sources.ts`
- Sources distributed across 5 bias ratings
- Each article linked to exactly one source

### Gaps to Address

1. **API Enhancement:** Backend needs to support multiple source IDs and bias rating filters (using indexed sourceId for performance)
2. **Source Data Endpoint:** Need API endpoint to provide available sources (id, name, biasRating) for filter UI
3. **Filter UI:** Need to create FilterPanel component with checkboxes/toggles (displays source names, uses IDs internally)
4. **State Management:** Need to manage filter state and sync with URL (store source IDs in URL)
5. **Query Parameter Handling:** Extend URL params to support multiple filters
6. **Mobile UX:** Filter panel needs responsive design for mobile devices

## 4. Proposed Implementation Plan

### Task 1: Extend API to Support Multi-Filter Queries
**Owner:** Backend Developer | **Estimate:** 5 hours

**Subtasks:**
1. Create new API endpoint `/api/sources` to return available sources with id, name, and biasRating
2. Update `parseQueryParams` in `/api/articles/route.ts` to accept:
   - `sourceIds` (comma-separated list of source UUIDs)
   - `bias` (comma-separated list or array)
3. Modify `whereClause` construction to filter by `sourceId` using Prisma's `in` operator (indexed field for performance)
4. Add validation for source IDs (UUID format) and bias rating values
5. Update API response to include source information with IDs
6. Test API with various filter combinations

**Files to modify:**
- `V2/app/api/articles/route.ts` - Update to filter by sourceId instead of source name
- `V2/app/api/sources/route.ts` - Create new endpoint to list available sources

**Example API calls:**
```
GET /api/sources
Response: [{ id: "uuid-1", name: "The Guardian", biasRating: "left", ... }, ...]

GET /api/articles?sourceIds=uuid-1,uuid-2&bias=left,center&page=1&limit=50
```

### Task 2: Create FilterPanel Component
**Owner:** Frontend Developer | **Estimate:** 6 hours

**Subtasks:**
1. Create `V2/app/components/FilterPanel/` directory
2. Implement `FilterPanel.tsx` with:
   - Source filter section (checkbox list showing source names, tracking source IDs)
   - Bias filter section (checkbox list with color indicators)
   - "Clear All Filters" button
   - Active filter count badge
3. Create `FilterPanel.module.scss` for styling
4. Implement collapsible/expandable sections
5. Add mobile-responsive design (drawer/modal on small screens)
6. Create index.ts barrel export

**Component Props:**
```typescript
interface Source {
  id: string;  // UUID
  name: string;
  biasRating: BiasRating;
}

interface FilterPanelProps {
  availableSources: Source[];  // Full source objects with IDs
  selectedSourceIds: string[];  // Array of source IDs (UUIDs)
  selectedBiases: BiasRating[];
  onSourceChange: (sourceIds: string[]) => void;  // Receives source IDs
  onBiasChange: (biases: BiasRating[]) => void;
  onClearFilters: () => void;
  articleCounts?: {
    sources: Record<string, number>;  // Keyed by source ID
    biases: Record<BiasRating, number>;
  };
}
```

**Files to create:**
- `V2/app/components/FilterPanel/FilterPanel.tsx`
- `V2/app/components/FilterPanel/FilterPanel.module.scss`
- `V2/app/components/FilterPanel/index.ts`

### Task 3: Integrate Filter State Management
**Owner:** Frontend Developer | **Estimate:** 5 hours

**Subtasks:**
1. Update `V2/app/page.tsx` to manage filter state:
   - Fetch available sources from `/api/sources` on mount
   - Add state for `selectedSourceIds` (array of UUIDs) and `selectedBiases`
   - Read initial state from URL query parameters (sourceIds as comma-separated UUIDs)
   - Update URL when filters change (using `useRouter` or `useSearchParams`)
2. Modify `fetchArticles` function to include filter parameters (sourceIds, not names)
3. Handle filter changes and trigger article refetch
4. Reset pagination to page 1 when filters change
5. Add filter state to BiasDistribution component for context

**URL Format:**
```
/?sourceIds=uuid-1,uuid-2&bias=left,lean-left&page=1
```

**Files to modify:**
- `V2/app/page.tsx`

### Task 4: Update UI Layout for Filter Integration
**Owner:** Frontend Developer | **Estimate:** 3 hours

**Subtasks:**
1. Modify page layout in `page.tsx` to include FilterPanel
2. Position FilterPanel in sidebar or as collapsible top section
3. Update responsive grid for mobile (filter drawer/modal)
4. Add filter summary bar showing active filters
5. Update `page.module.scss` with new layout styles

**Layout Options:**
- **Desktop:** FilterPanel in left sidebar, articles in main area
- **Mobile:** Collapsible filter button opening drawer/modal

**Files to modify:**
- `V2/app/page.tsx`
- `V2/app/page.module.scss`

### Task 5: Add Filter Counts and Empty States
**Owner:** Frontend Developer | **Estimate:** 2 hours

**Subtasks:**
1. Fetch article counts per source and bias from API (or calculate client-side)
2. Display counts next to each filter option
3. Add "no results" empty state component
4. Show active filter summary when filters applied
5. Add loading states during filter operations

**Files to modify:**
- `V2/app/components/FilterPanel/FilterPanel.tsx`
- `V2/app/page.tsx`
- `V2/app/page.module.scss`

### Task 6: Testing and Documentation
**Owner:** QA/Developer | **Estimate:** 4 hours

**Subtasks:**
1. Write unit tests for filter logic (API query building)
2. Write component tests for FilterPanel
3. Test filter combinations (single source, multiple sources, bias only, combined)
4. Test pagination with filters
5. Test URL state persistence and sharing
6. Test mobile responsiveness
7. Update README or add user guide for filtering feature
8. Document API query parameter format

**Files to create/modify:**
- `V2/app/components/FilterPanel/FilterPanel.test.tsx` (if testing infrastructure exists)
- `V2/app/api/articles/route.test.ts` (if testing infrastructure exists)
- `V2/README.md` (update with filtering documentation)

## 5. Files to Create/Modify

### New Files:
1. `V2/app/components/FilterPanel/FilterPanel.tsx` - Main filter component
2. `V2/app/components/FilterPanel/FilterPanel.module.scss` - Filter styles
3. `V2/app/components/FilterPanel/index.ts` - Barrel export
4. `V2/app/components/FilterPanel/FilterPanel.test.tsx` - Component tests (optional)
5. `V2/app/api/sources/route.ts` - New endpoint to list available sources

### Modified Files:
1. `V2/app/page.tsx` - Integrate FilterPanel, manage filter state, fetch sources
2. `V2/app/page.module.scss` - Update layout for filter panel
3. `V2/app/api/articles/route.ts` - Support multiple source IDs and bias filters
4. `V2/README.md` - Document filtering feature

## 6. Technical Design Details

### API Query Parameters

**Current:**
```
GET /api/articles?source=The%20Guardian&page=1&limit=50
```

**Proposed:**
```
GET /api/articles?sourceIds=550e8400-e29b-41d4-a716-446655440000,6ba7b810-9dad-11d1-80b4-00c04fd430c8&bias=left,lean-left&page=1&limit=50
```

**Query Parameter Specification:**
- `sourceIds` (optional): Comma-separated list of source UUIDs (exact match on indexed field)
- `bias` (optional): Comma-separated list of bias ratings (exact match)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50, max: 100)

**Note:** Using source IDs instead of names provides better performance because:
1. The `sourceId` field is indexed in the database
2. UUID matching is faster than case-insensitive string matching
3. Avoids issues with special characters or name changes

### Database Query Enhancement

**Current Prisma Query:**
```typescript
const whereClause = sourceFilter
  ? {
      source: {
        name: {
          equals: sourceFilter,
          mode: 'insensitive' as const,
        },
      },
    }
  : {};
```

**Proposed Prisma Query (using indexed sourceId field):**
```typescript
const whereClause: any = {};

// Filter by source IDs (indexed field - optimal performance)
if (sourceIdsFilter && sourceIdsFilter.length > 0) {
  whereClause.sourceId = {
    in: sourceIdsFilter,  // Direct ID match on indexed field
  };
}

// Filter by bias rating (via source relation)
if (biasFilter && biasFilter.length > 0) {
  whereClause.source = {
    biasRating: {
      in: biasFilter,
    },
  };
}
```

**Performance Note:** This approach leverages the indexed `sourceId` field on the Article model, which provides significantly better query performance compared to filtering by source name. The database can use the index for fast lookups instead of string comparisons.

### Filter State Management

**State Structure:**
```typescript
interface FilterState {
  selectedSourceIds: string[];  // Array of source UUIDs
  selectedBiases: BiasRating[];
  availableSources: Source[];   // For displaying names in UI
}

interface Source {
  id: string;
  name: string;
  biasRating: BiasRating;
}
```

**URL Synchronization:**
- Use Next.js `useSearchParams` and `useRouter` to read/write query params
- Encode arrays as comma-separated values (UUIDs for sources)
- Decode on page load to initialize filter state
- Store source IDs in URL, but display source names in UI

### Component Hierarchy

```
ArticlesPage (page.tsx)
├── Header
├── FilterPanel (NEW)
│   ├── SourceFilters
│   │   └── Checkbox list of sources
│   ├── BiasFilters
│   │   └── Checkbox list of bias ratings
│   └── ClearFiltersButton
├── BiasDistribution
└── ArticleGrid
    └── ArticleCard (repeated)
```

## 7. Edge Cases and Considerations

### Edge Cases to Handle:

1. **No Results:** When filters produce no articles, show helpful empty state
2. **Invalid Filter Values:** Validate and ignore invalid source IDs (non-UUID format or non-existent IDs) or bias ratings
3. **Large Filter Sets:** Limit UI to show only available sources (avoid empty checkboxes)
4. **URL Manipulation:** Validate query parameters on page load (UUID format for sourceIds)
5. **Concurrent Filters:** Ensure source AND bias filters work together correctly
6. **Pagination Reset:** Reset to page 1 when filters change
7. **Deep Links:** Support sharing URLs with pre-applied filters (URLs contain source IDs)
8. **Source Lookup:** Handle case where source ID in URL doesn't match any available source

### Performance Considerations:

1. **Debounce Filter Changes:** If using search/autocomplete, debounce API calls
2. **Client-Side Filtering:** Consider client-side filtering for small datasets to reduce API calls
3. **Indexed Queries:** Use indexed `sourceId` field for filtering (UUID lookup is fast)
4. **Filter Count Calculation:** Optimize count queries or cache results
5. **ID-Based Filtering Benefits:**
   - Direct index usage on `sourceId` field
   - No case-insensitive string matching required
   - Consistent performance regardless of source name length or special characters

### Security Considerations:

1. **SQL Injection:** Use Prisma's parameterized queries (already handled)
2. **Input Validation:** Validate all filter inputs on backend (UUID format for sourceIds)
3. **Rate Limiting:** Consider rate limiting API if filter changes trigger frequent requests
4. **ID Exposure:** Source UUIDs in URLs are not sensitive information, but consider if this aligns with security policy

## 8. Mobile Responsiveness Strategy

### Desktop (>768px):
- FilterPanel in fixed left sidebar
- Always visible
- Vertical layout

### Tablet (768px-1024px):
- FilterPanel in collapsible left sidebar
- Toggle button to show/hide
- Overlays content when open

### Mobile (<768px):
- Filter button in header/toolbar
- Opens full-screen modal or bottom drawer
- Apply/Cancel buttons for filter confirmation

## 9. Future Enhancements (Out of Scope)

These are potential improvements for future iterations:

1. **Search Integration:** Combine text search with filters
2. **Date Range Filter:** Filter by publication date
3. **Saved Filter Presets:** Allow users to save favorite filter combinations
4. **Filter Analytics:** Track popular filter combinations
5. **Smart Filters:** Suggest filters based on user behavior
6. **Reliability Filter:** Filter by source reliability rating
7. **Cluster-Based Filtering:** Filter by story clusters (when implemented)
8. **Advanced Filter Logic:** Support OR/AND logic between filter types

## 10. Testing Plan

### Unit Tests:
- Query parameter parsing logic
- Filter state management
- Prisma query building with filters

### Integration Tests:
- API endpoint with various filter combinations
- Filter + pagination interactions
- URL state synchronization

### E2E Tests:
- Apply single source filter
- Apply multiple source filters
- Apply bias filter
- Apply combined source + bias filters
- Clear all filters
- Pagination with active filters
- URL sharing with filters
- Mobile filter drawer/modal

### Manual Testing Checklist:
- [ ] Filter by single source
- [ ] Filter by multiple sources
- [ ] Filter by single bias rating
- [ ] Filter by multiple bias ratings
- [ ] Combine source and bias filters
- [ ] Clear individual filters
- [ ] Clear all filters at once
- [ ] Navigate through pages with active filters
- [ ] Copy URL and open in new tab (filter state persists)
- [ ] Test on mobile devices (responsive filter UI)
- [ ] Test with empty results (show appropriate message)
- [ ] Test with all filters applied
- [ ] Test filter counts accuracy

## 11. Risk Assessment

### High Risk:
- **API Performance:** Multiple filters could slow down queries
  - *Mitigation:* Ensure database indexes, test with large datasets, consider caching
  
### Medium Risk:
- **Mobile UX Complexity:** Filter modal/drawer might feel cumbersome
  - *Mitigation:* User testing, consider alternative mobile filter UI
  
- **URL State Management:** Complex filter state in URLs can get messy
  - *Mitigation:* Use clear encoding scheme, validate on load

### Low Risk:
- **Filter Option Overload:** 15 sources might clutter the UI
  - *Mitigation:* Group by bias, add search within filters, collapsible sections

## 12. Open Questions

1. **Should filters be collapsible by default on mobile?**
   - Recommendation: Yes, use collapsible drawer/modal on mobile

2. **Should we show disabled filter options when they would produce zero results?**
   - Recommendation: Show all options with counts; indicate zero results

3. **Should filter changes reset pagination to page 1?**
   - Recommendation: Yes, always reset to page 1 when filters change

4. **Should we persist filter state in localStorage or cookies?**
   - Recommendation: No for MVP; URL state is sufficient. Consider for future enhancement.

5. **Should there be a "Select All" option for sources and biases?**
   - Recommendation: Not needed initially; "Clear All" serves similar purpose

## 13. Timeline Estimate

| Phase | Tasks | Duration |
|-------|-------|----------|
| Backend | Task 1 (API Enhancement + Sources Endpoint) | 5 hours |
| Frontend | Task 2 (FilterPanel Component) | 6 hours |
| Frontend | Task 3 (State Management) | 5 hours |
| Frontend | Task 4 (Layout Integration) | 3 hours |
| Frontend | Task 5 (Counts & Empty States) | 2 hours |
| Testing | Task 6 (Testing & Docs) | 4 hours |
| **Total** | | **25 hours (3-4 working days)** |

**Note:** Timeline assumes one developer working on implementation. Can be parallelized with backend and frontend developers working simultaneously.

## 14. Definition of Done

- [ ] Backend API supports multiple source and bias filters
- [ ] FilterPanel component created and styled
- [ ] Filter state managed and synced with URL
- [ ] Pagination works correctly with filters
- [ ] Mobile-responsive filter UI implemented
- [ ] Active filter count and summary displayed
- [ ] Clear filters functionality works
- [ ] Empty state shown when no results
- [ ] All edge cases handled
- [ ] Tests written and passing (if test infrastructure exists)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Feature tested on multiple devices/browsers
- [ ] Performance validated (queries under 500ms)

## 15. Dependencies

### Technical Dependencies:
- Next.js routing and query parameter handling
- Prisma ORM for database queries
- SCSS/Sass for styling
- React hooks (useState, useEffect, useSearchParams, useRouter)

### External Dependencies:
- None (all functionality can be built with existing stack)

### Team Dependencies:
- Design input for filter UI/UX (optional)
- QA for comprehensive testing (optional)

## 16. Rollout Strategy

### Phase 1: MVP (Covered in this plan)
- Basic source and bias filtering
- URL state persistence
- Desktop and mobile responsive UI

### Phase 2: Enhancement (Future)
- Filter counts and analytics
- Saved filter presets
- Search integration

### Phase 3: Advanced (Future)
- Smart filter suggestions
- Advanced filter logic (OR/AND)
- Reliability filtering

---

**Plan Status:** Draft - Ready for Review  
**Last Updated:** January 29, 2026  
**Author:** GitHub Copilot  
**Reviewers:** Project Team
