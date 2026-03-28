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
- **MCP Server Context:** Stitch MCP used for high-fidelity design generation.

---

## Changelog

### March 28, 2026: Dashboard — Exact Stitch HTML Match
- **Objective:** Restore and exactly replicate the Stitch-generated Aurora Glass dashboard.
- **Files Changed:**
  - `Sidebar.tsx`: Pill-shaped gradient active nav (`from-indigo-500 to-purple-400 rounded-full`), glass sidebar bg, user profile card at bottom with avatar + logout.
  - `Layout.tsx`: Added sticky Top App Bar with search input, dark mode toggle, bell notification, user avatar. Removed collapse toggle — sidebar is fixed-width on desktop.
  - `Dashboard.tsx`: Complete 12-column bento grid — Weather (8col), Tasks (4col), News (5col), Calendar (7col), hero greeting, floating action button.
  - `WeatherWidget.tsx`: Large 7xl temperature, location, feels-like, 3-day forecast icons, large decorative weather icon.
  - `TasksWidget.tsx`: Circular checkbox buttons, completed task strikethrough, glass row styling.
  - `CalendarWidget.tsx`: Proper Mon–Sun 7-col mini calendar grid, today pill highlight, event dots.
  - `WeatherWidget.tsx`: Large 7xl temperature, location, feels-like, 3-day forecast icons, large decorative weather icon.
  - `TasksWidget.tsx`: Circular checkbox buttons, completed task strikethrough, glass row styling.
  - `CalendarWidget.tsx`: Proper Mon–Sun 7-col mini calendar grid, today pill highlight, event dots.
  - `NewsWidget.tsx`: Featured article with hero image + two thumbnail articles with category labels.

### March 28, 2026: Notes, Tasks, Calendar/Events, Chat — Stitch HTML Integration
- **Objective:** Implement all 4 remaining pages from Stitch-generated Aurora Glass HTML (located in `stitch-design-codes/`).
- **Files Changed:**
  - `Notes.tsx`: "Your Archives" hero, filter tabs (All/Personal/Work/Ideas), masonry 3-col glass note cards with color-coded tags, hover lift effect, empty state.
  - `Tasks.tsx`: "Objective Registry" hero with active count badge, filter tabs (All/Today/Upcoming/Completed), 3 task groups (High Priority / Active Flow / Recently Achieved), glass card rows with circular checkboxes and priority badges.
  - `Calendar.tsx`: "Temporal Matrix" hero, Mon–Sun 7-col interactive calendar grid, event dots, today highlighted with indigo pill, right panel with upcoming events (color-coded accent bars), inline add-event form, promotional promo card.
  - `Chat.tsx`: Aura Pulse AI chat — left sessions sidebar with "New Chat" button + session list, main glass chat panel with Aura Pulse header, suggestion cards (empty state), message bubbles with animated typing indicator, glass input bar with mic + send.
- **Design Source:** `stitch-design-codes/*.html` — user-provided Stitch HTML files.
- **Branch:** `ui2`
