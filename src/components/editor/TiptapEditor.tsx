// src/components/editor/TiptapEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
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
        class: 'ProseMirror prose prose-slate dark:prose-invert max-w-none focus:outline-none',
      },
    }
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
