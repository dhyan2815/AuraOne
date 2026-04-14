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

