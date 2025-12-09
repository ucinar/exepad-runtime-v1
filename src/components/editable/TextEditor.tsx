'use client';

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  componentId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'lead' | 'large' | 'small' | 'muted';
  as?: 'p' | 'span' | 'div';
}

export default function TextEditor({ 
  componentId, 
  initialContent, 
  onContentChange, 
  className,
  placeholder = "Click to edit text...",
  variant = 'default',
  as = 'p'
}: TextEditorProps) {
  const isFirstRender = useRef(true);

  const variantClasses = {
    default: 'leading-7',
    lead: 'text-xl text-muted-foreground leading-relaxed',
    large: 'text-lg font-semibold',
    small: 'text-sm font-medium leading-none',
    muted: 'text-sm text-muted-foreground',
  };

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        // Keep paragraph with no extra styling
        paragraph: {},
        // Disable other block elements for simple text editing
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: initialContent ? `<p>${initialContent}</p>` : '<p></p>',
    onUpdate: ({ editor }) => {
      if (!isFirstRender.current) {
        const content = editor.getText();
        onContentChange(content);
      }
    },
    onCreate: () => {
      isFirstRender.current = false;
    },
    editorProps: {
      attributes: {
        class: cn(
          'focus:outline-none w-full',
          // Match the exact styling of the non-edit Text component
          variantClasses[variant],
          className
        ),
        spellcheck: 'false',
        style: 'color: inherit; min-height: 1em; font-family: inherit;',
      },
      handleKeyDown: (view, event) => {
        // Prevent line breaks in single-line text components
        if (as !== 'div' && event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  });

  // Update editor content when initialContent changes
  useEffect(() => {
    if (editor && !editor.isFocused && initialContent !== editor.getText()) {
      editor.commands.setContent(initialContent ? `<p>${initialContent}</p>` : '<p></p>');
    }
  }, [editor, initialContent]);

  // Just return the editor content directly without any wrapper
  return <EditorContent editor={editor} />;
}