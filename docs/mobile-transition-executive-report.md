# Aura One Mobile Transformation Executive Report

**Prepared for:** Aura One Stakeholders  
**Report purpose:** Define the strategic, technical, product, and UI/UX approach for transforming Aura One from a web application into a production-ready mobile application while preserving the existing user experience, backend behavior, core logic, themes, transitions, animations, and product value.  
**Recommended delivery model:** Separate mobile codebase with shared contracts, shared backend, and platform-native mobile UI implementation.  
**Recommended mobile platform:** Expo React Native with TypeScript.

---

## 1. Executive Summary

Aura One should be transformed into a dedicated mobile application rather than wrapped or copied directly from the web application. The current web app should remain stable while a parallel mobile codebase is created. The mobile application should preserve the same core product functionality, design language, user journeys, authentication model, database records, AI behavior, RAG workflows, themes, and business logic, but it should implement the interface and interactions using mobile-native patterns.

The recommended approach is to create a separate Expo React Native application that connects to the same Supabase backend and shares core TypeScript contracts with the existing web app. This architecture allows Aura One to scale across web, iOS, and Android without compromising either platform.

The transition should be handled as a structured product initiative with clear phases:

1. Audit the current web product and define shared contracts.
2. Create a mobile application shell with authentication, navigation, and theming.
3. Port each module individually, beginning with notes and tasks.
4. Implement chat, AI, and knowledge base functionality through secure backend-backed services.
5. Add production mobile capabilities such as offline cache, push notifications, deep links, analytics, and release automation.
6. Maintain ongoing web/mobile parity through shared types, schema validation, design tokens, and contract tests.

---

## 2. Strategic Objective

The primary objective is to deliver Aura One as a fully functional mobile application available to users on their personal devices while preserving the web product's core experience and logic.

The mobile app must:

- Preserve existing feature behavior.
- Preserve the Aura One visual identity.
- Preserve the backend and database model.
- Preserve user authentication and user-specific data access.
- Preserve AI chat, agentic processing, Brain Mode behavior, and knowledge retrieval.
- Preserve core interaction quality, including premium transitions and dark/light theme behavior.
- Improve the experience where mobile-specific patterns are more appropriate.
- Avoid introducing a duplicate backend or a fragmented product model.

The mobile application should not be treated as a smaller or reduced version of the web app. It should be a first-class Aura One client.

---

## 3. Current Product Understanding

Aura One is currently structured as a TypeScript React web application. Its architecture includes:

- Vite-based frontend runtime.
- React route-based pages.
- Supabase backend integration.
- Authentication flows.
- Notes and task CRUD logic.
- Realtime database subscriptions.
- Calendar/event functionality.
- Chat and AI orchestration services.
- Knowledge base and RAG ingestion/retrieval logic.
- Theme styling through global CSS variables and Tailwind utilities.
- UI transitions and animations through web-focused libraries.

The current product should be treated as the source of truth for feature behavior, but not as the literal source of all mobile UI code.

---

## 4. Recommended Architecture

### 4.1 High-Level Architecture

```text
Aura One Platform
|
|-- Web App
|   |-- Vite
|   |-- React
|   |-- Tailwind CSS
|   |-- React Router
|
|-- Mobile App
|   |-- Expo React Native
|   |-- TypeScript
|   |-- Native Navigation
|   |-- Native Theme System
|   |-- Mobile Secure Storage
|
|-- Shared Package
|   |-- Types
|   |-- Schemas
|   |-- API Contracts
|   |-- Theme Tokens
|   |-- AI Command Contracts
|   |-- Validation Rules
|
|-- Backend
|   |-- Supabase Auth
|   |-- Supabase Database
|   |-- Supabase Realtime
|   |-- Supabase Storage
|   |-- Supabase Edge Functions
|   |-- Row-Level Security Policies
|
|-- AI Layer
    |-- Agent Orchestration
    |-- RAG Ingestion
    |-- RAG Retrieval
    |-- Model Gateway
    |-- Tool Execution Boundary
```

### 4.2 Recommended Repository Model

The recommended structure is a monorepo, because it makes shared logic easier to version and test.

```text
aura-one/
|
|-- apps/
|   |-- web/
|   |   |-- src/
|   |   |-- package.json
|   |
|   |-- mobile/
|       |-- app/
|       |-- src/
|       |-- package.json
|
|-- packages/
|   |-- shared/
|   |   |-- src/
|   |   |   |-- types/
|   |   |   |-- schemas/
|   |   |   |-- contracts/
|   |   |   |-- theme/
|   |   |   |-- constants/
|   |   |   |-- utils/
|   |
|   |-- api-client/
|   |   |-- src/
|   |
|   |-- design-system/
|       |-- src/
|
|-- supabase/
|   |-- migrations/
|   |-- functions/
|   |-- policies/
|
|-- docs/
|   |-- mobile-transition-executive-report.md
```

If a monorepo is not desired immediately, the mobile app can begin in a separate repository and later adopt a shared package strategy. However, the monorepo approach is better for long-term production maintenance.

---

## 5. What Should Take Place

The following changes should take place to support a successful mobile transition.

### 5.1 Create a Dedicated Mobile Codebase

A new mobile codebase should be created using Expo React Native and TypeScript. It should not replace the current web app. Instead, it should exist alongside it and consume the same backend.

Required outcomes:

- New mobile app project.
- Mobile navigation architecture.
- Mobile authentication flow.
- Shared Supabase connection strategy.
- Shared business contracts.
- Mobile-specific UI components.
- Mobile-specific animation layer.
- Mobile-specific storage and offline strategy.

### 5.2 Extract Shared Contracts

Shared contracts should be created for all core data and business logic concepts.

Shared contracts should include:

- User profile model.
- Note model.
- Task model.
- Calendar event model.
- Chat session model.
- Chat message model.
- Knowledge document model.
- RAG chunk model.
- AI command schema.
- Tool execution schema.
- Theme tokens.
- Error and loading state definitions.

### 5.3 Preserve Existing Backend Behavior

The Supabase backend should remain the central system of record. Mobile and web should use the same tables, authentication, policies, and realtime behavior.

The mobile app should not create duplicate records, duplicate tables, or mobile-only versions of existing entities unless a specific mobile platform feature requires it.

### 5.4 Replace Web UI With Native Mobile UI

Mobile screens should be purpose-built for phones and tablets. Web components should not be copied directly if they depend on browser APIs, CSS, Radix UI behavior, or DOM-based interactions.

Instead, the mobile app should recreate the experience using:

- Native screens.
- Native gestures.
- Native safe areas.
- Native scroll behavior.
- Native keyboard avoidance.
- Native theme management.
- Native animation libraries.

### 5.5 Harden AI and Backend Security

Any privileged AI orchestration, model keys, service-role Supabase operations, or sensitive tools should be moved behind server-side APIs or Supabase Edge Functions. The mobile client should call a secure gateway, not directly expose secrets.

---

## 6. How It Should Take Place

### 6.1 Phase 1: Discovery and Parity Mapping

The first phase should define exactly what Aura One does today and what the mobile app must preserve.

Deliverables:

- Current feature inventory.
- User journey map.
- Database entity map.
- API/service map.
- Theme token inventory.
- Animation inventory.
- Component inventory.
- Mobile feature parity matrix.
- Risk register.

### 6.2 Phase 2: Shared Foundation

The second phase should create the shared foundation that prevents future divergence between web and mobile.

Deliverables:

- Shared TypeScript types.
- Shared Zod schemas.
- Shared theme tokens.
- Shared constants.
- Shared data contracts.
- Shared error models.
- Shared test fixtures.

### 6.3 Phase 3: Mobile App Shell

The third phase should create the first runnable mobile app.

Deliverables:

- Expo app initialized.
- TypeScript configured.
- Supabase client configured.
- Secure auth persistence configured.
- Splash screen implemented.
- Auth navigator implemented.
- App tab navigator implemented.
- Light/dark theme implemented.
- Settings/logout implemented.

### 6.4 Phase 4: Feature Migration

Feature migration should happen module-by-module, not all at once.

Recommended order:

1. Authentication.
2. Dashboard.
3. Notes.
4. Tasks.
5. Calendar.
6. Chat.
7. Knowledge Base.
8. Settings.
9. Realtime updates.
10. Offline support.
11. Push notifications.
12. Production release workflows.

### 6.5 Phase 5: Quality Assurance

Testing should verify that the mobile application matches web behavior and satisfies mobile production standards.

Required test areas:

- Unit tests for shared logic.
- Integration tests for Supabase operations.
- Contract tests for database models.
- Mobile UI tests for critical flows.
- Authentication flow tests.
- Offline/online sync tests.
- Realtime subscription tests.
- AI chat tests.
- Knowledge retrieval tests.
- Performance tests.
- Accessibility checks.

### 6.6 Phase 6: Production Deployment

Production deployment should use automated build and release tooling.

Recommended deployment model:

- EAS Build for iOS and Android builds.
- TestFlight for iOS beta distribution.
- Google Play Internal Testing for Android beta distribution.
- Staged rollout for production.
- Crash reporting and analytics before public release.
- Versioned release notes.
- Feature flags for high-risk functionality.

---

## 7. Where It Should Take Place

### 7.1 Frontend Changes

Frontend changes should take place in the new mobile application codebase.

Areas impacted:

- Navigation.
- Screen layout.
- Components.
- Forms.
- Theme usage.
- Animation implementation.
- Editor implementation.
- Chat interface.
- Calendar interface.
- Knowledge base interface.
- Loading, error, and empty states.

### 7.2 Backend Changes

Backend changes should take place in Supabase and any server-side function layer.

Areas impacted:

- Database migrations.
- Row-level security policies.
- Realtime permissions.
- Storage permissions.
- Edge Functions.
- AI request gateway.
- Push notification token storage.
- Audit logging.

### 7.3 Shared Logic Changes

Shared logic should take place in dedicated shared packages.

Areas impacted:

- Types.
- Schemas.
- Contracts.
- Constants.
- Theme tokens.
- AI command validation.
- Utility functions.

### 7.4 Documentation Changes

Documentation should take place in the repository documentation folder.

Recommended documents:

- Mobile transition report.
- Mobile architecture guide.
- Feature parity matrix.
- API contract guide.
- Supabase schema guide.
- UI/UX mobile design guide.
- Release process guide.

---

## 8. Text Tag Structure and Information Architecture

The mobile application should use a consistent text tag and content structure for clarity, accessibility, analytics, and future localization.

### 8.1 Screen Tag Structure

Each screen should have a stable screen identifier.

```text
screen.dashboard
screen.notes.list
screen.notes.detail
screen.tasks.list
screen.tasks.detail
screen.calendar
screen.chat.sessions
screen.chat.thread
screen.knowledge.list
screen.knowledge.detail
screen.settings
screen.auth.login
screen.auth.signup
screen.auth.forgot_password
screen.auth.reset_password
```

### 8.2 Component Tag Structure

Each reusable component should have a stable component identifier.

```text
component.card.note
component.card.task
component.card.event
component.button.primary
component.button.secondary
component.input.text
component.input.search
component.modal.confirmation
component.toast.success
component.toast.error
component.empty_state
component.loader
component.avatar
component.sidebar.mobile_drawer
component.bottom_tab
```

### 8.3 Action Tag Structure

Every important user action should have a consistent action identifier.

```text
action.auth.login
action.auth.signup
action.auth.logout
action.note.create
action.note.update
action.note.delete
action.task.create
action.task.update
action.task.complete
action.task.delete
action.event.create
action.event.update
action.event.delete
action.chat.message_send
action.chat.brain_mode_enable
action.chat.brain_mode_disable
action.knowledge.upload
action.knowledge.delete
action.settings.theme_change
```

### 8.4 State Tag Structure

UI states should be tracked consistently.

```text
state.loading
state.empty
state.error
state.success
state.offline
state.syncing
state.synced
state.unauthenticated
state.authenticated
state.permission_denied
```

### 8.5 Content Text Structure

User-facing copy should be externalized into a content dictionary.

Example:

```ts
export const copy = {
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to continue your Aura One workspace.",
    signupTitle: "Create your Aura One account",
    forgotPasswordTitle: "Reset your password",
  },
  notes: {
    emptyTitle: "No notes yet",
    emptyDescription: "Capture your thoughts, ideas, and insights in one place.",
    createAction: "New note",
  },
  tasks: {
    emptyTitle: "No tasks yet",
    emptyDescription: "Create your first task and stay focused.",
    createAction: "New task",
  },
  chat: {
    inputPlaceholder: "Ask Aura anything...",
    brainModeLabel: "Brain Mode",
  },
};
```

Benefits:

- Easier localization.
- More consistent UI copy.
- Cleaner testing.
- Improved analytics mapping.
- Easier client review.

---

## 9. Copying Strategy

The transition should distinguish between what can be copied, what should be adapted, and what must be rebuilt.

### 9.1 Copy Directly

The following can largely be copied or extracted into shared packages:

- Type definitions.
- Database model interfaces.
- Zod schemas.
- AI command schemas.
- Utility functions.
- Constants.
- Theme values.
- Data transformation logic.
- Error classification rules.

### 9.2 Adapt Carefully

The following should be adapted for mobile:

- Supabase client initialization.
- Authentication persistence.
- Realtime subscriptions.
- CRUD service functions.
- Chat message lifecycle.
- RAG ingestion triggers.
- Date/time handling.
- Form validation.
- Theme selection.

### 9.3 Rebuild for Mobile

The following should be rebuilt specifically for mobile:

- Navigation.
- Layout components.
- Buttons and inputs.
- Modals and sheets.
- Sidebars and menus.
- Rich text editor experience.
- Scroll containers.
- Keyboard-aware screens.
- Animations.
- Gesture interactions.
- File/document pickers.
- Push notification flows.

### 9.4 Do Not Copy Blindly

The following should not be copied directly into mobile:

- DOM-dependent components.
- Browser-only APIs.
- Web CSS classes without conversion.
- Radix UI components.
- React Router configuration.
- Browser scrollbar styling.
- Framer Motion code.
- Web-only editor assumptions.

---

## 10. Database Logic Model

### 10.1 Principle

The database should remain platform-neutral. Web and mobile should read and write the same records in the same format.

### 10.2 Core Entities

Recommended core entities:

```text
users
profiles
notes
tasks
events
chat_sessions
chat_messages
knowledge_documents
rag_chunks
rag_embeddings
user_settings
notification_tokens
sync_queue
```

### 10.3 Notes Model

```text
notes
|-- id
|-- user_id
|-- title
|-- content
|-- tags
|-- is_archived
|-- created_at
|-- updated_at
|-- deleted_at
```

Mobile behavior:

- Fetch notes by authenticated user.
- Create notes with optimistic UI.
- Update notes locally, then sync.
- Delete or soft-delete notes.
- Trigger RAG ingestion after create/update.
- Trigger RAG cleanup after delete.

### 10.4 Tasks Model

```text
tasks
|-- id
|-- user_id
|-- title
|-- description
|-- due_date
|-- priority
|-- completed
|-- created_at
|-- updated_at
|-- deleted_at
```

Mobile behavior:

- List tasks by date, priority, and completion state.
- Support quick completion from list cards.
- Support push reminders in later production phases.
- Trigger RAG ingestion after meaningful task changes.

### 10.5 Calendar Events Model

```text
events
|-- id
|-- user_id
|-- title
|-- description
|-- starts_at
|-- ends_at
|-- location
|-- recurrence_rule
|-- reminder_at
|-- created_at
|-- updated_at
```

Mobile behavior:

- Show upcoming events.
- Support agenda and calendar views.
- Integrate reminders.
- Optionally integrate with native device calendars in a later phase.

### 10.6 Chat Model

```text
chat_sessions
|-- id
|-- user_id
|-- name
|-- created_at
|-- updated_at

chat_messages
|-- id
|-- session_id
|-- user_id
|-- role
|-- content
|-- metadata
|-- created_at
```

Mobile behavior:

- Persist user messages immediately.
- Generate session names from first user message.
- Call the agent orchestration layer.
- Persist AI responses with metadata.
- Display sources and tools used when available.
- Provide clear fallback messages on failure.

### 10.7 Knowledge and RAG Model

```text
knowledge_documents
|-- id
|-- user_id
|-- title
|-- source_type
|-- source_uri
|-- status
|-- created_at
|-- updated_at

rag_chunks
|-- id
|-- document_id
|-- user_id
|-- content
|-- metadata
|-- created_at

rag_embeddings
|-- id
|-- chunk_id
|-- user_id
|-- embedding
|-- model
|-- created_at
```

Mobile behavior:

- Upload/import knowledge sources.
- Show ingestion state.
- Search or query knowledge through the AI layer.
- Display retrieved sources in chat responses.

---

## 11. Backend Logic Model

### 11.1 Supabase Auth

Supabase Auth should remain the authentication provider.

Requirements:

- Email/password sign-in.
- Signup.
- Password reset.
- Session refresh.
- Secure mobile session storage.
- Deep-link password reset handling.

### 11.2 Row-Level Security

All user-owned tables must enforce row-level security.

Rules:

- Users can only read their own records.
- Users can only create records under their own user ID.
- Users can only update their own records.
- Users can only delete their own records.
- Service role operations must only run server-side.

### 11.3 Edge Functions and API Gateway

The backend should expose secure endpoints for operations that should not run directly on the client.

Recommended functions:

```text
functions/chat-agent
functions/rag-ingest
functions/rag-remove
functions/rag-search
functions/notification-register
functions/notification-send
functions/sync-resolver
```

### 11.4 AI Model Gateway

The AI model gateway should centralize:

- Model provider keys.
- Model fallback logic.
- Rate limiting.
- Prompt protection.
- Tool execution permission checks.
- RAG retrieval.
- Structured command validation.
- Error normalization.

The mobile client should send only the authenticated user's request and necessary context. It should not contain privileged model keys or service role keys.

---

## 12. Frontend Logic Model

### 12.1 Mobile State Layers

Recommended mobile state architecture:

```text
Server State
|-- Supabase data
|-- TanStack Query cache
|-- Realtime updates

Local App State
|-- Zustand stores
|-- UI preferences
|-- theme mode
|-- selected chat session
|-- transient UI state

Secure State
|-- Supabase session
|-- refresh token
|-- secure auth material

Offline State
|-- cached notes
|-- cached tasks
|-- cached events
|-- pending sync mutations
```

### 12.2 Screen Logic Pattern

Each screen should follow this pattern:

```text
Screen
|-- Load authenticated user
|-- Load required server data
|-- Subscribe to realtime changes when active
|-- Render loading state
|-- Render empty state
|-- Render content state
|-- Render error state
|-- Handle create/update/delete actions
|-- Optimistically update cache
|-- Sync with Supabase
```

### 12.3 Service Logic Pattern

Each domain should have a service layer.

```text
services/
|-- authService.ts
|-- notesService.ts
|-- tasksService.ts
|-- eventsService.ts
|-- chatService.ts
|-- knowledgeService.ts
|-- ragService.ts
|-- notificationService.ts
```

Services should not render UI. They should only perform data access, orchestration calls, validation, and transformations.

### 12.4 Hook Logic Pattern

Hooks should connect service logic to screens.

```text
hooks/
|-- useAuth.ts
|-- useNotes.ts
|-- useTasks.ts
|-- useEvents.ts
|-- useChatSessions.ts
|-- useChatMessages.ts
|-- useKnowledge.ts
|-- useTheme.ts
|-- useOfflineSync.ts
```

Hooks should be responsible for:

- Loading state.
- Error state.
- Cache updates.
- Realtime subscriptions.
- User-triggered actions.

---

## 13. UI/UX Requirements

### 13.1 Design Principles

The mobile app should feel:

- Calm.
- Intelligent.
- Premium.
- Fast.
- Focused.
- Trustworthy.
- Minimal but powerful.
- Consistent with the current Aura One brand.

### 13.2 Layout Principles

Mobile layouts should use:

- Safe area padding.
- Thumb-friendly actions.
- Bottom navigation for primary destinations.
- Stack navigation for detail pages.
- Bottom sheets for contextual actions.
- Floating action buttons where appropriate.
- Clear empty states.
- Skeleton loaders for content loading.
- Pull-to-refresh where useful.

### 13.3 Navigation Model

Recommended navigation:

```text
RootNavigator
|
|-- AuthStack
|   |-- Landing
|   |-- Login
|   |-- Signup
|   |-- ForgotPassword
|   |-- ResetPassword
|
|-- AppTabs
    |-- DashboardStack
    |-- NotesStack
    |-- TasksStack
    |-- CalendarStack
    |-- AssistantStack
    |-- SettingsStack
```

### 13.4 Dashboard UX

The dashboard should provide a focused summary of the user's day.

Recommended sections:

- Greeting and date.
- Quick actions.
- Today's tasks.
- Upcoming events.
- Recent notes.
- Assistant prompt entry.
- Optional weather/news widgets if retained from web.

### 13.5 Notes UX

Notes should be optimized for quick capture.

Requirements:

- Fast note creation.
- Search.
- Tag filtering.
- Recent notes.
- Archive support.
- Editor optimized for mobile keyboards.
- Auto-save behavior where appropriate.
- Clear sync state.

### 13.6 Tasks UX

Tasks should be optimized for rapid completion and prioritization.

Requirements:

- Create task quickly.
- Mark complete from list.
- Filter by priority.
- Filter by due date.
- Show overdue tasks.
- Support reminders in a later phase.

### 13.7 Calendar UX

Calendar should support both overview and agenda-based planning.

Requirements:

- Agenda view.
- Day view.
- Upcoming events.
- Event create/edit flow.
- Reminder display.
- Optional native calendar integration later.

### 13.8 Chat UX

Chat is a strategic feature and should receive high attention.

Requirements:

- Fast message input.
- Brain Mode toggle.
- Message streaming if supported.
- Source cards for retrieved context.
- Tool-used indicators.
- Clear failure messages.
- Session history.
- New chat action.
- Keyboard-aware layout.
- Preserved draft text if the app backgrounds.

### 13.9 Knowledge Base UX

Knowledge Base should make the user's stored intelligence visible and manageable.

Requirements:

- List imported sources.
- Show ingestion status.
- Support file/document import.
- Support removal.
- Show source type.
- Connect visibly to chat answers.

### 13.10 Settings UX

Settings should include:

- Account information.
- Theme selection.
- Notification preferences.
- Data/privacy controls.
- Logout.
- App version.
- Support links.

---

## 14. Theme and Visual System

### 14.1 Theme Tokens

The theme should be converted from web CSS variables into shared TypeScript tokens.

```text
theme/
|-- colors.ts
|-- spacing.ts
|-- typography.ts
|-- radii.ts
|-- shadows.ts
|-- motion.ts
|-- index.ts
```

### 14.2 Color Tokens

Recommended token names:

```text
color.primary
color.secondary
color.tertiary
color.background
color.surface
color.surfaceElevated
color.text
color.textMuted
color.border
color.success
color.warning
color.danger
```

### 14.3 Typography Tokens

Recommended text styles:

```text
text.displayLarge
text.displayMedium
text.headingLarge
text.headingMedium
text.headingSmall
text.bodyLarge
text.bodyMedium
text.bodySmall
text.caption
text.button
```

### 14.4 Motion Tokens

Recommended motion tokens:

```text
motion.duration.fast
motion.duration.normal
motion.duration.slow
motion.easing.standard
motion.easing.enter
motion.easing.exit
motion.scale.press
motion.opacity.disabled
```

### 14.5 Component Style Rules

All components should use shared tokens rather than hard-coded values.

Benefits:

- Brand consistency.
- Easier redesigns.
- Better dark mode support.
- Better accessibility.
- More consistent client review.

---

## 15. Animation and Transition Strategy

### 15.1 Mobile Animation Principle

The goal is not to copy web animations line-for-line. The goal is to preserve the feeling of the Aura One experience using native mobile motion.

### 15.2 Recommended Libraries

- React Native Reanimated.
- Moti.
- React Native Gesture Handler.
- Native navigation transitions.

### 15.3 Required Motion Areas

- Screen transitions.
- Tab transitions.
- Card press feedback.
- Button press feedback.
- Modal and bottom sheet transitions.
- Chat message appearance.
- Loading skeletons.
- Theme transitions.
- Empty-state illustrations or subtle motion.

### 15.4 Motion Guidelines

- Use motion to clarify state changes.
- Keep animations fast and subtle.
- Avoid excessive movement.
- Respect reduced-motion accessibility settings.
- Avoid blocking user input during long animations.

---

## 16. Offline and Sync Strategy

Mobile production requires thoughtful offline behavior.

### 16.1 Offline Requirements

The app should support:

- Viewing cached notes.
- Viewing cached tasks.
- Viewing cached events.
- Drafting notes offline.
- Editing tasks offline.
- Preserving chat drafts offline.
- Syncing pending changes when network returns.

### 16.2 Sync Queue

A sync queue should track pending mutations.

```text
sync_queue
|-- id
|-- user_id
|-- entity_type
|-- entity_id
|-- operation
|-- payload
|-- status
|-- retry_count
|-- created_at
|-- updated_at
```

### 16.3 Conflict Resolution

Recommended conflict rules:

- Prefer latest update for simple fields.
- Preserve local drafts if remote data changed.
- Warn users for destructive conflicts.
- Track `updated_at` consistently.
- Consider soft deletes for recoverability.

---

## 17. Security and Privacy Requirements

### 17.1 Client Security

The mobile app must never include:

- Service-role Supabase keys.
- AI provider secret keys.
- Private prompts that expose system behavior.
- Backend-only configuration.

### 17.2 Secure Storage

Use secure storage for:

- Auth session material.
- Refresh tokens.
- Sensitive user preferences if needed.

### 17.3 Network Security

All backend requests should use HTTPS. Sensitive actions should be authenticated and validated server-side.

### 17.4 Privacy

The app should include:

- Privacy policy link.
- Data deletion or export plan.
- Clear explanation of AI and knowledge usage.
- Notification permission explanation.

---

## 18. Production Operations

### 18.1 Observability

Recommended production tooling:

- Crash reporting.
- Performance monitoring.
- Error logging.
- Analytics events.
- Supabase logs.
- AI usage monitoring.

### 18.2 Release Management

Recommended release process:

```text
Development Build
-> Internal QA
-> TestFlight / Play Internal Testing
-> Beta Group
-> Staged Production Rollout
-> Full Production Release
```

### 18.3 Feature Flags

Feature flags should be used for:

- Brain Mode.
- RAG upload.
- Push notifications.
- Offline sync.
- Experimental widgets.
- New editor experience.

### 18.4 Version Compatibility

Database and API changes should be backward-compatible because users may run older mobile versions.

Rules:

- Prefer additive schema changes.
- Avoid removing fields abruptly.
- Version API responses when needed.
- Keep old clients functional during staged rollout.

---

## 19. Feature Parity Matrix

| Area | Web Source Behavior | Mobile Requirement | Priority |
|---|---|---|---|
| Authentication | Login, signup, reset, session gate | Native auth stack with secure session storage | Critical |
| Dashboard | Main workspace overview | Mobile home tab with summary widgets | Critical |
| Notes | CRUD, realtime, RAG ingestion | Mobile notes list/detail/editor with sync | Critical |
| Tasks | CRUD, realtime, RAG ingestion | Mobile tasks list/detail with quick completion | Critical |
| Calendar | Event planning | Mobile agenda/calendar screens | High |
| Chat | Agentic request, message persistence, metadata | Native chat UI with Brain Mode and source display | Critical |
| Knowledge Base | RAG document management | Mobile source list/import/status | High |
| Theme | Light/dark tokens | Native token-based theme | Critical |
| Animations | Web transitions | Native Reanimated/Moti transitions | Medium |
| Offline | Limited by web assumptions | Cache and sync queue | High |
| Notifications | Not core web behavior | Mobile reminders and alerts | Medium |
| Analytics | Optional | Event tagging and funnel tracking | Medium |

---

## 20. Risks and Mitigation

### 20.1 Risk: Rich Text Editor Complexity

Mobile rich text editing can be difficult to make reliable.

Mitigation:

- Start with a lightweight editor.
- Consider Markdown for mobile.
- Use WebView-based editor only if formatting parity is mandatory.
- Keep the storage format consistent.

### 20.2 Risk: Web and Mobile Feature Drift

Two clients can diverge over time.

Mitigation:

- Shared contracts.
- Shared schemas.
- Feature parity matrix.
- Contract tests.
- Shared release checklist.

### 20.3 Risk: Exposed AI Secrets

Mobile apps can be inspected by attackers.

Mitigation:

- Move AI calls server-side.
- Use Edge Functions or a secure API gateway.
- Validate commands server-side.
- Rate-limit AI operations.

### 20.4 Risk: Offline Sync Conflicts

Users may edit data across devices.

Mitigation:

- Use updated timestamps.
- Use optimistic UI carefully.
- Track pending sync operations.
- Implement conflict resolution rules.

### 20.5 Risk: Performance Issues

Chat, knowledge, and long lists can become slow on mobile.

Mitigation:

- Use virtualized lists.
- Cache server state.
- Paginate chat and notes.
- Compress large metadata.
- Profile on real devices.

---

## 21. Recommended Implementation Timeline

### Stage 1: Architecture and Contracts

Estimated duration: 1-2 weeks.

Deliverables:

- Final architecture decision.
- Shared package plan.
- Feature parity matrix.
- Supabase security review.
- Theme token extraction.

### Stage 2: Mobile Foundation

Estimated duration: 2-3 weeks.

Deliverables:

- Expo app.
- Auth flow.
- App shell.
- Navigation.
- Theme.
- Settings/logout.

### Stage 3: Core Productivity Features

Estimated duration: 3-5 weeks.

Deliverables:

- Notes.
- Tasks.
- Calendar.
- Realtime sync.
- Initial offline cache.

### Stage 4: AI and Knowledge Features

Estimated duration: 3-5 weeks.

Deliverables:

- Chat sessions.
- Message handling.
- Brain Mode.
- RAG source display.
- Knowledge upload/import.
- Secure AI gateway.

### Stage 5: Production Readiness

Estimated duration: 2-4 weeks.

Deliverables:

- Push notifications.
- Crash reporting.
- Analytics.
- QA automation.
- App store assets.
- Beta release.
- Production rollout.

---

## 22. Acceptance Criteria

The mobile project should be considered successful when:

- Users can authenticate securely on mobile.
- Users can access the same data as the web app.
- Notes, tasks, events, chat, and knowledge behavior match web expectations.
- The UI feels native, polished, and aligned with Aura One branding.
- Dark and light themes are supported.
- Realtime updates work reliably.
- AI responses are secure and consistent.
- Sensitive secrets are not shipped in the mobile client.
- The app works under weak network conditions.
- Critical flows are tested.
- The app can be built and released through iOS and Android pipelines.

---

## 23. Final Recommendation

Aura One should move forward with a dedicated Expo React Native mobile application backed by the existing Supabase infrastructure and protected by a shared contract layer. This balances speed, quality, scalability, and maintainability.

The guiding principle should be:

> Reuse the product logic, data contracts, backend, visual identity, and user expectations. Rebuild the presentation and interaction layer for mobile.

This strategy avoids breaking the current web application, enables a production-grade mobile experience, and gives Aura One a maintainable foundation for future cross-platform growth.
