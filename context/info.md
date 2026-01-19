# Verbum Application Overview

**Verbum** is a modern, high-performance web application designed for focused reading and study of religious texts (specifically the Bible), utilizing a Rapid Serial Visual Presentation (RSVP) engine. It is built as a TypeScript monorepo using TurboRepo.

## Architecture

The project follows a modular monorepo structure:

- **Framework:** Next.js (React)
- **Build System:** TurboRepo
- **Language:** TypeScript
- **Styling:** Tailwind CSS with `shadcn/ui` components
- **State/Data:** tRPC (implied by `packages/api` and `utils/trpc.ts`)

### Directory Structure

- **`apps/web`**: The main frontend application.
    - Features a sophisticated **RSVP Player** (`components/player.tsx`) for speed reading.
    - Includes authentication views (`sign-in`, `sign-up`).
    - Uses a customized UI library based on `shadcn`.
- **`packages/`**: Shared internal libraries.
    - **`api`**: Backend logic and tRPC routers.
    - **`auth`**: Authentication logic (likely using `better-auth`).
    - **`config`**: Shared configuration (TypeScript, etc.).
    - **`env`**: Environment variable validation and management.

## Key Features

### 1. RSVP (Rapid Serial Visual Presentation) Reader
The core feature is a specialized reader located in `apps/web/src/components/player.tsx` (and its sub-components). It allows users to read text one word at a time at high speeds.

- **Speed Control:** Adjustable Words Per Minute (WPM) ranging from 100 to 1200.
- **Optical Engine:**
    - Calculates "Optimal Recognition Points" (ORP) for centering words.
    - Adjusts duration based on word length and punctuation (comma, period, quotes).
    - Includes a "warm-up" period to ramp up speed gradually.
- **Study Mode:**
    - Dynamically highlights specific categories of words:
        - **Divine Terms** (e.g., God, Jesus, Spirit) in Amber/Gold.
        - **Negative Terms** (e.g., Sin, Death, Evil) in Red.
        - **Connectors** (e.g., Therefore, However) in Blue.
    - Displays surrounding context verses when paused.
- **Navigation:**
    - Seek bar for chapter progress.
    - Chapter selector.
    - Keyboard shortcuts (Space to Play/Pause, Arrows to Seek/Speed, 'S' for Study Mode).

### 2. User Interface
- **Dark/Light Mode:** Integrated theme toggling.
- **Responsive Design:** Optimized for both desktop and mobile reading experiences.
- **Minimalist Aesthetic:** Uses "grainy gradients" and backdrop blurs for a focused reading environment.

## Data Sources
- The application currently fetches book data (e.g., Berean Study Bible - BSB) from a remote JSON storage endpoint (`vercel-storage`).

## Tech Stack Summary
- **Frontend:** Next.js 15 (App Router), React 19, Lucide React
- **Backend:** tRPC, Node.js
- **Package Manager:** Bun (indicated by `bun.lock`)
- **Utilities:** `clsx`, `tailwind-merge`, `zod`
