// components/layout/VirtualList.tsx
"use client";

import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import DynamicRenderer from '@/components/DynamicRenderer'; // Adjust path
import { VirtualListProps, VirtualListItemData } from '@/interfaces/components/common/layout/layout'; // Adjust path
import { ComponentProps } from '@/interfaces/components/common/core';

// --- Helper function to merge item data into the template ---

/**
 * Recursively merges data from an item into a component template.
 * It replaces placeholders like `{{key}}` in strings with the corresponding
 * value from the data object.
 * @param template - The template structure (can be an object, array, or primitive).
 * @param data - The data object for a single item.
 * @returns A new structure with data merged in.
 */
const mergeDataIntoTemplate = (template: any, data: VirtualListItemData): any => {
  // FIX: Explicitly handle arrays by mapping over them and calling the function recursively.
  // This ensures that array structures are preserved.
  if (Array.isArray(template)) {
    return template.map(item => mergeDataIntoTemplate(item, data));
  }

  // Handle strings by replacing placeholders.
  if (typeof template === 'string') {
    return template.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
      return data[placeholder] !== undefined ? String(data[placeholder]) : match;
    });
  }

  // Handle objects by iterating over their properties and calling the function recursively.
  if (template && typeof template === 'object' && !React.isValidElement(template)) {
    const newProps: { [key: string]: any } = {};
    for (const key in template) {
      if (Object.prototype.hasOwnProperty.call(template, key)) {
        newProps[key] = mergeDataIntoTemplate((template as any)[key], data);
      }
    }
    return newProps;
  }

  // Return all other types (like numbers, booleans, etc.) as-is.
  return template;
};


// --- The VirtualList Component Implementation ---

export const VirtualList: React.FC<VirtualListProps> = ({
  content,
  itemTemplate,
  itemHeight,
  containerHeight,
  overscanCount = 5,
  classes,
  ...restProps
}) => {

  // The Row component is what react-window renders for each item.
  // It's memoized for performance.
  const Row = React.memo(({ index, style }: ListChildComponentProps) => {
    const itemData = content[index];
    if (!itemData) return null;

    // For each row, merge the specific item's data into the shared template.
    const componentProps = mergeDataIntoTemplate(itemTemplate, itemData);

    return (
      <div style={style}>
        {/* Use the DynamicRenderer to render the final, data-filled component. */}
        <DynamicRenderer component={componentProps} />
      </div>
    );
  });
  Row.displayName = 'VirtualListRow';

  return (
    <div
      className={cn("w-full", classes)}
      style={{ height: containerHeight }}
      {...filterDOMProps(restProps)}
    >
      {/* AutoSizer is a helper that provides the width and height of the parent container.
          This makes the FixedSizeList automatically fill its container.
      */}
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemSize={itemHeight}
            itemCount={content.length}
            overscanCount={overscanCount}
          >
            {Row}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

/*
  IMPORTANT: To use this component, you will need to install the necessary libraries:
  
  npm install react-window react-virtualized-auto-sizer
  npm install @types/react-window --save-dev
*/

VirtualList.displayName = 'VirtualList';

export default VirtualList;
