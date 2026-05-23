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
        class: 'ProseMirror prose max-w-none focus:outline-none text-text dark:text-gray-100',
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
    <div className="h-full w-full overflow-hidden bg-transparent">
      <EditorContent editor={editor} className="min-h-[600px] outline-none" />
    </div>
  );
};

export default TiptapEditor;
