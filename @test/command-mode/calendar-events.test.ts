/**
 * Command Mode Test: Calendar/Event Operations
 * Tests AI's ability to parse natural language and create/read/delete events
 */

export const calendarEventsTestCases = [
  {
    id: 'CE-001',
    input: 'Schedule a meeting with the team on Monday at 2pm',
    expected: {
      action: 'create',
      type: 'event',
      title: 'Meeting with the team',
      dayOfWeek: 'monday',
      timeValue: '14:00'
    },
    keywords: ['meeting', 'Monday', '2pm', 'scheduled'],
    mode: 'command'
  },
  {
    id: 'CE-002',
    input: 'Add event: Doctor appointment next Thursday at 10:30am',
    expected: {
      action: 'create',
      type: 'event',
      title: 'Doctor appointment',
      dayOfWeek: 'thursday',
      timeValue: '10:30'
    },
    keywords: ['Doctor appointment', 'Thursday', 'scheduled'],
    mode: 'command'
  },
  {
    id: 'CE-003',
    input: 'Show my events for this week',
    expected: {
      action: 'read',
      type: 'event',
      timeRange: 'this week'
    },
    keywords: ['events', 'week', 'showing'],
    mode: 'command'
  },
  {
    id: 'CE-004',
    input: 'Book a lunch with Sarah on December 15th at noon',
    expected: {
      action: 'create',
      type: 'event',
      title: 'Lunch with Sarah',
      specificDate: '12-15',
      timeValue: '12:00'
    },
    keywords: ['Lunch with Sarah', 'December 15', 'booked'],
    mode: 'command'
  },
  {
    id: 'CE-005',
    input: 'Delete the event called "Team Standup"',
    expected: {
      action: 'delete',
      type: 'event'
    },
    keywords: ['deleted', 'Team Standup'],
    mode: 'command'
  },
  {
    id: 'CE-006',
    input: 'What events do I have tomorrow?',
    expected: {
      action: 'read',
      type: 'event',
      timeRange: 'tomorrow'
    },
    keywords: ['events', 'tomorrow'],
    mode: 'command'
  },
  {
    id: 'CE-007',
    input: 'Schedule a reminder: Standup every weekday at 9am',
    expected: {
      action: 'create',
      type: 'event',
      title: 'Standup',
      recurring: true,
      timeValue: '09:00'
    },
    keywords: ['Standup', 'weekday', '9am', 'scheduled'],
    mode: 'command'
  },
  {
    id: 'CE-008',
    input: 'Create an all-day event: Company Holiday on December 25th',
    expected: {
      action: 'create',
      type: 'event',
      title: 'Company Holiday',
      specificDate: '12-25',
      allDay: true
    },
    keywords: ['Company Holiday', 'December 25', 'all-day'],
    mode: 'command'
  }
];

export interface CalendarTestResult {
  testId: string;
  input: string;
  parsedTitle: string;
  parsedDate: string;
  parsedTime: string;
  dbRecordExists: boolean;
  status: 'PASS' | 'FAIL' | 'ERROR';
  errorMessage?: string;
  timestamp: string;
}

export function validateCalendarEvent(
  aiResponse: string,
  dbEvents: any[],
  testCase: typeof calendarEventsTestCases[0]
): CalendarTestResult {
  const keywordsFound = testCase.keywords.filter(kw =>
    aiResponse.toLowerCase().includes(kw.toLowerCase())
  );

  const eventInDb = dbEvents.some(e => {
    const titleMatch = testCase.expected.title
      ? e.title?.toLowerCase().includes(testCase.expected.title.toLowerCase())
      : true;
    return titleMatch;
  });

  const passed = keywordsFound.length >= 2 && (testCase.expected.action !== 'create' || eventInDb);

  return {
    testId: testCase.id,
    input: testCase.input,
    parsedTitle: testCase.expected.title || '',
    parsedDate: testCase.expected.specificDate || testCase.expected.dayOfWeek || '',
    parsedTime: testCase.expected.timeValue || '',
    dbRecordExists: eventInDb,
    status: passed ? 'PASS' : 'FAIL',
    errorMessage: passed ? undefined : 'Event not found in database',
    timestamp: new Date().toISOString()
  };
}