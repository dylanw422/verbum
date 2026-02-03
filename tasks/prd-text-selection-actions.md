# PRD: Text Selection Actions (Reading Mode)

## Introduction
Enhance the Reader's "Reading Mode" by providing contextual actions when a user selects text. This feature enables a fluid study experience similar to Medium or Notion, allowing users to highlight, note, or research specific phrases without losing their place.

## Goals
- Streamline the transition from reading to studying.
- Provide quick access to existing tools (Concordance, Notes).
- Enable persistent highlighting of text with immediate visual feedback.
- Ensure selection feels natural but precise (snapping to words).

## User Stories

### US-001: Snap Text Selection to Words
**Description:** As a user, when I drag my cursor to select text, I want the selection to automatically expand to include full words so that I don't accidentally select partial words.

**Acceptance Criteria:**
- [ ] Selection expands to nearest word boundaries on mouse up / selection end.
- [ ] Works across multiple words.
- [ ] Does not span across different verses if technical limitations apply (or handles it gracefully).
- [ ] Verify in browser using dev-browser skill.

### US-002: Display Floating Action Menu
**Description:** As a user, when I finish selecting text, I want to see a floating menu near the selection with available actions.

**Acceptance Criteria:**
- [ ] Menu appears immediately after selection ends.
- [ ] Menu is positioned above or below the selection (smart positioning based on viewport).
- [ ] Menu disappears if selection is cleared or user clicks away.
- [ ] Menu contains icons/labels for: Highlight, New Note, Concordance, Copy, Share.
- [ ] Verify in browser using dev-browser skill.

### US-003: Highlight Action (Optimistic)
**Description:** As a user, I want to highlight the selected text so I can mark important passages.

**Acceptance Criteria:**
- [ ] Clicking "Highlight" immediately applies a visual style (e.g., yellow/rose background) to the selection.
- [ ] The highlight persists in the UI even before the server confirms (optimistic update).
- [ ] The highlight is saved to the backend.
- [ ] If the backend fails, the highlight is removed and an error toast is shown.
- [ ] Verify in browser using dev-browser skill.

### US-004: Concordance Lookup
**Description:** As a user, I want to search the selected phrase in the Concordance tool.

**Acceptance Criteria:**
- [ ] Clicking "Concordance" opens the Concordance Tool (sidebar/modal).
- [ ] The search field is pre-filled with the selected text.
- [ ] The search is automatically executed.
- [ ] Verify in browser using dev-browser skill.

### US-005: Copy and Share
**Description:** As a user, I want to copy the text or share it.

**Acceptance Criteria:**
- [ ] Clicking "Copy" copies the text + reference (e.g., "Jesus wept. (John 11:35)") to the clipboard.
- [ ] Clicking "Share" triggers the native share sheet (if mobile) or a custom share modal/clipboard action.

### US-006: New Note
**Description:** As a user, I want to attach a note to the selected text.

**Acceptance Criteria:**
- [ ] Clicking "New Note" opens the note editor (modal or sidebar).
- [ ] The note is linked to the specific verse(s) and selected text.
- [ ] Verify in browser using dev-browser skill.

## Functional Requirements
1.  **Selection Handler:** Implement `onSelectionChange` or `onMouseUp` listener in `ReaderStage` (Reading Mode only).
2.  **Boundary Logic:** Logic to detect the start and end words of the selection within the `WordData` / `verses` structure.
3.  **Menu Component:** A reusable `FloatingToolbar` component using a library like `@floating-ui/react` or manual calculation.
4.  **Context Data:** The action handlers must receive:
    - Selected Text (string)
    - Verse Reference (Book, Chapter, Verse)
    - (Optional) Start/End Word Indices for precise anchoring.
5.  **State Management:**
    - `isMenuOpen`
    - `selectionCoordinates` (x, y)
    - `selectedData` (text, ref)

## Non-Goals
- Selection in RSVP mode (ReaderStage currently splits these views).
- Multi-verse highlighting in v1 (if it significantly complicates the backend logic, restrict to single verse for now, but UI should support multi-word).
- Social commenting (public notes).

## Technical Considerations
- **ReaderStage.tsx:** The main integration point.
- **Z-Index:** Ensure the menu floats above the "MagicalTransition" and text layers.
- **Mobile:** Selection on mobile (long press) handles differently; ensure the custom menu doesn't conflict with OS menus (or decide to use OS menu integration if possible, though web custom menus are standard now).
- **DOM Traversal:** Need to map DOM nodes back to `WordData` or verse indices. The current `ReaderStage` renders words as `span` elements. Adding `data-word-index` or `data-verse` attributes to these spans will make identifying the selection context much easier.

## Success Metrics
- Frequency of "Concordance" vs "Highlight" usage.
- User feedback on selection ease (snapping).
