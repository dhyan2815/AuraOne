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

### March 28, 2026: Global Scale & Padding Optimization — Human-Readable Layout
- **Objective:** Fix "oversized/zoomed" UI issues by downscaling heroes, padding, and font sizes to fit 100% Windows screen.
- **Action:** Systematically reduced font sizes (`5xl`/`3.5rem` down to `text-3xl`), container padding (`p-8` down to `p-6`), and component margins across all pages.
- **Files Adjusted:**
  - `Dashboard.tsx`: Hero font `3.25rem` → `text-4xl`, container `p-8` → `p-6`, gap `gap-6` → `gap-5`.
  - `Layout.tsx`: Header padding `px-8` → `px-6`.
  - `Notes.tsx`: Hero `text-5xl` → `text-3xl`, card/container padding reduced.
  - `Tasks.tsx`: Hero `text-4xl` → `text-2xl`, row padding `p-5` → `p-4`.
  - `Calendar.tsx`: Hero `text-[3.5rem]` → `text-3xl`, grid padding `p-8` → `p-5`.
  - `Chat.tsx`: Hero `text-5xl` → `text-3xl`, chat bubble/container padding reduced.
  - All Widgets: Shrunk temperatures (`7xl` → `5xl`), thumbnails, and spacing for a compact, professional feel.

### March 28, 2026: Phase 2 — Deep UI Scaling Pass (All Components)
- **Objective:** Complete second-pass optimization after user screenshot review confirmed persistent oversizing.
- **Root Cause:** Sidebar was `w-64` (256px), consuming too much horizontal space. Controls bars used `flex-wrap` causing layout breaks.
- **Files Fixed:**
  - `Sidebar.tsx`: Narrowed from `w-64` → `w-56`, reduced brand/nav/profile card padding throughout.
  - `Notes.tsx`: Removed `flex-wrap` from controls bar. Filter tabs `px-6 py-2 text-sm` → `px-4 py-1.5 text-xs`. Search input `w-48 text-sm` → `w-32 text-xs`. New Note button scaled down. Card `p-6 rounded-3xl` → `p-5 rounded-2xl`. Title `text-xl` → `text-base`. Content preview `text-sm line-clamp-4` → `text-xs line-clamp-3`. Grid gap `gap-8` → `gap-5`.
  - `Tasks.tsx`: Task title `text-lg` → `text-sm`. Row `p-4 gap-5` → `p-3 gap-4`. Checkbox `w-7 h-7` → `w-5 h-5`. Filter buttons `px-6 py-2 text-sm` → `px-4 py-1.5 text-xs`. New Task button tightened. Group label margins reduced.
  - `Dashboard.tsx`: Hero `text-4xl` → `text-3xl`, subtitle `text-lg` → `text-sm`. Container `p-6` → `p-5`. Grid gap `gap-6` → `gap-4`. Widget card `p-6` → `p-5`. Widget headers `text-xl` → `text-base`. Calendar nav buttons `w-10 h-10` → `w-8 h-8`. FAB `w-16 h-16 bottom-8 right-8` → `w-12 h-12 bottom-6 right-6`.
  - `Calendar.tsx`: Outer `p-6 gap-6` → `p-5 gap-5`. Hero `text-3xl` → `text-2xl`. Right panel heading `text-xl` → `text-base`.
  - `Chat.tsx`: Outer `p-4 gap-4` → `p-3 gap-3`. Sessions aside `w-72` → `w-60`. Session list items `p-4 rounded-[1.5rem]` → `p-2.5 rounded-xl`. Messages area `p-6 space-y-6` → `p-4 space-y-4`. Chat header tightened.

### March 28, 2026: Logo Generation & Integration
- **Objective:** Create and implement a high-fidelity SVG logo for AuraOne based on the website's design language.
- **Action:** Utilized Stitch MCP (`GenerateScreenFromText` with project ID) to generate a new branding screen with a bioluminescent, neural network-inspired SVG logo matching the Aurora Glass/Neon Cyberpunk design systems. Extracted the raw SVG and futuristic wordmark into a scalable, reusable `Logo.tsx` React component.
- **Outcome:** Replaced simple text instances and generic icons of "AuraOne" across major structural and landing pages (`Sidebar.tsx`, `Login.tsx`, `SignUp.tsx`, `LandingPage.tsx`) with the new, cohesive, glowing `Logo` component to strengthen brand identity.

### March 28, 2026: Pervasive Brand Identity Integration
- **Objective:** Systematically replace all remaining placeholder icons (Sparkles, Globe, ✦, ✨) and text logos with the official AuraOne `Logo` component across the entire application.
- **Action:**
  - Enhanced `Logo.tsx` with `iconOnly` and `textOnly` props to support varied layout requirements.
  - Replaced the primary form icons in `ResetPassword.tsx` and `ForgotPassword.tsx`.
  - Updated `Settings.tsx` to use the logo in the "System Configuration" header and the "About" section.
  - Branded the "Operational Command" and "Editing Protocol" labels in `TaskPage.tsx` and `NotePage.tsx`.
  - Integrated the logo into the **Dashboard** hero greeting and Floating Action Button (FAB).
  - Fully branded the **Aura Pulse Chat** by replacing the generic ✦ symbol in the header, message avatars, and typing indicators with the neural logo.
  - Replaced the generic global spinner in `Loader.tsx` with a pulsing, bioluminescent branded `Logo` sequence.
- **Outcome:** ACHIEVED 100% visual consistency. The AuraOne bioluminescent identity is now deeply woven into every major user touchpoint, creating a premium, unified brand experience.
### March 28, 2026: Phase 3 — Remaining Oversized Views Scaling
- **Objective:** Address "illogical" layouts and massive text scalings reported by the user in Settings, Layout Topbar, Tasks Hero, and Chat internal components.
- **Files Fixed:**
  - `Layout.tsx`: Shrunk the `Top App Bar` height (`h-16` → `h-12`). Scaled down icons (`size={20}` → `size={16}`), padding, and avatar size to feel compact and native. 
  - `Settings.tsx`: Completely rebuilt spacing and typography. Reduced generic 5xl headers to 2xl, `p-10 text-center rounded-[3rem]` panels to standard `p-6 rounded-2xl` dense grid blocks. Replaced large gap sections with tighter layouts and smaller secondary text scales.
  - `Tasks.tsx`: Fixed the hero container that was set up as `flex-col md:flex-row`. Streamlined it to a permanent single-row flex to prevent breaking alignments and save vertical screen space.
  - `Chat.tsx`: Compacted the input bar `p-6` → `p-3`, input send button down to `w-9 h-9`. Scaled down suggestion cards to `p-4` inside a limited `max-w-md` grid. Reduced message avatars (`w-10 h-10` → `w-8 h-8`).
