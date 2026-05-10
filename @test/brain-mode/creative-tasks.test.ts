/**
 * Brain Mode Test: Creative Tasks
 * Tests open-ended creative responses that don't require JSON structure
 */

export const creativeTasksTestCases = [
  {
    id: 'CT-001',
    input: 'Write a short story (100 words) about a developer who finally fixes a bug after days of debugging',
    expectedBehavior: 'Creative narrative with humorous or relatable tone, no JSON parsing errors',
    type: 'story',
    minLength: 80,
    maxLength: 150,
    mode: 'brain'
  },
  {
    id: 'CT-002',
    input: 'Brainstorm 5 creative uses for blockchain technology beyond cryptocurrency',
    expectedBehavior: 'List of 5 diverse, innovative use cases with brief explanations',
    type: 'brainstorm',
    expectedCount: 5,
    mode: 'brain'
  },
  {
    id: 'CT-003',
    input: 'Write a haiku about debugging code',
    expectedBehavior: 'Traditional 5-7-5 syllable structure, tech-themed',
    type: 'poetry',
    format: 'haiku',
    mode: 'brain'
  },
  {
    id: 'CT-004',
    input: 'Explain what "technical debt" would sound like if it were a person complaining',
    expectedBehavior: 'Humorous personification, creative analogy, no structured format',
    type: 'humor',
    mode: 'brain'
  },
  {
    id: 'CT-005',
    input: 'If programming languages were characters in a fantasy RPG, what class would TypeScript be?',
    expectedBehavior: 'Creative character analysis with game mechanics analogy',
    type: 'analogy',
    mode: 'brain'
  },
  {
    id: 'CT-006',
    input: 'Give me a metaphor for understanding recursion',
    expectedBehavior: 'Relatable real-world metaphor (like nested dolls, mirrors)',
    type: 'explanation',
    mode: 'brain'
  },
  {
    id: 'CT-007',
    input: 'Write a motivational quote in the style of a software developer',
    expectedBehavior: 'Tech-themed motivational quote, concise',
    type: 'quote',
    mode: 'brain'
  },
  {
    id: 'CT-008',
    input: 'Describe the smell of clean code using all five senses',
    expectedBehavior: 'Sensory description, creative and evocative',
    type: 'creative',
    mode: 'brain'
  }
];

export interface CreativeTestResult {
  testId: string;
  input: string;
  responseLength: number;
  noJsonError: boolean;
  creativeElementsFound: string[];
  status: 'PASS' | 'FAIL' | 'ERROR';
  timestamp: string;
}

export function validateCreativeResponse(
  input: string,
  response: string,
  testCase: typeof creativeTasksTestCases[0]
): CreativeTestResult {
  // Check for JSON parsing errors (would indicate command mode leakage)
  const hasJsonError = response.includes('"action":') || response.includes('"type":');

  // Check length constraints
  const validLength = testCase.minLength
    ? response.length >= testCase.minLength
    : true;

  return {
    testId: testCase.id,
    input,
    responseLength: response.length,
    noJsonError: !hasJsonError,
    creativeElementsFound: [],
    status: !hasJsonError && validLength ? 'PASS' : 'FAIL',
    timestamp: new Date().toISOString()
  };
}