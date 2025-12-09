// components/layout/SplitPane.tsx
"use client";

import React from 'react';
import { cn, filterDOMProps } from '@/lib/utils'; // Assumes a utility for class names
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/runtime/components/ui/resizable'; // Adjust path
import DynamicRenderer from '@/components/DynamicRenderer'; // Adjust path
import { SplitPaneProps, SplitDirection } from '@/interfaces/components/common/layout/layout'; // Adjust path

// --- The SplitPane Component Implementation ---

export const SplitPane: React.FC<SplitPaneProps> = ({
  content,
  direction = 'horizontal',
  initialSizes = [50, 50],
  minSizes = ['10', '10'], // Defaulting to 10% minimum size
  classes,
  ...restProps
}) => {

  // Validate that exactly two children are provided, as this is a two-pane splitter.
  if (!content || content.length !== 2) {
    console.error('[SplitPane] This component requires exactly two child components.');
    // Render a fallback or null in case of invalid configuration.
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
        Error: SplitPane requires exactly two children.
      </div>
    );
  }

  // The shadcn/ui ResizablePanel component expects minSize and defaultSize to be numbers (percentages).
  // This function safely parses the values from the string-based interface.
  const parseSize = (size: string | number, fallback: number): number => {
    if (typeof size === 'number') return size;
    const parsed = parseInt(size, 10);
    return isNaN(parsed) ? fallback : parsed;
  };

  return (
    <div className={cn("w-full h-full", classes)} {...filterDOMProps(restProps)}>
      <ResizablePanelGroup direction={direction}>
        {/* First Pane */}
        <ResizablePanel
          defaultSize={parseSize(initialSizes[0], 50)}
          minSize={parseSize(minSizes[0], 10)}
        >
          {/* The DynamicRenderer is used to render the actual component for the first pane. */}
          <div className="h-full w-full p-4">
            <DynamicRenderer component={content[0]} />
          </div>
        </ResizablePanel>

        {/* Handle for resizing */}
        <ResizableHandle withHandle />

        {/* Second Pane */}
        <ResizablePanel
          defaultSize={parseSize(initialSizes[1], 50)}
          minSize={parseSize(minSizes[1], 10)}
        >
          {/* The DynamicRenderer is used to render the actual component for the second pane. */}
          <div className="h-full w-full p-4">
            <DynamicRenderer component={content[1]} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

SplitPane.displayName = 'SplitPane';

export default SplitPane;
