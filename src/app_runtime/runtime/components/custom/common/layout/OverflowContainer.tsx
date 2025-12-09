// components/layout/OverflowContainer.tsx
// No "use client" directive - this is a Server Component by default.

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Adjust path
import { OverflowContainerProps } from '@/interfaces/components/common/layout/layout'; // Adjust path

// --- The OverflowContainer Component Implementation (SSR-Friendly) ---

export const OverflowContainer: React.FC<OverflowContainerProps> = ({
  content,
  overflowX = 'auto',
  overflowY = 'auto',
  classes,
  ...restProps
}) => {

  // FIX: Use a mapping to ensure Tailwind's JIT compiler can find the full class names.
  // This prevents dynamic string concatenation which the compiler cannot detect.
  const overflowXClasses: { [key: string]: string } = {
    auto: 'overflow-x-auto',
    hidden: 'overflow-x-hidden',
    scroll: 'overflow-x-scroll',
    visible: 'overflow-x-visible',
  };

  const overflowYClasses: { [key: string]: string } = {
    auto: 'overflow-y-auto',
    hidden: 'overflow-y-hidden',
    scroll: 'overflow-y-scroll',
    visible: 'overflow-y-visible',
  };

  const containerClasses = cn(
    overflowX && overflowXClasses[overflowX],
    overflowY && overflowYClasses[overflowY],
    classes
  );

  return (
    <div className={containerClasses} {...filterDOMProps(restProps)}>
      {/* FIX: Render each child component directly.
          Wrapping them in a list renderer can interfere with
          the parent container's direct styling of its children.
      */}
      {content && content.map((component) => (
        <DynamicRenderer key={component.uuid} component={component} />
      ))}
    </div>
  );
};

OverflowContainer.displayName = 'OverflowContainer';

export default OverflowContainer;
