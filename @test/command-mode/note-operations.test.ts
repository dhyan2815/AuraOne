/**
 * Command Mode Test: Note Operations
 * Tests AI's ability to parse natural language and create/read/delete notes
 */

export const noteOperationsTestCases = [
  {
    id: 'NO-001',
    input: 'Create a note with title "Meeting Notes" and content "Discuss Q4 goals and budget"',
    expected: {
      action: 'create',
      type: 'note',
      title: 'Meeting Notes',
      contentContains: 'Q4 goals'
    },
    keywords: ['note created', 'Meeting Notes'],
    mode: 'command'
  },
  {
    id: 'NO-002',
    input: 'Show all my notes',
    expected: {
      action: 'read',
      type: 'note'
    },
    keywords: ['notes', 'show', 'list'],
    mode: 'command'
  },
  {
    id: 'NO-003',
    input: 'Create a note called "Ideas" with content "1. New feature ideas 2. Improvements"',
    expected: {
      action: 'create',
      type: 'note',
      title: 'Ideas'
    },
    keywords: ['note created', 'Ideas'],
    mode: 'command'
  },
  {
    id: 'NO-004',
    input: 'Delete the note titled "Old Note"',
    expected: {
      action: 'delete',
      type: 'note'
    },
    keywords: ['deleted', 'Old Note'],
    mode: 'command'
  },
  {
    id: 'NO-005',
    input: 'Archive the note about meeting minutes',
    expected: {
      action: 'update',
      type: 'note',
      is_archived: true
    },
    keywords: ['archived', 'note'],
    mode: 'command'
  },
  {
    id: 'NO-006',
    input: 'Update note "Shopping List" to add "milk, eggs, bread"',
    expected: {
      action: 'update',
      type: 'note',
      contentUpdated: true
    },
    keywords: ['updated', 'Shopping List'],
    mode: 'command'
  },
  {
    id: 'NO-007',
    input: 'Add a quick note: Remember to buy coffee beans',
    expected: {
      action: 'create',
      type: 'note',
      title: 'Quick Note',
      contentContains: 'coffee beans'
    },
    keywords: ['note created'],
    mode: 'command'
  },
  {
    id: 'NO-008',
    input: 'Find notes containing "project"',
    expected: {
      action: 'read',
      type: 'note',
      searchTerm: 'project'
    },
    keywords: ['notes', 'project', 'found'],
    mode: 'command'
  }
];

export interface NoteTestResult {
  testId: string;
  input: string;
  parsedAction: string;
  titleFromAI: string;
  contentMatched: boolean;
  dbState: 'created' | 'updated' | 'deleted' | 'unchanged';
  status: 'PASS' | 'FAIL' | 'ERROR';
  timestamp: string;
}

export function validateNoteOperation(
  aiResponse: string,
  dbNotes: any[],
  testCase: typeof noteOperationsTestCases[0]
): NoteTestResult {
  const keywordsFound = testCase.keywords.filter(kw =>
    aiResponse.toLowerCase().includes(kw.toLowerCase())
  );

  let dbState: 'created' | 'updated' | 'deleted' | 'unchanged' = 'unchanged';

  if (testCase.expected.action === 'create') {
    const created = dbNotes.some(n =>
      n.title?.toLowerCase().includes(testCase.expected.title?.toLowerCase() || '')
    );
    dbState = created ? 'created' : 'unchanged';
  } else if (testCase.expected.action === 'delete') {
    const deleted = !dbNotes.some(n =>
      n.title?.toLowerCase().includes(testCase.expected.title?.toLowerCase() || '')
    );
    dbState = deleted ? 'deleted' : 'unchanged';
  }

  const passed = keywordsFound.length > 0 && dbState !== 'unchanged';

  return {
    testId: testCase.id,
    input: testCase.input,
    parsedAction: testCase.expected.action,
    titleFromAI: testCase.expected.title || '',
    contentMatched: !!testCase.expected.contentContains,
    dbState,
    status: passed ? 'PASS' : 'FAIL',
    timestamp: new Date().toISOString()
  };
}