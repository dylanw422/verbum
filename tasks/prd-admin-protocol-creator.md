# PRD: Admin Protocol Creator

## Introduction
Empower admins to create and manage "Protocols" (reading plans) directly within the application. This feature adds a "Create/Edit Protocol" interface accessible only to admins, allowing them to define a title, description, and an ordered list of bible chapters. The selection interface uses a hierarchical book/chapter explorer with drag-and-drop reordering for maximum flexibility.

## Goals
- Allow admins to create new system-wide protocols.
- Allow admins to edit existing protocols.
- Provide an intuitive interface for selecting specific chapters from the bible.
- Enable custom ordering of chapters (not just canonical order).

## User Stories

### US-001: Admin Access & Entry
**Description:** As an admin, I want to access the Protocol Creator from the Protocol Library so I can add new content.

**Acceptance Criteria:**
- [ ] The "Settings" (gear) icon in `ProtocolLibraryModal` opens the `ProtocolEditorModal` (instead of toast).
- [ ] If editing an existing protocol, the modal pre-fills with that protocol's data.
- [ ] If creating new, the modal starts empty.
- [ ] Verify non-admins cannot access this view (backend protection + UI hiding).

### US-002: Protocol Metadata
**Description:** As an admin, I want to define the title and description of the protocol so users know what it is.

**Acceptance Criteria:**
- [ ] Input fields for "Title" and "Description".
- [ ] Validation: Title is required.
- [ ] Verify in browser using dev-browser skill.

### US-003: Chapter Selection (Hierarchy)
**Description:** As an admin, I want to browse books and chapters to select content for the plan.

**Acceptance Criteria:**
- [ ] Display a list of Bible Books (Genesis -> Revelation).
- [ ] Clicking a book expands it to show a grid of Chapter buttons (1, 2, 3...).
- [ ] "Select All" button for each book adds all its chapters.
- [ ] Clicking a chapter toggles its selection state (Visual feedback: Highlighted if selected).
- [ ] Verify in browser using dev-browser skill.

### US-004: Selected Steps & Reordering
**Description:** As an admin, I want to see the list of chapters I've added and reorder them to create a custom flow.

**Acceptance Criteria:**
- [ ] Separate panel/column showing "Selected Steps" (The actual protocol path).
- [ ] Steps display "Book Chapter" (e.g., "Genesis 1").
- [ ] Steps can be removed via an "X" button.
- [ ] Steps are drag-and-drop reorderable (using `dnd-kit` or similar).
- [ ] Verify in browser using dev-browser skill.

### US-005: Save & Publish
**Description:** As an admin, I want to save the protocol so it becomes available to users.

**Acceptance Criteria:**
- [ ] "Save Protocol" button commits changes to the `protocols` table via mutation.
- [ ] Handle creation (`insert`) vs update (`patch`).
- [ ] Show success toast and close modal on completion.
- [ ] Verify data persists in Convex dashboard.

## Functional Requirements
- FR-1: **State Management:** Local state for `title`, `description`, and `selectedSteps` (array of `{ book, chapter }`).
- FR-2: **Selection Logic:** Toggling a chapter in the accordion adds/removes it from the `selectedSteps` list.
- FR-3: **Duplicates:** Prevent duplicate steps? (Decision: Allow duplicates if user wants them, e.g., read Psalm 23 twice, but warn or visually distinct).
- FR-4: **Data Source:** Use the existing `library` data structure (Bible books/chapters) to populate the selector. If not available as raw JSON, create a constant `BIBLE_STRUCTURE` helper.

## Non-Goals
- Importing plans from CSV/Text.
- Rich text formatting for descriptions.
- Scheduling specific dates (just ordered steps).

## Design Considerations
- **Layout:** Two-column layout (on desktop):
    - Left: Bible Explorer (Accordion).
    - Right: Selected Steps (Sortable List).
- **Mobile:** Tabbed view or stacked (Select -> Review).
- **Theme:** Consistent with dark mode (Zinc/Rose).

## Technical Considerations
- **Backend:**
    - `createProtocol` mutation (admin only).
    - `updateProtocol` mutation (admin only).
- **Frontend:**
    - Use `dnd-kit` for drag-and-drop.
    - Need a static `BIBLE_BOOKS` list with chapter counts (e.g., `{ name: "Genesis", chapters: 50 }`) since loading the *entire* text library is too heavy just for selection.

## Success Metrics
- Admin successfully creates a protocol with >5 chapters.
- Admin successfully reorders steps.

## Open Questions
- Should we allow "Draft" status? (Not for v1, `isPublic` defaults to true or manual toggle).
