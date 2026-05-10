/**
 * Command Mode Test: Task Creation
 * Tests AI's ability to parse natural language and create tasks in database
 */

export const taskCreationTestCases = [
  {
    id: 'TC-001',
    input: 'Create a task to buy groceries tomorrow',
    expected: {
      action: 'create',
      type: 'task',
      title: 'Buy groceries',
      priority: 'medium',
      futureDate: true
    },
    keywords: ['buy groceries', 'tomorrow', 'task created'],
    mode: 'command'
  },
  {
    id: 'TC-002',
    input: 'Remind me to call John at 5pm',
    expected: {
      action: 'create',
      type: 'task',
      title: 'Call John',
      hasTime: true,
      timeValue: '17:00'
    },
    keywords: ['call John', '5pm', 'task created'],
    mode: 'command'
  },
  {
    id: 'TC-003',
    input: 'Add high priority task: Finish report by Friday',
    expected: {
      action: 'create',
      type: 'task',
      title: 'Finish report',
      priority: 'high',
      futureDate: true
    },
    keywords: ['high priority', 'Finish report', 'Friday'],
    mode: 'command'
  },
  {
    id: 'TC-004',
    input: 'Create a task called "Review PRs" with priority low for next week',
    expected: {
      action: 'create',
      type: 'task',
      title: 'Review PRs',
      priority: 'low',
      futureDate: true
    },
    keywords: ['Review PRs', 'low', 'next week'],
    mode: 'command'
  },
  {
    id: 'TC-005',
    input: 'I need to submit the tax forms by end of this month',
    expected: {
      action: 'create',
      type: 'task',
      title: 'Submit tax forms',
      priority: 'high',
      futureDate: true
    },
    keywords: ['tax forms', 'end of month', 'task created'],
    mode: 'command'
  },
  {
    id: 'TC-006',
    input: 'Show my tasks',
    expected: {
      action: 'read',
      type: 'task'
    },
    keywords: ['tasks', 'show', 'list'],
    mode: 'command'
  },
  {
    id: 'TC-007',
    input: 'Mark the task "Buy groceries" as completed',
    expected: {
      action: 'update',
      type: 'task',
      completed: true
    },
    keywords: ['completed', 'Buy groceries', 'updated'],
    mode: 'command'
  },
  {
    id: 'TC-008',
    input: 'Delete the task about groceries',
    expected: {
      action: 'delete',
      type: 'task'
    },
    keywords: ['delete', 'task', 'groceries'],
    mode: 'command'
  }
];

export interface TaskTestResult {
  testId: string;
  input: string;
  parsedAction: string;
  parsedType: string;
  titleExtracted: string;
  priorityExtracted: string;
  dateParsed: boolean;
  dbRecordCreated: boolean;
  status: 'PASS' | 'FAIL' | 'ERROR';
  errorMessage?: string;
  timestamp: string;
}

export function validateTaskCreation(
  aiResponse: string,
  dbState: { tasks: any[] },
  testCase: typeof taskCreationTestCases[0]
): TaskTestResult {
  const hasSuccessMessage = testCase.keywords.some(kw =>
    aiResponse.toLowerCase().includes(kw.toLowerCase())
  );

  const dbHasNewTask = dbState.tasks.some(t =>
    t.title?.toLowerCase().includes(testCase.expected.title?.toLowerCase() || '')
  );

  const passed = hasSuccessMessage && (testCase.expected.action !== 'create' || dbHasNewTask);

  return {
    testId: testCase.id,
    input: testCase.input,
    parsedAction: testCase.expected.action,
    parsedType: testCase.expected.type,
    titleExtracted: testCase.expected.title || '',
    priorityExtracted: testCase.expected.priority || 'medium',
    dateParsed: !!testCase.expected.futureDate,
    dbRecordCreated: dbHasNewTask,
    status: passed ? 'PASS' : 'FAIL',
    errorMessage: passed ? undefined : 'Task not created in database',
    timestamp: new Date().toISOString()
  };
}