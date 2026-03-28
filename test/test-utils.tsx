import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';

// Custom render wrapper with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

export function renderWithRouter(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { initialEntries = ['/'], ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    // Re-export these for convenience
    screen,
    waitFor,
  };
}

// Helper to wait for element to be removed/appear
export { screen, waitFor };

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {},
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

// Mock task data
export const createMockTask = (overrides = {}) => ({
  id: 't1',
  user_id: 'test-user-id',
  title: 'Sample task',
  description: 'Task description',
  due_date: new Date().toISOString(),
  priority: 'low' as const,
  completed: false,
  created_at: new Date().toISOString(),
  ...overrides,
});

// Mock note data
export const createMockNote = (overrides = {}) => ({
  id: 'n1',
  user_id: 'test-user-id',
  title: 'Sample note',
  content: '<p>Note content</p>',
  created_at: new Date().toISOString(),
  tags: ['tag1'],
  is_archived: false,
  ...overrides,
});

// Mock event data
export const createMockEvent = (overrides = {}) => ({
  id: 'e1',
  user_id: 'test-user-id',
  title: 'Sample event',
  start_time: new Date().toISOString(),
  end_time: null,
  description: null,
  created_at: new Date().toISOString(),
  ...overrides,
});
