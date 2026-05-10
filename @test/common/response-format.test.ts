/**
 * Common Test: Response Format
 * Tests chat message display, markdown rendering, UI correctness
 */

export const responseFormatTestCases = [
  {
    id: 'RF-001',
    input: 'List: item1, item2, item3',
    contentType: 'list',
    expected: 'Rendered as bullet points',
    mode: 'both'
  },
  {
    id: 'RF-002',
    input: '**Bold text** and *italic text*',
    contentType: 'markdown',
    expected: 'Bold and italic rendering',
    mode: 'both'
  },
  {
    id: 'RF-003',
    input: 'Code: `const x = 1`',
    contentType: 'code',
    expected: 'Inline code formatting',
    mode: 'both'
  },
  {
    id: 'RF-004',
    input: '```js\nconsole.log("test")\n```',
    contentType: 'codeblock',
    expected: 'Code block with syntax highlighting',
    mode: 'both'
  },
  {
    id: 'RF-005',
    input: 'Link: [click here](https://example.com)',
    contentType: 'link',
    expected: 'Clickable hyperlink',
    mode: 'both'
  },
  {
    id: 'RF-006',
    input: '1. First\n2. Second\n3. Third',
    contentType: 'ordered_list',
    expected: 'Numbered list rendering',
    mode: 'both'
  },
  {
    id: 'RF-007',
    input: '## Heading\nSome text',
    contentType: 'heading',
    expected: 'Heading styled correctly',
    mode: 'both'
  },
  {
    id: 'RF-008',
    input: '> Quote text',
    contentType: 'blockquote',
    expected: 'Blockquote styling',
    mode: 'both'
  },
  {
    id: 'RF-009',
    role: 'user',
    contentType: 'user_message',
    expected: 'Right-aligned, different styling from AI',
    mode: 'both'
  },
  {
    id: 'RF-010',
    role: 'ai',
    contentType: 'ai_message',
    expected: 'Left-aligned, AI avatar shown',
    mode: 'both'
  },
  {
    id: 'RF-011',
    input: 'Very long message that wraps to multiple lines and tests how the UI handles text overflow and wrapping behavior',
    contentType: 'long_text',
    expected: 'Proper text wrapping, no horizontal scroll',
    mode: 'both'
  },
  {
    id: 'RF-012',
    input: 'Emoji test: 🎉 ✅ 🔥 💯',
    contentType: 'emoji',
    expected: 'Emojis render correctly',
    mode: 'both'
  }
];

export interface ResponseFormatResult {
  testId: string;
  contentType: string;
  rendered: boolean;
  styling: 'correct' | 'incorrect' | 'partial';
  scrollBehavior: 'normal' | 'broken';
  status: 'PASS' | 'FAIL' | 'ERROR';
  timestamp: string;
}

export function validateResponseFormat(
  element: HTMLElement
): ResponseFormatResult {
  const hasProperStyling = getComputedStyle(element).wordWrap === 'break-word';
  const noHorizontalScroll = element.scrollWidth <= element.clientWidth;

  return {
    testId: '',
    contentType: 'text',
    rendered: element.innerHTML.length > 0,
    styling: hasProperStyling ? 'correct' : 'incorrect',
    scrollBehavior: noHorizontalScroll ? 'normal' : 'broken',
    status: hasProperStyling && noHorizontalScroll ? 'PASS' : 'FAIL',
    timestamp: new Date().toISOString()
  };
}

// DOM-based validation helpers
export const ValidationHelpers = {
  findMessageContainer: (role: 'user' | 'ai'): HTMLElement | null =>
    document.querySelector(`[data-role="${role}"]`),

  checkMarkdownRendering: (container: HTMLElement): boolean => {
    const codeBlocks = container.querySelectorAll('pre code');
    const boldElements = container.querySelectorAll('strong');
    const italicElements = container.querySelectorAll('em');
    const links = container.querySelectorAll('a');

    return codeBlocks.length > 0 || boldElements.length > 0 ||
           italicElements.length > 0 || links.length > 0;
  },

  checkAlignment: (container: HTMLElement): 'left' | 'right' | 'center' => {
    const style = getComputedStyle(container);
    return style.justifyContent as 'left' | 'right' | 'center';
  },

  checkAvatar: (role: 'user' | 'ai'): boolean => {
    const container = document.querySelector(`[data-role="${role}"]`);
    return !!container?.querySelector('[data-avatar]');
  }
};