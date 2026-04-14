import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconProps = Record<string, any>;

vi.mock('lucide-react', () => ({
  LayoutDashboard: (props: IconProps) => <span data-testid="icon-layoutdashboard" {...props} />,
  FileText: (props: IconProps) => <span data-testid="icon-filetext" {...props} />,
  CheckSquare: (props: IconProps) => <span data-testid="icon-checksquare" {...props} />,
  Calendar: (props: IconProps) => <span data-testid="icon-calendar" {...props} />,
  Settings: (props: IconProps) => <span data-testid="icon-settings" {...props} />,
  MessagesSquare: (props: IconProps) => <span data-testid="icon-messagessquare" {...props} />,
  LogOut: (props: IconProps) => <span data-testid="icon-logout" {...props} />,
  Menu: (props: IconProps) => <span data-testid="icon-menu" {...props} />,
  X: (props: IconProps) => <span data-testid="icon-x" {...props} />,
  Search: (props: IconProps) => <span data-testid="icon-search" {...props} />,
  Moon: (props: IconProps) => <span data-testid="icon-moon" {...props} />,
  Sun: (props: IconProps) => <span data-testid="icon-sun" {...props} />,
  Bell: (props: IconProps) => <span data-testid="icon-bell" {...props} />,
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn(), promise: vi.fn() },
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target: any, prop: string) => {
      const Component = ({ children, ...props }: { children?: React.ReactNode; props?: any }) => <div data-testid={`motion-${prop}`} {...props}>{children}</div>;
      return Component;
    },
  }),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'dhyan@example.com',
      user_metadata: { name: 'Dhyan' },
    },
    loading: false,
    error: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../src/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

import Layout from '../src/components/structure/Layout';
import Sidebar from '../src/components/structure/Sidebar';

describe('app shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.queryByText('Aura AI Chat')).not.toBeInTheDocument();

    const desktopAside = container.querySelector('aside');
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
