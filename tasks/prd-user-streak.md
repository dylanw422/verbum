# PRD: User Streak Tracking

## Introduction
Implement a "Current Streak" tracking system to encourage daily engagement with the scripture reading app. The system will track consecutive days of activity, where "activity" is defined as completing a chapter.

## Goals
- Track daily user engagement streaks.
- Display the current streak on the Journal dashboard.
- Utilize the user's local timezone for "daily" calculations.
- Store data securely in the existing Convex database.

## User Stories

### US-001: Schema Update for User Stats
**Description:** As a developer, I need to store streak data in the user's profile.
**Acceptance Criteria:**
- [ ] Add `currentStreak` (number), `highestStreak` (number), and `lastEngagedDate` (string, YYYY-MM-DD) to the `users` table schema in Convex.
- [ ] Ensure default values are 0 or null for new/existing users.

### US-002: Streak Increment Logic (Backend)
**Description:** As a user, I want my streak to update when I finish a chapter so my progress is recorded.
**Acceptance Criteria:**
- [ ] Create a Convex mutation `updateUserStreak` that accepts a `clientDate` string (YYYY-MM-DD).
- [ ] Logic:
    - If `lastEngagedDate` === `clientDate`: Do nothing (already counted).
    - If `lastEngagedDate` === `yesterday` (relative to `clientDate`): Increment `currentStreak`.
    - Otherwise (missed a day or first time): Reset `currentStreak` to 1.
- [ ] Update `highestStreak` if `currentStreak` > `highestStreak`.
- [ ] Update `lastEngagedDate` to `clientDate`.

### US-003: Trigger Streak on Chapter Completion (Frontend)
**Description:** As a user, I want the app to detect when I finish reading a chapter.
**Acceptance Criteria:**
- [ ] In `Player` component, inside the `handleComplete` callback (triggered when chapter ends), invoke the `updateUserStreak` mutation.
- [ ] Pass the user's current local date (YYYY-MM-DD) to the mutation.
- [ ] Verify this only fires on completion, not just play/pause.

### US-004: Display Streak on Journal Dashboard
**Description:** As a user, I want to see my current streak on my dashboard to feel motivated.
**Acceptance Criteria:**
- [ ] In `apps/web/src/app/journal/page.tsx`, fetch the real user data from Convex.
- [ ] Replace the mock "Current Streak" stat with the real `currentStreak` value.
- [ ] Handle loading states (e.g., show "-" or skeleton).
- [ ] Verify in browser.

## Functional Requirements
- FR-1: Streak is defined by consecutive days of completing at least one chapter.
- FR-2: Days are defined by the user's local timezone (client sends date string).
- FR-3: If a day is missed, streak resets to 1 on the next completion.
- FR-4: Streak only increments once per day.

## Non-Goals
- No streak "freeze" or repair items.
- No notifications for "streak at risk".
- No visual celebrations/confetti (MVP only).

## Technical Considerations
- **Database:** Convex `users` table.
- **Client Time:** use `new Date().toLocaleDateString('en-CA')` (YYYY-MM-DD) to get local ISO-like date string.
- **Edge Cases:** User traveling across timezones (simple local date string is sufficient for MVP; we trust the client).

## Success Metrics
- Increase in daily active users (DAU).
- Increase in average session frequency per week.
