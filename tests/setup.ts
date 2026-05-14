import '@testing-library/jest-dom';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '', pathname: '/' },
  writable: true,
});

// Mock window.localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });