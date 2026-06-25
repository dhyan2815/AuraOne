// Tiptap Rich-Text Editor Component — Headless editor wrapper that manages markdown inputs and controlled sync events.

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

// Configuration properties for the rich text editor wrapper.
interface TiptapEditorProps {
  content: string; // The initial or controlled editor content string.
  onChange: (content: string) => void; // Triggered when editor keystrokes change content.
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  // Initialize headless Tiptap editor engine with starter settings and output hooks.
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // Emit HTML content change upwards.
    },
    editorProps: {
      attributes: {
        // Enforce custom ProseMirror classes defined in index.css.
        class: 'ProseMirror prose max-w-none focus:outline-none text-text dark:text-gray-100',
      },
    }
  });

  // Synchronize external value alterations without resetting cursor positions.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || '', false); // Avoid pushing new undo history state.
    }
  }, [content, editor]);

  return (
    <div className="h-full w-full overflow-hidden bg-transparent">
      {/* ProseMirror viewport mount point. */}
      <EditorContent editor={editor} className="min-h-[600px] outline-none" />
    </div>
  );
};

export default TiptapEditor;
