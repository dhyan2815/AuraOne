# Performance Monitoring & Uptime Documentation

## Metrics Collection

### Key Operations Tracked
- AI service response time
- API fallback rates
- Error frequencies by type

### How to View Metrics

Run in browser console:
```typescript
import { perfMonitor } from './utils/performance';
console.log(perfMonitor.getMetrics());
```

## Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| AI response (Gemini) | < 5s | TBD |
| AI response (fallback) | < 10s | TBD |
| Page load | < 2s | TBD |
| Cache hit rate | > 80% | N/A |

## Monitoring Tools

- Vercel Analytics: Dashboard → Performance
- Browser DevTools: Network tab, Performance tab
- Console: Custom perfMonitor utility

## Uptime

- Platform: Vercel
- SLA: 99.9% (Vercel Pro)
- Current: Check Vercel dashboard

## Bottleneck Analysis

Run profiling:
```bash
npm run build -- --profile
```

## Run Tests

Run performance benchmarks:
```bash
npm run test:perf
```