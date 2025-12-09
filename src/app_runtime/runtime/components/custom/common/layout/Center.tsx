// components/layout/Center.tsx
// No "use client" directive - this is a Server Component by default.

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { DynamicRendererList } from '@/components/DynamicRenderer'; // Adjust path
import { CenterProps } from '@/interfaces/components/common/layout/layout'; // Adjust path

// --- The Center Component Implementation (SSR-Friendly) ---

export const Center: React.FC<CenterProps> = (props) => {
  const {
    content,
    classes,
    // Destructure component-specific props to prevent them from being spread to DOM
    componentType,
    uuid,
    // Also destructure any alternative CSS-style prop names that might come from JSON
    alignItems: _alignItems,
    justifyContent: _justifyContent,
    display: _display,
    // Destructure any other props that shouldn't go to DOM
    ...restProps
  } = props as any;

  // Applies Tailwind CSS classes to create a flex container that centers its content.
  // 'w-full' is included to ensure the component takes up the available horizontal space,
  // which is a common requirement for centering.
  const centerClasses = cn(
    'w-full flex items-center justify-center',
    classes
  );

  return (
    <div className={centerClasses} {...filterDOMProps(restProps)}>
      {/* The DynamicRendererList is responsible for rendering the array of child components. */}
      {content && content.length > 0 && (
        <DynamicRendererList components={content} />
      )}
    </div>
  );
};

Center.displayName = 'Center';

export default Center;
