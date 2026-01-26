# PRD: Study Hours Tracking

## Introduction
Implement a "Study Hours" tracking system to monitor and display the total amount of time a user spends reading scripture within the application. This feature aims to provide users with a tangible metric of their dedication and engagement.

## Goals
- Track the total time (in seconds) a user spends in the `Player` (reading mode).
- Persist this data in the Convex database.
- Display the accumulated time in hours (e.g., "18.5") on the Journal dashboard, replacing the current mock data.

## User Stories

### US-001: Schema Update for Time Tracking
**Description:** As a developer, I need to store the total study duration in the user's profile.
**Acceptance Criteria:**
- [ ] Add `totalStudyTime` (number, default 0) to the `userStats` table in `packages/backend/convex/schema.ts`.
- [ ] Ensure the field is indexed or accessible via existing `by_userId` index.

### US-002: Backend Mutation for Logging Time
**Description:** As a system, I need a secure way to increment a user's study time.
**Acceptance Criteria:**
- [ ] Create a Convex mutation `logStudyTime` (or update `logSession`) in `packages/backend/convex/userStats.ts`.
- [ ] The mutation accepts `duration` (number, in seconds) and increments the user's `totalStudyTime`.
- [ ] Validate that `duration` is a reasonable positive number (e.g., < 24 hours per call) to prevent data corruption.

### US-003: Player Component Time Tracking
**Description:** As a user, I want the app to count the time I am actively reading.
**Acceptance Criteria:**
- [ ] In `apps/web/src/components/player/ReaderStage.tsx` (or a new hook `useStudyTimer`), track time whenever the player is in the `playing` state.
- [ ] Use a reliable interval (e.g., every 1 second) to accumulate time locally.
- [ ] "Flush" (send) the accumulated time to the backend:
    - Periodically (e.g., every 30-60 seconds) to prevent data loss on crash.
    - On component unmount (navigating away).
    - On player pause or completion.
- [ ] Ensure idle time (paused state) is NOT counted.

### US-004: Display Study Hours on Dashboard
**Description:** As a user, I want to see my total study hours on my dashboard.
**Acceptance Criteria:**
- [ ] In `apps/web/src/app/journal/page.tsx`, fetch the `totalStudyTime` from `userStats`.
- [ ] Convert the raw seconds to hours, formatted to one decimal place (e.g., 3600s -> "1.0", 1800s -> "0.5").
- [ ] Handle the loading state (display a skeleton or "-").
- [ ] Verify the displayed value matches the backend data.

## Functional Requirements
- FR-1: Time must only be tracked when the player is active (`playing === true`).
- FR-2: Time is stored in seconds for precision but displayed in hours.
- FR-3: The system must robustly handle network interruptions (e.g., optimistic updates or simply retrying the next flush).
- FR-4: Large durations sent in a single request should be validated/clamped.

## Non-Goals
- Tracking "sessions" as distinct history items (we only care about the cumulative total for now).
- Breakdown of time by book or chapter.
- Leaderboards or social comparison of study hours.

## Technical Considerations
- **Database:** Convex `userStats` table.
- **State Management:** Local React state/refs for accumulating seconds before flushing to reduce API calls.
- **Edge Cases:**
    - User leaves the tab open while playing (browser throttling of `requestAnimationFrame` might affect tracking if dependent on it; prefer `Date.now()` diffs).
    - Rapid play/pause toggling (should not spam the backend; use a buffer/debounce).

## Success Metrics
- Accurate reflection of time spent reading.
- No significant performance impact on the player (rendering or network).
