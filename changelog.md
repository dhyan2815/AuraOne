# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html), and the format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] - 2026-03-22

This version marks the complete migration of the AuraOne backend from Firebase to Supabase, along with a comprehensive refactor of the entire data layer and numerous bug fixes that arose during the transition.

### Major Changes

-   **Backend Migration (Firebase to Supabase)**: The entire backend infrastructure, including authentication, database (Firestore to PostgreSQL), and real-time services, has been migrated to Supabase. This involved a full rewrite of all data-access hooks and services to use the `supabase-js` client.

### Added

-   **Supabase Integration**: Introduced the Supabase client service (`src/services/supabase.ts`) as the new central point for all backend interactions.
-   **Database Migrations**: Created and applied SQL schemas for all core features, including `tasks`, `notes`, `events`, and the newly refactored `chat` functionality, all with Row Level Security (RLS) policies for data protection.
-   **New Rich Text Editor**: Implemented a modern rich text editor using `Tiptap` to replace the deprecated `ReactQuill` component.

### Changed

-   **Authentication Flow**: Completely refactored the authentication system (`useAuth` hook, Login, SignUp, Forgot/Reset Password pages) to use Supabase Auth.
-   **Data Hooks**: Rewrote all data-handling hooks (`useTasks`, `useNotes`, `useEvents`) to perform CRUD operations against the Supabase API.
-   **Chat System**: Overhauled the entire real-time chat feature, including session management and message handling, to run on the new Supabase backend. (Closes #64)
-   **Component Refactoring**: Updated every component that touched Firebase data to align with the new Supabase data structures and services. This includes the Dashboard, Settings, Calendar, and all feature-specific pages.
-   **Rich Text Editor**: Replaced `react-quill` with `Tiptap` in the `NotePage` to resolve deprecation warnings and improve compatibility with React 18. (Closes #59)

### Fixed

-   **Legacy Imports**: Scanned the entire codebase and removed all remaining legacy Firebase service imports, which were causing multiple server and client-side errors. (Closes #58, #60, #61, #62, #63)
-   **Event Creation**: Corrected a critical runtime error caused by the use of an incorrect function name (`addEvent` instead of `createEvent`) in the events module. (Closes #57)
-   **UI Crash**: Resolved a "white screen" crash on the Dashboard by adding a missing `useEffect` import that was removed during a refactor. (Closes #65)

### Removed

-   **Firebase Dependency**: Completely uninstalled the `firebase` package from the project.
-   **Firebase Service**: Deleted the legacy `src/services/firebase.ts` file.

---
