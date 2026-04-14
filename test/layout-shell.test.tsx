import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockLogout = vi.fn();

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => {
      const Component = ({ children, ...props }: any) => <div {...props}>{children}</div>;
      return Component;
    },
  }),
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'dhyan@example.com',
      user_metadata: { name: 'Dhyan' },
    },
    logout: mockLogout,
  }),
}));

import Layout from '../src/components/structure/Layout';
import Sidebar from '../src/components/structure/Sidebar';

describe('app shell', () => {
  beforeEach(() => {
    mockLogout.mockReset();
    localStorage.clear();
    document.documentElement.className = '';
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });
  });

  it('renders route-aligned sidebar labels and keeps the desktop rail sticky', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.queryByText('Aura AI Chat')).not.toBeInTheDocument();

    const desktopAside = container.querySelector('aside.hidden');
    expect(desktopAside?.className).toContain('sticky');
    expect(desktopAside?.className).toContain('top-0');
  });

  it('applies and toggles theme state from the top bar control', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route path='dashboard' element={<div>Dashboard content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const toggle = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(toggle);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
