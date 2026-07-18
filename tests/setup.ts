import '@testing-library/jest-dom';

Object.defineProperty(window, 'location', {
  value: { href: '', pathname: '/' },
  writable: true,
});

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });