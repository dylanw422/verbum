# PRD: Active Protocols (Reading Plans)

## Introduction
Implement "Active Protocols," a feature allowing users to subscribe to and track progress through structured reading plans (e.g., "The Gospels," "Wisdom Literature"). Users can browse a system library of protocols, subscribe to multiple plans simultaneously, and track their progress automatically via reading activity or manual overrides.

## Goals
- Enable users to browse and subscribe to curated reading plans ("Protocols").
- Display active protocols on the Journal Dashboard.
- Track progress through protocols (automatically via reading or manual check-off).
- Encourage consistent reading habits through structured goals.

## User Stories

### US-001: Browse Protocol Library
**Description:** As a user, I want to see a list of available reading plans so I can choose one that fits my spiritual goals.

**Acceptance Criteria:**
- [ ] Create a "Browse Protocols" view (modal or page).
- [ ] Display list of system protocols (title, description, total chapters).
- [ ] "Start Protocol" button for each plan.
- [ ] Verify in browser using dev-browser skill.

### US-002: Subscribe to Protocol
**Description:** As a user, I want to start a protocol so it appears on my dashboard.

**Acceptance Criteria:**
- [ ] Clicking "Start" adds the protocol to the user's "Active Protocols" list in the database.
- [ ] Navigate user back to Dashboard or show success toast.
- [ ] Prevent duplicate subscriptions to the exact same active protocol.
- [ ] Typecheck passes.

### US-003: Dashboard Protocol Widget
**Description:** As a user, I want to see my active protocols on the Journal Dashboard so I can quickly access my next reading.

**Acceptance Criteria:**
- [ ] Replace the mock "Active Protocols" card with real data.
- [ ] Display title, progress bar (%), and "chapters remaining" for each active protocol.
- [ ] Clicking a protocol opens its details/progress view.
- [ ] Verify in browser using dev-browser skill.

### US-004: Protocol Details & Progress
**Description:** As a user, I want to see the list of chapters in my protocol and my status for each.

**Acceptance Criteria:**
- [ ] Detail view showing ordered list of chapters.
- [ ] Visual distinction between "Read" and "Unread" chapters.
- [ ] "Read Now" button next to the next unread chapter (links to Player).
- [ ] Manual "Mark as Read" toggle for each chapter.
- [ ] Verify in browser using dev-browser skill.

### US-005: Automatic Progress Tracking
**Description:** As a user, I want my progress to update automatically when I finish reading a chapter in the app.

**Acceptance Criteria:**
- [ ] When a chapter is completed in the Player (existing `handleComplete`), check if it matches any active protocol steps.
- [ ] If match found, mark that step as complete in the database.
- [ ] Update progress percentage.
- [ ] Typecheck passes.

## Functional Requirements
- FR-1: **Data Model:**
    - `Protocols` (System): `id`, `title`, `description`, `steps` (array of `{ book, chapter }`).
    - `UserProtocols`: `userId`, `protocolId`, `startDate`, `completedSteps` (array of step indices or IDs), `status` (active/completed).
- FR-2: Users can have multiple active protocols (4B).
- FR-3: Protocol steps are ordered lists of chapters (1A).
- FR-4: Progress is tracked by matching `completedSteps` against the protocol's total steps.
- FR-5: "Mark as Read" can be triggered manually or via Player completion event (3C).

## Non-Goals
- User-created custom protocols (v2).
- "Day-based" scheduling (e.g., "You are 3 days behind") (v2).
- Social sharing of progress.
- Reminders/Push notifications.

## Design Considerations
- **Dashboard Card:** Keep the existing aesthetic (Zinc/Rose). Use a compact list for multiple protocols.
- **Library:** Simple grid or list of cards with cover art or icons.
- **Progress:** Visual progress bar is critical for motivation.

## Technical Considerations
- **Backend (Convex):**
    - Need `protocols` table (for system definitions).
    - Need `userProtocols` table (state).
    - Functions: `listSystemProtocols`, `subscribeToProtocol`, `getUserProtocols`, `markStepComplete`.
- **Frontend:**
    - Reuse `DashboardCard` component.
    - Create `ProtocolLibraryModal` or page.

## Success Metrics
- Increase in daily active users (DAU) engaging with the Player.
- Number of protocols started vs. completed.

## Open Questions
- Should we seed the database with a few initial protocols (e.g., "Gospels", "Psalms", "Proverbs")? (Yes, need generic seed data).
- What happens when a protocol is finished? (Move to "History" tab).
