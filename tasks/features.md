# Verbum: Path to the Go-To Christian App

This document outlines high-impact features to evolve Verbum from a focused RSVP reader into a comprehensive spiritual growth platform.

## 1. Depth & Meditation
### Lectio Divina Mode (The Anti-RSVP)
*   **Concept:** A "Slow Mode" for deep meditation.
*   **Feature:** Fade a single verse in and out, holding it for 1-2 minutes. Includes a synchronized breathing guide (expanding/contracting circle).
*   **Why:** RSVP is for intake; Lectio is for digestion. It makes the app useful for both study and prayer.

### The "Deep Dive" Lens
*   **Concept:** Contextual study without leaving the flow.
*   **Interaction:**
    1.  **Pause:** User pauses the RSVP stream (Study Mode already displays the full verse context when paused).
    2.  **Select:** User taps any word directly within the context verses already visible on the screen.
    3.  **Explore:** Tapping a word opens a drawer with:
        *   **Original Language:** Hebrew/Greek + Strong's definition.
        *   **Cross-References:** 3 key related verses.
        *   **AI Insight:** A one-sentence historical context summary.
*   **Why:** Leverages existing UI patterns to transform the tool into a deep study companion without adding new visual clutter.

## 2. Community & Connection
### Community Pulse (Ambient Social)
*   **Concept:** Subtle connection to the global church.
*   **Feature:** A non-intrusive indicator showing "12 others reading Romans 8 right now."
*   **Why:** Creates a sense of shared experience without the distraction of a full social feed.

## 3. Habit & Gamification
### Verse Loops for Memorization
*   **Concept:** Gamified scripture memory.
*   **Feature:** A "Loop Mode" where the RSVP engine cycles a verse, progressively replacing words with underscores (\_) until the user can recite it from memory.
*   **Why:** Leverages existing RSVP tech for a high-value utility.

### Morning & Evening Liturgy
*   **Concept:** Curated daily routines to remove decision fatigue.
*   **Feature:** A "Daily Office" button that queues a Psalm (Slow/Lectio), an OT chapter (Fast/RSVP), and a NT chapter (Fast/RSVP).
*   **Why:** Builds a daily habit by telling the user exactly what to read.

## 4. Technical Roadmap
- [ ] **Mobile Native (PWA/Capacitor):** Critical for "in-between" moments (commutes, waiting rooms).
- [ ] **Offline Mode:** Ensure the core reading experience works without data.
- [ ] **Audio Sync:** Synchronized Text-to-Speech (TTS) with the RSVP engine.
