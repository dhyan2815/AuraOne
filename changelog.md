# AuraOne v2 - Development Changelog

This file tracks the major changes, migrations, and new features implemented during the revival of the AuraOne project.

## `2026-03-22` - Project Revival & Migration to Supabase

### Phase 1: Supabase Project Setup & Configuration
- **Decision**: Shifted project backend from the inaccessible Firebase instance to a new Supabase project for enhanced reliability and features.
- **Setup**: Created a new Supabase project.
- **Configuration**: Added Supabase `URL` and `ANON_KEY` to the `.env` file.
- **Integration**: Installed the `@supabase/supabase-js` client library and created the client service at `src/services/supabase.ts`.

### Phase 2: Authentication Migration
- **`useAuth` Hook**: Completely refactored `src/hooks/useAuth.ts` to replace all Firebase Authentication logic with Supabase Auth methods (`onAuthStateChange`, `signInWithPassword`, `signUp`, etc.).
- **UI Components**: Updated `src/pages/Login.tsx` and `src/pages/SignUp.tsx` to use the new Supabase-powered `useAuth` hook.
- **Bug Fix**: Resolved a TypeScript issue in `useAuth.ts` by adding explicit type definitions for function parameters.
- **Verification**: User successfully created an account and logged into the application using the new Supabase authentication system.

### Phase 3: Database & Feature Migration (Tasks)
- **Database**: Created the `tasks` table in the Supabase PostgreSQL database via a SQL script, including all necessary columns and Row Level Security (RLS) policies for user data protection.
- **`useTasks` Hook**: Refactored `src/hooks/useTasks.ts` to replace all Firestore logic with Supabase client calls for all CRUD (Create, Read, Update, Delete) operations.
- **Real-time**: Implemented real-time updates for tasks using Supabase Channels.
- **UI Components**:
    - Refactored `src/pages/Tasks.tsx` to align with the new data structure and functions from the Supabase-powered `useTasks` hook.
    - Refactored `src/components/tasks/TaskCard.tsx` to correctly display task data from the new schema and remove defunct features like "star" and "pin".
- **Verification**: User deferred verification until all migrations are complete.

### Phase 3: Database & Feature Migration (Notes)
- **Database**: Created the `notes` table in Supabase with appropriate columns and RLS policies.
- **`useNotes` Hook**: Refactored `src/hooks/useNotes.ts` from Firestore to Supabase, including CRUD operations and real-time listeners.
- **UI Components**:
    - Refactored `src/pages/Notes.tsx` to use the new hook and remove defunct filter options.
    - Refactored `src/components/notes/NoteCard.tsx` to match the new `Note` data schema.
    - Refactored `src/pages/NotePage.tsx` for creating and editing notes, including updating the auto-save logic.
- **Verification**: User deferred verification until all migrations are complete.

---
### Phase 4: Database & Feature Migration (Events)
- **Database**: Created the `events` table in Supabase with appropriate columns (`title`, `start_time`, `end_time`, etc.) and RLS policies.
- **`useEvents` Hook**: Refactored `src/hooks/useEvents.ts` to be a collection of exported functions using the Supabase client for all CRUD operations and real-time listeners.
- **UI Components**:
    - Refactored `src/pages/Calendar.tsx` to align with the new data structure from the Supabase-powered `useEvents` functions, including fetching, creating, and deleting events.
- **Verification**: User deferred verification until all migrations are complete.

---
## `2026-03-22` - Phase 5: Project Cleanup
- **Dependencies**: Uninstalled the `firebase` package as it is no longer required.
- **Code Cleanup**: Removed the unused `src/services/firebase.ts` file.
- **Completion**: The migration from Firebase to Supabase is now complete. All core features (Auth, Tasks, Notes, Events) are running on the new backend.

---
*Next up: V2 Feature Planning & Implementation.*

---
### Phase 6: Post-Migration Bug Squashing
- **Console Errors**: Addressed multiple critical errors that appeared in the browser console after the Supabase migration.
- **Event Creation Fix**: Refactored `CalendarWidget` and `aiService` to use the correct `createEvent` function instead of the non-existent `addEvent`, resolving multiple import errors and crashes. (Closes #57)
- **Dashboard 404 Fix**: Removed legacy Firebase authentication logic from the `Dashboard` component, which was causing a 404 error, and replaced it with the Supabase `useAuth` hook. (Closes #58)

