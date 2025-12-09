'use client';

import React, { Suspense, lazy, memo, useSyncExternalStore } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useEditMode } from '@/context/EditModeContext';
import { TextProps } from '@/interfaces/components/common/core';
import { cn } from '@/lib/utils';
const TextEditor = lazy(() => import('./TextEditor'));

interface EditableTextProps extends Omit<TextProps, 'uuid'> {
  uuid?: string;
  placeholder?: string;
}

interface MemoizedEditableTextProps extends EditableTextProps {
  content: string;
  isEditMode: boolean;
  updateContent: (uuid: string, newContent: string, componentType: string, field: string) => void;
}

const MemoizedEditableText = memo(({ uuid, content, isEditMode, updateContent, ...props }: MemoizedEditableTextProps) => {
  const variantClasses = {
    default: 'leading-7',
    lead: 'text-xl text-muted-foreground leading-relaxed',
    large: 'text-lg font-semibold',
    small: 'text-sm font-medium leading-none',
    muted: 'text-sm text-muted-foreground',
  };

  const sanitize = props.sanitize ?? true;
  const rehypePlugins = sanitize ? [rehypeSanitize] : [];

  if (isEditMode && uuid) {
    return (
      <Suspense
        fallback={
          <div
            className={cn(
              variantClasses[props.variant || 'default'],
              'prose prose-gray max-w-none dark:prose-invert',
              'prose-p:mb-0 prose-p:leading-[inherit]',
              props.classes
            )}
          >
            <ReactMarkdown
              rehypePlugins={rehypePlugins}
              components={{
                p: ({ children }) => <>{children}</>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        }
      >
        <TextEditor
          componentId={uuid}
          initialContent={content}
          onContentChange={(newContent) =>
            updateContent(uuid, newContent, 'TextProps', 'content')
          }
          className={props.classes}
          placeholder={props.placeholder}
          variant={props.variant}
          as={props.as}
        />
      </Suspense>
    );
  }

  return (
    <div
      className={cn(
        variantClasses[props.variant || 'default'],
        'prose prose-gray max-w-none dark:prose-invert',
        'prose-p:mb-0 prose-p:leading-[inherit]',
        'prose-strong:font-semibold',
        'prose-em:italic',
        'prose-a:text-primary hover:prose-a:text-primary/80',
        props.classes
      )}
    >
      <ReactMarkdown
        rehypePlugins={rehypePlugins}
        components={{
          p: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MemoizedEditableText.displayName = 'MemoizedEditableText';

export function EditableText({ uuid, ...props }: EditableTextProps) {
  const { isEditMode, updateContent, getContentFor, subscribeContent } = useEditMode();

  const subscribedContent = useSyncExternalStore(
    (cb) => (uuid ? subscribeContent(uuid, cb) : () => {}),
    () => (uuid ? getContentFor(uuid) ?? props.content : props.content),
    () => (uuid ? getContentFor(uuid) ?? props.content : props.content)
  );

  const content = subscribedContent ?? props.content;

  return (
    <MemoizedEditableText
      {...props}
      uuid={uuid}
      content={content}
      isEditMode={isEditMode}
      updateContent={updateContent}
    />
  );
}

export default EditableText;
