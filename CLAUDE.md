# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MEMORY DISCIPLINE (ENFORCED EVERY SESSION)
- Before any response: load latest memory.
- After every command execution or session end: 
  • Record exact command + full output summary
  • Key decisions / lessons
  • Date-stamped entry
- Never skip this step.

# PROJECT-LEVEL MEMORY DIRECTIVE (HIGHEST PRIORITY)
- You have a dedicated project memory directory at .claude/memory/
- This directory is git-tracked and shared with the team.
- At the END of every single session AND after every command I execute:
  1. Summarize: commands run, output, decisions, errors, learnings.
  2. Append or update the relevant file in .claude/memory/ (use daily-YYYY-MM-DD.md for sessions, or topic files).
  3. Update .claude/memory/MEMORY.md as the index.
- Never write memory outside this directory.
- Before starting any task, read the latest .claude/memory/MEMORY.md and any relevant topic files.
- Treat this as your permanent long-term memory for this project.

## Common Commands
- **Run Development Server**: `npm run dev` - Starts the Vite development server for the frontend.
- **Run Backend Server**: `npm run dev:server` - Starts the backend server using nodemon. **Note**: The `server/index.js` file does not currently exist, so this command will fail until the backend is implemented.
- **Build**: `npm run build` - Compiles the TypeScript code and builds the frontend for production.
- **Lint**: `npm run lint` - Lints the codebase using ESLint.
- **Run Tests**: `npm run test` - Runs the test suite using Mocha. **Note**: No tests are currently implemented, so this command will not find any tests to run.

## High-Level Architecture
This is a full-stack application with a React frontend and a Node.js/Express backend, although the backend is not yet implemented.

### Frontend
The frontend is a single-page application built with React, Vite, and TypeScript.

- **Project Layout**:
  - `src/`: Contains all the frontend source code.
  - `src/pages/`: Top-level components for each page/route (e.g., `Dashboard.tsx`, `Login.tsx`).
  - `src/components/`: Reusable components, organized by feature (e.g., `notes`, `tasks`) and type (`ui`, `structure`, `widgets`).
  - `src/hooks/`: Custom React hooks for managing state and business logic (e.g., `useAuth`, `useTasks`).
  - `src/services/`: Modules for interacting with external services like Supabase and AI APIs.
  - `src/config/`: Configuration files, such as API endpoints.
- **Core Components & Libraries**:
  - **Routing**: Handled by `react-router-dom`.
  - **State Management**: Primarily uses custom hooks (`src/hooks/`) and `zustand` for global state.
  - **Styling**: Tailwind CSS with Radix UI for accessible components and `tailwindcss-animate` for animations. `clsx` and `tailwind-merge` are used for conditional classes.
  - **UI/UX**: `framer-motion` for animations, `sonner` for notifications, and `react-quill` for a rich text editor.
- **Key Dependencies**:
  - `react`, `react-dom`, `react-router-dom`
  - `vite`, `typescript`
  - `tailwindcss`, `@radix-ui/react-*`
  - `zustand`
  - `@supabase/supabase-js`
  - `@google/generative-ai`

### Backend

## RECENT UPDATES
- **COMPONENT TESTING INITIATIVE**: Added testing libraries (`chai`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@types/chai`) to `devDependencies` and configured Mocha to run with a JSDOM setup file (`test/setup.js`). Created `test/components.test.tsx` with **full interaction** coverage for the `Card` component (render, props, and user interaction tests). Updated the `npm test` script to execute the new test suite. Documented this progress in the project plan and memory state files.

### Backend
The backend is intended to be a Node.js application using Express and Mongoose for MongoDB interaction. However, the `server/index.js` file and any other backend-related files have not been created yet. The scripts in `package.json` (`server` and `dev:server`) are placeholders for future development.
