# PRD: Personal Journal & Verse Linking

## Introduction
Create a dedicated `/entries` page where users can write personal journal entries, notes, or reflections. A key feature is the ability to link specific scripture verses to these entries using a smart combobox selector.

## Goals
- Provide a space for users to document their spiritual journey.
- Allow structured linking of scripture references to notes.
- Maintain visual consistency with the existing dark/tech aesthetic.

## User Stories

### US-001: Journal Entries Schema
**Description:** As a developer, I need a database table to store journal entries.
**Acceptance Criteria:**
- [ ] Create `journalEntries` table in Convex schema.
- [ ] Fields: `userId`, `title` (string), `content` (string/HTML/Markdown), `linkedVerse` (string, optional, e.g., "John 3:16"), `createdAt` (string/number).
- [ ] Create mutation `createEntry` and query `getEntries`.

### US-002: Journal Page UI (/entries)
**Description:** As a user, I want a dedicated page to view my past entries.
**Acceptance Criteria:**
- [ ] Create `apps/web/src/app/entries/page.tsx`.
- [ ] Display a chronological list (or grid) of entries.
- [ ] Show Title, Date, and Linked Verse preview for each entry.
- [ ] Include a "New Entry" button that opens a creation modal or page.

### US-003: Entry Creation with Verse Selector
**Description:** As a user, I want to write a note and easily tag it with a verse by typing.
**Acceptance Criteria:**
- [ ] Implement a form with Title and Body inputs.
- [ ] Implement a **Verse Combobox**:
    - Users type (e.g., "Joh").
    - Dropdown filters available Books.
    - User selects Book -> types Chapter -> types Verse.
    - *Simplified MVP:* A standard Shadcn Combobox that lists Books, then standard text input for "Chapter:Verse" OR a smart regex parser that formats "John 3 16" to "John 3:16".
    - *Preferred:* A "Book" combobox + "Reference" input.
- [ ] Save the entry to Convex.

### US-004: Dashboard Integration
**Description:** As a user, I want to access my journal from the main dashboard.
**Acceptance Criteria:**
- [ ] Add a "Journal" button to the `/journal` page (e.g., in the "Codex Entries" card header or a main navigation button).
- [ ] Ensure the "Codex Entries" card on the dashboard shows the 3 most recent *real* entries (replace mocks).

## Functional Requirements
- FR-1: Entries are private to the user.
- FR-2: Verse linking stores the reference string (not the text content).
- FR-3: The UI must allow creating, viewing, and (optional for MVP) editing entries.

## Non-Goals
- Rich text editor (WYSIWYG) - Plain text/textarea is fine for MVP.
- Full-text scripture search (searching for "love" to find 1 Corinthians 13). Search is by Reference only.

## Technical Considerations
- Use `shadcn/ui` components (Combobox, Dialog/Sheet, Input, Textarea).
- Convex for backend.

## Success Metrics
- Number of journal entries created.
- Percentage of entries with linked verses.
