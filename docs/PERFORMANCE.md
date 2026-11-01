# Performance Monitoring and Uptime Proof

Last Edited: 2026-11-01 21:25:25 IST (UTC+05:30)

## Scope

This document covers performance, monitoring and uptime evidence for Issue #74. It records measured build metrics, models the runtime cost of an Aura request, and lists known hotspots with the exact steps for collecting live evidence.

AuraOne is a static React SPA on Vercel with Supabase-backed data services. There is no application server: the browser calls Supabase, Gemini, OpenRouter, OpenWeatherMap and NewsData.io directly, so client-side network timing is the main performance surface.

---

## Instrumentation Status

The runtime monitor this document used to reference has been removed:

| Previously referenced | Status |
|-----------------------|--------|
| `src/utils/performance.ts` (`perfMonitor`) | Removed on 2026-07-17 in `0525cc2` (refactor: utils & schema files) |
| `tests/unit/performance.test.ts` | Removed on 2026-07-17 in `0525cc2` |
| `src/services/aiService.ts` (`ai-service.processAIRequest` timing) | Removed on 2026-07-17 in `6f91a94` (refactor: ai & rag based files). Replaced by `agentOrchestrator.ts` and `llmService.ts`. |
| `tests/unit/aiService.test.ts` | Removed on 2026-07-17 in `6f91a94` |

**The codebase currently has no app-level timing instrumentation.** These signals are available today:

- **Agent metadata.** Every AI reply in `chat_messages.metadata` stores `toolsUsed`, `steps`, `sources` and `pendingActions`. From these you can count tool calls, model turns and fallbacks (`fallback_openrouter`).
- **Message timestamps.** The gap between a user message's `created_at` and the next AI message's `created_at` approximates end-to-end Aura latency (see the SQL below).
- **Hard failures.** Failed requests are saved as AI messages whose content starts with `[SYSTEM ERROR @ ...]`.
- **Platform tooling.** Browser DevTools (Network and Performance), Lighthouse, the Vercel deployment dashboard, and Supabase API and database reports. Vercel Web Analytics and Speed Insights are not installed (`@vercel/analytics` and `@vercel/speed-insights` are not dependencies).

---

## Measured Build Metrics

Measured at the time of this edit with `npm run build` (Vite 5.4.21). Since 2026-11-01, route pages load on demand (`React.lazy` in `src/App.tsx`), and stable vendor code is split into long-lived chunks (`manualChunks` in `vite.config.ts`).

### Before and After Code Splitting

| Metric | Single bundle (before) | Code split (now) |
|--------|------------------------|------------------|
| JS needed before the first page renders | 1,446.55 kB (442.11 kB gzip), 1 file | 574.11 kB (179.62 kB gzip), 4 files |
| Signed-out landing page (`/`), total JS | 1,446.55 kB (442.11 kB gzip) | 616.94 kB (193.58 kB gzip), **−56% gzip** |
| Signed-in Dashboard (`/dashboard`), JS before idle prefetch | 1,446.55 kB (442.11 kB gzip) | 639.08 kB (197.85 kB gzip), **−55% gzip** |
| Largest chunk | 1,446.55 kB | 436.11 kB (`NotePage`, on demand) |
| All JS combined | 1,446.55 kB (442.11 kB gzip) | 1,454.52 kB (461.41 kB gzip) in 35 files |
| Vite chunk-size warning (> 500 kB) | Yes | No |

The combined total is slightly larger (+19 kB gzip) because each chunk is compressed on its own, so a signed-in user who eventually opens every screen downloads about 4% more overall. In exchange, the first render needs less than half the JavaScript it used to.

### First-Load Chunks

`index.html` loads the app shell and preloads the three vendor chunks in parallel:

| Chunk | Minified | Gzip | Contents |
|-------|----------|------|----------|
| `index-*.js` | 104.88 kB | 36.37 kB | App shell: `App`, `Layout`, `TopBar`, `useAuth`, Radix dropdown, react-hot-toast |
| `react-*.js` | 164.18 kB | 53.59 kB | react, react-dom, React Router |
| `supabase-*.js` | 176.46 kB | 46.38 kB | `@supabase/supabase-js` |
| `motion-*.js` | 128.59 kB | 43.28 kB | framer-motion |
| `index-*.css` | 69.78 kB | 13.14 kB | Tailwind and Living Map styles |

### On-Demand Route Chunks

| Chunk | Minified | Gzip | Main contents | Route |
|-------|----------|------|---------------|-------|
| `NotePage-*.js` | 436.11 kB | 138.98 kB | TipTap, ProseMirror, linkifyjs, marked | `/notes/:id` |
| `Chat-*.js` | 271.00 kB | 82.26 kB | Agent services with zod and chrono-node, react-markdown stack | `/chat` |
| `LandingPage-*.js` | 38.51 kB | 12.07 kB | Landing page | `/` (signed out) |
| `Dashboard-*.js` | 15.30 kB | 5.27 kB | Dashboard and its widgets | `/dashboard` |
| `parse-*.js` + `format-*.js` | 43.12 kB | 10.60 kB | date-fns (shared) | Dashboard, Calendar, task pages |
| Every other page | < 10 kB each | | Tasks, Notes, Calendar, KnowledgeBase, Settings, TaskPage, auth pages, plus small shared and icon chunks | Their routes |

### Idle Prefetch and Failed Loads

After a signed-in page renders, `App.tsx` waits for `requestIdleCallback` (or a 2 s timeout where that API is missing) and then prefetches the other signed-in route chunks: about 758 kB (243 kB gzip) in the background, so later section switches don't wait on the network. Signed-out visitors never prefetch. If the background download becomes a concern on mobile data, the next step would be to prefetch on nav-link hover or focus instead.

If a chunk fails to load during navigation (for example after a redeploy, when Vercel answers old asset URLs with `index.html`), the page loader reloads the tab once. A failed prefetch is ignored, so a flaky connection never reloads the page while someone is typing.

---

## Runtime Cost Model: One Aura Message

| Phase | Network calls | Notes |
|-------|---------------|-------|
| Save the user message | 1 INSERT + 1 SELECT (message count), +1 UPDATE on the session's first message | `chatHandler.ts` |
| RAG pre-retrieval | 1 `embedContent` + 1 `match_knowledge_chunks` RPC | Skipped for pure-action phrasing or on a 60 s cache hit |
| Model turns | 1 `streamGenerateContent` (SSE) per turn, max 8 | Turns = tool rounds + 1 |
| Tool execution | 1 to 2 Supabase queries per tool, run in order | `search_knowledge_base` adds another embed and RPC, uncached |
| Background re-index (per successful create/update) | SELECT + DELETE + `batchEmbedContents` + UPSERT | Fire-and-forget. Does not delay the reply. |
| Save the AI reply | 1 INSERT | Includes metadata |
| UI refresh | 2 SELECTs (sessions + full message history), plus realtime INSERT events | `Chat.tsx` |

**Typical paths:**

- **Pure action** ("Add a task to call the bank tomorrow"): no RAG, then turn 1 calls `create_task` and turn 2 confirms. That is 2 model turns, 1 task INSERT and 4 background re-index calls.
- **Knowledge question** ("What did I note about the Q4 roadmap?"): 1 embed + 1 RPC, then 1 or 2 model turns (more if the model also calls `search_knowledge_base`).
- **Multi-step** ("Move my standup to 3pm and show today's agenda"): `list_items` → `update_event` → `get_agenda` → answer. That is about 3 or 4 turns.

**Latency bounds:**

- **Perceived latency** is reduced by streaming: tokens reach the draft bubble as they arrive, and the step trace updates live.
- **Header timeouts:** 30 s per Gemini streaming turn and 45 s for OpenRouter. Each timeout covers only the wait for response headers (the abort timer is cleared when `fetch` resolves), so a stream that stalls mid-body has no client timeout.
- **Worst case:** 8 Gemini turns and their tool calls, then an OpenRouter fallback, before an error message is written.

---

## Known Hotspots

| # | Hotspot | Location | Effect |
|---|---------|----------|--------|
| 1 | **Resolved on 2026-11-01.** This was a single 1.45 MB JS chunk with every page imported eagerly. Pages now load on demand, and first-load JS is 574 kB (180 kB gzip). | `src/App.tsx`, `vite.config.ts` | No longer applies. `NotePage` (139 kB gzip) is the largest remaining chunk, loaded on demand or by idle prefetch. |
| 2 | Full-table reads in agent tools: `list_items`, `get_agenda` and `find_free_slots` fetch every user row (no limit or date range) and filter in the browser. `list_items` trims to 20 only after fetching. | `src/services/agentTools.ts`, `src/hooks/use*.ts` | Payload and latency grow linearly with the user's data |
| 3 | Re-embedding on every note autosave: the 5 s idle autosave calls `updateNote`, which triggers `silentIngest` (4 network calls including an embedding), even when the content is unchanged | `src/pages/NotePage.tsx`, `src/hooks/useNotes.ts` | Embedding API usage and Supabase writes while editing |
| 4 | Sequential full re-sync: `ingestAllForUser` indexes one item at a time, about 4 requests per item, and never batches embeddings across items | `src/services/ragIngestionService.ts` | Knowledge Sync time grows linearly with item count |
| 5 | Tool calls run in order: several function calls in one turn are awaited one after another | `src/services/agentOrchestrator.ts` | Extra latency on multi-tool turns |
| 6 | `search_knowledge_base` bypasses the 60 s RAG cache | `src/services/agentTools.ts` | Repeated embedding and RPC calls |
| 7 | Realtime refetches the whole list: Notes and Calendar reload every row on each change event instead of applying the payload | `src/pages/Notes.tsx`, `src/pages/Calendar.tsx` | Redundant reads |
| 8 | Full chat history is reloaded after every send, in addition to the realtime INSERT events | `src/pages/Chat.tsx` | Payload grows with session length |
| 9 | Multiple `useAuth` instances: `/dashboard` mounts 5 (App, TopBar, Dashboard, TasksWidget, CalendarWidget), and each calls `getSession()` and registers its own auth listener | `src/hooks/useAuth.ts` | Redundant work and listeners |
| 10 | Weather (2 requests) and news (1 request) are fetched on every Dashboard mount with no response cache | `src/components/widgets/` | Third-party quota use and slower Dashboard loads |
| 11 | The RAG cache Map is never evicted (entries expire logically but stay in memory) | `src/services/agentOrchestrator.ts` | Small memory growth over a long-lived tab |

---

## Recommendations

| Priority | Change | Addresses |
|----------|--------|-----------|
| Done | Route-level code splitting: `React.lazy` for every page, `Suspense` in `App` and `Layout`, idle prefetch and vendor `manualChunks` | #1 |
| High | Push filters into Supabase queries (`limit`, `ilike` keyword match, date ranges) for agent tools | #2 |
| High | Re-index a note only when its content actually changed (compare a hash or the previous value), or only on explicit save | #3 |
| Medium | Batch embeddings across items and run ingestion with bounded concurrency in `ingestAllForUser` | #4 |
| Medium | Run independent read-only tool calls in parallel (`Promise.all`); keep mutating calls in order | #5 |
| Medium | Add an idle timeout to the SSE reader so a stalled stream falls back instead of hanging | Latency bounds |
| Medium | Restore lightweight instrumentation: record time-to-first-token, total duration, turn count, per-tool duration and outcome (success / fallback / error) in `chat_messages.metadata` | Monitoring |
| Low | Send `search_knowledge_base` through the retrieval cache and bound the cache size (LRU) | #6, #11 |
| Low | Apply realtime payloads in place instead of refetching; append the new message instead of reloading the history | #7, #8 |
| Low | Move auth into one context provider | #9 |
| Low | Cache weather and news responses in localStorage with a TTL (10 to 30 min) | #10 |

---

## How to Capture Real Evidence

1. Open the deployed app and sign in.
2. Run representative chat requests in both **Command** and **Brain** mode:
   - Pure action: *"Add a task to call the bank tomorrow"*
   - Knowledge question: *"What did I write about the Q4 roadmap?"*
   - Multi-step: *"Move my standup to 3pm and list today's agenda"*
3. In DevTools → Network, filter on `streamGenerateContent`, `embedContent`, `rpc/match_knowledge_chunks` and `rest/v1`. For each request, record time to first byte and total duration, and count the model turns.
4. Run the SQL below in the Supabase SQL editor to get latency and fallback rates from real traffic. The queries assume `chat_messages.metadata` is a `jsonb` column.

```sql
-- Approximate end-to-end Aura latency per reply (last 7 days)
select ai.id,
       ai.created_at - um.created_at       as latency,
       jsonb_array_length(coalesce(ai.metadata->'steps', '[]'::jsonb)) as steps,
       ai.metadata->'toolsUsed'            as tools
from chat_messages ai
join lateral (
  select m.created_at
  from chat_messages m
  where m.session_id = ai.session_id
    and m.role = 'user'
    and m.created_at < ai.created_at
  order by m.created_at desc
  limit 1
) um on true
where ai.role = 'ai'
  and ai.created_at > now() - interval '7 days'
order by ai.created_at desc;
```

```sql
-- Fallback and hard-failure frequency (last 7 days)
select count(*) filter (where metadata->'toolsUsed' ? 'fallback_openrouter') as openrouter_fallbacks,
       count(*) filter (where content like '[SYSTEM ERROR%')                 as hard_failures,
       count(*)                                                              as total_replies
from chat_messages
where role = 'ai'
  and created_at > now() - interval '7 days';
```

5. Run Lighthouse (mobile and desktop) on `/` and `/dashboard`, and record LCP, TBT, CLS and total transfer size.
6. Take screenshots of:
   - Vercel project deployments, status and uptime window
   - Vercel Analytics, if enabled
   - Supabase API and database reports
   - The DevTools Network waterfall for one request of each type above

---

## Current Evidence Status

Only real environment evidence is accepted for this issue.

| Evidence | Status |
|----------|--------|
| Production build size | Captured (see Measured Build Metrics) |
| Test suite | Captured: `npm run test:run` passes 109 tests in 8 files |
| Production uptime screenshots | `PENDING - capture from Vercel dashboard` |
| Live latency samples | `PENDING - capture from DevTools Network panel and the chat_messages latency query` |
| Fallback/error frequency samples | `PENDING - capture from the fallback frequency query` |
| Lighthouse / Core Web Vitals | `PENDING - capture with Lighthouse on / and /dashboard` |

---

## Acceptance Criteria

- Core tests pass (`npm run test:run`) and the production build succeeds (`npm run build`).
- This document contains either:
  - real evidence screenshots or values, or
  - clearly labeled `PENDING` sections with exact collection steps.
- If runtime instrumentation is restored, it records per-request duration, model turn count and outcome (success, fallback or error).

## Related Verification

- `tests/unit/agentTools.test.ts`: tool schemas, argument validation, delete gate, free-slot calculation
- `tests/integration/ai-fallback.test.ts`: response and retry patterns against a mocked `fetch`
- `tests/unit/caching.test.ts`: TTL cache behaviour (test-local implementation)
- `.github/workflows/preflights.yml`: CI typecheck, lint, tests with coverage, build, audit
