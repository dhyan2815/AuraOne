# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primarily a showcase, learning and knowledge project by Dhyan Patel: evaluated by recruiters, interviewers and peers who sign up and click through it, and used by its author and individual knowledge workers to run their day (tasks, notes, events) with an AI assistant on top.

## Product Purpose
One personal hub instead of app overload: tasks, notes, calendar events, news and weather in a single workspace, with Aura Assistant able to read and act on all of it. Success means a visitor understands the product in one screen, signs up, and can create, find and ask about their own items without switching tools.

## Positioning
The assistant is not a chat bolted on the side: it runs a ReAct agent loop with tool calls over the user's own data (Command Mode turns plain language into validated create/read/update/delete actions; Brain Mode reasons in depth), grounded by a personal RAG Knowledge Base built from the user's notes, tasks and events, with Gemini primary and OpenRouter fallback.

## Operating Context
- Public surfaces: landing page, login, sign up, forgot password, reset password.
- Authenticated app: Dashboard (weather, tasks, calendar, news widgets), Notes list + note editor (TipTap rich text, tags), Tasks list + task detail (High/Medium/Low priority, due dates, pending/complete), Events calendar (month view, create/edit/delete), Chat with Aura (sessions sidebar, Command/Brain modes), Knowledge Base (Explorer and Playground views over RAG chunks), Settings.
- Desktop sidebar navigation (collapsible) and mobile bottom navigation; light and dark themes with system preference detection.
- Supabase auth and realtime sync; third-party data from OpenWeatherMap and NewsData.io.

## Capabilities and Constraints
- Redesign scope is UI/UX only: every page, interface, popup and dialog gets a new visual world with proper transitions; backend, data flow, functionality and feature set must not change. Any collision between the new design and existing behaviour is escalated to the owner before acting.
- Stack is fixed: React 18, TypeScript, Vite, Tailwind 3, Framer Motion, Radix UI, lucide-react, TipTap, react-hot-toast/sonner.
- Light and dark themes are an existing feature and must remain.

## Brand Commitments
- Name: AuraOne; assistant name: Aura (Aura Assistant). Tagline in use: "One app, zero chaos—just pure focus."
- The current look (indigo/violet aurora gradients, glass panels, current logo) is explicitly replaced; nothing visual is binding.

## Evidence on Hand
- Landing page testimonials (Rajesh Verma, Anjali Sharma, Amit Patel, Dhairya Kumar) are sample content; the owner chose to keep them.
- Real assets: `src/assets/LandingImage.png`, architecture diagrams in `architecture/`, AI assistant test reports in `reports/`, Stitch mobile comps in `docs/stitch mobile app designs/` (prior direction, not binding).
- No real customers, press, usage statistics or pricing exist; none may be invented.

## Product Principles
1. One place: every feature is reachable in one hop and visibly part of the same workspace.
2. The assistant acts, not just talks: show what Aura did to the user's data.
3. The user's own content is the hero; chrome stays out of its way.
4. Change the surface, never the behaviour.

## Accessibility & Inclusion
README commits to WCAG compliance with keyboard navigation; keep visible focus, contrast in both themes, and reduced-motion fallbacks for every transition.
