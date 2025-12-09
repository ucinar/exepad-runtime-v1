'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { Button } from '@/runtime/components/ui/button';

interface MarkdownEditorProps {
  componentId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  className?: string;
  sanitize?: boolean;
}

export default function MarkdownEditor({ 
  componentId, 
  initialContent, 
  onContentChange, 
  className,
  sanitize = true 
}: MarkdownEditorProps) {
  const isFirstRender = useRef(true);
  const [showMarkdown, setShowMarkdown] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'font-bold mb-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc ml-6 mb-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal ml-6 mb-4',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic mb-4',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 font-mono',
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your content... Use **bold**, *italic*, # headings, and more markdown syntax.",
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      if (!isFirstRender.current) {
        const html = editor.getHTML();
        // Convert HTML back to markdown-like format for storage
        const textContent = editor.getText();
        onContentChange(textContent);
      }
    },
    onCreate: () => {
      isFirstRender.current = false;
    },
    editorProps: {
      attributes: {
        class: cn(
          'focus:outline-none min-h-[200px] w-full p-4 rounded-md border border-gray-200 dark:border-gray-700',
          'hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 bg-transparent',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 focus:bg-transparent',
          'prose prose-gray max-w-none dark:prose-invert',
          'prose-headings:font-bold prose-headings:mb-4',
          'prose-p:mb-4 prose-ul:mb-4 prose-ol:mb-4',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
          className
        ),
        spellcheck: 'true',
        style: 'color: inherit;',
      },
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && initialContent !== editor.getText()) {
      editor.commands.setContent(initialContent || '');
    }
  }, [editor, initialContent]);

  const toggleView = () => {
    setShowMarkdown(!showMarkdown);
  };

  return (
    <div className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-transparent border-b border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Rich Text Editor</span>
          {sanitize && <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">Sanitized</span>}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleView}
            className="text-xs"
          >
            {showMarkdown ? 'Rich Text' : 'Markdown'}
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      {showMarkdown ? (
        <textarea
          className="w-full h-64 p-4 bg-transparent font-mono text-sm resize-none focus:outline-none"
          value={editor?.getHTML() || ''}
          onChange={(e) => {
            editor?.commands.setContent(e.target.value);
          }}
          placeholder="Write markdown here..."
        />
      ) : (
        <div className="min-h-[200px]">
          <EditorContent editor={editor} />
        </div>
      )}

      {/* Status indicator */}
      {editor?.isFocused && (
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 z-30">
          Editing...
        </div>
      )}
    </div>
  );
}
