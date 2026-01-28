# PRD: Meditation Mode for Daily Bread

## Introduction
Implement a "Meditation Mode" triggered from the "Daily Bread" section of the Journal Dashboard. This mode provides a focused, immersive experience for users to meditate on the daily verse. It features a breathing guide (visual circle animation), displays the full verse text, and prompts the user to journal upon completion.

## Goals
- Provide a distraction-free environment for meditating on scripture.
- Guide users through a simple breathing exercise (Breathe In / Breathe Out).
- seamless transition from the dashboard to meditation and then to journaling.
- Log the engagement activity implicitly by leading to a journal entry.

## User Stories

### US-001: Launch Meditation Mode
**Description:** As a user, I want to click the "Meditate" button on the Daily Bread card to enter a full-screen or focused modal view with the daily verse.

**Acceptance Criteria:**
- [ ] "Meditate" button in `DashboardCard` opens the Meditation view.
- [ ] View displays the current Daily Bread verse text and reference.
- [ ] UI is minimal, dark/themed, and distraction-free.
- [ ] Verify in browser using dev-browser skill.

### US-002: Breathing Animation & Guidance
**Description:** As a user, I want a visual guide for breathing so I can center my thoughts while reading the verse.

**Acceptance Criteria:**
- [ ] Display a large, subtle circle behind or around the text.
- [ ] Circle expands for "Breathe In" (e.g., 5s) and contracts for "Breathe Out" (e.g., 5s).
- [ ] Subtle text indicator ("Breathe In" / "Breathe Out") syncs with the animation.
- [ ] Animation loops for the duration of the session.
- [ ] Verify in browser using dev-browser skill.

### US-003: Fixed Duration & Completion
**Description:** As a user, I want the session to last for a fixed time (e.g., 2 minutes) so I know I've completed a meaningful pause.

**Acceptance Criteria:**
- [ ] Timer runs for 2 minutes (120 seconds) upon entry.
- [ ] Visual progress indicator (bar or ring) optional but helpful.
- [ ] Upon timeout, automatically transition to the "Session Complete" state or Journal prompt.
- [ ] Option to "End Early" (Exit button) is available.
- [ ] Verify in browser using dev-browser skill.

### US-004: Post-Meditation Journal Prompt
**Description:** As a user, I want to be prompted to journal about my meditation immediately after it finishes.

**Acceptance Criteria:**
- [ ] When the timer ends, show a smooth transition to a prompt: "What is the Spirit speaking to you?" (or similar).
- [ ] "Journal Now" button navigates to `/entries?new=true&ref=...` (passing the verse ref).
- [ ] "Done" button returns to Dashboard without journaling.
- [ ] Verify in browser using dev-browser skill.

## Functional Requirements
- FR-1: Meditation View overlays the dashboard (Modal) or is a separate page route (e.g., `/journal/meditate`). (Decision: **Modal** keeps context, but **Route** might be more "immersive". Let's stick to **Full Screen Modal/Overlay** within the page for smoother transitions).
- FR-2: Retrieve `dailyVerse` data from the parent context or query.
- FR-3: Breathing cycle: 5s In, 5s Out (10s total cycle).
- FR-4: Duration: 2 minutes fixed.
- FR-5: Background visual: "Growing and shrinking circle".

## Non-Goals
- Audio/Music support.
- Configurable settings (duration, breath speed) for v1.
- Tracking "minutes meditated" separate from general usage stats (unless implicit).

## Design Considerations
- **Visuals:** Use the existing app aesthetic (Zinc/Rose).
- **Typography:** Serif for the verse (sacred feel), Mono for the breathing guide.
- **Animation:** Use `framer-motion` for the circle scale and opacity.
- **Z-Index:** Ensure it covers the dashboard but perhaps leaves a "close" button accessible.

## Technical Considerations
- Reuse `dailyVerse` data already fetched in `JournalPage`.
- Use a local state `isMeditating` to toggle the overlay.
- `useEffect` for the 2-minute timer.
- `useRouter` for navigation to Journal Entry.

## Success Metrics
- Users completing the full 2-minute session.
- Conversion rate from "Meditate" to "Journal Entry".

## Open Questions
- Should the verse text fade in/out with breath? (Keep it static for readability for now).
- Should we hide the "Breathe In/Out" text after a few cycles to reduce noise? (Keep it for v1).
