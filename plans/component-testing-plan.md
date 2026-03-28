# Plan: Add Component Testing to AuraOne

## Context

The goal is to create a robust testing suite for the AuraOne application to ensure all components function correctly after the recent UI overhaul. This plan outlines the steps to set up the testing environment, create a comprehensive test file, and validate the functionality of the core components.

## Implementation Plan

### Step 1: Setup Testing Environment

The first step is to add the necessary testing libraries to the project and configure the testing environment.

1.  **Install Dependencies**: Add `chai`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `@types/chai` to the `devDependencies` in `package.json`.
2.  **Configure `jsdom`**: Create a setup file (e.g., `test/setup.js`) to configure `jsdom` to provide a simulated browser environment for tests running in Node.js.
3.  **Update `package.json`**: Modify the `test` script to use the new setup file.

### Step 2: Create Test File

A single, comprehensive test file will be created to test the core UI and feature components. This file will be located at `test/components.test.tsx`.

1.  **Test Structure**: The test file will use `mocha`'s `describe` and `it` blocks to structure the tests logically for each component.
2.  **Component Coverage**: The tests will cover the following components:
    *   `Card.tsx`
    *   `NoteCard.tsx`
    *   `TaskCard.tsx`
    *   `NewsWidget.tsx`
    *   `WeatherWidget.tsx`
    *   `TasksWidget.tsx`
    *   `CalendarWidget.tsx`
3.  **Testing approach**: For each component, the tests will:
    *   Verify that the component renders without crashing.
    *   Check for the presence of key elements and text.
    *   Test that props are passed and rendered correctly.
    *   Simulate user interactions (e.g., clicks) where applicable and assert the expected outcome.

### Step 3: Run and Validate Tests

After creating the test file, the test suite will be run to ensure all tests pass and that the components are functioning as expected.

1.  **Run Tests**: Execute the `npm test` command.
2.  **Debug**: If any tests fail, debug the component or the test itself to resolve the issue.
3.  **Final Validation**: Once all tests pass, the testing setup is complete.

## Verification

The success of this plan will be verified by:

1.  All new dependencies being correctly installed.
2.  The `npm test` command running without errors.
3.  All tests in `test/components.test.tsx` passing successfully.

### Phase 2: Additional Enhancements (Optional)

- **Expand component coverage** – add tests for `Loader.tsx`, `TiptapEditor.tsx`, `Sidebar.tsx`, `Layout.tsx`, and any other reusable UI pieces.
- **State & context wrappers** – create a `test/utils/renderWithProviders.tsx` helper that renders components inside required providers (Zustand store, auth/theme context).
- **Mock external services** – stub Supabase, AI, and any fetch‑based APIs using `sinon` or `msw` in the test setup.
- **Accessibility checks** – run `axe-core` in each test and assert `violations.length === 0`.
- **Coverage reporting** – add `nyc` (or `c8`) to the `npm test` script:
  ```json
  "test": "nyc mocha --require test/setup.js \"test/**/*.test.tsx\""
  ```
  and generate an HTML report.
- **Async & error handling tests** – use `await findBy*` / `waitFor` to verify loading and error UI for components that fetch data.
- **Theming / dark‑mode validation** – mount components with a `dark` class on the root and assert the correct CSS classes appear.
- **Update test script** – ensure the JSDOM setup is always required by adding `--require test/setup.js` if not already present.

These steps can be performed after the baseline suite is green, providing richer confidence while keeping the initial effort minimal.
