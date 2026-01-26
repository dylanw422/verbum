# PRD: Journal Improvements (Collections & Scripture Search)

## Introduction
Enhance the Journaling experience by adding organizational capabilities (Collections/Tags) and improving the scripture linking workflow with a smart, autocomplete-enabled search input.

## Goals
- Allow users to organize entries into multiple "Collections" (acting as tags/folders).
- Streamline scripture linking with a single smart input field that filters books and handles chapter/verse entry smoothly.
- Improve the visual hierarchy and usability of the entry creation modal.

## User Stories

### US-001: Schema Update for Collections
**Description:** As a developer, I need to store collections/tags and link them to entries.
**Acceptance Criteria:**
- [ ] Create `collections` table: `userId`, `name` (string), `color` (optional).
- [ ] Update `journalEntries` table: Add `collectionIds` (array of IDs) field.
- [ ] Create mutations: `createCollection`, `getCollections`.

### US-002: Collection Management UI
**Description:** As a user, I want to create and manage collections to organize my notes.
**Acceptance Criteria:**
- [ ] In `EntryModal`, add a "Collections" selector (Multi-select dropdown or pill list).
- [ ] Allow creating a new collection directly from the selector (e.g., "Create 'Prayer'").
- [ ] Display selected collections as pills on the Entry Card in `/entries`.

### US-003: Smart Scripture Input (Frontend)
**Description:** As a user, I want to type "John 3:16" quickly without clicking multiple dropdowns.
**Acceptance Criteria:**
- [ ] Replace the 3-field selector with a single `SmartVerseInput` component.
- [ ] **Interaction:**
    - User types "Jo".
    - Dropdown shows matches: "Job", "Joel", "John", etc.
    - User presses **Tab** or **Enter**: Autocompletes the best match (e.g., "John") and adds a space.
    - User types "3". Input becomes "John 3".
    - User types ":". Input becomes "John 3:".
    - User types "16". Input becomes "John 3:16".
- [ ] Validation: Ensure the book exists.

### US-004: Filter Entries by Collection
**Description:** As a user, I want to see only notes related to specific topics.
**Acceptance Criteria:**
- [ ] Add a filter bar to `/entries` page.
- [ ] Allow clicking a collection pill to filter the list.

## Functional Requirements
- FR-1: Entries can belong to multiple collections.
- FR-2: Scripture input must be case-insensitive for book matching.
- FR-3: Tab key should facilitate completion/navigation in the verse input.

## Non-Goals
- Nested folders.
- Renaming/Deleting collections (MVP: just Create/Assign).

## Technical Considerations
- **Combobox:** Use a custom implementation or `cmdk` if available (shadcn uses `cmdk`). Since `cmdk` isn't installed, build a custom lightweight suggestion list.
- **Regex:** Use regex to parse "Book Chapter:Verse" strings.

## Success Metrics
- Reduction in time to link a verse.
- Usage of collections in new entries.
