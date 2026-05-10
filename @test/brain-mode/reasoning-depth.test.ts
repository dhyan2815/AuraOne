/**
 * Brain Mode Test: Reasoning Depth
 * Tests complex multi-step reasoning queries in Brain mode (OpenRouter)
 *
 * Test Case Format:
 * {
 *   id: string,
 *   input: string,
 *   expectedBehavior: string,
 *   keywords: string[],
 *   mode: 'brain'
 * }
 */

export const reasoningDepthTestCases = [
  {
    id: 'RD-001',
    input: 'What are the trade-offs between using a relational database vs a NoSQL database for a social media application?',
    expectedBehavior: 'Detailed analysis covering consistency, scalability, query flexibility, and use cases',
    keywords: ['trade-off', 'relational', 'NoSQL', 'consistency', 'scalability'],
    mode: 'brain'
  },
  {
    id: 'RD-002',
    input: 'If a train travels 60mph and another train travels 80mph in opposite directions, and they start 350 miles apart, how long until they meet?',
    expectedBehavior: 'Step-by-step calculation showing relative speed and time to meet (2.5 hours)',
    keywords: ['time', 'meet', 'hours', 'distance', 'speed'],
    mode: 'brain'
  },
  {
    id: 'RD-003',
    input: 'Compare three different authentication methods: JWT, Session-based, and OAuth. Which would you recommend for a microservices architecture?',
    expectedBehavior: 'Comparison of all three with pros/cons and recommendation for microservices',
    keywords: ['JWT', 'session', 'OAuth', 'microservices', 'authentication'],
    mode: 'brain'
  },
  {
    id: 'RD-004',
    input: 'Explain why in software engineering we often prefer composition over inheritance, with examples',
    expectedBehavior: 'Explanation of SOLID principles, composition benefits, real-world examples',
    keywords: ['composition', 'inheritance', 'SOLID', 'coupling', 'flexibility'],
    mode: 'brain'
  },
  {
    id: 'RD-005',
    input: 'A company has 5 projects with different ROI percentages and budget requirements. How would you optimize which projects to fund with a fixed budget of $500,000?',
    expectedBehavior: 'Knapsack-style optimization reasoning with clear methodology',
    keywords: ['optimize', 'ROI', 'budget', 'projects', 'funding'],
    mode: 'brain'
  },
  {
    id: 'RD-006',
    input: 'If you had to choose between speed, security, and user experience as the top priority for a healthcare app, what would you choose and why?',
    expectedBehavior: 'Balanced reasoning considering HIPAA, patient safety, and usability',
    keywords: ['priority', 'healthcare', 'security', 'UX', 'HIPAA'],
    mode: 'brain'
  },
  {
    id: 'RD-007',
    input: 'Walk me through how you would design a URL shortener system from scratch, including data structures and algorithms',
    expectedBehavior: 'System design with hashing, database schema, cache strategy, collision handling',
    keywords: ['URL', 'shortener', 'hash', 'database', 'cache'],
    mode: 'brain'
  },
  {
    id: 'RD-008',
    input: 'Why does adding more developers to a late software project often make it even later? Explain using the law of diminishing returns and communication overhead',
    expectedBehavior: 'Reference to Brooks\' law, explanation of coordination costs, practical examples',
    keywords: ['Brooks law', 'diminishing returns', 'communication', 'team size'],
    mode: 'brain'
  }
];

// Run test manually and record results
export async function runReasoningDepthTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const testCase of reasoningDepthTestCases) {
    try {
      // This would be executed via the actual Chat UI or API
      const result = await executeBrainModeTest(testCase.input);
      const passed = validateBrainModeResponse(result, testCase);

      results.push({
        testId: testCase.id,
        input: testCase.input,
        expected: testCase.expectedBehavior,
        actual: result.substring(0, 200),
        status: passed ? 'PASS' : 'FAIL',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        testId: testCase.id,
        input: testCase.input,
        expected: testCase.expectedBehavior,
        actual: `Error: ${error.message}`,
        status: 'ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  return results;
}

interface TestResult {
  testId: string;
  input: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  timestamp: string;
}

async function executeBrainModeTest(input: string): Promise<string> {
  // Placeholder - actual implementation would call the AI service
  // This is where you'd integrate with handleSendMessage with isBrainMode=true
  return '';
}

function validateBrainModeResponse(response: string, testCase: typeof reasoningDepthTestCases[0]): boolean {
  // Check if response contains expected keywords
  const hasKeywords = testCase.keywords.some(keyword =>
    response.toLowerCase().includes(keyword.toLowerCase())
  );
  return hasKeywords && response.length > 50;
}