# PRD: Replace "Study Mode" with "Reading Mode"

## Introduction
Replace the existing "Study Mode" (which shows context verses in a popup when paused) with a full "Reading Mode". This new mode will present the chapter text in a traditional reading layout, allowing users to switch between high-speed RSVP (Rapid Serial Visual Presentation) reading and standard paragraph reading seamlessly.

## Goals
- Replace "Study Mode" with "Reading Mode".
- Ensure RSVP is the default mode.
- Provide a "magical" transition between RSVP and Reading Mode.
- Indicate the user's current RSVP position within the Reading Mode text.

## User Stories

### US-001: Reading Mode Layout
**Description:** As a user, I want to see the chapter text formatted as normal paragraphs when I switch to Reading Mode, so I can read at my own pace or check context.

**Acceptance Criteria:**
- [ ] Display the entire chapter text in a readable, max-width container.
- [ ] Typography should be optimized for long-form reading (serif font, comfortable line height).
- [ ] Ensure the layout is responsive (mobile vs desktop).
- [ ] Verify in browser using dev-browser skill.

### US-002: Active Verse Indicator
**Description:** As a user, I want to see exactly where I was in RSVP mode when I switch to Reading Mode, so I don't lose my place.

**Acceptance Criteria:**
- [ ] Highlight or indicate the specific verse corresponding to the current RSVP word index.
- [ ] Auto-scroll to the active verse when entering Reading Mode.
- [ ] Reading Mode is for reference only; switching back resumes from the original RSVP position (no jump-on-click).
- [ ] Verify in browser using dev-browser skill.

### US-003: Magical Transition
**Description:** As a user, I want the switch between modes to feel smooth and magical, with the active word morphing into the text.

**Acceptance Criteria:**
- [ ] Implement morph/layout animation (e.g., using `framer-motion` layout animations).
- [ ] The active RSVP word visually "expands" or "morphs" into its position within the full text layout.
- [ ] No jarring layout shifts or flashes.
- [ ] Verify in browser using dev-browser skill.

### US-004: Mode Toggling & Default State
**Description:** As a user, I want the app to always start in RSVP mode and never remember the previous mode.

**Acceptance Criteria:**
- [ ] Default state on EVERY load is always RSVP.
- [ ] The app does not persist the "Reading Mode" state across refreshes or sessions.
- [ ] "Study Mode" toggle button is renamed/re-iconed to "Reading Mode".
- [ ] Toggling to Reading Mode automatically pauses RSVP playback.

## Functional Requirements
- FR-1: Rename `studyMode` state/logic to `readingMode` (or similar) throughout the component tree.
- FR-2: When entering Reading Mode, RSVP playback MUST pause.
- FR-3: Reading Mode displays the ENTIRE chapter text.
- FR-4: "Magical" transition: The active word/verse in RSVP should visually morph into its position in the paragraph layout using `framer-motion`.
- FR-5: Ensure state does not persist (reset to RSVP on mount).

## Non-Goals
- Persistence of Reading Mode state.
- Clicking a verse to jump the RSVP player (Reading Mode is read-only reference).
- Editing text.
- Audio narration sync (beyond existing scope).

## Technical Considerations
- Use `framer-motion` `layoutId` or `layout` props to achieve the morphing effect between the center-stage word and the paragraph text.
- Since Reading Mode displays the entire chapter, ensure the full text is rendered (perhaps lazily or hidden via CSS) during RSVP mode to allow for smooth layout transitions.
- Update `usePlayerPersistence` to remove or bypass persistence for this specific mode.

## Success Metrics
- Users engage with Reading Mode for context checks without abandoning the session.
- High visual satisfaction with the "morphing" transition.
- Zero "lost place" complaints.

## Open Questions
- Should the background darken further in Reading Mode to increase contrast? (Optional UI polish).
- Performance of `framer-motion` layout animations with large blocks of text (need to test).
