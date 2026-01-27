# PRD: Daily Bread (Random Daily Verse)

## 1. Introduction
The "Daily Bread" feature displays a daily Bible verse on the user's dashboard. This verse is consistent across all users, changes every 24 hours, and is sourced from a JSON Bible data blob. This feature serves as a daily anchor for meditation and study.

## 2. Goals
- **Consistency:** Ensure every user sees the exact same verse for a given day.
- **Automation:** The verse updates automatically every 24 hours without manual intervention.
- **Source of Truth:** Utilize the specific Bible version provided via a JSON blob.
- **Future-Proofing:** Retain UI elements (buttons) for future interactivity ("Meditate", "Quick Journal") even if they are non-functional in this iteration.

## 3. User Stories

### US-001: Backend - Daily Verse Selection Job
**Description:** As the system, I need to select and store a new verse every 24 hours so that the daily content is refreshed.
**Acceptance Criteria:**
- [ ] Create a Convex Cron job scheduled to run daily (e.g., midnight UTC).
- [ ] The job fetches/reads the Bible data from the designated JSON blob source.
- [ ] A random verse is selected from the source.
- [ ] The selected verse is stored in a `dailyVerses` table (or updated in a singleton record) with fields: `text`, `reference` (Book Chapter:Verse), `date`.
- [ ] Typecheck passes.

### US-002: Backend - API to Get Today's Verse
**Description:** As a frontend client, I need to fetch the current active verse.
**Acceptance Criteria:**
- [ ] Create a Convex query `api.dailyVerse.get` (or similar).
- [ ] Returns the most recent/current verse record.
- [ ] Handles edge case where no verse exists (e.g., first run) by either returning null or triggering a generation.
- [ ] Typecheck passes.

### US-003: UI - Display Daily Verse
**Description:** As a user, I want to see the "Daily Bread" card populated with today's verse.
**Acceptance Criteria:**
- [ ] Update `apps/web/src/app/journal/page.tsx` (Daily Bread section) to use the Convex query.
- [ ] Display the verse text in the quote block.
- [ ] Display the verse reference (e.g., "John 1:5") in the citation.
- [ ] Ensure the "Meditate" and "Quick Journal" buttons remain visible but can be non-functional (or show a "Coming Soon" toast) for now.
- [ ] Handle loading state (skeleton or spinner) while fetching.
- [ ] Verify in browser.

## 4. Functional Requirements
1.  **Data Source:** The system must retrieve Bible text from a JSON blob (URL or file path to be defined in implementation).
2.  **Schema:** A `dailyVerses` table (or equivalent) in Convex to store history and current verse.
    *   `date`: string (YYYY-MM-DD)
    *   `verseText`: string
    *   `reference`: string
    *   `book`: string
    *   `chapter`: number
    *   `verse`: number
3.  **Scheduling:** Use Convex Crons (`crons.ts`) to schedule the update.
4.  **Randomness:** The selection algorithm should be random from the available text in the blob.

## 5. Non-Goals
- **Personalization:** The verse is not unique to the user; it is global.
- **Interactive Buttons:** "Meditate" and "Quick Journal" actions are out of scope for *logic* implementation in this ticket (UI only).
- **Multiple Translations:** Only the translation in the JSON blob is supported.

## 6. Design Considerations
- **UI:** Reuse the existing `DashboardCard` layout in `apps/web/src/app/journal/page.tsx`.
- **Typography:** Ensure verse text is legible and respects the current theme (font-serif italic).

## 7. Technical Considerations
- **JSON Blob:** Ensure the backend (Convex) can access this blob. If it's an external URL, use `fetch`. If it's a local file, ensure it's bundled or accessible to the Convex runtime. *Assumption: It will be a `fetch` to a remote URL or imported JSON file.*

## 8. Success Metrics
- **Freshness:** The verse changes exactly once per day.
- **Reliability:** The "Daily Bread" card never appears empty or broken.

## 9. Open Questions
- **Blob Location:** What is the specific URL or path to the Bible JSON blob? (To be configured in env variables or constants).
