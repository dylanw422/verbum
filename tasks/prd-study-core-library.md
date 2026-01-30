# PRD: Study Core Library Modal

## 1. Introduction
The "Study Core" section on the Journal Dashboard serves as the gateway to deep theological and linguistic study tools. This PRD defines the implementation of a centralized **Study Core Library Modal**, providing a navigation framework and layout for future features like Concordances, Commentaries, Hebrew/Greek lexicons, and Maps.

## 2. Goals
- **Centralization:** Provide a single entry point for all advanced study tools.
- **Consistent UX:** Maintain the visual language established by the `ProtocolLibraryModal`.
- **Navigation Framework:** Implement a sidebar-based navigation structure that allows users to switch between tools within the same context.
- **Scaffolding:** Establish placeholders for future development without implementing core tool logic.

## 3. User Stories

### US-001: Launch Study Core Modal
**Description:** As a user, I want to click the "Open Library" button on the Study Core dashboard card so that I can access advanced study tools.

**Acceptance Criteria:**
- [ ] Clicking "Open Library" in `apps/web/src/app/journal/page.tsx` opens the `StudyCoreModal`.
- [ ] Modal uses a backdrop-blur overlay consistent with existing modals.
- [ ] Verify in browser.

### US-002: Sidebar Navigation Layout
**Description:** As a user, I want a sidebar that lists available study tools so I can easily switch between them.

**Acceptance Criteria:**
- [ ] Sidebar on the left containing 4 items: Concordance, Commentaries, Hebrew/Greek, and Maps.
- [ ] Each item includes an icon (Search, BookOpen, LayoutDashboard, Shield) and a label.
- [ ] Active state visually indicates which tool is selected.
- [ ] Verify in browser.

### US-003: Main Content Area
**Description:** As a user, I want a main content area that updates based on my sidebar selection.

**Acceptance Criteria:**
- [ ] Selecting a tool in the sidebar updates the header and content in the right-side panel.
- [ ] Header includes tool title and a brief description.
- [ ] Verify in browser.

### US-004: Tool Empty States ("Coming Soon")
**Description:** As a user, I want to see a professional "Coming Soon" message for tools that are not yet implemented.

**Acceptance Criteria:**
- [ ] Content area displays a themed empty state for all 4 tools.
- [ ] Includes "Coming Soon" text and a brief explanation of what the tool will provide (e.g., "Full Bible concordance and cross-references").
- [ ] Verify in browser.

## 4. Functional Requirements
- **FR-1:** The modal must be triggered from the "Study Core" `DashboardCard` action.
- **FR-2:** The layout must be a 2-column split (Sidebar: ~250px, Content: Flexible).
- **FR-3:** Navigation between tools must be handled via local state within the modal.
- **FR-4:** Include a close button (X) in the top right corner.
- **FR-5:** Implement responsive behavior: on smaller screens, the sidebar may stack or become a top-level selection menu (matching `ProtocolLibraryModal`'s responsive patterns).

## 5. Non-Goals
- **Implementation of Search Logic:** The Concordance will not actually search.
- **API Integration:** No external commentary or map APIs will be called.
- **Persistent Selection:** State does not need to persist after the modal is closed.

## 6. Design Considerations
- **Visual Style:** High-contrast dark theme (Zinc-950/900).
- **Accents:** Use Rose-500 for active states and icons.
- **Background:** Incorporate the grainy noise overlay used in the Protocol Library.
- **Transitions:** Use `framer-motion` for entry/exit and content switching.

## 7. Technical Considerations
- **Component Reuse:** Utilize `Lucide-React` icons already present in the project.
- **Modal Wrapper:** If a base `Modal` or `Overlay` component exists, it should be used to ensure consistency in padding and shadows.

## 8. Success Metrics
- **Discoverability:** Users can find and open the modal within 2 seconds of landing on the dashboard.
- **Clarity:** Users understand what future tools will be available based on the empty states.

## 9. Open Questions
- Should the "Open Library" action be the ONLY way to access this, or should individual tool buttons (Concordance, etc.) also open the modal to that specific tab? (Current scope: "Open Library" is the primary trigger).
