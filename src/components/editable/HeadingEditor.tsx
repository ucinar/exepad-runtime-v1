'use client';

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';

interface HeadingEditorProps {
  componentId: string;
  initialText: string;
  onTextChange: (text: string) => void;
  level: number;
  className?: string;
}

export default function HeadingEditor({ 
  componentId, 
  initialText, 
  onTextChange, 
  level,
  className 
}: HeadingEditorProps) {
  const isFirstRender = useRef(true);
  const safeLevel = Math.max(1, Math.min(6, level)) as 1 | 2 | 3 | 4 | 5 | 6;

  const levelStyles = {
    1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    2: 'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
    3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    6: 'scroll-m-20 text-base font-semibold tracking-tight',
  };

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        // Keep paragraph with no extra styling
        paragraph: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: `Edit heading ${safeLevel}...`,
      }),
    ],
    content: initialText ? `<h${safeLevel}>${initialText}</h${safeLevel}>` : `<h${safeLevel}></h${safeLevel}>`,
    onUpdate: ({ editor }) => {
      if (!isFirstRender.current) {
        const text = editor.getText();
        onTextChange(text);
      }
    },
    onCreate: () => {
      isFirstRender.current = false;
    },
    editorProps: {
      attributes: {
        // Apply heading styles directly to the ProseMirror container
        class: cn(
          'focus:outline-none w-full',
          // Apply the heading level styles to the editor container
          levelStyles[safeLevel as keyof typeof levelStyles],
          className
        ),
        spellcheck: 'false',
        style: 'color: inherit; min-height: 1em; font-family: inherit;',
      },
    },
  });

  // Update editor content when initialText changes
  useEffect(() => {
    if (editor && !editor.isFocused && initialText !== editor.getText()) {
      editor.commands.setContent(initialText ? `<h${safeLevel}>${initialText}</h${safeLevel}>` : `<h${safeLevel}></h${safeLevel}>`);
    }
  }, [editor, initialText, safeLevel]);

  // Just return the editor content directly without any wrapper
  return <EditorContent editor={editor} />;
}