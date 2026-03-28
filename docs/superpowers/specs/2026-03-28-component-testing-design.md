---
name: Component Testing Design Spec
description: Single combined test suite for all AuraOne UI components
type: reference
---

# Component‑Testing Design (single combined file)

**Goal**: Add one test file `test/components.test.tsx` that provides full‑interaction coverage for every UI component listed in the component‑testing‑plan.

## Test environment
- JSDOM is already configured in `test/setup.js`.
- The existing `npm test` script runs Mocha with the `tsx` runner and picks up any `*.test.tsx` under `test/`.

## Mocking strategy
- Local mocks for custom hooks (`useNotes`, `useTasks`, etc.) are defined inside the test file using `jest.mock`/`sinon` (or simple stub functions). These mocks are scoped to the test file only and do not affect production code.

## Test sections (order in the file)
1. **Card** – render title, children, optional action link (already covered).
2. **NoteCard** – list & grid view, date formatting, tag display, navigation link.
3. **TaskCard** – list & grid view, priority badge, due‑date, overdue styling, completion toggle.
4. **NewsWidget** – headline, source, clickable link.
5. **WeatherWidget** – temperature, city name, appropriate icon.
6. **TasksWidget** – task list rendering, empty‑state handling.
7. **CalendarWidget** – month grid, selected date highlight, day‑click callback.
8. **LandingPage** – hero section, navigation links, CTA button.

Each section follows the pattern:
```tsx
describe('ComponentName', () => {
  it('does X', () => {
    const { container } = render(<ComponentName …props />);
    // assertions with screen.getBy… / expect(container).to…
  });
});
```
Components that use `react‑router-dom` links are wrapped in `<MemoryRouter>`.

## Execution & CI
- The file lives at `test/components.test.tsx`.
- Running `npm test` will now execute *all* component tests in one pass.
- GitHub Actions already runs `npm test`; no extra workflow steps needed.

## Verification steps
1. Run `npm test` locally – expect all tests to pass.
2. Push the changes; CI will run the same command.
3. If any test fails, adjust mock data or assertions and re‑run.

---

*Created by Claude on 2026‑03‑28.*
