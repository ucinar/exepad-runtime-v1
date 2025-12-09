'use client';

import React, { lazy, Suspense, useSyncExternalStore } from 'react';
import { useEditMode } from '@/context/EditModeContext';
import { MarkdownBlockProps } from '@/interfaces/components/website/content/content';
import { MarkdownBlock } from '@/app_runtime/runtime/components/custom/website/content/MarkdownBlock';

// Lazy load the editor only when needed
const MarkdownEditor = lazy(() => import('./MarkdownEditor'));

interface EditableMarkdownProps extends Omit<MarkdownBlockProps, 'uuid'> {
  uuid?: string;
}

export function EditableMarkdown({ uuid, ...props }: EditableMarkdownProps) {
  const { isEditMode, updateContent, getContentFor, subscribeContent } = useEditMode();
  
  const subscribedContent = useSyncExternalStore(
    (cb) => (uuid ? subscribeContent(uuid, cb) : () => {}),
    () => (uuid ? getContentFor(uuid) ?? props.content : props.content),
    () => (uuid ? getContentFor(uuid) ?? props.content : props.content)
  );
  const content = subscribedContent ?? props.content;

  if (!isEditMode || !uuid) {
    return <MarkdownBlock {...props} uuid={uuid || 'fallback-uuid'} content={content} />;
  }

  const handleContentChange = (newContent: string) => {
    updateContent(uuid, newContent, 'MarkdownBlockProps', 'content');
  };

  return (
    <Suspense fallback={<MarkdownBlock {...props} uuid={uuid} content={content} />}>
      <MarkdownEditor
        componentId={uuid}
        initialContent={content}
        onContentChange={handleContentChange}
        className={props.classes}
        sanitize={props.sanitize}
      />
    </Suspense>
  );
}

export default EditableMarkdown;
