# PRD: Verses Engaged Tracking

## Introduction
Implement a "Verses Engaged" counter to track the total volume of scripture consumed by the user. This metric provides a sense of cumulative progress and depth of study.

## Goals
- Track the total number of verses a user has read/completed.
- Display this total on the Journal dashboard.
- Update the count automatically when a chapter is completed.
- Store data efficiently in the existing `userStats` table.

## User Stories

### US-001: Schema Update for Verse Count
**Description:** As a developer, I need to store the cumulative verse count.
**Acceptance Criteria:**
- [ ] Add `versesEngaged` (number, default 0) field to the `userStats` table in Convex schema.
- [ ] Update `getStats` query to return this field.

### US-002: Update Mutation to Handle Verse Count
**Description:** As a developer, I need the backend to accept and increment the verse count.
**Acceptance Criteria:**
- [ ] Rename/Refactor `updateUserStreak` to `logSession` (or similar generic name) or update the existing mutation signature.
- [ ] Accept an additional argument: `versesRead` (number).
- [ ] Increment the `versesEngaged` field in the database by `versesRead`.
- [ ] Ensure this happens atomically with the streak update.

### US-003: Calculate and Send Verse Count (Frontend)
**Description:** As a user, I want the app to count exactly how many verses were in the chapter I just finished.
**Acceptance Criteria:**
- [ ] In `Player` component, calculate the number of unique verses in the current chapter's `words` array.
- [ ] Pass this number to the mutation called in `handleComplete`.
- [ ] Verify the calculation is accurate (e.g., if chapter has 20 verses, send 20).

### US-004: Display Verses Engaged on Dashboard
**Description:** As a user, I want to see my total verses read on the Journal page.
**Acceptance Criteria:**
- [ ] Update `apps/web/src/app/journal/page.tsx` to display the real `versesEngaged` value.
- [ ] Format the number (e.g., "1,248") for readability.
- [ ] Handle loading state.

## Functional Requirements
- FR-1: "Verses Engaged" is a cumulative lifetime total.
- FR-2: The count is updated only upon successful completion of a chapter (consistent with streak logic).
- FR-3: The number of verses is determined by the client (Player) based on the parsed text data.

## Non-Goals
- Tracking partial verses or saving progress mid-chapter (for this iteration).
- Breakdown by book/genre.

## Technical Considerations
- **Data Integrity:** Client trusts the verse count.
- **Migration:** Existing `userStats` documents might need a backfill or default value handling (Convex handles missing fields gracefully if checked, but better to patch).

## Success Metrics
- User engagement with the "Verses Engaged" stat.
- Consistent incrementing of the stat correlating with streak updates.
