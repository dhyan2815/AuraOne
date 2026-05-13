# Performance Monitoring and Uptime Proof

## Scope
This document covers monitoring and uptime evidence for Issue #74.
AuraOne is currently deployed on Vercel with Supabase-backed data services.

## Instrumented Metrics
Runtime instrumentation is implemented in:
- `src/utils/performance.ts`
- `src/services/aiService.ts`

Tracked signals:
- `ai-service.processAIRequest` duration
- request status (`success` or `error`)
- error message capture for failed requests

## How to Capture Real Evidence
1. Open the deployed app.
2. Execute representative chat requests in command mode and brain mode.
3. In browser console, run:

```ts
import { perfMonitor } from './utils/performance';
perfMonitor.getMetrics();
```

4. Capture screenshots of:
- Vercel project status and uptime window
- Vercel analytics/performance panels
- console metrics output from a live session

## Current Evidence Status
Only real environment evidence is accepted for this issue.

- Production uptime screenshots: `PENDING - capture from Vercel dashboard`
- Live latency samples: `PENDING - capture from runtime metrics output`
- Fallback/error frequency samples: `PENDING - capture from runtime metrics output and logs`

## Acceptance Criteria
- Monitoring utility records per-request duration and status correctly.
- Core tests pass after instrumentation updates.
- This document contains either:
  - real evidence screenshots/values, or
  - clearly labeled `PENDING` sections with exact collection steps.

## Related Verification
- `tests/unit/performance.test.ts`
- `tests/unit/aiService.test.ts`
- `tests/integration/ai-fallback.test.ts`
