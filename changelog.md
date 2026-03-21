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

---
*Next up: Verification of the Tasks feature, followed by migration of the Notes feature.*
