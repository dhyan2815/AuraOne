# AuraOne Project Memory

## Overview
AuraOne is a modern AI-productivity platform. This file serves as a persistent state for major architectural decisions, UI improvements, and core logic changes.

---

## Log

### March 23, 2026: UI/UX Redesign - Five Design Templates
- **Objective:** Upgrade AuraOne to a modern, techy, and premium UI.
- **Action:** Analyzed existing React/Vite/Tailwind structure.
- **Outcome:** Generated 5 distinct design templates in Stitch MCP under Project ID: `1233998317345071554`.
    1.  **Neon Cyberpunk Dark:** High-contrast dark mode with neon glows and glassmorphism.
    2.  **Aurora Glass:** Airy light mode with soft pastel gradients and frosted panels.
    3.  **Obsidian Pro:** Minimalist bento-grid in charcoal/slate (inspired by Linear).
    4.  **Cosmic Intelligence:** Deep space HUD with star textures and bioluminescent accents.
    5.  **Minted Clean:** Fresh teal-to-emerald dual-tone editorial layout with tonal depth.
- **Status:** **Completed.** The entire AuraOne UI has been refactored to align with the Aurora Glass design system.
    *   Core pages (Login, Signup, Dashboard, Tasks, Notes, Calendar, Settings, Chat) now feature high-fidelity glassmorphism, Plus Jakarta Sans typography, and bioluminescent aurora effects.
    *   Unified design tokens implemented in `tailwind.config.js` and `index.css`.
    *   Neural-themed terminology adopted across the UI ("Neural Identity", "Temporal Matrix", "Objective Registry").

---

## Technical Context
- **Framework:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + custom glassmorphism utilities in `index.css`.
- **Primary Design System:** Aurora Glass (actively implemented).
- **Theme Philosophy:** Deep, high-contrast semantic dark mode with neural-themed terminology ("Cognitive Registry", "Temporal Matrix").
- **MCP Server Context:** Stitch MCP used for high-fidelity design generation.

---

## Changelog

### April 14, 2026: Comprehensive Dark Mode Overhaul & Semantic Theme Solidification
- **Objective:** Finalize the transition from "white and glowing" dark mode artifacts to a truly professional, high-contrast dark aesthetic.
- **Action:**
  - **Full Layout Refactor**: Updated `Layout.tsx`, `Sidebar.tsx`, and `Dashboard.tsx` to eliminate all hardcoded `bg-white` and `indigo-500/5` utilities.
  - **Premium Detail Pages**: Completely overhauled `NotePage.tsx`, `TaskPage.tsx`, and `Settings.tsx` (Nexus Control) to use the `.glass` utility and semantic tokens (`text-text`, `text-text-variant`, `primary/10`).
  - **Widget Ecosystem**: Refactored `WeatherWidget`, `TasksWidget`, `CalendarWidget`, and `NewsWidget` to ensure bento-grid consistency in dark mode.
  - **UI/UX Polish**: Adopted "Neural" terminology across all registry pages. Standardized the `.glass` utility in `index.css` to automatically adjust opacity and border contrast based on theme.
- **Outcome:** AuraOne now delivers a world-class dark mode experience that feels unified, premium, and highly technical, with no remaining light-mode artifacts in core or detail pages.

### April 14, 2026: Theme System Refactor — RGB Channel Migration
- **Objective:** Resolve PostCSS @apply errors with dynamic opacity (e.g., `border-primary/10`).
- **Action:**
  - Migrated `var(--color-*)` variables in `index.css` from Hex to **RGB space-separated triples**.
  - Updated `tailwind.config.js` to use `rgb(var(--color-*) / <alpha-value>)` for core semantic colors.
- **Outcome:** Full support for Tailwind shorthand opacity (/10, /20, etc.) inside both JSX and @apply directives, ensuring a robust and bug-free design system.

### April 14, 2026: UI Simplification — Header Removal & Relocated Theme Toggle
- **Objective:** Streamline the interface by removing redundant header elements and providing a more accessible theme toggle.
- **Action:** 
  - Eliminated the top `header` in `Layout.tsx`, including search, notification icons, and user account details.
  - Relocated the light/dark mode toggle to the **bottom-right corner** as a floating button.
  - Enhanced the toggle with `framer-motion` for smooth, spring-based transitions between the Sun and Moon icons.
- **Outcome:** A cleaner, more focused workspace.

### April 14, 2026: Hotfix — WeatherWidget Crash & PostCSS Safelist
- **Objective:** Fix "White Screen of Death" and Resolve PostCSS @apply errors.
- **Action:**
  - **Icon Fix**: Added missing `RotateCw` import to `WeatherWidget.tsx`.
  - **PostCSS Compatibility**: Added a `safelist` to `tailwind.config.js` for custom colors with dynamic opacity (`border-primary/10`, `text-text/30`, etc.) to ensure they are available for `@apply` in `index.css`.
- **Outcome:** Application now loads correctly without reference errors or build-time CSS failures.

### April 14, 2026: Chat Module Repair & Weather API Resilience
- **Objective:** Fix "ReferenceError: format is not defined" in Chat.tsx and handle 401 Weather Unauthorized.
- **Action:**
  - **Import Fix**: Added `import { format } from "date-fns"` to `Chat.tsx` to restore session timestamp rendering.
  - **API Resilience**: Updated `WeatherWidget.tsx` to trap 401 status codes and display a user-friendly "Invalid Weather API Key" message.
- **Outcome:** The Chat page no longer crashes upon loading, and the Weather widget provides actionable feedback regarding API configuration issues.

### March 28, 2026: Logo Generation & Integration
... (previous logs preserved)

### April 14, 2026: Terminology Standardization — From Esoteric to Intuitive
- **Objective**: Replace abstract and confusing page titles (e.g., "Temporal Matrix", "Nexus Control") with clear, professional names.
- **Action**:
  - **Dashboard**: Renamed sections to "ACTIVE TASKS" and "MY SCHEDULE".
  - **Tasks**: Renamed "Objective Registry" to "Workboard" and updated priority tiers to "Low, Medium, High".
  - **Notes**: Renamed "Archives" to "My Notes" and updated action buttons (e.g., "ADD NOTE").
  - **Calendar**: Renamed "Temporal Matrix" to "Events Calendar".
  - **Settings**: Renamed "Nexus Control" to "Settings" and simplified sub-labels (e.g., "Signature" -> "Display Name").
  - **Chat**: Renamed "Neural Pulse" to "Aura Assistant" and updated interaction prompts for clarity.
- **Outcome**: The application now features a logical, user-friendly interface that maintains its premium aesthetic while being significantly more intuitive.

### April 14, 2026: News Widget Expansion — Enhanced Information Density
- **Objective**: Increase the number of news updates visible on the dashboard to improve information delivery.
- **Action**: 
  - Updated `NewsWidget.tsx` to fetch and render 5 items (1 featured + 4 secondary) instead of 3.
  - Expanded the categories system to include "Pulse" and "Editorial" for the additional articles.
  - Optimized transition delays for the newly added secondary items.
- **Outcome**: The dashboard now provides a more comprehensive overview of global updates while maintaining its sleek, high-fidelity aesthetic.

### April 14, 2026: UI Consistency — Refined Calendar Terminology
- **Objective**: Replace the abstract "Vapor Schedule" label in the Calendar widget with a more logical and intuitive term.
- **Action**: Updated `CalendarWidget.tsx` to rename "Vapor Schedule" to "Daily Agenda".
- **Outcome**: Improved UI clarity and adherence to the standardized professional terminology system.

### April 14, 2026: Authentication UI Refine — Logical Taxonomy
- **Objective**: Standardize esoteric and abstract labeling in the Login and SignUp pages to improve clarity and user onboarding.
- **Action**:
  - **Login.tsx**: Replaced "Universal Identifier" with "Email Address", "Secure Key" with "Password", and "Restore Session" with "Sign In". Standardized decorative headers to "Welcome Back" and "Professional Workspace".
  - **SignUp.tsx**: Replaced "Guardian Name" with "Full Name", "Digital Identifier" with "Email Address", and "Cryptographic Key" with "Password". Updated "Commence Journey" to "Sign Up".
- **Outcome**: The authentication flow is now intuitive and professionally labeled while retaining its premium visual identity.

### April 14, 2026: Sidebar Collapsing & Logout Button Refinement
- **Objective**: Implement collapsible sidebar functionality and resolve confusion between logout and collapse icons.
- **Action**:
  - **Collapsible Sidebar**: Introduced `isCollapsed` state with `localStorage` persistence. The sidebar now transitions between `224px` and `80px` width.
  - **Floating Toggle**: Added a glassmorphic Chevron toggle button positioned on the sidebar's right border, vertically aligned with the "Dashboard" item. Fixed overflow issues to ensure the toggle button remains fully visible in both expanded and collapsed states.
  - **Logout Clarification**: Replaced the ambiguous `LogOut` (arrow) icon with a `Power` icon in the profile section. Added an explicit "SIGN OUT" label that appears on hover to clearly distinguish the action.
  - **UI/UX Dynamics**: Leveraged synced `framer-motion` springs for butter-smooth layout shifts. Added rotation animations to the toggle chevron and graceful label showing/hiding with `AnimatePresence`.
- **Outcome**: Improved workspace flexibility and reduced interface ambiguity.

### April 14, 2026: Chat UI Deep Refactor — Professional SaaS Integration
- **Objective**: Completely resolve the "zoomed" and "huge" feeling of the Chat page by aligning it with professional SaaS standards.
- **Action**:
  - **Layout Reconstruction**: Reduced page sidebar width from `20rem` to `18rem` and simplified the nested-box structure into a unified, clean glass container.
  - **Header & Navigation**: Slimmed the chat header to a fixed `h-14` and adopted cleaner, bold typography instead of "black" weights.
  - **Message Optimization**: Redesigned message bubbles with `rounded-2xl` and `py-2.5 px-4` padding. Scaled down avatars and unified spacing.
  - **Input Area Refinement**: Transformed the bulky floating input pod into an integrated, compact message bar with `rounded-xl` borders and standardized icon sizes.
  - **Empty State**: Replaced the "hero-style" massive text with a welcoming, centered layout featuring a 25% reduction in font sizes.
- **Outcome**: The chat interface now feels expansive, professional, and perfectly scaled, fitting seamlessly into the AuraOne ecosystem with improved information density.

### April 14, 2026: Branch Synchronization & Rebase Cleanup
- **Objective**: Align the `ui2` branch with `main` to ensure a clean commit history and resolve version drift depicted in the repository status.
- **Action**: 
  - Fetched latest updates from `origin/main`.
  - Rebased `ui2` onto `origin/main`, resolving minor layout conflicts in `Settings.tsx` by favoring the premium UI overhaul.
  - Successfully harmonized 28 unique `ui2` commits with the 2 most recent commits from `main`.
  - Fast-forwarded the `main` branch to match `ui2`, achieving parity across both branches.
- **Outcome**: Both `main` and `ui2` are now perfectly synchronized at the same commit, with no "ahead" or "behind" indicators on GitHub.

### April 14, 2026: Codebase Cleanup — Removal of Unused Assets & Legacy Configs
- **Objective**: Standardize and optimize the codebase by removing all unused files, components, and legacy configurations to reduce technical debt and build size.
- **Action**:
  - **Asset Pruning**: Permanently deleted 7 unu
  sed image and video assets from `src/assets/` (`flat-illustration-1.jpg`, `flat-illustration-2.jpg`, `flat-illustration-3.png`, `illustration.jpg`, `LandingVideo.mp4`, `LandingVideo2.mp4`, `project_flow.png`).
  - **Legacy Config Removal**: Deleted `firebase.json` and `logo.html` (legacy playbooks/configs no longer relevant post-Supabase migration).
  - **Dependency Optimization**: Updated `package.json` to remove unused server-side and client-side dependencies including `mongoose`, `express`, `axios`, `@ai-sdk/google`, `@google/generative-ai`, `nodemon`, and `proxyquire`. Cleaned up the `scripts` section to remove obsolete server commands.
  - **Verification**: Verified that all remaining components and assets are actively imported and functional within the application. Corrected the favicon path in `index.html` to follow Vite root-absolute standards. Added `CLAUDE.md` to `.gitignore` and untracked it from git.
- **Outcome**: A leaner, more professional codebase with significantly reduced complexity and zero reliance on deprecated backend or AI SDKs.

### April 24, 2026: Logo Synchronization — SVG Component Integration
- **Objective**: Fix broken image links in the header and footer of the Login and SignUp pages.
- **Action**: 
  - Replaced legacy `<img src="/favicon.svg" />` tags in `Login.tsx` and `SignUp.tsx` with the high-fidelity `Logo` component.
  - Standardized logo dimensions (`w-10 h-10` for header, `w-8 h-8` for footer) across both authentication pages.
  - Updated copyright year from 2025 to 2026 in page footers for consistency with the rest of the application.
- **Outcome**: Resolved broken image issues while enhancing UI consistency and aligning with the premium AuraOne design system.
