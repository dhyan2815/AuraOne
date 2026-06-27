// Configure the global Vitest environment, stubbing window location properties and localStorage mocks for DOM tests.

import '@testing-library/jest-dom';

// Stub the window.location properties to prevent routing failures during jsdom testing.
Object.defineProperty(window, 'location', {
  value: { href: '', pathname: '/' },
  writable: true,
});

// Stub browser localStorage helper functions using mock tracking hooks.
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });