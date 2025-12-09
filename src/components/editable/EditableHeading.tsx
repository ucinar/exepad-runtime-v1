'use client';

import React, { Suspense, lazy, useSyncExternalStore } from 'react';
import { useEditMode } from '@/context/EditModeContext';
import { HeadingProps } from '@/interfaces/components/common/core';
import { cn } from '@/lib/utils';
const HeadingEditor = lazy(() => import('./HeadingEditor'));

interface EditableHeadingProps extends Omit<HeadingProps, 'uuid'> {
  uuid?: string;
}

export function EditableHeading({ uuid, ...props }: EditableHeadingProps) {
  const { isEditMode, updateContent, getContentFor, subscribeContent } = useEditMode();
  
  const subscribedText = useSyncExternalStore(
    (cb) => (uuid ? subscribeContent(uuid, cb) : () => {}),
    () => (uuid ? getContentFor(uuid) ?? props.text : props.text),
    () => (uuid ? getContentFor(uuid) ?? props.text : props.text)
  );

  const text = subscribedText ?? props.text;
  const safeLevel = Math.max(1, Math.min(6, props.level));
  const Tag = `h${safeLevel}` as keyof JSX.IntrinsicElements;

  const levelStyles = {
    1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    2: 'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
    3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    4: 'scroll-m-20 text-xl font-semibold tracking-tight',
    5: 'scroll-m-20 text-lg font-semibold tracking-tight',
    6: 'scroll-m-20 text-base font-semibold tracking-tight',
  };

  if (isEditMode && uuid) {
    return (
      <Suspense
        fallback={
          <Tag
            className={cn(
              levelStyles[safeLevel as keyof typeof levelStyles],
              props.classes
            )}
          >
            {text}
          </Tag>
        }
      >
        <HeadingEditor
          componentId={uuid}
          initialText={text}
          onTextChange={(newText) =>
            updateContent(uuid, newText, 'HeadingProps', 'text')
          }
          level={safeLevel}
          className={props.classes}
        />
      </Suspense>
    );
  }

  return (
    <Tag
      className={cn(
        levelStyles[safeLevel as keyof typeof levelStyles],
        props.classes
      )}
    >
      {text}
    </Tag>
  );
}

export default EditableHeading;
