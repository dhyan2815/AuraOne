// Section registry — maps routes to their Living Map colour class and nav label.

export interface Section {
  key: 'today' | 'tasks' | 'notes' | 'events' | 'aura' | 'know' | 'set';
  path: string;
  label: string;
  cls: string;
}

export const sections: Section[] = [
  { key: 'today', path: '/dashboard', label: 'Today', cls: 'sec-today' },
  { key: 'tasks', path: '/tasks', label: 'Tasks', cls: 'sec-tasks' },
  { key: 'notes', path: '/notes', label: 'Notes', cls: 'sec-notes' },
  { key: 'events', path: '/events', label: 'Events', cls: 'sec-events' },
  { key: 'aura', path: '/chat', label: 'Aura', cls: 'sec-aura' },
  { key: 'know', path: '/knowledge', label: 'Knowledge', cls: 'sec-know' },
];

const settings: Section = { key: 'set', path: '/settings', label: 'Settings', cls: 'sec-set' };

// Resolve the section that owns a pathname; unknown paths fall back to Today.
export const sectionFor = (pathname: string): Section =>
  [...sections, settings].find((s) => pathname === s.path || pathname.startsWith(`${s.path}/`)) ?? sections[0];
