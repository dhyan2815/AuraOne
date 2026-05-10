/**
 * Brain Mode Test: Context Retention
 * Tests multi-turn conversation memory within a session
 */

export const contextRetentionTestCases = [
  {
    id: 'CR-001',
    conversation: [
      { role: 'user', content: 'My name is Dhyan and I work as a software engineer' },
      { role: 'ai', content: 'Nice to meet you, Dhyan! As a software engineer, what technologies do you work with?' },
      { role: 'user', content: 'Mostly TypeScript and React. I also like Python for automation' },
      { role: 'user', content: 'What programming language would you recommend I learn next?' }
    ],
    expectedBehavior: 'AI acknowledges user is Dhyan, a TypeScript/React engineer, and makes recommendation based on this context',
    keywords: ['Dhyan', 'TypeScript', 'React', 'Python', 'recommend'],
    mode: 'brain'
  },
  {
    id: 'CR-002',
    conversation: [
      { role: 'user', content: 'I am planning a trip to Japan next month' },
      { role: 'ai', content: 'That sounds exciting! What cities are you planning to visit?' },
      { role: 'user', content: 'Tokyo, Kyoto, and Osaka' },
      { role: 'user', content: 'Create a task to research best temples in Kyoto' }
    ],
    expectedBehavior: 'AI creates task with context of Japan trip planning, referencing Kyoto temples',
    keywords: ['task', 'Kyoto', 'temples', 'Japan'],
    mode: 'brain'
  },
  {
    id: 'CR-003',
    conversation: Array.from({ length: 8 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'ai' as const,
      content: i === 0 ? 'Start a project called "TestProject"' : `Message ${Math.ceil(i / 2)}`
    })),
    expectedBehavior: 'AI maintains conversation context across 8+ messages without losing track of project name',
    keywords: ['TestProject', 'project', 'remember'],
    mode: 'brain'
  },
  {
    id: 'CR-004',
    conversation: [
      { role: 'user', content: 'Set my favorite color to blue' },
      { role: 'ai', content: 'Your favorite color is now set to blue' },
      { role: 'user', content: 'What is my favorite color?' },
      { role: 'user', content: 'Actually change it to green' },
      { role: 'user', content: 'What color did I choose?' }
    ],
    expectedBehavior: 'AI tracks preference changes and provides correct latest value (green)',
    keywords: ['green', 'favorite', 'color', 'changed'],
    mode: 'brain'
  },
  {
    id: 'CR-005',
    conversation: [
      { role: 'user', content: 'Remember that my deadline is Friday' },
      { role: 'user', content: 'What day is my deadline?' },
      { role: 'user', content: 'Is that this Friday or next Friday?' }
    ],
    expectedBehavior: 'AI accurately recalls deadline information and can clarify ambiguity',
    keywords: ['deadline', 'Friday', 'remember'],
    mode: 'brain'
  }
];

export interface ContextTestResult {
  testId: string;
  messageCount: number;
  contextPreserved: boolean;
  keywordsFound: string[];
  status: 'PASS' | 'FAIL' | 'ERROR';
  notes: string;
  timestamp: string;
}

export function validateContextRetention(
  conversation: typeof contextRetentionTestCases[0]['conversation'],
  finalResponse: string,
  testCase: typeof contextRetentionTestCases[0]
): ContextTestResult {
  const foundKeywords = testCase.keywords.filter(kw =>
    finalResponse.toLowerCase().includes(kw.toLowerCase())
  );

  const contextPreserved = foundKeywords.length >= Math.floor(testCase.keywords.length * 0.6);

  return {
    testId: testCase.id,
    messageCount: conversation.length,
    contextPreserved,
    keywordsFound: foundKeywords,
    status: contextPreserved ? 'PASS' : 'FAIL',
    notes: `Found ${foundKeywords.length}/${testCase.keywords.length} context keywords`,
    timestamp: new Date().toISOString()
  };
}