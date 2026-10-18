// Tiptap Rich-Text Editor Component — Headless editor wrapper that manages markdown inputs and controlled sync events, with a pill formatting toolbar.

import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror prose max-w-none focus:outline-none text-ink',
      },
    }
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
  }, [content, editor]);

  // Track which marks/nodes are active at the caret so toolbar buttons can show pressed state.
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: !!editor?.isActive('bold'),
      italic: !!editor?.isActive('italic'),
      strike: !!editor?.isActive('strike'),
      h2: !!editor?.isActive('heading', { level: 2 }),
      bullet: !!editor?.isActive('bulletList'),
      ordered: !!editor?.isActive('orderedList'),
      quote: !!editor?.isActive('blockquote'),
      code: !!editor?.isActive('code'),
    }),
  });

  const tools = editor && active ? [
    { key: 'bold', label: 'Bold', text: <b>B</b>, run: () => editor.chain().focus().toggleBold().run() },
    { key: 'italic', label: 'Italic', text: <i>I</i>, run: () => editor.chain().focus().toggleItalic().run() },
    { key: 'strike', label: 'Strikethrough', text: <s>S</s>, run: () => editor.chain().focus().toggleStrike().run() },
    { key: 'h2', label: 'Heading', text: 'H2', run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { key: 'bullet', label: 'Bulleted list', text: '• List', run: () => editor.chain().focus().toggleBulletList().run() },
    { key: 'ordered', label: 'Numbered list', text: '1. List', run: () => editor.chain().focus().toggleOrderedList().run() },
    { key: 'quote', label: 'Quote', text: '“ ”', run: () => editor.chain().focus().toggleBlockquote().run() },
    { key: 'code', label: 'Code', text: '{ }', run: () => editor.chain().focus().toggleCode().run() },
  ] as const : [];

  return (
    <div className="h-full w-full overflow-hidden bg-transparent">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex w-max max-w-full flex-wrap gap-1 rounded-full bg-step p-1.5"
      >
        {tools.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-label={t.label}
            aria-pressed={active?.[t.key]}
            onClick={t.run}
            className={`h-10 min-w-10 rounded-full px-2.5 font-extrabold transition-colors hover:bg-sheet ${active?.[t.key] ? 'bg-sheet' : ''}`}
          >
            {t.text}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className="mt-3 min-h-[480px] max-w-[720px] outline-none" />
    </div>
  );
};

export default TiptapEditor;
