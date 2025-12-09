// components/layout/Flex.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import { DynamicRenderer } from '@/components/DynamicRenderer'; // Adjust path
import { FlexProps } from '@/interfaces/components/common/layout/layout'; // Adjust path

// --- The Flex Component Implementation (Corrected) ---

export const Flex: React.FC<FlexProps> = (props) => {
  const {
    content,
    direction = 'row',
    wrap = 'nowrap',
    justify = 'start',
    align = 'stretch',
    gap = '0',
    classes,
    // Destructure component-specific props to prevent them from being spread to DOM
    componentType,
    uuid,
    // Also destructure any alternative CSS-style prop names that might come from JSON
    // to prevent them from reaching the DOM element
    alignItems: _alignItems,
    justifyContent: _justifyContent,
    flexDirection: _flexDirection,
    flexWrap: _flexWrap,
    // Destructure any other props that shouldn't go to DOM
    ...restProps
  } = props as any;

  // Mapping for flex-direction
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
  };

  // Mapping for justify-content
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  // Mapping for align-items
  const alignItemsClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };
  
  // Mapping for flex-wrap
  const wrapClasses = {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
  };

  const flexClasses = cn(
    'flex',
    directionClasses[direction as keyof typeof directionClasses],
    wrapClasses[wrap as keyof typeof wrapClasses],
    justifyClasses[justify as keyof typeof justifyClasses],
    alignItemsClasses[align as keyof typeof alignItemsClasses],
    // Note: Tailwind CSS needs the full class name, so dynamic gap values are applied like this.
    // Ensure your tailwind.config.js is set up to scan for these classes if you use a variable.
    gap && `gap-${gap}`,
    classes
  );

  return (
    <div className={flexClasses} {...filterDOMProps(restProps)}>
      {/*
        * FIX: Render each component from the 'content' array directly.
        * This makes each one a direct child of the flex container,
        * solving the layout issue by removing the extra nested div that
        * DynamicRendererList was creating.
        */}
      {Array.isArray(content) && content.map((component, index) => (
        <DynamicRenderer key={component.uuid || `${component.componentType}-${index}`} component={component} />
      ))}
    </div>
  );
};

Flex.displayName = 'Flex';

export default Flex;
