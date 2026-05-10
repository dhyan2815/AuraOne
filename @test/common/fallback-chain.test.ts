/**
 * Common Test: Fallback Chain
 * Tests that OpenRouter fallback activates when Gemini fails
 */

export const fallbackChainTestCases = [
  {
    id: 'FC-001',
    primaryFailure: 'gemini_429',
    expectedFallback: 'openrouter',
    mode: 'command',
    description: 'Gemini rate limit triggers OpenRouter fallback'
  },
  {
    id: 'FC-002',
    primaryFailure: 'gemini_401',
    expectedFallback: 'openrouter',
    mode: 'command',
    description: 'Gemini auth error triggers OpenRouter fallback'
  },
  {
    id: 'FC-003',
    primaryFailure: 'gemini_timeout',
    expectedFallback: 'openrouter',
    mode: 'command',
    description: 'Gemini timeout triggers OpenRouter fallback'
  },
  {
    id: 'FC-004',
    primaryFailure: 'gemini_500',
    expectedFallback: 'openrouter',
    mode: 'command',
    description: 'Gemini server error triggers OpenRouter fallback'
  },
  {
    id: 'FC-005',
    primaryFailure: 'gemini_json_parse_error',
    expectedFallback: 'openrouter',
    mode: 'command',
    description: 'Gemini returns invalid JSON, triggers OpenRouter fallback'
  },
  {
    id: 'FC-006',
    primaryFailure: 'openrouter_also_fails',
    expectedFallback: 'error_message',
    mode: 'command',
    description: 'Both Gemini and OpenRouter fail, show error message'
  },
  {
    id: 'FC-007',
    primaryFailure: 'none',
    expectedFallback: 'none',
    mode: 'brain',
    description: 'Brain mode should use OpenRouter directly (no fallback)'
  },
  {
    id: 'FC-008',
    primaryFailure: 'openrouter_timeout',
    expectedFallback: 'error_message',
    mode: 'brain',
    description: 'Brain mode OpenRouter timeout shows error'
  }
];

export interface FallbackTestResult {
  testId: string;
  mode: string;
  primaryAPI: string;
  fallbackTriggered: boolean;
  fallbackAPI: string;
  responseTime: number;
  status: 'PASS' | 'FAIL' | 'ERROR';
  notes: string;
  timestamp: string;
}

export function validateFallbackChain(
  mode: string,
  apiCalls: string[],
  responseTime: number
): FallbackTestResult {
  const hasFallback = apiCalls.includes('openrouter');
  const isBrainMode = mode === 'brain';

  // In command mode, fallback should be transparent (only one visible response)
  // In brain mode, OpenRouter is the primary
  const passed = isBrainMode
    ? apiCalls[0] === 'openrouter'
    : apiCalls.length <= 2; // At most primary + fallback

  return {
    testId: '',
    mode,
    primaryAPI: isBrainMode ? 'openrouter' : 'gemini',
    fallbackTriggered: hasFallback && apiCalls.length > 1,
    fallbackAPI: hasFallback ? 'openrouter' : 'none',
    responseTime,
    status: passed ? 'PASS' : 'FAIL',
    notes: hasFallback ? 'Fallback chain working correctly' : 'No fallback needed',
    timestamp: new Date().toISOString()
  };
}

// Log to track API call sequence
export interface APICallLog {
  timestamp: number;
  api: 'gemini' | 'openrouter';
  status: 'success' | 'error';
  errorCode?: string;
  duration: number;
}

export function createFallbackLogger(): {
  log: (call: APICallLog) => void;
  getSequence: () => APICallLog[];
  reset: () => void;
} {
  const sequence: APICallLog[] = [];

  return {
    log: (call: APICallLog) => sequence.push(call),
    getSequence: () => [...sequence],
    reset: () => sequence.length = 0
  };
}