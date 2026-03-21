# Master Plan: AuraOne v2 Supabase Migration & Revival

**Objective**: Revive the AuraOne project by migrating the backend from Firebase to Supabase, restoring all original features, and laying a solid foundation for future V2 enhancements.

## Phase 1: Supabase Project Setup & Configuration

**Goal**: Get the application running with a new Supabase backend.

1.  **Create a Supabase Project**:
    *   The user will create a new project in the [Supabase Dashboard](https://app.supabase.io/) (manually done by the user).
2.  **Get API Credentials**:
    *   From the project's settings, find the **Project URL** and the `anon` **public API key** (Got it and added into the existing `.env` file).
3.  **Configure Environment Variables**:
    *   Create a `.env` file in the project root (There exist already `.env` file in the project root, also the supabase credentials are added into that `.env` file).
    *   Add the credentials from the previous step as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4.  **Install Supabase Client**:
    *   Run `npm install @supabase/supabase-js`, (manually done by the user).
5.  **Create Supabase Client Service**:
    *   Create a new file `src/services/supabase.ts` to initialize and export the Supabase client. This will replace the existing `firebase.ts`.
6.  **Verification**: The application will still be broken, but this phase is complete when the environment variables are set up and the Supabase client is installed and initialized.

## Phase 2: Authentication Migration

**Goal**: Replace Firebase Auth with Supabase Auth.

1.  **Refactor `useAuth.ts`**:
    *   Rewrite the `useAuth` hook to use the Supabase client.
    *   Replace `onAuthStateChanged` with `supabase.auth.onAuthStateChange`.
    *   Implement `login`, `signup`, and `logout` functions using `supabase.auth.signInWithPassword`, `supabase.auth.signUp`, and `supabase.auth.signOut`.
2.  **Update UI Components**:
    *   Update `Login.tsx`, `SignUp.tsx`, and any other auth-related components to use the new functions from the refactored `useAuth.ts`.
3.  **Verification**: Run `npm run dev` and successfully sign up for a new account and log in. A new user should appear in the `auth.users` table in the Supabase dashboard.

## Phase 3: Database & Feature Migration

**Goal**: Re-implement core features (Tasks, Notes, Events) using the Supabase database. This will be done feature by feature.

**Sprint 1: Migrating Tasks**

1.  **Create `tasks` Table in Supabase**:
    *   Using the Supabase SQL Editor, create a `tasks` table. The schema will be based on the `Task` interface in `useTasks.ts`, but in SQL format.
    *   **Schema**: `id` (uuid, primary key), `user_id` (uuid, foreign key to `auth.users`), `title` (text), `description` (text), `due_date` (timestamp), `priority` (text), `completed` (boolean), `created_at` (timestamp).
    *   **Enable Row Level Security (RLS)**: Create policies to ensure users can only access their own tasks.
2.  **Refactor `useTasks.ts`**:
    *   Remove all Firestore-related code.
    *   Use the Supabase client to implement CRUD functions:
        *   `getTasks`: `supabase.from('tasks').select('*')`
        *   `addTask`: `supabase.from('tasks').insert({...})`
        *   `updateTask`: `supabase.from('tasks').update({...}).eq('id', taskId)`
        *   `deleteTask`: `supabase.from('tasks').delete().eq('id', taskId)`
    *   **Real-time Updates**: Replace `onSnapshot` with `supabase.channel('...').on('postgres_changes', ...).subscribe()` to listen for changes to the `tasks` table.
3.  **Verification**: The Tasks page in the application should be fully functional, allowing for creation, reading, updating, and deleting of tasks, with real-time updates.

*(This sprint will be repeated for **Notes** and **Events**, each with its own table, RLS policies, and frontend hook refactoring.)*

## Phase 4: V2 Feature Planning & Implementation

**Goal**: Plan and build new features on the stable Supabase foundation.

1.  **User Prioritization**: We will collaboratively decide on the priority of new features.
2.  **Implementation Sprints**: Tackle one new feature at a time, building out the necessary database tables, RLS policies, and frontend components.

## Phase 5: Cleanup and Final Review

**Goal**: Remove dead code and ensure the application is clean and maintainable.

1.  **Remove Firebase**: Run `npm uninstall firebase`.
2.  **Delete Firebase-related files**: Remove `src/services/firebase.ts`.
3.  **Code Review**: Do a final pass over the codebase to ensure consistency and remove any remaining unused code.

---

This plan provides a clear roadmap for the migration. Once you've had a chance to review it, we can move forward.
