# PRD: Library Concordance & Advanced Search

## 1. Introduction
A comprehensive search and concordance tool integrated into the Study Core Library. This feature allows users to perform advanced text and Strong's number queries across the entire biblical text, visualize the distribution of results across books, and drill down into specific verses for detailed analysis.

## 2. Goals
- **Advanced Querying:** Support complex search patterns including Boolean operators (AND/OR), exact phrases, wildcards, and Strong's numbers (Hxxxx/Gxxxx).
- **Data Visualization:** Provide immediate visual feedback on where terms appear most frequently in the Bible (e.g., "Love" vs. "Law").
- **Deep Analysis:** Bridge the gap between search results and deep study by offering a specialized "Verse Analysis" view for selected results.
- **Seamless Integration:** Live within the existing `StudyCoreModal` "Concordance" tab.

## 3. User Stories

### US-001: Concordance Dashboard & Input
**Description:** As a user, I want a dedicated search interface in the Study Core where I can type queries.
**Acceptance Criteria:**
- [ ] "Concordance" tab in `StudyCoreModal` is active (replacing "Coming Soon").
- [ ] Large search input field with distinct visual state.
- [ ] Quick-filter chips for "Old Testament", "New Testament", or "Both".
- [ ] Verify in browser.

### US-002: Advanced Search Logic
**Description:** As a power user, I want to use operators to refine my search.
**Acceptance Criteria:**
- [ ] Support exact phrase search (e.g., `"Kingdom of God"`).
- [ ] Support Boolean AND (e.g., `grace + faith` or `grace AND faith`).
- [ ] Support Boolean OR (e.g., `sin OR transgression`).
- [ ] Support Wildcards (e.g., `bapti*` finds baptism, baptize, baptist).
- [ ] Search logic correctly parses and filters the Bible dataset.

### US-003: Strong's Number Search
**Description:** As a student of original languages, I want to find every occurrence of a specific Greek or Hebrew word.
**Acceptance Criteria:**
- [ ] User can type a Strong's number (e.g., `G26`, `H0430`).
- [ ] System detects the format and searches against the underlying Strong's index/Interlinear data.
- [ ] Results display the English translation used in that specific instance.

### US-004: Frequency Visualization
**Description:** As a user, I want to see a chart of search results to understand the distribution of a topic.
**Acceptance Criteria:**
- [ ] Display a Bar Chart or Heatmap above the result list.
- [ ] X-Axis: Bible Books (Gen-Rev).
- [ ] Y-Axis/Color: Frequency of the search term in that book.
- [ ] Hovering over a bar shows the exact count for that book.
- [ ] Verify in browser.

### US-005: Result List Display
**Description:** As a user, I want to scan through the search results efficiently.
**Acceptance Criteria:**
- [ ] List displays verse reference (e.g., "Genesis 1:1") and verse text.
- [ ] Search terms are highlighted within the text (bold or colored background).
- [ ] Infinite scroll or pagination for large result sets.
- [ ] Display total count of matches found.
- [ ] Verify in browser.

### US-006: Verse Analysis Drill-Down
**Description:** As a user, I want to click a result to see deep details without losing my search context.
**Acceptance Criteria:**
- [ ] Clicking a result row opens a "Verse Analysis" view (slide-over or sub-view).
- [ ] View displays: Full Verse, Interlinear breakdown (Word | Strong's | Morph), and Cross-References (if available).
- [ ] "Back to Results" button returns to the search list preserving scroll position.
- [ ] Verify in browser.

## 4. Functional Requirements

### Search Engine
- **FR-1:** Input parsing must separate operators (`"`, `*`, `AND`, `OR`) from keywords.
- **FR-2:** Search must be case-insensitive for English text.
- **FR-3:** Strong's search must handle variations like `g26`, `G26`, `G0026`.

### Visualization
- **FR-4:** Chart must dynamically update based on the filtered result set.
- **FR-5:** Chart must scale to fit the container width (responsive).

### Data Handling
- **FR-6:** Efficiently load necessary Bible text data. If full-text search requires a large dataset, utilize a search index or web worker to prevent UI freezing.
- **FR-7:** Cache recent search results to allow instant back-navigation.

## 5. Non-Goals
- **Semantic Search:** We are not implementing AI/Vector embeddings for this version (e.g., searching "sadness" won't find "grief" unless explicitly handled).
- **Commentary Search:** This is strictly for the Biblical text.
- **External Export:** No PDF/CSV export of search results.

## 6. Design Considerations
- **Aesthetic:** Minimalist, data-heavy but clean. Use the existing Zinc/Rose color palette.
- **Typography:** Monospace for verse references, Serif for Bible text.
- **Performance:** Debounce the search input to avoid stuttering on every keystroke.

## 7. Technical Considerations
- **Data Source:** Determine if `BSB.json` (English) and `interlinear.json` (Strongs) can be queried efficiently client-side. If the dataset is too large (~5MB+ compressed is fine, 30MB+ is risky), consider:
    - Generating a lightweight search index file (e.g., just text + refs) to load for the Concordance.
    - Or using a Convex backend query if the data resides in the DB.
- **Charting Library:** Use `Recharts` or a lightweight SVG solution for the frequency graph.

## 8. Success Metrics
- **Performance:** Search results appear within < 300ms of user stopping typing.
- **Engagement:** Users click through to "Verse Analysis" on > 20% of searches.

## 9. Open Questions
- Do we have a pre-built "Verse Analysis" component, or does US-006 require building that from scratch? (Assumed build from scratch based on "Specialized view").
- Does the current `interlinear.json` allow easy reverse-lookup (Strongs -> Verses)? (Previous tasks suggest yes, or we might need to invert the index on load).
