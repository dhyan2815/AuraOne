/**
 * Common Test: Error Handling
 * Tests graceful error handling, no crashes, proper user feedback
 */

export const errorHandlingTestCases = [
  {
    id: 'EH-001',
    scenario: 'Network timeout',
    simulateError: 'timeout',
    expectedBehavior: 'Show friendly error, offer retry option',
    errorMessage: 'Connection timeout - please try again',
    mode: 'both'
  },
  {
    id: 'EH-002',
    scenario: 'API rate limit (429)',
    simulateError: 'rate_limit',
    expectedBehavior: 'Graceful fallback or clear message about wait time',
    errorMessage: 'rate-limited',
    mode: 'command'
  },
  {
    id: 'EH-003',
    scenario: 'Invalid API key (401)',
    simulateError: 'unauthorized',
    expectedBehavior: 'Clear error about configuration, no crash',
    errorMessage: 'authentication',
    mode: 'both'
  },
  {
    id: 'EH-004',
    scenario: 'Empty user input',
    input: '',
    expectedBehavior: 'Prevent send, no error thrown',
    errorMessage: '',
    mode: 'both'
  },
  {
    id: 'EH-005',
    scenario: 'Very long input (>10000 chars)',
    input: 'x'.repeat(10001),
    expectedBehavior: 'Either truncate gracefully or show input too long error',
    errorMessage: 'input.*too long',
    mode: 'both'
  },
  {
    id: 'EH-006',
    scenario: 'Special characters in input',
    input: 'Create task: "Test <script>alert(1)</script>"',
    expectedBehavior: 'Sanitize input, no XSS, task created with sanitized title',
    errorMessage: '',
    mode: 'command'
  },
  {
    id: 'EH-007',
    scenario: 'Network disconnection mid-request',
    simulateError: 'network_error',
    expectedBehavior: 'Show retry option, preserve user input',
    errorMessage: 'connection.*lost',
    mode: 'both'
  },
  {
    id: 'EH-008',
    scenario: 'Database error on save',
    simulateError: 'database_error',
    expectedBehavior: 'Show error message, user message still in UI',
    errorMessage: 'database.*error',
    mode: 'both'
  },
  {
    id: 'EH-009',
    scenario: 'Malformed date in natural language',
    input: 'Create task: due on 32nd of month',
    expectedBehavior: 'Parse error or fallback to today + reasonable handling',
    errorMessage: '',
    mode: 'command'
  },
  {
    id: 'EH-010',
    scenario: 'Concurrent requests',
    inputs: ['Task 1', 'Task 2', 'Task 3'],
    expectedBehavior: 'All handled sequentially or queued, no race conditions',
    errorMessage: '',
    mode: 'command'
  }
];

export interface ErrorTestResult {
  testId: string;
  scenario: string;
  errorDisplayed: boolean;
  noCrash: boolean;
  userInputPreserved: boolean;
  retryOption: boolean;
  status: 'PASS' | 'FAIL' | 'ERROR';
  timestamp: string;
}

export function validateErrorHandling(
  errorOccurred: boolean,
  userInput: string,
  uiState: { inputPreserved: boolean; errorShown: boolean; retryButton: boolean }
): ErrorTestResult {
  const passed = !errorOccurred || (uiState.errorShown && uiState.noCrash);

  return {
    testId: '',
    scenario: '',
    errorDisplayed: uiState.errorShown,
    noCrash: true,
    userInputPreserved: uiState.inputPreserved || userInput === '',
    retryOption: uiState.retryButton,
    status: passed ? 'PASS' : 'FAIL',
    timestamp: new Date().toISOString()
  };
}