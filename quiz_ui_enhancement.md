# Stitch Prompt: Enhance Verbum Quiz UI

## 1. High-Level Goal

The primary goal is to redesign the quiz modal to be visually consistent with the main "Verbum" application's dark, futuristic, and "hacker-console" aesthetic. The quiz should feel like a seamless and integrated part of the user experience, not a standard pop-up.

## 2. Core Aesthetic to Emulate

Reference the styling of the main book selection screen (`book-select.tsx`):
- **Theme:** Dark, sci-fi, "terminal" look.
- **Colors:** Deep `zinc` backgrounds (`bg-zinc-950`), with `rose-500` as the primary accent color.
- **Typography:** A mix of `font-sans` for readability and `font-mono` for labels and secondary details.
- **UI Style:** Card-based elements with subtle borders (`border-zinc-800`), backdrop blur effects (`backdrop-blur-sm`), and hover states that highlight with the `rose` accent color.
- **Iconography:** Consistent use of `lucide-react` icons, often with a single accent color.

## 3. Screen-by-Screen Enhancement: The Quiz Modal

### 3.1. Modal Container

- **Current:** A simple `bg-zinc-900` box with a `border-zinc-800`.
- **Desired:**
    - Apply a `backdrop-blur-sm` effect to the modal's background for a layered feel.
    - Change the background to `bg-zinc-900/80` to allow the blur to show through.
    - The border should remain `border-zinc-800`.

### 3.2. Initial State ("Chapter Complete!")

- **Current:** Standard-looking `h2` and paragraph, with two solid-looking buttons.
- **Desired:**
    - Change the title "Chapter Complete!" to `font-mono`, uppercase, with letter spacing, similar to `SectionHeader`.
    - Restyle the "Take Quiz" button to be the primary call-to-action. It should have a `rose-500` accent, but follow the style of the main app's buttons (more subtle than a solid background color).
    - The "No Thanks" button should be a secondary, "ghost" style button, with a simple border or just text.

### 3.3. Quiz State (Question & Options)

- **Current:** A list of buttons for options. The selected state is `bg-rose-500/10`.
- **Desired:**
    - The question text should be the main focus, in `font-sans` and a brighter `zinc-100`.
    - The answer options should be styled like the `BookCard` components from the main page. They should be rectangular, with a `bg-zinc-800/50`, and a `border-zinc-800`.
    - **On hover**, the border should change to `border-rose-500/50` and the background to `bg-rose-500/10`.
    - **On select**, the border should become a solid `border-rose-500`. The text inside should also become a brighter `zinc-100` or `rose-100`.

### 3.4. Results State ("Quiz Complete!")

- **Current:** A large `CheckCircle` icon in `green-500` or `rose-500`, and simple text.
- **Desired:**
    - Replace the large icon with a more subtle, on-theme graphic. Perhaps a stylized progress bar or a `lucide-react` icon styled consistently with the rest of the app.
    - The score display should be the central element. Use `font-mono` for the numbers and surround it with graphical elements that fit the "console" theme. For example: `[SCORE: 08/10]`.
    - Avoid using "happy" colors like bright green. Stick to the `rose` and `zinc` color palette. A perfect score could be a bright `rose-400`, while an imperfect score could be a dimmer `zinc-400`.

## 4. Pro-Tips to Apply

- **Iterate:** Make these changes one step at a time if necessary, starting with the modal container and buttons.
- **Be Specific:** The prompt provides specific color and style references from the existing application.
- **Use UI Keywords:** The prompt uses terms like "modal container", "call-to-action", "ghost button", and "hover states".
