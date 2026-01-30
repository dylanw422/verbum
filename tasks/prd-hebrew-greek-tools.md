# PRD: Hebrew/Greek Study Tools

## Introduction
The "Original Languages" section of the Study Core Library allows users to deepen their biblical study by examining the original Hebrew (Old Testament) and Greek (New Testament) texts. This feature provides an interlinear view where English text is presented alongside the original language, coupled with interactive tools to lookup lexical definitions, morphology, and Strong's numbers.

## Goals
- **Interlinear Visualization:** seamlessly display English text aligned with its original Hebrew/Greek source.
- **Interactive Lexicon:** Allow users to click on any word to reveal its definition, root, pronunciation, and grammatical form.
- **Context Awareness:** Automatically switch between Hebrew and Greek resources based on the book being studied.
- **Non-Intrusive UX:** Integrate these deep study tools within the existing `StudyCoreModal` without cluttering the interface.

## User Stories

### US-001: Access Original Languages Tool
**Description:** As a user, I want to select the "Hebrew/Greek" tool from the Study Core library so that I can begin my original language study.

**Acceptance Criteria:**
- [ ] Clicking the "Hebrew/Greek" tab in `StudyCoreModal` replaces the "Coming Soon" placeholder with the tool interface.
- [ ] The interface loads the current chapter's interlinear data (or prompts to select a passage).
- [ ] Verify in browser using dev-browser skill.

### US-002: View Interlinear Text
**Description:** As a user, I want to see the English text displayed line-by-line or word-by-word with the corresponding Hebrew or Greek word.

**Acceptance Criteria:**
- [ ] Display text in a "word card" format: English word on top, Original word below (or vice versa).
- [ ] Support Right-to-Left (RTL) layout for Hebrew texts.
- [ ] Support Left-to-Right (LTR) layout for Greek texts.
- [ ] Include Transliteration (optional but recommended).
- [ ] Verify visually that alignment is correct.

### US-003: Word Definition Lookup (Lexicon)
**Description:** As a user, I want to click on a specific word to view its detailed lexical information.

**Acceptance Criteria:**
- [ ] Clicking a word opens a details pane (sidebar or popover).
- [ ] Details include: Original Word, Transliteration, Pronunciation (phonetic), Strong's Number, Definition/Gloss, and Part of Speech.
- [ ] verify that the correct data is displayed for the clicked word.

### US-004: Navigate Chapters
**Description:** As a user, I want to navigate between chapters within the Hebrew/Greek tool.

**Acceptance Criteria:**
- [ ] Include a simple chapter selector or "Previous/Next" navigation within the tool view.
- [ ] Updating the chapter refreshes the interlinear view with new data.

## Functional Requirements

- **FR-1: Data Sourcing:** The system must fetch interlinear data (English, Original, Strong's, Morphology) from a reliable source. ( *Note: If local JSON is too large, consider a lazy-loaded approach or an external API/edge function proxy*).
- **FR-2: Rendering Engine:** Create a `InterlinearReader` component that handles:
    - Text alignment.
    - Bi-directional text support (Hebrew vs Greek).
    - Click interactions.
- **FR-3: Lexicon Viewer:** Create a `LexiconCard` component to display word details.
- **FR-4: State Management:** Track the currently selected `verse` or `word` to highlight it and show details.

## Non-Goals
- Full morphological search (finding all instances of a specific grammatical form).
- Manuscript comparison (e.g., comparing Byzantine vs. Alexandrian text types).
- Audio playback of pronunciations (text-only for MVP).

## Design Considerations
- **Typography:** Use distinct fonts for Hebrew (e.g., SBL Hebrew or similar web font) and Greek to ensure readability.
- **Layout:**
    - *Desktop:* Split view? Interlinear on left, Lexicon on right?
    - *Mobile:* Stacked view. Clicking a word opens a bottom drawer with definitions.
- **Theme:** Maintain the `zinc-950` dark mode aesthetic. Use `rose-500` for highlights/selections.

## Technical Considerations
- **Data Size:** A full interlinear Bible with Strong's numbers is large (~10MB+ JSON).
    - *Strategy:* Split data by book or chapter. Store in `public/` or fetch from the existing blob storage if possible.
    - *Alternative:* Use an API if one is available and cost-effective.
- **Libraries:**
    - No specific "Hebrew rendering" library needed, standard HTML/CSS with proper `dir="rtl"` attributes works for Hebrew.

## Success Metrics
- Users spend >2 minutes in the tool per session.
- Users click on at least 5 words per session (indicating active study).
- Load time for a chapter is < 1 second.

## Open Questions
- Do we have a license-free source for the Interlinear data (e.g., Berean Interlinear, OpenScriptures)?
    - *Assumption:* We will use public domain data (e.g., Open Greek New Testament, WLC for Hebrew) mapped to KJV or BSB.
